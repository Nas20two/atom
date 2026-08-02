#!/usr/bin/env node
/**
 * Atom Video Processor
 * 
 * Processes Atom job queue items:
 * 1. Reads a job from stdin or creates from args
 * 2. Generates 4× 15-second clips via OpenRouter
 * 3. Stitches with ffmpeg
 * 4. Outputs final MP4
 * 
 * Usage:
 *   ./atom-processor.js --job '{"template":"real-estate","data":{...}}'
 *   ./atom-processor.js --file /path/to/job.json
 *   ./atom-processor.js --demo "A luxury apartment with ocean views"
 * 
 * Prerequisites:
 *   - OPENROUTER_API_KEY in environment
 *   - ffmpeg installed
 *   - Node.js 18+
 */

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { execSync, spawn } = require("child_process");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const API_BASE = "https://openrouter.ai/api/v1";

const OUTPUT_DIR = path.join(process.env.HOME || "/tmp", "atom-output");
const TUNNEL_URL = process.env.ATOM_TUNNEL_URL || "https://consisting-growing-piece-frontier.trycloudflare.com";

// ─── Template Prompt Builders ────────────────────────────────────────────

const TEMPLATE_PROMPTS = {
  "real-estate": (data) => {
    const { streetAddress, suburb, bedrooms, bathrooms, price, keyFeature1, keyFeature2, videoStyle } = data;
    const address = [streetAddress, suburb].filter(Boolean).join(", ");
    const features = [keyFeature1, keyFeature2, data.keyFeature3].filter(Boolean).join(", ");
    
    if (videoStyle === "Luxury Showcase") {
      return [
        `Cinematic aerial drone shot of a luxury ${data.propertyType || "estate"} at ${address || "prime location"}, prestige real estate film style, golden hour drone shot, luxurious architecture, manicured gardens`,
        `Interior tour of ${address || "luxury property"}, high-end finishes, marble countertops, designer fixtures, ${bedrooms || "spacious"} bedrooms, dramatic natural light through floor-to-ceiling windows`,
        `Highlighting exquisite features: ${features || "premium craftsmanship and designer details"}, slow cinematic reveal, luxury lifestyle imagery, infinity pool or panoramic views`,
        `Sunset establishing shot of ${address || "the luxury estate"}", dramatic sky, warm ambient lighting, "For Sale by Prestige Agent" text overlay area, ultra-luxury real estate photography style`,
      ].map((p) => `[Luxury Real Estate] ${p}`);
    }
    
    if (videoStyle === "Development/Off-Plan") {
      return [
        `Architectural visualization establishing shot of ${address || "new development"}, modern ${data.propertyType || "building"} design, artist impression or construction progress, sleek contemporary architecture`,
        `CGI-style interior walkthrough of ${address || "off-plan development"}, ${bedrooms || "designer"} bedrooms with built-in wardrobes, modern kitchen with island bench, premium fixtures in bathrooms`,
        `Development features showcase: ${features || "state-of-the-art amenities, rooftop terrace, gym, pool, concierge service"}, lifestyle and community focus, modern development marketing style`,
        `${address || "New development"} closing scene with artist impression, display suite or site photo, "Register Your Interest" text overlay, contact agent info, premium property development branding`,
      ].map((p) => `[Development Video] ${p}`);
    }
    
    if (videoStyle === "Rental") {
      return [
        `Bright welcoming shot of ${address || "rental property"}, ${data.propertyType || "home"} exterior, well-maintained garden or entryway, real estate rental photography style, natural daylight`,
        `Spacious interior tour of ${address || "rental property"}, ${bedrooms || ""} bedrooms ${bathrooms ? `and ${bathrooms} bathrooms` : ""}, neutral decor, ample natural light, practical layout showcase`,
        `Rental features: ${features || "modern conveniences, storage space, proximity to transport and shops"}, tenant-friendly focus, lifestyle shots of nearby cafes and parks`,
        `${address || "Rental property"} closing scene with "Available Now" overlay, contact agent, rental branding, bright and inviting atmosphere`,
      ].map((p) => `[Rental Property] ${p}`);
    }
    
    if (videoStyle === "Commercial") {
      return [
        `Professional commercial property establishing shot of ${address || "commercial space"}, modern ${data.propertyType || "office or retail"} building exterior, business district setting, professional real estate photography`,
        `Functional interior tour of ${address || "commercial space"}, open plan layout, high ceilings, professional fit-out, ${bedrooms || "multiple"} office spaces or retail floor area`,
        `Business features: ${features || "prime location, high foot traffic, parking, accessibility"}, commercial real estate focus, proximity to transport hubs and amenities`,
        `${address || "Commercial property"} closing scene with "For Lease / For Sale" overlay, contact commercial agent, professional business branding, city skyline background`,
      ].map((p) => `[Commercial Property] ${p}`);
    }
    
    // Default: Standard Listing
    return [
      `Cinematic aerial drone shot of a beautiful ${data.propertyType || "property"} at ${address || "a stunning location"}, luxury real estate photography style, golden hour lighting`,
      `Interior walkthrough of ${address || "modern property"}, ${bedrooms || ""} bedrooms ${bathrooms ? `and ${bathrooms} bathrooms` : ""}, bright natural light, premium finishes, smooth slow camera pan`,
      `Highlight feature: ${features || "stunning architecture and design"}, dynamic motion shot emphasizing the unique selling points of this property`,
      `Closing shot of ${address || "the property"} at sunset with warm ambient lighting, text overlay area, "For Sale" sign visible, cinematic real estate photography style`,
    ].map((p) => `[Real Estate Video] ${p}`);
  },

  "wellness": (data) => {
    const { businessName, practitionerName, service1, service2, brandVibe } = data;
    const services = [service1, service2, data.service3].filter(Boolean).join(", ");
    return [
      `Peaceful wellness center establishing shot with ${brandVibe || "calm"} atmosphere, ${businessName || "wellness studio"} entrance, soft natural lighting, zen garden or tranquil setting`,
      `${practitionerName || "Practitioner"} performing ${service1 || "healing session"} on client, professional healthcare setting, warm and caring atmosphere, smooth gentle camera movement`,
      `Close-up details of ${services || "wellness treatment services"}, aromatic oils, candles, peaceful ambiance, soft bokeh effect, relaxing color palette`,
      `Closing scene of ${businessName || "wellness center"} with ${brandVibe || "peaceful"} branding, client smiling, appointment booking call-to-action area, warm sunset lighting`,
    ].map((p) => `[Wellness Video] ${p}`);
  },

  "healthcare": (data) => {
    const { clinicName, specialty, conditionName, benefit1 } = data;
    return [
      `Professional medical clinic establishing shot of ${clinicName || "healthcare facility"}, ${specialty || "medical"} practice, clean modern interior, welcoming reception area`,
      `${specialty || "Medical"} professional explaining ${conditionName || "treatment"} to patient using modern medical technology, educational healthcare setting, warm professional lighting`,
      `Animated medical visualization showing ${benefit1 || "treatment benefits"}, healthcare infographic style, clean professional animation, patient education focused`,
      `${clinicName || "Medical practice"} closing scene with healthcare team, accessible and welcoming atmosphere, appointment booking area, professional medical branding`,
    ].map((p) => `[Health Education Video] ${p}`);
  },

  "custom": (data) => {
    const desc = data.description || data.product || "promotional video";
    return [
      `Cinematic establishing shot for ${desc}, professional videography style, golden hour lighting`,
      `Detailed product or service showcase for ${desc}, dynamic camera movement, professional setting`,
      `Highlighting key features and benefits of ${desc}, engaging visual storytelling`,
      `Closing scene for ${desc} with call to action, professional branding, warm inviting atmosphere`,
    ].map((p) => `[Promotional Video] ${p}`);
  },

  "trades": (data) => {
    const { businessName, tradeType, service1, service2, beforeAfterDesc, location } = data;
    const services = [service1, service2, data.service3].filter(Boolean).join(", ");
    return [
      `Professional establishing shot of a ${tradeType || "trade"} service vehicle and team at ${location || "a job site"}, ${businessName || "trade business"}, bright morning light, professional tradesman appearance`,
      `Before and after transformation shot showing ${beforeAfterDesc || "expert craftsmanship and quality workmanship"}, detailed close-up of finished work, premium materials, clean professional finish`,
      `${businessName || "Trade professional"} performing ${services || "expert trade services"}, safety equipment visible, professional work environment, skilled craftsmanship in action`,
      `${businessName || "Trade business"} closing scene with completed project showcase, customer satisfaction, ${location || "local service area"}, call to action for booking, professional trade branding`,
    ].map((p) => `[Trades & Home Services] ${p}`);
  },

  "hospitality": (data) => {
    const { venueName, venueType, cuisine, location, vibe, signature1, signature2 } = data;
    const signatures = [signature1, signature2, data.signature3].filter(Boolean).join(", ");
    return [
      `Cinematic establishing shot of ${venueName || "venue"}, a beautiful ${venueType || "restaurant"} in ${location || "a stunning location"}, ${vibe || "warm inviting"} atmosphere, golden hour exterior or moody evening lighting`,
      `Interior food and atmosphere showcase at ${venueName || "restaurant"}, ${cuisine || "signature"} dishes beautifully plated, ${signatures || "signature menu items"}, dim warm lighting, chef at work, premium dining experience`,
      `Lifestyle scene at ${venueName || "venue"}, ${vibe || "vibrant"} ambiance, guests enjoying ${cuisine || "the dining experience"}, wine being poured, laughter and conversation, experiential hospitality marketing`,
      `Closing shot of ${venueName || "venue"} with ${cuisine || "signature"} branding, ${location || "city or suburb location"}, table waiting for guests, reservation call-to-action, warm sunset or evening city lights background`,
    ].map((p) => `[Hospitality Video] ${p}`);
  },

  "education": (data) => {
    const { institution, courseName, qualification, deliveryMode, outcome1, outcome2 } = data;
    const outcomes = [outcome1, outcome2, data.outcome3].filter(Boolean).join(", ");
    return [
      `Cinematic establishing shot of ${institution || "educational institution"}, modern campus or ${deliveryMode || "online"} learning environment, professional training setting, students engaged in study, motivational learning atmosphere`,
      `Course showcase: ${courseName || "professional qualification"} (${qualification || "certification"}), classroom or ${deliveryMode || "online"} delivery scene, study materials, practical training, ${outcomes || "career-building skills"}`,
      `Student success highlight: ${outcomes || "career outcomes and professional growth"}, graduates in workplace or career setting, achievement celebration, testimonial-style shot`,
      `Closing shot of ${institution || "education provider"} with ${courseName || "course"} branding, enrolment call-to-action, campus or ${deliveryMode || "online"} environment, bright career-focused atmosphere`,
    ].map((p) => `[Education Video] ${p}`);
  },

  "fitness": (data) => {
    const { businessName, businessType, speciality, style, offer1, offer2 } = data;
    const offers = [offer1, offer2, data.offer3].filter(Boolean).join(", ");
    return [
      `High-energy establishing shot of ${businessName || "fitness studio"}, ${businessType || "gym"} interior with ${style || "motivational"} atmosphere, athletes training, state-of-the-art equipment, dynamic lighting`,
      `Action training montage at ${businessName || "gym"}, ${speciality || "transformation"} in progress, before-and-after transformations, intense workout closeups, sweat and determination`,
      `Community and results at ${businessName || "studio"}: ${offers || "personal training, group classes, transformation programs"}, clients achieving goals, supportive coaching environment, victory moments`,
      `Closing shot of ${businessName || "fitness brand"} with ${offers || "program offerings"} call-to-action, ${style || "motivational"} atmosphere, "Join Now" or "Free Trial" text overlay, energetic branding`,
    ].map((p) => `[Fitness Video] ${p}`);
  },

  "automotive": (data) => {
    const { businessName, businessType, speciality, style, highlight1, highlight2 } = data;
    const highlights = [highlight1, highlight2, data.highlight3].filter(Boolean).join(", ");
    return [
      `Cinematic establishing shot of ${businessName || "dealership"}, ${businessType || "premium dealership"} showroom or workshop, ${style || "professional"} atmosphere, ${speciality || "vehicles"} on display, clean automotive lighting`,
      `Showcase of ${businessName || "the business"}: ${highlights || "inventory, quality service, customer care"}, detailed shot of ${speciality || "vehicles and service"}, quality craftsmanship or premium inventory`,
      `Customer experience at ${businessName || "dealership"}: sales or service interaction, satisfied customer receiving keys or vehicle, ${style || "professional"} service environment, trust-building moment`,
      `Closing shot of ${businessName || "automotive brand"}, ${speciality || "specialty"} callout, showroom or workshop background, "Visit Us" or "Book Now" text overlay, professional automotive branding`,
    ].map((p) => `[Automotive Video] ${p}`);
  },

  "professional-services": (data) => {
    const { businessName, profession, speciality, style, service1, service2 } = data;
    const services = [service1, service2, data.service3].filter(Boolean).join(", ");
    return [
      `Professional establishing shot of ${businessName || "consultancy firm"}, ${profession || "professional services"} office environment, ${style || "professional"} atmosphere, modern workspace, confident team or professional at desk`,
      `Service expertise showcase: ${services || "expert advisory and consulting"}, ${speciality || "professional expertise"}, document review or client meeting setting, trust-building professional imagery`,
      `Client relationship scene at ${businessName || "firm"}: handshake or consultation, ${style || "trusted advisor"} moment, partnership and success, professional and approachable atmosphere`,
      `Closing shot of ${businessName || "professional brand"}, ${profession || "practice"} office or consultation room, "Book a Consultation" or "Get in Touch" text overlay, professional and trustworthy branding`,
    ].map((p) => `[Professional Services Video] ${p}`);
  },
};

