# Atom Content Marketing Pipeline — Master Plan

**Status:** Draft | **Last Updated:** 2026-07-22
**Owner:** NaSy + Kai
**Goal:** Automate 1 short-form video post per day using Atom + Ace Step tracks → cross-post to YouTube Shorts, Instagram Reels, X, TikTok → market Atom, Ace Step, and nasyhub products.

---

## 1. OBJECTIVE

**The North Star:** A self-sustaining content flywheel that:
- Uses Ace Step tracks as raw material
- Renders them into short-form videos via Atom
- Cross-posts to 4 platforms daily
- Each post markets Atom AND the track AND the broader product ecosystem
- Costs near-zero (free-tier infra)
- Feeds AI search discoverability (GaryVee GEO play)

**Why this matters:** We have the product (Atom), the content (Ace Step tracks), and the automation engine (n8n). None of it is connected. This plan connects them.

---

## 2. CURRENT STATE INVENTORY

### 2.1 Tracks
| Source | Count | Format | Location |
|--------|-------|--------|----------|
| Ace Step v1.5 | 13 selected tracks | WAV/MP3 | My Passport / SoundCloud_Ready/ |
| EDM Collection | 8 organized tracks | MP3 | My Passport / SoundCloud_Ready/EDM/ |
| NaSy Hub Tracks | 5 tracks | MP3 | My Passport / SoundCloud_Ready/NaSy_Hub_Tracks/ |
| Albums | 8 organized albums | Various | My Passport / SoundCloud_Ready/Albums/ |
| **Total available** | **~26+ tracks** | | |

**Selected singles (priority):** Hardstyle Aggressive, Hardstyle Pumping, Phonk High Energy, Pop Synth Upbeat

### 2.2 Atom Agent
| Capability | Status | Details |
|-----------|--------|---------|
| Visualizer engine | ✅ Built | BPM-synced, color schemes, scene generation |
| Fal.ai integration | ✅ Built | Video gen via queue.fal.run (Veo, Wan, etc.) |
| Marketing video types | ✅ Built | Brand videos, multi-scene scripts, social copy |
| HTTP API | ✅ Built | Agent on port 3001 |
| Audio embedding | ❌ Missing | Need to pipe actual Ace Step tracks as audio layer |
| Direct render-to-file | ❌ Missing | Need export endpoint for n8n consumption |

### 2.3 n8n
| Capability | Status | Details |
|-----------|--------|---------|
| n8n installed | ✅ Yes | Mac Mini, local |
| YouTube upload workflow | ✅ Exists | `youtube-upload.json` |
| Gumroad listing workflow | ✅ Exists | `gumroad-listing.json` |
| Instagram Reels posting | ❌ Missing | API integration needed |
| X posting | ❌ Missing |  |
| TikTok posting | ❌ Missing |  |
| Track queue management | ❌ Missing |  |
| Scheduler/rotation | ❌ Missing |  |

### 2.4 Platforms
| Platform | Account | API Access | Notes |
|----------|---------|-----------|-------|
| YouTube | nasyhub | YouTube Data API v3 | Shorts upload via API |
| Instagram | nasyhub | Graph API | Reels via Business Account |
| X (Twitter) | @nasyhub | Twitter API v2 | Media upload + tweet |
| TikTok | @nasyhub | TikTok API | Business account needed |

---

## 3. THE PIPELINE

### 3.1 High-Level Flow

```
n8n (scheduler) 
  → Pick track from queue (rotation)
  → Call Atom API: render short with track audio
  → Save rendered video file
  → Generate post copy (track name, hooks, hashtags, CTA)
  → Cross-post to all 4 platforms
  → Log to tracking sheet
  → Increment queue position
```

### 3.2 Daily Output

