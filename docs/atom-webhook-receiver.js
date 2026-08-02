#!/usr/bin/env node
/**
 * Atom Webhook Receiver v2
 * Receives jobs from Vercel → generates prompts → creates deliverables → sets 4hr timer
 */

import { createServer } from "http";
import { writeFile, mkdir, appendFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { spawn } from "child_process";

const JOBS_DIR = "/tmp/atom-jobs";
const PORT = process.env.PORT || 3180;
const DELIVERABLES_DIR = path.join(process.env.HOME, "Desktop", "Atom-Deliverables");

// ─── Template prompt generators ───────────────────────────────────────────────

const PROMPT_GENERATORS = {
  trades: (data) => [
    `Cinematic 60-second promo for ${data.businessName || "a trade business"}, specializing in ${data.tradeType || "home services"}. Services: ${[data.service1, data.service2, data.service3].filter(Boolean).join(", ") || "various trade services"}. Location: ${data.location || "local area"}.`,
    `Before/after transformation showcase: ${data.beforeAfterDesc || "quality workmanship demonstrated through completed projects"}. Certifications: ${data.certifications || "licensed professionals"}.`,
    `Call to action: "${data.ctaText || "Get a Free Quote"}" — ${data.ctaLink || "contact for quote"}. Language: ${data.language || "English"}.`,
  ],
  hospitality: (data) => [
    `Cinematic 60-second promo for ${data.businessName || "a hospitality venue"}, type: ${data.venueType || "restaurant/cafe"}. Cuisine: ${data.cuisine || "modern Australian"}. Location: ${data.location || "local area"}.`,
    `Atmosphere and experience: ${data.atmosphereDesc || "warm, inviting ambiance with exceptional service"}.`,
    `Call to action: "${data.ctaText || "Book Now"}" — ${data.ctaLink || "book online"}. Language: ${data.language || "English"}.`,
  ],
  fitness: (data) => [
    `High-energy 60-second promo for ${data.businessName || "a fitness studio"}, type: ${data.fitnessType || "gym/personal training"}. Specialties: ${[data.service1, data.service2, data.service3].filter(Boolean).join(", ") || "various fitness programs"}. Location: ${data.location || "local area"}.`,
    `Training philosophy: ${data.philosophyDesc || "results-driven training for all fitness levels"}. Certifications: ${data.certifications || "certified trainers"}.`,
    `Call to action: "${data.ctaText || "Join Now"}" — ${data.ctaLink || "sign up today"}. Language: ${data.language || "English"}.`,
  ],
  education: (data) => [
    `Professional 60-second promo for ${data.businessName || "an educational institution"}, type: ${data.educationType || "training provider"}. Programs: ${[data.service1, data.service2, data.service3].filter(Boolean).join(", ") || "various courses offered"}. Location: ${data.location || "local area"}.`,
    `Learning environment: ${data.environmentDesc || "state-of-the-art facilities with experienced instructors"}. Accreditations: ${data.accreditations || "nationally recognised"}.`,
    `Call to action: "${data.ctaText || "Enrol Now"}" — ${data.ctaLink || "enrol today"}. Language: ${data.language || "English"}.`,
  ],
  "real-estate": (data) => [
    `Cinematic 60-second property showcase for ${data.businessName || "a real estate agency"}, type: ${data.propertyType || "residential"}. Location: ${data.location || "prime location"}.`,
    `Property highlights: ${data.propertyHighlights || "stunning property with premium features"}. ${data.beds || 3} bed, ${data.baths || 2} bath. Price: ${data.price || "contact agent"}.`,
    `Call to action: "${data.ctaText || "Book Inspection"}" — ${data.ctaLink || "book now"}. Language: ${data.language || "English"}.`,
  ],
  wellness: (data) => [
    `Calming 60-second promo for ${data.businessName || "a wellness practice"}, type: ${data.wellnessType || "holistic health"}. Services: ${[data.service1, data.service2, data.service3].filter(Boolean).join(", ") || "various wellness services"}. Location: ${data.location || "local area"}.`,
    `Healing approach: ${data.approachDesc || "holistic approach to health and wellbeing"}. Certifications: ${data.certifications || "certified practitioners"}.`,
    `Call to action: "${data.ctaText || "Book Session"}" — ${data.ctaLink || "book today"}. Language: ${data.language || "English"}.`,
  ],
  healthcare: (data) => [
    `Professional 60-second promo for ${data.businessName || "a healthcare practice"}, type: ${data.practiceType || "medical practice"}. Services: ${[data.service1, data.service2, data.service3].filter(Boolean).join(", ") || "comprehensive healthcare services"}. Location: ${data.location || "local area"}.`,
    `Practice approach: ${data.approachDesc || "patient-centred care with experienced practitioners"}. Accreditations: ${data.qualifications || "registered healthcare professionals"}.`,
    `Call to action: "${data.ctaText || "Book Appointment"}" — ${data.ctaLink || "book online"}. Language: ${data.language || "English"}.`,
  ],
  automotive: (data) => [
    `Dynamic 60-second promo for ${data.businessName || "an automotive business"}, type: ${data.autoType || "dealership/service centre"}. Services: ${[data.service1, data.service2, data.service3].filter(Boolean).join(", ") || "comprehensive automotive services"}. Location: ${data.location || "local area"}.`,
    `Specialty: ${data.specialtyDesc || "expert service with quality guarantee"}. Certifications: ${data.certifications || "licensed and insured"}.`,
    `Call to action: "${data.ctaText || "Book Service"}" — ${data.ctaLink || "book now"}. Language: ${data.language || "English"}.`,
  ],
  "professional-services": (data) => [
    `Professional 60-second promo for ${data.businessName || "a professional services firm"}, type: ${data.serviceType || "consulting/business services"}. Services: ${[data.service1, data.service2, data.service3].filter(Boolean).join(", ") || "expert professional services"}. Location: ${data.location || "local area"}.`,
    `Value proposition: ${data.valuePropDesc || "trusted expertise delivering measurable results"}. Credentials: ${data.credentials || "industry recognised professionals"}.`,
    `Call to action: "${data.ctaText || "Get Started"}" — ${data.ctaLink || "contact today"}. Language: ${data.language || "English"}.`,
  ],
};

function generatePrompts(template, data) {
  const gen = PROMPT_GENERATORS[template];
  if (!gen) {
    return ["Cinematic 60-second business promo video", "Professional visual showcase", "Call to action included"];
  }
  return gen(data);
}

function generateSocialCopy(template, data) {
  const name = data.businessName || "Your Business";
  const location = data.location || "your local area";
  const cta = data.ctaText || "Get in Touch";
  const link = data.ctaLink || "[your link here]";
  const tempName = template.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase());
  
  return `# Social Media Copy — ${name}

## 📱 Instagram (60s Reel)
**Caption:**
From start to finish. 🛠️✨
${name} delivers quality ${tempName} services across ${location}.
Ready to transform your space? Tap the link in bio.

#${tempName.replace(/\s/g, "")}Services #${location.replace(/[^a-zA-Z]/g, "")} #LocalBusiness

## 🎵 TikTok
**Caption:**
The before and after you've been waiting for 👀
${name} — ${location}'s trusted ${tempName} professionals.
${cta} → ${link}

## ▶️ YouTube Shorts
**Title:** ${name} — ${tempName} Showcase
**Description:**
Professional ${tempName} services by ${name}.
📍 Serving ${location}
📞 ${cta}: ${link}

---

*Generated by Atom — AI Video Generator for Businesses*
*Template: ${template}*`;
}

