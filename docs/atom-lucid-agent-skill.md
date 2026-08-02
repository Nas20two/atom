## July 2026 — Agent Skill File (Fal.ai Powered)

### Atom Lucid Agent — Scaffolded (June 17), Migrated to Fal.ai (July 1)
- **Location:** `~/.openclaw/workspace/atom-agent/`
- **Structure:** Lucid agent with Hono adapter, same pattern as ti-agent
- **Entrypoints:**
  - `create-music-video-dev` — 60s vertical music visualizer (LEGACY, HyperFrames)
  - `health` — health check
  - `generate-marketing-script` — Generates brand story script with scene prompts
  - `generate-marketing-video` — Full pipeline: script + Fal.ai scene generation (Wan 2.5) + clip URLs
- **Render engines:**
  - Music visualizers: HyperFrames 0.6.104 (BPM-synced GSAP — different use case)
  - Marketing promos: **Fal.ai Wan 2.5** ($0.05/s, best value)
- **Fal.ai key:** Stored in `/src/services/fal-client.ts`, also in process-job.js for webhook flow
- **Balance:** $20 loaded (NaSy, July 1, 2026)
- **HITL:** ALL output requires NaSy review before delivery. No auto-send.

### Webhook Processor (process-job.js)
- Location: `~/atom-processor/process-job.js`
- Also migrated to Fal.ai — generates clips per prompt instead of spawning old atom-processor.js
- Includes balance check before processing
- Falls back to Wan 2.5 model, generates sequentially (spend control)
- Waits: Wallet funding (NaSy's ETH transfer → x402 mode flip) before going live

### Fal.ai Pipeline Details (July 1)
- **Account:** Created, $20 loaded, API key active
- **Models:**
  - **Veo 3.1 Lite** ($0.20/s) — Best cinematic quality, image-to-video, ~40s generation for 8s clip
  - **Wan 2.2** ($0.05/s) — Best value, text-to-video, strong temporal coherence
  - **Flux Schnell** (~free) — Fast seed image generation
  - **Kling 3.0 Pro** ($0.112/s) — Alternative to Veo, good ad-quality framing
- **Endpoint pattern:** POST `queue.fal.run/{model}`, poll `status_url`, get result at `response_url`
- **Client:** `/src/services/fal-client.ts` — `submitVideoGeneration()` + `pollStatus()` + `fetchResult()`
- **Image-to-video:** Pass `image_url` in payload (supports data: URLs or public URLs)
- **Webhook processor:** `~/atom-processor/process-job.js` — sequential scene generation (spend control)
- **Balance check:** Runs before processing — stops if insufficient

### TaskMarket Bounty Pipeline (July 1)
- **Skill:** `skills/taskmarket-bounty/SKILL.md`
- **Pipeline script:** `skills/taskmarket-bounty/bounty-pipeline.py`
- **Submitted 2 bounties:** Carer 2040 + Shanghai 2033 (8 USDC each)
- **CLI:** `npx @lucid-agents/taskmarket`
- **Device wallet:** `0xe7D08d...` (agentId 57868) — separate from agent wallet
- **Cost per submission:** ~$1.60 Fal.ai credits ($0.20/s × 8s)

### Pricing Research Complete (June 17)
- **Location:** `research/pricing-2026-06-17.md`
- **Key findings:**
  - TI market: $1,500-15,000 per eval (freelance). Our AI power can undercut 10-30x.
  - Atom market: $50-1,200 per visualizer (freelance). $99-2,499 proposed.
  - Consulting market: $150-350/hr AI consulting AU. Entry at $250/hr.
- **Recommended entry pricing:**
  - TI Quick Eval: $49 | Full Report: $199 | Competitive Analysis: $499
  - Atom Basic: $99 | Standard: $399 | Premium: $899 | Series: $1,299 | Agency: $2,499
  - Consulting: $250/hr | AI Readiness: $1,500 | Fractional CTO: $6K-18K/mo

### Portfolio: Made By Atom Demo Videos (June 25 — July 1)
- **Location:** `~/nasyhub-v2/src/app/atom/page.tsx`
- **Demo videos hosted at:** `/public/` in nasyhub-v2
  - `atom-promo.mp4` (60s brand video)
  - `atom-ai-motion.mp4` (8s AI motion demo)
  - `atom-real-estate-demo.mp4` (Veo 3.1)
  - `atom-trades-demo.mp4` (Wan 2.2)
  - `reiki-promo-hindi.mp4`, `reiki-promo-english.mp4` (client work)
- **Work section (July 1):** Added bounty case studies with model tags and results