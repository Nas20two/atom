import { NextRequest, NextResponse } from "next/server";
import { isTier, priceIdFor } from "@/lib/pricing";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

/**
 * POST /api/create-atom-checkout
 * Body: { email: string, tier: "basic" | "pro" | "agent", product?: string }
 *
 * Creates a one-time (pay-per-video) Stripe Checkout Session. No subscriptions.
 * Returns { url } which the client redirects to.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      email?: string;
      tier?: string;
      product?: string;
    };

    const { email, tier, product } = body;
    if (!email || !isTier(tier)) {
      return NextResponse.json(
        { error: "Email and a valid tier (basic | pro | agent) are required." },
        { status: 400 }
      );
    }

    const priceId = priceIdFor(tier);
    if (!priceId) {
      return NextResponse.json(
        {
          error: `No Stripe price configured for tier "${tier}". Set STRIPE_PRICE_ID_${tier.toUpperCase()} in your environment.`,
        },
        { status: 500 }
      );
    }

    const stripe = (await import("@/lib/stripe")).createStripeClient();
    const orderId = crypto.randomUUID();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { orderId, tier, email, product: product ?? "" },
      success_url: `${BASE_URL}/atom/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/atom`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create checkout session.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
