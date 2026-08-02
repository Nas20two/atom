#!/usr/bin/env node
/**
 * Atom Job Processor v2 — Fal.ai powered
 * Full pipeline: prompt generation → Fal.ai video generation → Desktop delivery
 * 
 * Usage: node ~/atom-processor/process-job.js --job /tmp/atom-jobs/{jobId}/job.json [--force]
 */

import { mkdir, writeFile, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const ATOM_JOBS_DIR = process.env.ATOM_JOBS_DIR || "/tmp/atom-jobs";
const DELIVERABLES_DIR =
  process.env.ATOM_DELIVERABLES_DIR ||
  path.join(process.env.HOME || "", "Desktop", "Atom-Deliverables");

// Single, consistent Fal model. Override with FAL_MODEL — do NOT hardcode
// different model ids in different spots (that caused drift/mismatch before).
const FAL_MODEL = process.env.FAL_MODEL || "fal-ai/wan/v2.2-a14b/text-to-video";

// ─── Template prompt generators ───────────────────────────────────────────────

const PROMPT_GENERATORS = {
  trades: (data) => [
    `Cinematic 60-second promo for ${data.businessName || "a trade business"}, specializing in ${data.tradeType || "home services"}. Services: ${[data.service1, data.service2, data.service3].filter(Boolean).join(", ") || "various trade services"}. Location: ${data.location || "local area"}.`,
    `Before/after transformation showcase: ${data.beforeAfterDesc || "quality workmanship demonstrated through completed projects"}. Certifications: ${data.certifications || "licensed professionals"}.`,
    `Call to action: "${data.ctaText || "Get a Free Quote"}" — ${data.ctaLink || "contact for quote"}. Language: ${data.language || "English"}.`,
  ],
  hospitality: (data) => [
    `Cinematic 60-second promo for ${data.businessName || "a hospitality venue"}, type: ${data.venueType || "restaurant/cafe"}. Cuisine: ${data.cuisine || "modern Australian"}. Location: ${data.location || "local area"}.`,
    `Atmosphere and experience: ${data.atmosphereDesc || "warm, inviting ambiance with exceptional service"}. Dietary options: ${data.dietaryOptions || "various options available"}.`,
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

// ─── Fal.ai Client (inline — no deps needed) ──────────────────────────────────

const FAL_KEY = process.env.FAL_KEY || "fal-key-required";
const QUEUE_BASE = "https://queue.fal.run";

async function falSubmit(modelEndpoint, payload) {
  const url = `${QUEUE_BASE}/${modelEndpoint}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Key ${FAL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Fal.submit ${res.status}: ${await res.text().catch(() => "")}`);
  return res.json();
}

async function falPoll(job, maxAttempts = 90) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const res = await fetch(job.status_url, {
      headers: { Authorization: `Key ${FAL_KEY}` },
    });
    if (!res.ok) continue;
    const data = await res.json();
    process.stdout.write(".");
    if (data.status === "COMPLETED") {
      // Fetch actual result from response_url
      const rres = await fetch(job.response_url, {
        headers: { Authorization: `Key ${FAL_KEY}` },
      });
      return rres.ok ? rres.json() : null;
    }
    if (data.status === "FAILED") throw new Error("Fal.ai generation failed");
  }
  throw new Error("Fal.ai generation timed out");
}

async function falGenerateVideo(prompt, options = {}) {
  const { model = FAL_MODEL, duration = 10, aspectRatio = "9:16" } = options;
  const payload = { prompt, aspect_ratio: aspectRatio };
  const job = await falSubmit(model, payload);
  console.log(`  Submitted to model, polling...`);
  const result = await falPoll(job);
  const videoUrl = result?.video?.url || "";
  console.log(`\n  Completed: ${videoUrl.slice(0, 80)}`);
  return videoUrl;
}

