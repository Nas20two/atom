# Atom AI Film Studio — Blueprint

**Date:** 2026-07-29
**Source:** Machina's Claude Code film studio design (Higgsfield/Seedance pipeline)
**Goal:** Evolve Atom from video maker into a full AI film production system

---

## Cost Analysis

### Option A: Pure Fal.ai Stack (No $ Spend)
| Item | Cost | Notes |
|------|------|-------|
| Fal.ai balance | $0 (existing ~$14.40) | Seedance $0.24-0.68/s, Wan $0.05/s, Kling $0.22-0.34/s |
| music_generate | $0 | Free via Lyria 3 Pro Preview |
| ffmpeg | $0 | Already on Mac Mini |
| Subagent orchestration | $0 | Already built (me) |
| **Total (per film)** | **~$3-10** | ~60 clips × $0.05-0.17 each |
| **Missing:** No GPT Image 2, no unified queue, manual concurrency |

### Option B: Higgsfield Route
| Item | Cost | Notes |
|------|------|-------|
| Higgsfield CLI | $0 | Free to install |
| Higgsfield free plan | $0 | Planning, testing, reworking = 0 credits |
| Final renders | TBD | Pay-per-render, pricing unclear |
| GPT Image 2 access | Included | Solves TaskMarket image bounty problem |
| Fal.ai backup | ~$14.40 remaining | Keep as fallback |
| music_generate | $0 | Free |
| **Total (per film)** | **~$5-20** | Depends on Higgsfield pricing |
| **Benefit:** Unified queue, GPT Image 2, 4K upscaling, character consistency |

