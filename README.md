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

**Stack:** Next.js + TypeScript + Stripe Checkout + Fal.ai + Postgres (Vercel/Neon/Supabase)

## Key Files

- `docs/atom-processor.js` — Job processor (env-based API keys, never hardcode)
- `docs/atom-webhook-receiver.js` — Receives Vercel jobs → generates prompts → deliverables
- `docs/process-job.js` — Fal.ai queue job execution
- `docs/atom-lucid-agent-skill.md` — Agent operating skill

## Security

- API keys via environment variables only (`FAL_KEY`, `OPENROUTER_API_KEY`, etc.)
- Verify Stripe webhook signatures with `constructEvent`
- Serve generated videos via expiring signed URLs — never expose the bucket

---

*Atom — The smallest unit of marketing.*