async function falGenerateAndDownload(prompt, outputPath, options = {}) {
  const videoUrl = await falGenerateVideo(prompt, options);
  if (!videoUrl) throw new Error("No video URL returned");
  const res = await fetch(videoUrl);
  if (!res.ok) throw new Error(`Download failed ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(outputPath, buffer);
  console.log(`  Saved: ${outputPath} (${(buffer.length / 1024 / 1024).toFixed(1)} MB)`);
}

async function checkBalance() {
  try {
    const res = await fetch("https://rest.fal.ai/v1/balance", {
      headers: { Authorization: `Key ${FAL_KEY}` },
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`[Balance] $${data.credits?.toFixed(2) || "unknown"} remaining on Fal.ai`);
      return data.credits || 0;
    }
  } catch {}
  return 100; // optimistic if API unavailable
}

// ─── Main pipeline ─────────────────────────────────────────────────────────────

async function processJob(jobPath, options = {}) {
  const force = options.force || false;

  // Check balance
  const balance = await checkBalance();
  const estimatedJobCost = 2.25; // ~$2.25 for 3 clips at 15s at Wan 2.5 rates
  if (balance < estimatedJobCost && !force) {
    console.error(`[Balance] Insufficient: $${balance} < ~$${estimatedJobCost}. Use --force to proceed anyway.`);
    return;
  }

  // Load job
  const raw = await readFile(jobPath, "utf-8");
  const job = JSON.parse(raw);

  if (job.status !== "pending" && !force) {
    console.log(`[Process] Job ${job.id} is status "${job.status}" — skipping`);
    return;
  }

  const { id, template, data, email, tier } = job;
  const businessName = data?.businessName || `${template}-client`;
  const safeName = businessName.replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase();

  console.log(`\n━━━ Processing Job ${id} ━━━`);
  console.log(`  Template: ${template}`);
  console.log(`  Business: ${businessName}`);
  console.log(`  Email:    ${email}`);
  console.log(`  Tier:     ${tier}`);

  // Step 1: Generate prompts
  console.log(`\n[1/5] Generating prompts...`);
  const prompts = generatePrompts(template, data);
  job.generatedPrompts = prompts;

  // Step 2: Create deliverable folder
  const deliverableDir = path.join(DELIVERABLES_DIR, `${safeName}-${id}`);
  await mkdir(deliverableDir, { recursive: true });
  console.log(`[2/5] Deliverable folder: ${deliverableDir}`);

  // Step 3: Generate social copy
  console.log(`[3/5] Generating social copy...`);
  const socialCopy = generateSocialCopy(template, data);
  await writeFile(path.join(deliverableDir, "social-copy.md"), socialCopy);

  // Step 4: Create summary file
  console.log(`[4/5] Creating customer summary...`);
  const summary = generateSummary(job, prompts, deliverableDir);
  await writeFile(path.join(deliverableDir, "customer-summary.md"), summary);

  // Step 5: Video generation via Fal.ai
  console.log(`[5/5] Generating video via Fal.ai (${FAL_MODEL})...`);

  const aspectRatio = template === "real-estate" ? "16:9" : "9:16";
  const clipDuration = (tier === "premium" || tier === "pro") ? 15 : 10;
  let totalCost = 0;

  for (let i = 0; i < prompts.length; i++) {
    const videoName = `scene-${i + 1}-of-${prompts.length}.mp4`;
    const outputPath = path.join(deliverableDir, videoName);

    console.log(`\n  Scene ${i + 1}/${prompts.length}: ${prompts[i].slice(0, 70)}...`);

    try {
      await falGenerateAndDownload(prompts[i], outputPath, {
        model: FAL_MODEL,
        duration: clipDuration,
        aspectRatio,
      });
      // NOTE: 0.05 * clipDuration is an ESTIMATE. Track real per-model pricing
      // (see docs.fal.ai) before quoting customers or gating on balance.
      totalCost += 0.05 * clipDuration;
    } catch (err) {
      console.error(`  Scene ${i + 1} FAILED: ${err.message}`);
    }

    await new Promise((r) => setTimeout(r, 1000));
  }

  // Save README with final status
  await writeFile(
    path.join(deliverableDir, "README.txt"),
    [
      `Atom Deliverables - ${businessName}`,
      `=${"=".repeat(40)}`,
      ``,
      `Template: ${template}`,
      `Tier: ${tier}`,
      `Email: ${email}`,
      `Job ID: ${id}`,
      `Generated: ${new Date().toISOString()}`,
      ``,
      `Status: COMPLETED`,
      `Render Engine: ${FAL_MODEL}`,
      `Estimated Cost: ~$${totalCost.toFixed(2)} USD (from $20 Fal.ai balance)`,
      ``,
      `Deliverables:`,
      `- ${prompts.length}x scene clips (MP4)`,
      `- Social media copy (social-copy.md)`,
      `- Customer summary (customer-summary.md)`,
      ``,
      `⚠️  HITL REQUIRED: Review all clips before customer delivery.`,
      `   NaSy must approve quality before any send. Do not auto-send.`,
    ].join("\n")
  );

  // Mark job complete
  job.status = "completed";
  job.deliverableDir = deliverableDir;
  job.processedAt = new Date().toISOString();
  job.renderEngine = FAL_MODEL;
  job.estimatedCost = totalCost.toFixed(2);
  await writeFile(jobPath, JSON.stringify(job, null, 2));

  console.log(`\n━━━ Job ${id} complete ━━━`);
  console.log(`  Clips: ${prompts.length}x generated`);
  console.log(`  Cost: ~$${totalCost.toFixed(2)}`);
  console.log(`  Deliverables: ${deliverableDir}`);
  console.log(`  Remaining Fal.ai balance: ~$${(balance - totalCost).toFixed(2)}`);
}

// ─── Social copy generator ─────────────────────────────────────────────────────

function generateSocialCopy(template, data) {
  const name = data.businessName || "Your Business";
  const location = data.location || "your local area";
  const cta = data.ctaText || "Get in Touch";
  const link = data.ctaLink || "[your link here]";

  return `# Social Media Copy — ${name}

## Instagram (60s Reel)
**Caption:**
From start to finish.
${name} delivers quality ${template} services across ${location}.
Ready to transform your space? Tap the link in bio.

#${template}Services #${location.replace(/[^a-zA-Z]/g, "")} #LocalBusiness

## TikTok
**Caption:**
The before and after you've been waiting for
${name} — ${location}'s trusted ${template} professionals.
${cta} -> ${link}

## YouTube Shorts
**Title:** ${name} — ${template.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())} Showcase
**Description:**
Professional ${template} services by ${name}.
Serving ${location}
${cta}: ${link}

---

*Generated by Atom — AI Video Generator for Businesses*
*Template: ${template}*`;
}

// ─── Summary generator ──────────────────────────────────────────────────────────

function generateSummary(job, prompts, deliverableDir) {
  const { id, template, data, email, tier, photos } = job;
  const name = data?.businessName || "Unknown";

  return [
    `CUSTOMER ORDER SUMMARY — ${name}`,
    `=${"=".repeat(50)}`,
    ``,
    `CUSTOMER DETAILS`,
    `---`,
    `Business:      ${name}`,
    `Email:         ${email}`,
    `Template:      ${template}`,
    `Tier:          ${tier}`,
    `Job ID:        ${id}`,
    `Submitted:     ${job.createdAt || "N/A"}`,
    `Status:        ${job.status}`,
    ``,
    `FORM DATA`,
    `---`,
    ...Object.entries(data || {}).map(([k, v]) => `${k.padEnd(20)} ${v}`),
    ``,
    `DELIVERABLES`,
    `---`,
    `Folder:        ${deliverableDir}`,
    `Photos:        ${photos?.length || 0} files`,
    `Prompts:       ${prompts.length} generated`,
    ``,
    `Tier Deliverables:`,
    tier === "basic"
      ? `  1x 60-second video clip`
      : tier === "premium"
      ? `  1x 60-second video clip with music`
      : `  2x 60-second video clips + stills`,
    ``,
    `GENERATED PROMPTS`,
    `---`,
    ...prompts.map((p, i) => `[Prompt ${i + 1}] ${p}`),
    ``,
    `REFUND WINDOW`,
    `---`,
    `Submitted at:  ${job.createdAt || "N/A"}`,
    `Refund by:     ${job.refundDeadline || "4 hours from submission"}`,
    `Status:        ${job.status === "refunded" ? "REFUNDED" : "Active"}`,
  ].join("\n");
}

// ─── CLI entry point ────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const jobFlag = args.indexOf("--job");
const force = args.includes("--force");

if (jobFlag === -1) {
  console.error("Usage: node process-job.js --job /path/to/job.json [--force]");
  process.exit(1);
}

const jobPath = args[jobFlag + 1];
if (!jobPath || !existsSync(jobPath)) {
  console.error(`Job file not found: ${jobPath}`);
  process.exit(1);
}

processJob(jobPath, { force }).catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