function generateSummary(job, prompts, deliverableDir) {
  const { id, template, data, email, tier, photos, createdAt, refundDeadline } = job;
  const name = data?.businessName || "Unknown";
  
  return `╔════════════════════════════════════════╗
║     ATOM — Customer Order Summary       ║
╚════════════════════════════════════════╝

──────────────────────────────────────────
CUSTOMER DETAILS
──────────────────────────────────────────
Business:      ${name}
Email:         ${email}
Template:      ${template}
Tier:          ${tier}
Job ID:        ${id}
Submitted:     ${createdAt || "N/A"}
Status:        ${job.status}

──────────────────────────────────────────
FORM DATA
──────────────────────────────────────────
${Object.entries(data || {}).map(([k, v]) => `${k.padEnd(20)} ${v}`).join("\n")}

──────────────────────────────────────────
DELIVERABLES
──────────────────────────────────────────
Folder:        ${deliverableDir}
Photos:        ${photos?.length || 0} photo files
Prompts:       ${prompts.length} generated

Tier: ${tier}
${
  tier === "basic"
    ? "✓ 1× 60-second video (1080×1920 MP4)\n✓ AI-generated background music\n✓ Template motion graphics"
    : tier === "premium"
    ? "✓ 1× 60-second video (1080×1920 MP4)\n✓ Custom artwork direction\n✓ Genre-matched soundtrack\n✓ 4-scene cinematic arc\n✓ Title cards + transitions"
    : "✓ 2× 60-second videos (1080×1920 MP4)\n✓ Custom artwork direction\n✓ Genre-matched soundtrack\n✓ 4-scene cinematic arc\n✓ Title cards + transitions\n✓ 3 still frames per video\n✓ Auto-generated captions\n✓ Social media copy"
}

──────────────────────────────────────────
GENERATED PROMPTS
──────────────────────────────────────────
${prompts.map((p, i) => `[Prompt ${i + 1}] ${p}`).join("\n")}

──────────────────────────────────────────
REFUND WINDOW
──────────────────────────────────────────
Submitted at:  ${createdAt || "N/A"}
Refund by:     ${refundDeadline || "N/A (4 hours from submission)"}
Status:        ${job.status === "refunded" ? "⚠️ REFUNDED" : "Active"}

──────────────────────────────────────────`;
}

