export interface FalOrder {
  orderId: string;
  tier: string;
  email?: string;
  product?: string;
}

/** How many 60-second clips each paid tier delivers. (pricing.ts + homepage agree.) */
const CLIPS_PER_TIER: Record<string, number> = { basic: 1, pro: 2, agent: 1 };

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

function buildPrompt(order: FalOrder, clipIndex: number, totalClips: number): string {
  const tierLabel = order.tier.charAt(0).toUpperCase() + order.tier.slice(1);
  const product = order.product
    ? `About the business: ${order.product}. `
    : "";
  const base = `Cinematic 60-second ${tierLabel} business promo video, vertical 9:16. ${product}Professional commercial videography style, polished lighting, clear call to action.`;
  // For multi-clip tiers, differentiate the shots so each delivered clip is
  // distinct (Pro delivers 2 videos).
  if (totalClips <= 1) return base;
  return clipIndex === 0
    ? `${base} Lead with a strong, scroll-stopping hook opening scene.`
    : `${base} Lead with a customer-benefit / result focus — different framing and shot.`;
}

/**
 * Enqueue a paid order's video generation(s) on the Fal queue.
 *
 * Returns the Fal request id for every clip plus the model used, so the caller
 * can persist enqueued state (see src/lib/db.ts). Returns empty requestIds when
 * FAL_KEY is not configured — the order is recorded as paid but generation is
 * deferred until it is.
 *
 * Designed for serverless: we `queue.submit` (fast, returns a request id
 * immediately) and let Fal call our webhook when the render completes — we do
 * NOT poll inside the request handler.
 */
export async function enqueueFalJob(
  order: FalOrder,
  onClip?: (clipIndex: number, requestId: string, model: string) => void | Promise<void>
): Promise<{ requestIds: string[]; model: string }> {
  const output = { requestIds: [] as string[], model: "" };

  const falKey = process.env.FAL_KEY;
  if (!falKey) {
    console.warn(
      "[Fal] FAL_KEY not configured — order recorded but generation not submitted. Set FAL_KEY to enable."
    );
    return output;
  }

  const model = process.env.FAL_MODEL || "fal-ai/wan/v2.2-a14b/text-to-video";
  output.model = model;
  const clips = CLIPS_PER_TIER[order.tier] ?? 1;
  const falWebhookSecret = process.env.FAL_WEBHOOK_SECRET;

  const { fal } = await import("@fal-ai/client");
  fal.config({ credentials: falKey });

  for (let i = 0; i < clips; i++) {
    const prompt = buildPrompt(order, i, clips);
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
    output.requestIds.push(requestId);
    // Persist this clip immediately so a later failure can't orphan it (a
    // submitted render with no DB row = unqualified Fal spend).
    if (onClip) await onClip(i, requestId, model);
    console.log(`[Fal] Submitted ${model} (clip ${i + 1}/${clips}) — request_id=${requestId}`);
  }

  return output;
}
