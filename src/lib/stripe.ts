import Stripe from "stripe";

/**
 * Lazily constructed Stripe client. Constructing Stripe with an empty key
 * throws, so we only build it inside request handlers after validating env.
 */
export function createStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set.");
  }
  return new Stripe(key, {
    apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion,
  });
}
