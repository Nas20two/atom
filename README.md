# Atom — The Smallest Unit of Marketing

AI-powered video generation for businesses. Turn a simple prompt into a cinematic, branded promo video.

> **Origin:** Named after Atom from the 2011 film *Real Steel* — a beat-up, second-generation sparring robot dismissed as obsolete, who becomes the people's champion. Atom the product is the same energy: AI does the work, like Atom's shadow mode mirrors a human.

## What's Here

| Directory | Contents |
|-----------|----------|
| `src/app/atom/` | Next.js landing page routes (industries, pricing, success, etc.) |
| `src/app/atom-taskmarket/` | TaskMarket integration page |
| `docs/` | Blueprints, content pipeline, processor code, agent skill |
| `brand-assets/` | Atom logo (SVG/PNG) |
| `public/` | Logos, badges, brand cards, posters |
| `outreach/` | Pipeline research, Product Hunt listing, LinkedIn updates |
| `memory/` | Project history notes (Jul 2026) |

## Architecture (Core Flow)

**order → queue → webhook → fulfillment** — Fal.ai generation is async (seconds to minutes), so never generate inside a request.

1. User fills prompt/settings → order row created
2. Server creates Stripe Checkout Session with `orderId` metadata
3. Stripe redirects to success page; `payment_intent.succeeded` fires
4. Webhook verifies signature → marks order paid → enqueues Fal job (ack 200 fast)
5. Fal webhook marks video completed → store URL → serve via signed URL

**Stack:** Next.js + TypeScript + Stripe Checkout (one-time, pay-per-video) + Fal.ai + Postgres (Vercel/Neon/Supabase)

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in Stripe + Fal keys and a Price ID per tier
npm run dev                  # http://localhost:3000
```

## Key Files

- `src/app/` — Next.js App Router pages (landing, industries, pricing, success)
- `src/lib/pricing.ts` — pay-per-video tiers → Stripe Price IDs (from env)
- `src/app/api/create-atom-checkout/route.ts` — creates a one-time Stripe Checkout session
- `src/app/api/webhooks/stripe/route.ts` — verifies the Stripe signature, marks an order paid, enqueues the Fal job
- `src/app/api/webhooks/fal/route.ts` — Fal completion callback (guarded by a shared secret)
- `src/app/api/atom-submit/route.ts` — success-page status check
- `src/lib/fal.ts` — enqueues a paid order on the Fal queue (async, webhook-driven)
- `docs/process-job.js` — standalone Fal renderer (env-configured paths/model)
- `docs/atom-lucid-agent-skill.md` — Agent operating skill

## Architecture (Core Flow)

**order → queue → webhook → fulfillment** — Fal.ai generation is async (seconds to minutes), so never generate inside a request.

1. User fills the form → selects a pay-per-video tier
2. Server creates a one-time Stripe Checkout Session with `orderId` metadata
3. Stripe redirects to success; `checkout.session.completed` fires to `/api/webhooks/stripe`
4. Webhook verifies the signature → enqueues the Fal job (acks fast)
5. Fal calls `/api/webhooks/fal` when the render completes → store URL → serve via signed URL

> The old standalone `docs/atom-webhook-receiver.js` (plain, unauthenticated POST that triggered paid generation) was removed — that open-spend door is closed. The Veo/OpenRouter processor (`docs/atom-processor.js`) was removed in favour of the Fal pipeline.

## Security

- API keys via environment variables only (`STRIPE_SECRET_KEY`, `FAL_KEY`, …) — see `.env.example`
- Stripe webhook signature verified with `constructEvent` — rejected without a valid signature + secret
- Fal completion webhook guarded by a shared secret (`FAL_WEBHOOK_SECRET`, Bearer token)
- Serve generated videos via expiring signed URLs — never expose the bucket
- Persistence (orders/video state → Postgres on Vercel/Neon/Supabase) is the planned next step

---

*Atom — The smallest unit of marketing.*
