export interface FalOrder {
  orderId: string;
  tier: string;
  email?: string;
  product?: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

function buildPrompt(order: FalOrder): string {
  const tierLabel = order.tier.charAt(0).toUpperCase() + order.tier.slice(1);
  const product = order.product
    ? `About the business: ${order.product}. `
    : "";
  return `Cinematic 60-second ${tierLabel} business promo video, vertical 9:16. ${product}Professional commercial videography style, polished lighting, clear call to action.`;
}

/**
 * Enqueue a paid order's video generation on the Fal queue.
 *
 * Designed for serverless: we `queue.submit` (fast, returns a request id
 * immediately) and let Fal call our webhook when the render completes — we do
 * NOT poll inside the request handler.
 *
 * Generation does not run until FAL_KEY (and optionally FAL_MODEL) is set.
 * Order/payment state persistence is the expected next step (Postgres on
 * Neon/Supabase) — see README.
 */
export async function enqueueFalJob(order: FalOrder): Promise<void> {
  console.log(
    `[Fal] Order ${order.orderId} paid — enqueueing generation job (tier=${order.tier})`
  );

  const falKey = process.env.FAL_KEY;
  if (!falKey) {
    console.warn(
      "[Fal] FAL_KEY not configured — order recorded but generation not submitted. Set FAL_KEY to enable."
    );
    return;
  }

  const model = process.env.FAL_MODEL || "fal-ai/wan/v2.2-a14b/text-to-video";
  const prompt = buildPrompt(order);
  const falWebhookSecret = process.env.FAL_WEBHOOK_SECRET;

  const { fal } = await import("@fal-ai/client");
  fal.config({ credentials: falKey });

  const options: { input: { prompt: string; aspect_ratio: string }; webhookUrl?: string } =
    { input: { prompt, aspect_ratio: "9:16" } };
  // Fal's client passes the webhook URL to its queue API as `fal_webhook`.
  // Carry the shared secret in the URL so our completion route can verify it.
  if (falWebhookSecret) {
    options.webhookUrl = `${BASE_URL}/api/webhooks/fal?token=${encodeURIComponent(
      falWebhookSecret
    )}`;
  }

  const { request_id: requestId } = await fal.queue.submit(model, options);

  console.log(`[Fal] Submitted ${model} — request_id=${requestId}`);
}