/**
 * Expand 4 scene prompts to 6 by inserting transitional prompts between existing scenes
 * This gives us ~48s video (6 clips x 8s) from 4-scene templates
 */
function expandPrompts(prompts, data) {
  if (prompts.length >= 6) return prompts;
  
  const expanded = [];
  for (let i = 0; i < prompts.length; i++) {
    expanded.push(prompts[i]);
    if (i < prompts.length - 1) {
      // Insert a transitional prompt between scenes
      expanded.push(`Seamless transition shot connecting previous scene: ${prompts[i].slice(30, 100)} to ${prompts[i+1].slice(30, 100)}`);
    }
  }
  // If still less than 6, add b-roll filler
  while (expanded.length < 6) {
    expanded.push(`B-roll detail shot showcasing high-quality craftsmanship and professional atmosphere, cinematic slow motion, premium visual aesthetic`);
  }
  return expanded;
}

// ─── OpenRouter API ──────────────────────────────────────────────────────

function apiRequest(method, endpoint, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint.replace(/^\//, ""), API_BASE.replace(/\/?$/, "/"));
    const data = body ? JSON.stringify(body) : null;

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method,
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const raw = Buffer.concat(chunks).toString();
        try {
          resolve({ status: res.statusCode, data: JSON.parse(raw) });
        } catch {
          resolve({ status: res.statusCode, data: raw });
        }
      });
    });

    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function generateClip(prompt, duration = 8, model = "google/veo-3.1-lite") {
  return generateClipFromPhoto(null, prompt, duration, model);
}

