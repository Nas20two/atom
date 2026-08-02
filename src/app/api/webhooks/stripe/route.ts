import { NextRequest, NextResponse } from "next/server";
import { enqueueFalJob } from "@/lib/fal";
import { isTier } from "@/lib/pricing";

/**
 * POST /api/webhooks/stripe
 *
 * Stripe sends signed webhook events here. We verify the signature with
 * `constructEvent` before doing anything — without a valid signature + secret
 * the request is rejected, so an unauthenticated caller can't trigger paid
 * Fal generation. (This closes the open-spend door in the old docs receiver.)
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
    const product = session.metadata?.product;

    if (orderId && isTier(tier)) {
      await enqueueFalJob({ orderId, tier, email, product });
    } else {
      console.warn("[Stripe] checkout.session.completed without a valid orderId/tier", {
        orderId,
        tier,
      });
    }
  }

  return NextResponse.json({ received: true });
}
