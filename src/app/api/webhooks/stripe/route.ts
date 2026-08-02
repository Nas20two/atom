import { NextRequest, NextResponse } from "next/server";
import { enqueueFalJob } from "@/lib/fal";
import { isTier } from "@/lib/pricing";
import { getDbSafe, insertOrder, insertVideo, markOrderEnqueued, markOrderFailed } from "@/lib/db";

/**
 * POST /api/webhooks/stripe
 *
 * Stripe sends signed webhook events here. We verify the signature with
 * `constructEvent` before doing anything — without a valid signature + secret
 * the request is rejected, so an unauthenticated caller can't trigger paid
 * Fal generation. (This closes the open-spend door in the old docs receiver.)
 *
 * On checkout.session.completed we persist the order (idempotent on the unique
 * order_id) and only then enqueue the paid Fal render — a duplicated webhook
 * can't double-spend or double-generate.
 */
export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is not configured." },
      { status: 500 }
    );
  }

  let raw: Buffer;
  try {
    raw = Buffer.from(await req.arrayBuffer());
  } catch {
    return NextResponse.json({ error: "Could not read request body." }, { status: 400 });
  }

  let event: import("stripe").Stripe.Event;
  try {
    const stripe = (await import("@/lib/stripe")).createStripeClient();
    event = stripe.webhooks.constructEvent(raw, signature, webhookSecret);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Signature verification failed.";
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  // Handle the events that matter. For a one-time Checkout, the order is paid
  // when the checkout.session is completed.
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    const tier = session.metadata?.tier;
    const email = session.metadata?.email || session.customer_details?.email || undefined;
    const product = session.metadata?.product || undefined;
    const amountCents = session.amount_total ?? undefined;

    if (!orderId || !isTier(tier)) {
      console.warn("[Stripe] checkout.session.completed without a valid orderId/tier", {
        orderId,
        tier,
      });
      return NextResponse.json({ received: true });
    }

    const db = getDbSafe();

    if (db) {
      const created = await insertOrder(db, { orderId, tier, email, product, amountCents });
      if (!created) {
        // Duplicate event — the order is already recorded (and enqueued).
        // (If it ever sat at 'failed' from a partial enqueue, it's visible in
        // the DB for a support retry; a retry here must not re-enqueue because
        // some clips may already be submitted.)
        console.warn(
          "[Stripe] Duplicate checkout.session.completed for order — skipping re-enqueue",
          { orderId }
        );
        return NextResponse.json({ received: true });
      }

      try {
        const { requestIds, model } = await enqueueFalJob(
          { orderId, tier, email, product },
          // Persist each clip the moment it's submitted, so a partial failure
          // can't orphan a submitted render (unqualified spend with no row).
          async (clipIndex, falRequestId, model) => {
            await insertVideo(db, { orderId, clipIndex, falRequestId, model });
          }
        );
        if (requestIds.length === 0) {
          // FAL_KEY not configured — leave the order 'created' (paid, deferred).
          // Once FAL_KEY is set, support can re-enqueue it.
          return NextResponse.json({ received: true });
        }
        await markOrderEnqueued(db, orderId, model);
      } catch (err) {
        // Partial/failed enqueue after the order was inserted. Leave the order
        // explicitly 'failed' (never silently 'created') so it's visible to a
        // support retry — the request_ids already persisted tell us exactly
        // which clips (if any) made it to Fal.
        const reason = err instanceof Error ? err.message : String(err);
        await markOrderFailed(db, orderId, reason);
        return NextResponse.json({ error: `Enqueue failed: ${reason}` }, { status: 500 });
      }
    } else {
      // No Neon configured (local dev). Fall back to enqueue-without-persist so
      // Stripe test mode still works; production must set DATABASE_URL.
      console.warn(
        "[Stripe] DATABASE_URL not set — order not persisted; enqueueing without idempotency guard."
      );
      await enqueueFalJob({ orderId, tier, email, product });
    }
  }

  return NextResponse.json({ received: true });
}
