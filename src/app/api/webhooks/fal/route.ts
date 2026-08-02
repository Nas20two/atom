import { NextRequest, NextResponse } from "next/server";
import { getDbSafe, completeClip, finalizeOrderIfComplete } from "@/lib/db";

/**
 * POST /api/webhooks/fal
 *
 * Called by Fal when an enqueued render completes. Guarded by a shared secret
 * (`FAL_WEBHOOK_SECRET`) — mirrors the auth requirement called out in review #3.
 *
 * The completion webhook does NOT trigger spend (only the Stripe-signed
 * checkout webhook enqueues a render). We keep the shared-secret auth as-is; a
 * stronger request_id↔pending-order handshake is a future enhancement.
 *
 * On COMPLETED we persist the finished clip's URL and, once every clip of the
 * order is done, mark the order itself completed — enabling delivery without
 * double-spend.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.FAL_WEBHOOK_SECRET;
  const authHeader = req.headers.get("authorization");
  const queryToken = req.nextUrl.searchParams.get("token");

  if (!secret) {
    return NextResponse.json(
      { error: "FAL_WEBHOOK_SECRET is not configured." },
      { status: 500 }
    );
  }

  const authorized =
    queryToken === secret || authHeader === `Bearer ${secret}`;
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Record the completed render (if Fal reports one). Failures here must not
  // cause Fal to retry forever — acknowledge regardless; the status check is a
  // best-effort persistence step.
  try {
    const body = await req.json();
    const requestId = body?.request_id;
    const status = body?.status;
    const videoUrl = body?.result?.video?.url;

    if (requestId && status === "COMPLETED" && videoUrl) {
      const db = getDbSafe();
      if (db) {
        const orderId = await completeClip(db, requestId, videoUrl);
        if (orderId) {
          await finalizeOrderIfComplete(db, orderId);
          console.log(`[Fal] persisted completed clip ${requestId} for order ${orderId}`);
        } else {
          console.warn(`[Fal] completed webhook for unknown request_id ${requestId}`);
        }
      }
    } else if (requestId) {
      console.log(`[Fal] webhook received for ${requestId} (status=${status ?? "unknown"})`);
    }
  } catch (err) {
    console.warn("[Fal] webhook acknowledged but could not persist completion", {
      msg: err instanceof Error ? err.message : String(err),
    });
  }

  return NextResponse.json({ received: true });
}