### Option C: Hybrid (Recommended)
| Item | Cost | Notes |
|------|------|-------|
| Higgsfield CLI | $0 | For GPT Image 2 frames + queue management |
| Fal.ai | ~$14.40 remaining | For Seedance/Wan/Kling video (what they're good at) |
| music_generate | $0 | Free scoring |
| ffmpeg | $0 | Already on Mac Mini |
| **Total (per film)** | **~$3-15** | Best of both worlds |
| **Benefit:** GPT Image 2 frames + Fal.ai video + free music + unified queue |

---

## Phase 1: Foundation (Week 1) — $0

### Goal: Install Higgsfield CLI, build the style contract engine

#### Steps:
1. Install Higgsfield CLI:
   ```bash
   npm install -g @higgsfield/cli
   higgsfield auth login
   npx skills add higgsfield-ai/skills
   ```

2. Create `atom-agent/src/services/style-contract.ts`:
   - Vision model (Gemini 3.1 Pro via API key) reads reference frames
   - Outputs: lens feel, lighting direction, palette, grain, contrast, blocking, atmosphere, era markers
   - Stores as JSON: `{ lens, lighting, palette, grain, contrast, blocking, atmosphere, era }`

3. Create reference frame library:
   - `atom-agent/reference-frames/` — 5-10 frames per style (cinematic, commercial, music video)
   - Source from frameset.app, shotdeck.com, fancaps.net

4. Create `atom-agent/src/atom-film-agent.ts`:
   - Orchestrator that owns the shot list
   - Spawns subagents per shot family

#### Fallback:
- Higgsfield install fails → skip Higgsfield, use Fal.ai directly for everything
- Style contract fails → manual paragraph input instead of vision extraction
- Timeline: 4 days

---

## Phase 2: Frame Generation Engine (Week 2) — $0-5

### Goal: Generate still frames across models, lock characters and locations

#### Steps:
1. Create `atom-agent/src/frame-generator.ts`:
   - Takes shot brief + style contract
   - Runs same brief across multiple models in parallel (Higgsfield GPT Image 2, Fal.ai Flux Schnell)
   - Compares outputs, picks best
   - Stores winners

2. Create character reference sheets:
   - `atom-agent/characters/{name}/` — front, three-quarter, profile
   - Cropped separately (no grids — video models read panels as different people)
   - Separate sheets per wardrobe/state change

3. Create location reference sheets:
   - `atom-agent/locations/{name}/` — multi-angle
   - At least 3 angles per location

4. Frame rules implemented:
   - Objects hold emotion better than faces (faces drift, objects lock)
   - One impossible thing in one normal place
   - Character has a cost (limping > walking)

#### Fallback:
- No GPT Image 2 → Flux Schnell for frames (near-free, lower quality)
- Character sheets fail → keep characters simple, single reference
- Timeline: 5 days

---

## Phase 3: Prompt Template Engine (Week 2-3) — $0

### Goal: Automated shot script generation from locked templates

#### Steps:
1. Create `atom-agent/src/prompt-engine.ts`:
   - Template: `[scene context] [references] [blocking] [camera] [lighting] [audio] [style locks]`
   - Same order every time for consistency
   - One verb per shot
   - Subject movement and camera movement in separate sentences
   - 120-280 words for text-to-video, <80 words for image-to-video

2. Create prompt rules:
   - Five small actions > one adjective
   - Positive constraints only ("sharp clarity" not "no blur")
   - Constraints stay positive

3. Create shot list format:
   ```json
   {
     "shots": [
       { "id": "001", "beat": "opening", "description": "...", "model": "seedance_2_0", "duration": 5 }
     ]
   }
   ```

#### Fallback:
- Prompt engine fails → manual prompt writing for each shot (slower, same quality)
- Timeline: 3 days

---

## Phase 4: Motion Grammar (Week 3) — $0-3

### Goal: Animate frames into video clips that actually move

#### Steps:
1. Create `atom-agent/src/motion-grammar.ts`:
   - Every image-to-video prompt must have:
     - Named camera move (dolly in, push-in, tracking, crane up, etc.)
     - In-scene event (something happens during the 5 seconds)
     - "No frozen figures" (explicit)
   - Same keyframe, different result: "slow dolly in" = drift vs "slow dolly in as sail tears loose" = film

2. Implement chain shots:
   - Last frame of shot N = reference frame for shot N+1
   - Continuity carries forward without reloading character sheets

3. Implement time-code climax:
   - `[0-4s] wide and static, [4-8s] push-in, [8-12s] close-up, [12-15s] reveal`
   - Direct cuts inside a single clip

4. Shot isolation:
   - 3-5 seconds per shot
   - 12-16 shots per minute of film
   - Identity drift stops at 30 seconds

#### Fallback:
- Chain shots fail → independent shots, manual continuity
- Time-code climax fails → simpler single-beat shots
- Timeline: 5 days

---

## Phase 5: Subagent Fleet (Week 3-4) — $0

### Goal: Parallel generation across models with concurrency management

#### Steps:
1. Create `atom-agent/src/fleet-manager.ts`:
   - One orchestrator session owns the shot list
   - Spawns subagents by shot family (creatures, water, interiors, action)
   - Each subagent writes prompts, submits generations, polls jobs, reports winners

2. Concurrency management:
   - Check active jobs before submitting
   - Submit only when a slot frees
   - 3-4 candidates per shot, then change ONE variable per pass
   - Log every generation: prompt, model, result, kept/killed

3. Job tracking:
   - `atom-agent/jobs/` — one file per production run
   - Prompt, model, result URL, duration, cost, kept/killed

4. Iteration discipline:
   - Change ONE variable per pass (camera, lighting, or speed)
   - Never a full rewrite
   - A fail with 5 changes teaches nothing

#### Fallback:
- Fleet manager fails → single-threaded generation (slower, same quality, takes overnight)
- Timeline: 5 days

---

## Phase 6: Montage & Final Assembly (Week 4) — $0

### Goal: Score, cut from text file, 4K master

#### Steps:
1. Create `atom-agent/src/montage-engine.ts`:
   - Music first: brief the score against the cut's emotional arc
   - Movements, not moods: build, peak, quiet, resolve
   - Generate in one pass via music_generate tool, then trim cut to score

2. Create cut file format:
   ```
   shot-001 5s audio
   shot-002 4s mute
   shot-003 3s audio
   ```
   - Per-clip audio muted where it collides with score
   - Kept everywhere it adds realism

3. ffmpeg assembly:
   - ffmpeg reads the cut file and renders the film
   - Entire edit reproducible and changeable in seconds
   - No timeline software, no editor needed

4. Upscaling:
   - 720p while exploring
   - 1080p for keepers
   - 4K only for final master
   - Upscale once, at the end, on the finished cut
   - Never on individual clips

5. Final cut pass:
   - Any clip where you'd check your phone gets deleted
   - Whatever it cost you

#### Fallback:
- ffmpeg assembly fails → iMovie/manual assembly (slower, same quality)
- Upscaling fails → deliver at 1080p (acceptable)
- Timeline: 3 days

---

## Total Cost Estimate

| Phase | Cash Cost | Time |
|-------|-----------|------|
| Phase 1: Foundation | $0 | 4 days |
| Phase 2: Frame Engine | $0-5 | 5 days |
| Phase 3: Prompt Engine | $0 | 3 days |
| Phase 4: Motion Grammar | $0-3 | 5 days |
| Phase 5: Subagent Fleet | $0 | 5 days |
| Phase 6: Montage | $0 | 3 days |
| **Total** | **$0-8** | **~25 days** |

**First film production cost:** ~$3-15 (Fal.ai credits + optional Higgsfield renders)
**Monthly running cost:** ~$10-30 (assuming 2-4 films/month)

---

## Directory Structure

```
atom-agent/
├── src/
│   ├── atom-film-agent.ts          # Orchestrator
│   ├── style-contract.ts           # Vision model extraction
│   ├── frame-generator.ts          # Multi-model frame generation
│   ├── prompt-engine.ts            # Shot script templates
│   ├── motion-grammar.ts           # Camera move + event grammar
│   ├── fleet-manager.ts            # Subagent concurrency
│   └── montage-engine.ts           # ffmpeg assembly + scoring
├── reference-frames/               # Source cinema frames
├── characters/                     # Character reference sheets
├── locations/                      # Location reference sheets
├── jobs/                           # Generation logs
└── productions/                    # Cut files + final renders
```

---

## Quick Start (First Evening)

If you want to test the pipeline tonight:

1. `npm install -g @higgsfield/cli && higgsfield auth login`
2. Pick 3 reference frames from a film you like
3. Run them through Gemini 3.1 Pro → get style contract
4. Generate 5 frames across 2 models → pick winners
5. Write 3 shot prompts using the template
6. Generate 3 clips via Seedance 2.0 (image-to-video)
7. Assemble with ffmpeg: `ffmpeg -f concat -i file.txt -c copy output.mp4`

That's a proof of concept in one evening, $0-2 cost.