export type TierId = "basic" | "pro" | "agent";

export interface Tier {
  id: TierId;
  name: string;
  price: number; // in major currency units (USD)
  description: string;
  features: string[];
  popular?: boolean;
}

/**
 * Pay-per-video (one-time) tiers. No subscriptions.
 * Prices mirror the checkout section on the homepage.
 */
export const TIERS: Record<TierId, Tier> = {
  basic: {
    id: "basic",
    name: "One Video",
    price: 19,
    description:
      "A single 60-second cinematic video. Pick any industry template.",
    features: [
      "60-second 1080×1920 vertical MP4",
      "Any industry template",
      "AI-generated background music",
      "Cinematic motion graphics",
      "Email delivery within 24 hours",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 49,
    description:
      "Two 60-second videos + still frames + captions + social copy for a full launch.",
    features: [
      "Everything in One Video, plus:",
      "2× 60-second videos",
      "3 still frames per video",
      "Auto-generated captions",
      "Social media copy (TikTok, IG, YT)",
      "Priority 12-hour delivery",
    ],
    popular: true,
  },
  agent: {
    id: "agent",
    name: "Marketing Agent",
    price: 29,
    description:
      "One 60-second video with AI audience research + Facebook-ready export.",
    features: [
      "1× 60-second video",
      "AI audience research (pain points + hooks + platform)",
      "Static brand image per video",
      "Facebook-ready export (caption + hashtags + thumbnail)",
      "Automatic brand consistency check",
    ],
  },
};

export const TIER_ORDER: TierId[] = ["basic", "pro", "agent"];

export function isTier(id: string | undefined | null): id is TierId {
  return id === "basic" || id === "pro" || id === "agent";
}

/** The Stripe Price ID for a tier, read from env (STRIPE_PRICE_ID_<TIER>). */
export function priceIdFor(tier: TierId): string | undefined {
  const key = `STRIPE_PRICE_ID_${tier.toUpperCase()}`;
  return process.env[key];
}
