import { NextRequest, NextResponse } from "next/server";
import { getDbSafe, getOrderStatus } from "@/lib/db";

/**
 * GET /api/atom-submit?id=<session_id>
 *
 * Used by the success page to confirm a paid Checkout session before showing
 * the "your video is queued" state. When the order has been persisted to
 * Postgres we return the live DB status; otherwise we fall back to reading the
 * Stripe session's payment_status.
 */

/** Map our DB order status to the status the success page understands. */
function mapStatus(status: string | null | undefined): string {
  if (status === "completed") return "completed";
  if (status === "enqueued" || status === "created") return "queued";
  return "processing";
}

export async function GET(req: NextRequest) {
  const sessionId =
    req.nextUrl.searchParams.get("id") ||
    req.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session id." }, { status: 400 });
  }

  try {
    const stripe = (await import("@/lib/stripe")).createStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    const orderId = session.metadata?.orderId;
    const tier = session.metadata?.tier ?? null;

    // Prefer the live persisted status when we have an order row.
    const db = getDbSafe();
    if (db && orderId) {
      const row = await getOrderStatus(db, orderId);
      if (row) {
        return NextResponse.json({
          job: {
            id: orderId,
            tier: row.tier,
            status: mapStatus(row.status),
            paid: true,
          },
        });
      }
    }

    // Fallback: no order row yet (DB unset or webhook not processed) — report
    // from Stripe's own payment status so the success page still resolves.
    const paid = session.payment_status === "paid";
    return NextResponse.json({
      job: {
        id: orderId,
        tier,
        status: paid ? "queued" : "processing",
        paid,
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to retrieve session.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