async function generateClipFromPhoto(photoUrl, prompt, duration = 8, model = "google/veo-3.1-lite") {
  const isImageToVideo = !!photoUrl;
  const label = isImageToVideo ? `📸 Image→Video: "${prompt.slice(0, 50)}..."` : `🎬 Text→Video: "${prompt.slice(0, 50)}..."`;
  console.log(`\n${label}`);
  
  const body = {
    model,
    prompt: prompt.slice(0, 500),
    duration,
    size: "1080x1920",
    generate_audio: false,
  };

  // Image-to-video: add frame_images with the customer's photo
  if (isImageToVideo) {
    body.frame_images = [{
      type: "image_url",
      image_url: { url: photoUrl },
      frame_type: "first_frame",
    }];
    console.log(`   Photo URL: ${photoUrl.slice(0, 60)}...`);
  }

  const { status, data } = await apiRequest("POST", "/videos", body);

  if (status === 202 && data.id) {
    const jobId = data.id;
    console.log(`   Job submitted: ${jobId}`);

    for (let i = 0; i < 120; i++) {
      await sleep(5000);
      const poll = await apiRequest("GET", `/videos/${jobId}`);
      
      if (poll.status === 200 && poll.data) {
        const st = poll.data.status;
        console.log(`   Status: ${st}${poll.data.error ? ` (${poll.data.error})` : ""}`);
        
        if (st === "completed") {
          const urls = poll.data.unsigned_urls || [];
          if (urls.length > 0) {
            console.log(`   ✅ Complete! Download URL: ${urls[0].slice(0, 60)}...`);
            return urls;
          }
        }
        
        if (st === "failed") {
          throw new Error(`Generation failed: ${poll.data.error || "Unknown error"}`);
        }
      }
    }
    throw new Error("Timeout waiting for video generation");
  }

  throw new Error(`Failed to submit video: ${JSON.stringify(data)}`);
}