**One post = 15-30s short** with:
- Ace Step track playing (audio)
- Visualizer animated to BPM (Atom's scene engine)
- Track name + artist overlay
- "Made with Atom" watermark/footer
- "Create yours at atom.nasyhub.com" CTA
- Platform-optimized caption + hashtags

### 3.3 Weekly Rotation

| Day | Track Pool | Post Theme |
|-----|-----------|-----------|
| Mon | High energy (Hardstyle, Phonk) | "Start your week strong" |
| Tue | Atmospheric/Trap | "Deep focus vibes" |
| Wed | Pop/Synth | "Midweek boost" |
| Thu | Lo-fi/Chill | "Wind down Thursday" |
| Fri | High energy | "Weekend is here" |
| Sat | Album highlights | "New release / featured album" |
| Sun | Free / wildcard | "Community pick / throwback" |

**Rotation logic:** 26 tracks ÷ 7 days = 3.7 weeks before repeat. When a new track is added, insert into rotation.

---

## 4. TECHNICAL ARCHITECTURE

### 4.1 Component Tree

```
┌─────────────────────────────────────────────────┐
│                    n8n (Orchestrator)             │
│  ┌──────────┐  ┌──────────────┐  ┌────────────┐  │
│  │ Track    │  │ Render Queue │  │ Post Queue │  │
│  │ Queue    │→ │ (n8n + Atom) │→ │ (n8n)      │  │
│  │ (JSON)   │  │              │  │            │  │
│  └──────────┘  └──────┬───────┘  └──────┬─────┘  │
│                       │                  │        │
└───────────────────────┼──────────────────┼────────┘
                        │                  │
              ┌─────────▼──┐     ┌─────────▼────────┐
              │  Atom API  │     │  Platform APIs    │
              │  (port 3001)│    │  YT / IG / X / TT │
              │  + Fal.ai  │     │                   │
              └────────────┘     └───────────────────┘
```

### 4.2 Data Flow (Detailed)

**Step 1 — Track Selection (n8n)**
- Read `track_queue.json` (array of track objects)
- Each track has: `{ id, name, filePath, bpm, genre, duration, mood, artworkUrl, postedDates[] }`
- n8n picks the next unposted track, or the one with the longest gap since last post
- Updates queue position after selection

**Step 2 — Rendering (Atom API)**
- n8n calls Atom endpoint: `POST /api/render/short`
- Payload: `{ trackName, artist, bpm, mood, duration: 30, format: "vertical", audioUrl }`
- Atom generates visualizer scenes, submits to Fal.ai for video gen
- Fal.ai returns video URL (polling)
- Atom downloads the video, saves to local `~/atom-renders/` or Vercel Blob
- Returns: `{ videoUrl, thumbnailUrl, renderId }`

**Step 3 — Post Generation (n8n)**
- Caption template (auto-generated per track):
  ```
  🎵 {trackName} by {artist}
  
  Made with Atom — AI-powered music visualizers.
  Create your own at atom.nasyhub.com
  
  {hashtags}
  ```
- Platform-specific variations:
  - **YT Shorts:** Description + link in comments
  - **IG Reels:** Caption + music sticker
  - **X:** Short caption + link
  - **TT:** Caption with trending sounds

**Step 4 — Cross-Posting (n8n)**
- YouTube Shorts: YouTube Data API v3 (exists as `youtube-upload.json`)
- Instagram Reels: Facebook Graph API (Business Account required)
- X: Twitter API v2 (media upload + tweet)
- TikTok: TikTok Business API (requires approval)

**Step 5 — Logging (n8n)**
- Append to `post_log.json` or Notion/sheet:
  ```
  { date, trackId, renderId, platforms, status, engagement }
  ```
- Weekly summary: total posts, total views, top performers

### 4.3 File Storage

| Data | Storage | Path |
|------|---------|------|
| Track queue | JSON file | `~/.n8n/data/track_queue.json` |
| Track audio files | Local disk | `~/Desktop/ACE_Exports/` or Passport |
| Rendered videos | Local disk | `~/atom-renders/` |
| Post log | JSON file | `~/.n8n/data/post_log.json` |
| Post copy templates | JSON file | `~/.n8n/data/post_templates.json` |
| Platform auth tokens | n8n credentials | Encrypted in n8n |

---

## 5. BUILD PHASES

### Phase 1: Foundation (Week 1)
**Goal:** Single track, single platform, manual trigger

| Task | Detail | Est. Time |
|------|--------|-----------|
| 1.1 | Organize all Ace Step tracks into canonical location | 1h |
| 1.2 | Build track_queue.json with all 26 tracks, metadata | 30m |
| 1.3 | Build Atom `/api/render/short` endpoint (accepts audio URL, returns video) | 2-3h |
| 1.4 | Test: render one track manually via Atom, verify output | 1h |
| 1.5 | Set up YouTube Data API credentials in n8n | 30m |
| 1.6 | Adapt existing `youtube-upload.json` for Shorts upload | 1h |
| 1.7 | Manual test: n8n triggers render → download → YouTube upload | 1h |
| 1.8 | **Gate:** Verify end-to-end with real data, no shortcuts | 30m |

**Phase 1 Gate:** Can we render a track and post it to YouTube Shorts manually? If yes → Phase 2. If no → fix before moving.

### Phase 2: Automation (Week 2)
**Goal:** Daily scheduled post to YouTube Shorts

| Task | Detail | Est. Time |
|------|--------|-----------|
| 2.1 | Build n8n scheduler: daily at 10:00 AM | 1h |
| 2.2 | Add track rotation logic (pick by longest gap) | 1h |
| 2.3 | Build post_log.json append step | 30m |
| 2.4 | Add error handling: retry on failure, skip if already posted | 1h |
| 2.5 | **Gate:** Run 3 consecutive scheduled posts, verify all 3 land on YouTube | 1h |

**Phase 2 Gate:** 3 consecutive days of automated YouTube Shorts posts with zero manual intervention. If yes → Phase 3.

### Phase 3: Multi-Platform (Week 3)
**Goal:** Cross-post to YouTube + Instagram + X

| Task | Detail | Est. Time |
|------|--------|-----------|
| 3.1 | Set up Instagram Business Account + Graph API credentials | 1-2h |
| 3.2 | Build n8n Instagram Reels workflow | 2h |
| 3.3 | Set up X API v2 credentials (media + tweet) | 1h |
| 3.4 | Build n8n X post workflow | 1h |
| 3.5 | Build unified post workflow: render → YT → IG → X | 2h |
| 3.6 | Add platform-specific caption variations | 1h |
| 3.7 | **Gate:** Cross-post 1 video to all 3 platforms, verify | 1h |

**Phase 3 Gate:** Single render reaches all 3 platforms with correct formatting. If yes → Phase 4.

### Phase 4: Scale & Optimize (Week 4+)
**Goal:** Full pipeline, TikTok, tracking, refinement

| Task | Detail | Est. Time |
|------|--------|-----------|
| 4.1 | Add TikTok posting (if Business Account approved) | 1-2h |
| 4.2 | Build engagement tracking (views, likes, shares per post) | 1h |
| 4.3 | Add visual variation: randomize mood/color scheme per track | 30m |
| 4.4 | Add track album link in description (Gumroad/Spotify) | 30m |
| 4.5 | Build weekly report: n8n email summary of last 7 days | 1h |
| 4.6 | Review after 2 weeks of full operation | — |
| 4.7 | Iterate: drop underperforming tracks, double down on winners | Ongoing |

---

## 6. INFRASTRUCTURE & COST

| Component | Hosting | Monthly Cost |
|-----------|---------|-------------|
| n8n | Mac Mini (local) | $0 |
| Atom agent | Mac Mini (local) | $0 |
| Fal.ai video gen | Pay-per-use | ~$0.05-0.20/short |
| YouTube API | Free | $0 |
| Instagram API | Free | $0 |
| X API | Free (v2 basic) | $0 |
| TikTok API | Free | $0 |
| File storage | Local disk | $0 |
| **Total** | | **~$0.05-0.20/day (~$1.50-6/month)** |

**Fal.ai cost estimate:** 15-30s short via Wan 2.2 ($0.05/s) = $0.75-1.50 per video. 1/day = $22.50-45/month.

**Cost optimization:**
- Use Veo 3.1 Lite ($0.20/s) for lower quality / faster turnaround
- Or use Flux + image slideshow for near-zero visualizer cost
- Target: <$0.10/short for daily operation

---

## 7. POST TEMPLATES

### 7.1 YouTube Shorts
```
🎵 {trackName} — {genre}

Feeling this vibe? Drop a 🔥 if you agree.

Made with Atom — create your own AI music visualizers at atom.nasyhub.com

#nasyhub #acestep #{genreTag} #aitools #musicproduction #beatmaker #aivideo
```

### 7.2 Instagram Reels
```
🎵 {trackName} — {artist}

New beat dropping. Made with Atom.

Link in bio to create your own → atom.nasyhub.com

#nasyhub #{genreTag} #musicproducer #beats #aitools #reels
```

### 7.3 X (Twitter)
```
🎵 {trackName}

New track from Ace Step. Visuals by Atom.

Create your own music videos → atom.nasyhub.com

{genreTag} #nasyhub #aitools
```

### 7.4 TikTok
```
🎵 {trackName}

Made with Atom. You can make these too.

#nasyhub #acestep #{genreTag} #aitools #music
```

---

## 8. RISK & MITIGATION

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Fal.ai API down | Low | High | Queue renders, retry next cycle |
| Platform API rate limits | Medium | Medium | Stagger posts across 15-min intervals |
| YouTube copyright claim on own music | Low | Medium | Register as original content, dispute if needed |
| Instagram Reels API changes | Medium | High | Monitor Meta changelog, have fallback (manual post) |
| Fal.ai credits run out | Medium | High | Set budget alert, top up before empty |
| n8n crashes | Low | Medium | systemd auto-restart, daily health check |
| Track file moved/deleted | Low | Low | Track queue stores absolute path, file check before render |
| Daily post gets stale | Medium | Low | Weekly rotation, track variety, mood-based selection |

---

## 9. SUCCESS METRICS

| Metric | Week 1 Target | Month 1 Target | Month 3 Target |
|--------|-------------|---------------|---------------|
| Posts published | 5 | 28 | 90 |
| Total views | 1,000 | 10,000 | 100,000 |
| Avg views/post | 200 | 350 | 1,100 |
| Clicks to atom.nasyhub.com | 50 | 500 | 5,000 |
| New Atom users | 0 | 5 | 50 |
| New Gumroad sales | 0 | 3 | 20 |
| Cost per post | $0.15 | $0.10 | $0.05 |

---

## 10. WHAT WE'RE NOT DOING (YET)

- **Paid ads:** Organic only until we validate the loop
- **Influencer collabs:** Not until we have 30+ days of content
- **Custom per-track artwork:** Use existing album art or auto-generated
- **Multi-language:** English only
- **Response to comments:** Not automated — NaSy handles manually when worth it
- **Atom website SEO:** Separate project, not part of this pipeline

---

## 11. NEXT STEPS (Immediate)

1. **Review this plan** — NaSy approves or redlines
2. **Organize tracks** — copy all Ace Step tracks to `~/Desktop/Atom-Pipeline-Tracks/` with consistent naming
3. **Build track_queue.json** — metadata for all 26 tracks
4. **Start Phase 1** — Atom render endpoint, manual YouTube test
5. **Gate check** — before moving to Phase 2

---

*Plan is living — update as we learn. No improvisation during execution.*