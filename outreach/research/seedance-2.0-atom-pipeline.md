# Seedance 2.0 — Atom Pipeline Research

**Date:** 2026-06-19  
**Source:** Tweet from @ai_girl_craft + OpenSeedance research  
**Status:** Ready to test (free credits available)

---

## The Model

**Seedance 2.0** is ByteDance's multimodal video generation model. Key differentiator from Kling/Wan:

- **Joint audio-video generation** — audio and video generated together in one forward pass. No post-production audio dubbing/syncing. Frame-accurate lip sync across 8+ languages.
- **Dual-Branch Diffusion Transformer (DB-DiT)** — Vision branch handles spatial-temporal info, Audio branch generates waveform data. Cross-modal attention bridge connects them frame-by-frame.
- **Multi-reference input** — up to 9 images + 3 video clips + 3 audio clips in one generation
- **Character consistency lock** — global anchoring mechanism keeps faces/outfits/scenes stable across shots
- **Physics-aware** — trained with physics penalty objectives (gravity, fluid, collisions, footprints sinking into sand)

---

## Access via OpenSeedance (Recommended)

**URL:** https://openseedance.org  
**Login:** Google account only  
**Free trial:** 30 credits on signup + 5/day check-in + bonus streaks

### Pricing

| Plan | Price | Credits | ~Seedance 2.0 clips |
|------|-------|---------|-------------------|
| Starter | $15/mo | 300 | ~8.5 |
| Standard | $29/mo | 800 | ~22 |
| Premium | $79/mo | 3000 | ~85 |

**Cost per Seedance 2.0 clip:** ~35 credits for a 4s 480p video

### All Models Available on OpenSeedance
- **Seedance 2.0** (video)
- **Kling 3.0** (video)
- **Wan 2.7** (video)
- **Google Veo** (video)
- **GPT Image 2** (image)
- **Seedream** (image)
- **Nano Banana** (image)
- And more — all in one platform

---

## Comparison: Seedance 2.0 vs Kling 3.0 for Atom

| Feature | Seedance 2.0 | Kling 3.0 |
|---------|-------------|-----------|
| Cost per 10s clip | ~$0.11 (Ultra) / ~$0.75 (std) | ~$0.50–$1.50 |
| Max duration | ~15s | ~10s |
| Audio sync | ✅ Native (born together) | ❌ Separate step |
| Multi-reference | 9 img + 3 video + 3 audio | Limited |
| Camera control | Via prompt | Yes |
| Resolution | 480p–1080p | 720p–1080p |
| Character consistency | ✅ Strong (global anchor) | Moderate |

## Why This Matters for Atom

Atom's faceless content pipeline produces short-form videos that need:
1. Fast generation (≤15s clips)
2. Synced audio (voiceover + SFX)
3. Consistent branding across clips

Seedance 2.0's joint audio-video eliminates the most painful part of the current workflow — syncing audio separately.

## Decision

- ✅ Use Standard $29/mo plan once Atom generates revenue
- ✅ Free trial available now to test quality
- ❌ Not switching yet — test first, compare same prompt on both Seedance and Kling

## Next Steps

1. NaSy signs in to OpenSeedance with Google
2. Generate one Seedance 2.0 clip (free credits)
3. Generate same prompt on Kling 3.0 (also on OpenSeedance)
4. Compare quality, speed, and audio sync
5. Decide if $29/mo Standard is worth it