async function downloadVideo(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    const proto = url.startsWith("https") ? https : http;

    // OpenRouter video content URLs need auth
    const req = proto.request(
      url,
      { headers: url.includes("openrouter.ai") ? { Authorization: `Bearer ${OPENROUTER_API_KEY}` } : {} },
      (res) => {
        if (res.statusCode >= 300 && res.headers.location) {
          file.close();
          fs.unlinkSync(outputPath);
          return downloadVideo(res.headers.location, outputPath).then(resolve).catch(reject);
        }
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          const size = fs.statSync(outputPath).size;
          console.log(`   Downloaded: ${outputPath} (${(size / 1024 / 1024).toFixed(1)} MB)`);
          if (size < 1024) {
            const content = fs.readFileSync(outputPath, "utf-8");
            console.error(`   ⚠️  File too small, content: ${content.slice(0, 200)}`);
          }
          resolve(outputPath);
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

// ─── FFmpeg Processing ──────────────────────────────────────────────────

function generateFilters(template, data) {
  const filters = [];
  // Add text overlays for each clip
  return filters;
}

/**
 * Add Atom branding watermark overlay to a video
 * Uses overlay filter (drawtext not available in this ffmpeg build)
 */
// Path to pre-made Atom brand assets for watermark overlay
const ATOM_LOGO_DIR = path.join(process.env.HOME || "/tmp", "atom-output");
const ATOM_LOGO_PATH = path.join(ATOM_LOGO_DIR, "atom-logo-wordmark.png");
const ATOM_URL_BADGE_PATH = path.join(ATOM_LOGO_DIR, "atom-url-badge.png");

/**
 * Add Atom branding watermark overlay to a video
 * Uses pre-made Atom logo PNG (icon + wordmark) top-left
 * and "atom.nasyhub.com" URL badge bottom-right
 * Uses overlay filter (drawtext not available in this ffmpeg build)
 */
function addWatermark(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const outputDir = path.dirname(outputPath);
    
    // Use pre-made badge for bottom-right URL
    const bottomRightPng = path.join(outputDir, "atom-url-br.png");
    
    const { execSync } = require("child_process");
    
    try {
      execSync(`magick -size 240x35 xc:'rgba(0,0,0,0.35)' ` +
        `-font '/System/Library/Fonts/Helvetica.ttc' -pointsize 15 ` +
        `-fill white -gravity center -annotate +0+0 'atom.nasyhub.com' ` +
        `-bordercolor none -border 10x3 "${bottomRightPng}"`, { stdio: "pipe" });
    } catch (e) {
      console.log("   ⚠️  URL badge generation failed:", e.message);
      throw e;
    }

    // Check if pre-made Atom logo exists
    let logoPath = ATOM_LOGO_PATH;
    if (!fs.existsSync(logoPath)) {
      // Fallback: look for icon only
      logoPath = path.join(ATOM_LOGO_DIR, "atom-icon.png");
      if (!fs.existsSync(logoPath)) {
        console.log("   ⚠️  Atom logo assets not found at", ATOM_LOGO_DIR);
        // Copy from workspace as inline base64 fallback
        reject(new Error("Atom logo assets missing. Run setup first."));
        return;
      }
    }

    // Overlay both watermarks onto the video
    // Atom logo wordmark at top-left + URL badge at bottom-right
    const args = [
      "-i", inputPath,
      "-i", logoPath,
      "-i", bottomRightPng,
      "-filter_complex",
      "[0:v][1:v]overlay=20:20[bg];[bg][2:v]overlay=W-w-20:H-h-20",
      "-codec:a", "copy",
      "-y",
      outputPath,
    ];

    console.log(`\n©️  Adding Atom branding overlay to video...`);
    
    const proc = spawn("ffmpeg", args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    proc.stderr.on("data", (c) => { stderr += c; });
    
    proc.on("close", (code) => {
      // Cleanup generated URL badge
      try { fs.unlinkSync(bottomRightPng); } catch {}
      
      if (code === 0) {
        console.log(`   ✅ Atom branding overlay complete: ${outputPath}`);
        resolve(outputPath);
      } else {
        console.error("   ffmpeg error:", stderr.slice(-500));
        reject(new Error(`ffmpeg watermark exited with code ${code}`));
      }
    });
  });
}

function concatWithFFmpeg(inputFiles, outputPath) {
  return new Promise((resolve, reject) => {
    // Create concat file list
    const listPath = outputPath + ".files.txt";
    const lines = inputFiles.map((f) => `file '${f}'`);
    fs.writeFileSync(listPath, lines.join("\n"));

    const args = [
      "-f", "concat",
      "-safe", "0",
      "-i", listPath,
      "-c", "copy",
      "-y",
      outputPath,
    ];

    console.log(`\n✂️  Stitching ${inputFiles.length} clips...`);
    
    const proc = spawn("ffmpeg", args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    proc.stderr.on("data", (c) => { stderr += c; });
    
    proc.on("close", (code) => {
      fs.unlinkSync(listPath);
      if (code === 0) {
        const size = fs.statSync(outputPath).size;
        console.log(`   ✅ Stitched: ${outputPath} (${(size / 1024 / 1024).toFixed(1)} MB)`);
        resolve(outputPath);
      } else {
        console.error("   ffmpeg error:", stderr.slice(-500));
        reject(new Error(`ffmpeg exited with code ${code}`));
      }
    });
  });
}

function addMusicToVideo(videoPath, musicPath, outputPath) {
  return new Promise((resolve, reject) => {
    const args = [
      "-i", videoPath,
      "-i", musicPath,
      "-filter_complex", "[1:a]volume=0.3[a1]",
      "-map", "0:v",
      "-map", "[a1]",
      "-c:v", "copy",
      "-shortest",
      "-y",
      outputPath,
    ];

    console.log(`\n🎵 Adding music overlay...`);
    
    const proc = spawn("ffmpeg", args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    proc.stderr.on("data", (c) => { stderr += c; });
    
    proc.on("close", (code) => {
      if (code === 0) {
        console.log(`   ✅ Music added: ${outputPath}`);
        resolve(outputPath);
      } else {
        console.error("   ffmpeg error:", stderr.slice(-500));
        reject(new Error(`ffmpeg exited with code ${code}`));
      }
    });
  });
}

// ─── Personalized Motion Prompts from Customer Data ────────────────────

function buildMotionPrompts(template, data, count) {
  const name = data.businessName || "the business";
  const location = data.location || "";
  const services = [data.service1, data.service2, data.service3].filter(Boolean);
  const serviceText = services.length > 0 ? services.join(", ") : "professional services";
  const locationText = location ? ` in ${location}` : "";
  
  // Template-specific context
  const templateLabels = {
    trades: `${name}'s trades & home services${locationText} — ${serviceText}`,
    hospitality: `${name}${locationText} — ${data.venueType || "venue"} specializing in ${data.cuisine || "modern dining"}, ${serviceText}`,
    fitness: `${name}${locationText} — ${data.fitnessType || "fitness studio"} offering ${serviceText}`,
    education: `${name}${locationText} — ${data.educationType || "education provider"}, ${serviceText}`,
    "real-estate": `${name}${locationText} — ${data.propertyType || "real estate"}, ${serviceText}`,
    wellness: `${name}${locationText} — ${data.wellnessType || "wellness practice"}, ${serviceText}`,
    healthcare: `${name}${locationText} — ${data.practiceType || "healthcare practice"}, ${serviceText}`,
    automotive: `${name}${locationText} — ${data.autoType || "automotive business"}, ${serviceText}`,
    "professional-services": `${name}${locationText} — ${data.serviceType || "professional services"}, ${serviceText}`,
  };
  
  const context = templateLabels[template] || `${name}${locationText} — ${serviceText}`;
  
  // Motion patterns with customer context woven in
  const patterns = [
    `Slow cinematic establishing pan revealing ${context}, professional ${template} marketing video, warm natural lighting, realistic motion`,
    `Gentle zoom-in on ${name}'s key services: ${serviceText}, high-quality commercial videography, smooth parallax effect, polished look`,
    `Smooth tilt-up reveal of ${name}'s work${locationText ? ` in ${location}` : ""}, ${services[0] || "main service"} showcase, cinematic motion, professional atmosphere`,
    `Slow push-in on ${name}'s craftsmanship and ${serviceText}, dreamy atmospheric lighting, refined camera movement, premium quality`,
    `Graceful pan across ${name}'s ${template} operation${locationText}, showcasing ${services[1] || services[0] || "expert work"}, soft commercial lighting`,
    `Gentle camera drift through ${name}'s workspace, ${services.slice(0, 2).join(" and ") || serviceText} in focus, warm tones, professional videography style`,
  ];

  return patterns.slice(0, count);
}

// ─── Main Pipeline ───────────────────────────────────────────────────────

async function processJob(job, options = {}) {
  const model = options.model || "google/veo-3.1-lite";
  const addMusic = options.music !== false;
  const clipCount = options.clipCount || 6;
  const outputName = `atom-${job.template || "video"}-${Date.now()}`;
  const clipDir = path.join(OUTPUT_DIR, "clips");
  
  fs.mkdirSync(clipDir, { recursive: true });

  console.log(`\n${"=".repeat(50)}`);
  console.log(`🤖 Atom Video Processor`);
  console.log(`${"=".repeat(50)}`);
  console.log(`Template: ${job.template || "custom"}`);
  console.log(`Email:    ${job.email || "unknown"}`);
  console.log(`Tier:     ${job.tier || "basic"}`);
  console.log(`Model:    ${model}`);

  // Check for customer photos → use image-to-video if available
  const photos = job.photos || [];
  const hasPhotos = photos.length > 0;
  console.log(`Photos:   ${hasPhotos ? photos.length + " uploaded (image-to-video)" : "none (text-to-video fallback)"}`);

  const urls = [];

  if (hasPhotos) {
    // ─── IMAGE-TO-VIDEO: Animate customer photos ─────
    const data = job.data || {};
    const name = data.businessName || "Your Business";

    // Build personalized motion prompts using customer's actual data
    const MOTION_PROMPTS = buildMotionPrompts(job.template, data, clipCount);
    console.log(`\n🎬 Personalized motion prompts for ${name}:`);
    MOTION_PROMPTS.forEach((p, i) => console.log(`   ${i + 1}. ${p.slice(0, 80)}...`));

    // Convert local photo paths to tunnel URLs
    const jobId = job.id || path.basename(job.photos[0].split("/").slice(-2, -1)[0] || "unknown");
    for (let i = 0; i < Math.min(photos.length, clipCount); i++) {
      const photoPath = photos[i];
      const filename = path.basename(photoPath);
      // Extract jobId from the photo path: /tmp/atom-jobs/{jobId}/photo-N.jpg
      const pathParts = photoPath.split("/");
      const extractedJobId = pathParts[pathParts.length - 2] || jobId;
      const photoUrl = `${TUNNEL_URL}/files/${extractedJobId}/${filename}`;
      
      try {
        console.log(`\n📸 Photo ${i + 1}/${Math.min(photos.length, clipCount)}: ${photoPath}`);
        const clipUrls = await generateClipFromPhoto(
          photoUrl,
          MOTION_PROMPTS[i % MOTION_PROMPTS.length],
          options.clipDuration || 8,
          model
        );
        urls.push(...clipUrls);
      } catch (err) {
        console.error(`   ❌ Photo ${i + 1} failed: ${err.message}`);
        if (options.failFast) throw err;
      }
    }

    // Fill remaining clips with text-to-video transitions
    if (urls.length < clipCount) {
      const remaining = clipCount - urls.length;
      console.log(`\n📝 Generating ${remaining} transition clips via text-to-video...`);
      const promptBuilder = TEMPLATE_PROMPTS[job.template] || TEMPLATE_PROMPTS.custom;
      const textPrompts = expandPrompts(promptBuilder(job.data || {}), job.data).slice(0, remaining);
      for (let i = 0; i < textPrompts.length; i++) {
        try {
          const clipUrls = await generateClip(textPrompts[i], options.clipDuration || 8, model);
          urls.push(...clipUrls);
        } catch (err) {
          console.error(`   ❌ Transition clip ${i + 1} failed: ${err.message}`);
          if (options.failFast) throw err;
        }
      }
    }
  } else {
    // ─── TEXT-TO-VIDEO FALLBACK ─────
    console.log(`\n⚠️  No photos — using text-to-video (content filters may apply)`);
    const promptBuilder = TEMPLATE_PROMPTS[job.template] || TEMPLATE_PROMPTS.custom;
    const prompts = expandPrompts(promptBuilder(job.data || {}), job.data).slice(0, clipCount);

    console.log(`\n📝 Scene Script (${prompts.length} scenes):`);
    prompts.forEach((p, i) => console.log(`   ${i + 1}. ${p.slice(0, 80)}...`));

    for (let i = 0; i < prompts.length; i++) {
      try {
        const clipUrls = await generateClip(prompts[i], options.clipDuration || 8, model);
        urls.push(...clipUrls);
      } catch (err) {
        console.error(`   ❌ Clip ${i + 1} failed: ${err.message}`);
        if (options.failFast) throw err;
      }
    }
  }

  if (urls.length === 0) {
    throw new Error("No clips were generated successfully");
  }

  // Download clips
  console.log(`\n⬇️  Downloading ${urls.length} clip(s)...`);
  const clips = [];
  for (let i = 0; i < urls.length; i++) {
    const clipPath = path.join(clipDir, `clip-${i}.mp4`);
    await downloadVideo(urls[i], clipPath);
    clips.push(clipPath);
  }

  // Stitch clips
  const stitchedPath = path.join(OUTPUT_DIR, `${outputName}-stitched.mp4`);
  await concatWithFFmpeg(clips, stitchedPath);

  // Add watermark
  const watermarkedPath = path.join(OUTPUT_DIR, `${outputName}-watermarked.mp4`);
  await addWatermark(stitchedPath, watermarkedPath);

  // Add music (optional)
  let finalPath = watermarkedPath;
  if (addMusic) {
    const musicDir = path.join(process.env.HOME || "/tmp", "Desktop", "ACE_Exports");
    const musicFiles = fs.existsSync(musicDir) 
      ? fs.readdirSync(musicDir).filter(f => f.endsWith(".mp3") || f.endsWith(".wav"))
      : [];
    
    if (musicFiles.length > 0) {
      const musicPath = path.join(musicDir, musicFiles[0]);
      finalPath = path.join(OUTPUT_DIR, `${outputName}-final.mp4`);
      await addMusicToVideo(stitchedPath, musicPath, finalPath);
      console.log(`\n   Using music: ${musicFiles[0]}`);
    } else {
      console.log("\n   No music files found, skipping music overlay");
      finalPath = path.join(OUTPUT_DIR, `${outputName}-final.mp4`);
      fs.copyFileSync(stitchedPath, finalPath);
    }
  }

  // Cleanup clips
  clips.forEach((c) => fs.unlinkSync(c));
  console.log(`   🧹 Clips cleaned up`);

  const finalSize = fs.statSync(finalPath).size;
  console.log(`\n${"=".repeat(50)}`);
  console.log(`✅ ATOM VIDEO COMPLETE`);
  console.log(`${"=".repeat(50)}`);
  console.log(`File: ${finalPath}`);
  console.log(`Size: ${(finalSize / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Duration: ~${prompts.length * 8}s`);

  return finalPath;
}

// ─── CLI Entry ───────────────────────────────────────────────────────────

async function main() {
  if (!OPENROUTER_API_KEY) {
    console.error("❌ OPENROUTER_API_KEY not set");
    process.exit(1);
  }

  const args = process.argv.slice(2);
  let job = null;
  let options = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--job") {
      job = JSON.parse(args[++i]);
    } else if (args[i] === "--file") {
      job = JSON.parse(fs.readFileSync(args[++i], "utf-8"));
    } else if (args[i] === "--demo") {
      const prompt = args[++i];
      job = { template: "custom", data: { description: prompt }, email: "demo@atom.local" };
    } else if (args[i] === "--model") {
      options.model = args[++i];
    } else if (args[i] === "--duration") {
      options.clipDuration = parseInt(args[++i]);
    } else if (args[i] === "--no-music") {
      options.music = false;
    }
  }

  if (!job) {
    console.log(`
Usage:
  atom-processor.js --job <json>       Process a job object
  atom-processor.js --file <path>      Process a job JSON file
  atom-processor.js --demo <prompt>    Demo with a text prompt
  atom-processor.js --model <id>       Model override (default: google/veo-3.1-lite)

Examples:
  atom-processor.js --demo "A luxury apartment with ocean views at sunset"
  atom-processor.js --model alibaba/wan-2.6 --demo "Modern office space tour"
  atom-processor.js --file ~/atom-jobs/job-123.json
    `);
    process.exit(0);
  }

  try {
    const output = await processJob(job, options);
    console.log(`\n📬 Output: ${output}`);
  } catch (err) {
    console.error("\n❌ Processing failed:", err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { processJob, TEMPLATE_PROMPTS };