// ─── Webhook server ────────────────────────────────────────────────────────────

const server = createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.writeHead(200); res.end(); return; }

  // ─── GET /files/{jobId}/{filename} — serve photo files for Veo image-to-video ───
  if (req.method === "GET" && req.url.startsWith("/files/")) {
    const parts = req.url.replace("/files/", "").split("/");
    if (parts.length !== 2) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: "Invalid path. Use /files/{jobId}/{filename}" }));
      return;
    }
    const [jobId, filename] = parts;
    const filePath = path.join(JOBS_DIR, jobId, filename);
    // Security: prevent path traversal
    if (!filePath.startsWith(JOBS_DIR) || !filename.match(/^[a-zA-Z0-9_.-]+$/)) {
      res.writeHead(403);
      res.end(JSON.stringify({ error: "Forbidden" }));
      return;
    }
    try {
      const { readFile } = await import("fs/promises");
      const data = await readFile(filePath);
      const ext = path.extname(filename).toLowerCase();
      const mimeTypes = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };
      res.setHeader("Content-Type", mimeTypes[ext] || "image/jpeg");
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.writeHead(200);
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end(JSON.stringify({ error: "File not found" }));
    }
    return;
  }

  if (req.method !== "POST") { res.writeHead(405); res.end(JSON.stringify({ error: "GET /files or POST only" })); return; }

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = JSON.parse(Buffer.concat(chunks).toString());

    const { jobId, template, data, email, photos } = body;
    if (!jobId || !template || !email || !photos || !Array.isArray(photos)) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: "Missing required fields" }));
      return;
    }

    // 1. Save job files
    const jobDir = path.join(JOBS_DIR, jobId);
    await mkdir(jobDir, { recursive: true });
    
    const photoPaths = [];
    for (let i = 0; i < photos.length; i++) {
      const b64 = photos[i].replace(/^data:image\/\w+;base64,/, "");
      const ext = photos[i].startsWith("data:image/png") ? "png" : "jpg";
      const photoPath = path.join(jobDir, `photo-${i + 1}.${ext}`);
      await writeFile(photoPath, Buffer.from(b64, "base64"));
      photoPaths.push(photoPath);
    }

    // 2. Generate prompts
    const prompts = generatePrompts(template, data || {});

    // 3. Create deliverable folder on Desktop
    const safeName = (data?.businessName || "client").replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase();
    const deliverableDir = path.join(DELIVERABLES_DIR, `${safeName}-${jobId}`);
    await mkdir(deliverableDir, { recursive: true });

    // 4. Set refund deadline (4 hours from now)
    const createdAt = new Date().toISOString();
    const refundDeadline = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();

    // 5. Save job.json
    const job = {
      id: jobId,
      template,
      data: data || {},
      email,
      tier: body.tier || "basic",
      photos: photoPaths,
      status: "prompts_ready",
      createdAt,
      refundDeadline,
      generatedPrompts: prompts,
      deliverableDir,
      photoCount: photoPaths.length,
    };

    await writeFile(path.join(jobDir, "job.json"), JSON.stringify(job, null, 2));

    // 6. Generate deliverables (summary + social copy)
    const summary = generateSummary(job, prompts, deliverableDir);
    await writeFile(path.join(deliverableDir, "customer-summary.md"), summary);

    const socialCopy = generateSocialCopy(template, data || {});
    await writeFile(path.join(deliverableDir, "social-copy.md"), socialCopy);

    // 7. Delivery README
    await writeFile(path.join(deliverableDir, "README.txt"), [
      `Atom Deliverables — ${data?.businessName || "Client"}`,
      `Template: ${template} | Tier: ${body.tier || "basic"} | Job: ${jobId}`,
      `Customer: ${email}`,
      `Submitted: ${createdAt}`,
      `Refund window closes: ${refundDeadline}`,
      `Photos: ${photoPaths.length} uploaded`,
      `────────────────────────────`,
      `⏰ 4-hour delay active — video build starts after: ${refundDeadline}`,
      `Status: Prompts ready, deliverables folder populated.`,
      `Next: NaSy reviews after build completes.`,
    ].join("\n"));

    // 8. SCHEDULE the 4-hour build (via cron)
    const buildTime = new Date(Date.now() + 4 * 60 * 60 * 1000);
    scheduleBuild(jobId, buildTime);

    console.log(`\n[Atom] Job received & prepped: ${jobId}`);
    console.log(`[Atom]   Business: ${data?.businessName || "N/A"}`);
    console.log(`[Atom]   Template: ${template} | Tier: ${body.tier || "basic"}`);
    console.log(`[Atom]   Photos:   ${photoPaths.length}`);
    console.log(`[Atom]   Prompts:  ${prompts.length} generated`);
    console.log(`[Atom]   Refund:   ${refundDeadline}`);
    console.log(`[Atom]   Desktop:  ${deliverableDir}`);
    console.log(`[Atom]   Build at: ${buildTime.toISOString()}\n`);

    // Log to HITL log
    await appendFile(
      path.join(JOBS_DIR, "orders.log"),
      `${new Date().toISOString()} | ${jobId} | ${template} | ${data?.businessName || "?"} | ${email} | ${body.tier || "basic"} | ${photoPaths.length} photos\n`
    );

    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      jobId,
      refundDeadline,
      deliverableDir,
      promptsGenerated: prompts.length,
      buildScheduledAt: buildTime.toISOString(),
    }));

  } catch (err) {
    console.error("[Webhook] Error:", err);
    res.writeHead(500);
    res.end(JSON.stringify({ error: err.message }));
  }
});

