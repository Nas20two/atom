import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/atom-submit?id=<session_id>
 *
 * Used by the success page to confirm a paid Checkout session before showing
 * the "your video is queued" state.
 */
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

    const paid = session.payment_status === "paid";
    return NextResponse.json({
      job: {
        id: session.metadata?.orderId,
        tier: session.metadata?.tier ?? null,
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