// ─── 4-hour build scheduler ────────────────────────────────────────────────────

function scheduleBuild(jobId, buildTime) {
  const delayMs = buildTime.getTime() - Date.now();
  if (delayMs <= 0) {
    console.log(`[Scheduler] Build time already passed for ${jobId}, running now`);
    runBuild(jobId);
    return;
  }

  const hours = Math.floor(delayMs / 3600000);
  const mins = Math.floor((delayMs % 3600000) / 60000);
  console.log(`[Scheduler] ${jobId} — build scheduled in ${hours}h ${mins}m (at ${buildTime.toISOString()})`);

  // Use setTimeout for the 4-hour timer
  setTimeout(() => {
    console.log(`[Scheduler] Build time reached for ${jobId}`);
    runBuild(jobId);
  }, delayMs);
}

function runBuild(jobId) {
  const proc = spawn("node", [
    path.join(process.env.HOME, "atom-processor", "process-job.js"),
    "--job", path.join(JOBS_DIR, jobId, "job.json"),
  ], {
    stdio: "inherit",
    detached: true,
  });
  proc.on("exit", (code) => {
    console.log(`[Build] ${jobId} — process exited with code ${code}`);
  });
}

// ─── Start ──────────────────────────────────────────────────────────────────────

server.listen(PORT, () => {
  console.log(`\n━━━ Atom Webhook Receiver v2 ━━━`);
  console.log(`  Port:     ${PORT}`);
  console.log(`  Jobs:     ${JOBS_DIR}`);
  console.log(`  Desktop:  ${DELIVERABLES_DIR}`);
  console.log(`  Started:  ${new Date().toISOString()}\n`);
});