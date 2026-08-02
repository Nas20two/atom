"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Music, Film, ArrowRight, Building2, Heart, Stethoscope, MoreHorizontal, Check, AtomIcon, Volume2, Wrench, UtensilsCrossed, GraduationCap, Dumbbell, Car, Briefcase, X, Target, Lightbulb, Users, Globe, Film as FilmIcon, FileText, TrendingUp, MessageSquare, Handshake, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

// Premium Atom Theme — Blue → Orange gradient signature
const atomStyles = `
.atom-orbits { position: fixed; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
.atom-orbit { position: absolute; top: 50%; left: 50%; border: 1px solid rgba(0, 110, 254, 0.06); border-radius: 50%; transform-origin: center; animation: atom-spin linear infinite; }
.atom-orbit-1 { width: 600px; height: 200px; margin: -100px 0 0 -300px; animation-duration: 30s; }
.atom-orbit-2 { width: 200px; height: 600px; margin: -300px 0 0 -100px; animation-duration: 40s; animation-direction: reverse; }
.atom-orbit-3 { width: 500px; height: 350px; margin: -175px 0 0 -250px; animation-duration: 35s; transform: rotate(45deg); }
.atom-particle { position: absolute; width: 4px; height: 4px; background: #006efe; border-radius: 50%; box-shadow: 0 0 8px 2px rgba(0, 110, 254, 0.5); animation: atom-drift linear infinite; }
.atom-particle:nth-child(1) { top: 0; left: 50%; animation-duration: 30s; }
.atom-particle:nth-child(2) { top: 50%; left: 0; animation-duration: 40s; animation-delay: -10s; }
.atom-particle:nth-child(3) { bottom: 0; left: 50%; animation-duration: 35s; animation-delay: -20s; }
@keyframes atom-spin { to { transform: rotate(360deg); } }
@keyframes atom-drift {
  0% { transform: translate(0, 0) scale(1); opacity: 0.8; }
  25% { transform: translate(150px, -80px) scale(1.5); opacity: 1; }
  50% { transform: translate(0, -160px) scale(0.8); opacity: 0.6; }
  75% { transform: translate(-150px, -80px) scale(1.2); opacity: 1; }
  100% { transform: translate(0, 0) scale(1); opacity: 0.8; }
}

/* Card orbital hover */
.atom-card { position: relative; transition: all 0.3s ease; }
.atom-card::before { content: ''; position: absolute; inset: -1px; border-radius: inherit; background: conic-gradient(from 0deg, transparent, rgba(0,110,254,0.25), transparent, rgba(232,100,44,0.15), transparent); opacity: 0; transition: opacity 0.4s ease; mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude; padding: 1px; }
.atom-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,110,254,0.08); }
.atom-card:hover::before { opacity: 1; animation: atom-spin 3s linear infinite; }

/* Orange-accented card variant */
.atom-card-orange { position: relative; transition: all 0.3s ease; }
.atom-card-orange::before { content: ''; position: absolute; inset: -1px; border-radius: inherit; background: conic-gradient(from 0deg, transparent, rgba(232,100,44,0.25), transparent, rgba(0,110,254,0.15), transparent); opacity: 0; transition: opacity 0.4s ease; mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude; padding: 1px; }
.atom-card-orange:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(232,100,44,0.08); }
.atom-card-orange:hover::before { opacity: 1; animation: atom-spin 3s linear infinite; }

.atom-btn { position: relative; overflow: hidden; }
.atom-btn::after { content: ''; position: absolute; inset: -50%; background: conic-gradient(from 0deg, transparent, rgba(0,110,254,0.12), transparent, rgba(232,100,44,0.08), transparent); animation: atom-spin 4s linear infinite; opacity: 0; transition: opacity 0.3s; }
.atom-btn:hover::after { opacity: 1; }

/* Gradient text utility */
.atom-gradient-text { background: linear-gradient(135deg, #006efe, #4a8eff, #e8642c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

/* Video ring decoration */
.atom-video-ring { position: relative; }
.atom-video-ring::after { content: ''; position: absolute; inset: -3px; border-radius: inherit; border: 1px solid rgba(0,110,254,0.12); animation: atom-spin 20s linear infinite; clip-path: polygon(0 0, 30% 0, 30% 100%, 0 100%); }
`;

const templates = [
  {
    id: "real-estate",
    name: "Real Estate",
    icon: Building2,
    description: "Turn property listings into cinematic 60-second videos. For sale, rent, and development.",
    accent: "blue",
    status: "active" as const,
    href: "/atom/real-estate",
    badge: "New",
  },
  {
    id: "wellness",
    name: "Wellness",
    icon: Heart,
    description: "Brand promos for reiki, yoga, massage, and holistic health practitioners.",
    accent: "orange",
    status: "active" as const,
    href: "/atom/wellness",
    badge: "New",
  },
  {
    id: "healthcare",
    name: "Health Education",
    icon: Stethoscope,
    description: "Patient-friendly explainer videos for clinics, hospitals, and health services.",
    accent: "blue",
    status: "active" as const,
    href: "/atom/healthcare",
    badge: "",
  },
  {
    id: "trades",
    name: "Trades & Home Services",
    icon: Wrench,
    description: "Before & after showcases for plumbers, electricians, landscapers, and more.",
    accent: "orange",
    status: "active" as const,
    href: "/atom/trades",
    badge: "New",
  },
  {
    id: "hospitality",
    name: "Hospitality & Venues",
    icon: UtensilsCrossed,
    description: "Cinematic venue showcases for restaurants, cafes, hotels, bars, and breweries.",
    accent: "orange",
    status: "active" as const,
    href: "/atom/hospitality",
    badge: "New",
  },
  {
    id: "education",
    name: "Education & Training",
    icon: GraduationCap,
    description: "Course promos for RTOs, universities, colleges, and online training providers.",
    accent: "blue",
    status: "active" as const,
    href: "/atom/education",
    badge: "New",
  },
  {
    id: "fitness",
    name: "Fitness & Gym",
    icon: Dumbbell,
    description: "High-energy promos for gyms, personal trainers, yoga studios, and coaches.",
    accent: "orange",
    status: "active" as const,
    href: "/atom/fitness",
    badge: "New",
  },
  {
    id: "automotive",
    name: "Automotive & Dealerships",
    icon: Car,
    description: "Showcases for car dealers, detailers, mechanics, and auto shops.",
    accent: "blue",
    status: "active" as const,
    href: "/atom/automotive",
    badge: "New",
  },
  {
    id: "professional-services",
    name: "Professional Services",
    icon: Briefcase,
    description: "Brand videos for consultants, accountants, lawyers, brokers, and agencies.",
    accent: "blue",
    status: "active" as const,
    href: "/atom/professional-services",
    badge: "New",
  },
  {
    id: "more",
    name: "More Templates",
    icon: MoreHorizontal,
    description: "E-commerce, events, food & bev — more industry templates on the way.",
    accent: "muted",
    status: "coming" as const,
    href: "#",
    badge: "Coming Soon",
  },
];

const steps = [
  {
    icon: Sparkles,
    title: "Pick a Template",
    desc: "Choose your industry — real estate, wellness, healthcare, or more. Each template has fields tailored to your needs.",
  },
  {
    icon: Volume2,
    title: "Fill the Form",
    desc: "Enter your details and upload assets in about 2 minutes. Industry-specific fields make it fast.",
  },
  {
    icon: Film,
    title: "AI Generates Your Video",
    desc: "Atom assembles a cinematic 60-second video with matched music, motion, and branding. Delivered to your inbox within 24 hours.",
  },
];

const tiers = [
  {
    name: "One Video",
    price: 19,
    desc: "60-second cinematic video. Pick any industry template and get an AI-generated short with music, motion, and branding.",
    features: [
      "60-second 1080×1920 vertical MP4",
      "Any industry template",
      "AI-generated background music",
      "Cinematic motion graphics",
      "Email delivery within 24 hours",
    ],
    priceId: "basic",
  },
  {
    name: "Pro",
    price: 49,
    desc: "Two 60-second videos + still frames + captions + social copy for a full launch.",
    features: [
      "Everything in One Video, plus:",
      "2× 60-second videos",
      "3 still frames per video",
      "Auto-generated captions",
      "Social media copy (TikTok, IG, YT)",
      "Priority 12-hour delivery",
    ],
    priceId: "pro",
    popular: true,
  },
  {
    name: "Marketing Agent",
    price: 29,
    desc: "Monthly subscription — 2 videos/mo with AI audience research + Facebook-ready export.",
    monthly: true,
    features: [
      "2× 60-second videos per month",
      "AI audience research (pain points + hooks + platform)",
      "Static brand image per video",
      "Facebook-ready export (caption + hashtags + thumbnail)",
      "Automatic brand consistency check",
      "Cancel anytime — no lock-in",
    ],
    priceId: "agent",
  },
];

export default function AtomPage() {
  const [videoTab, setVideoTab] = useState("promo");
  const [email, setEmail] = useState("");
  const [product, setProduct] = useState("");
  const [tier, setTier] = useState("pro");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Research state
  const [research, setResearch] = useState<any>(null);
  const [researchLoading, setResearchLoading] = useState(false);
  const [researchError, setResearchError] = useState("");
  // Campaign modal state
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [campaignForm, setCampaignForm] = useState({ productName: "", valueProp: "", targetAudience: "", industry: "" });
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [campaignPlan, setCampaignPlan] = useState<any>(null);
  const [campaignError, setCampaignError] = useState("");

  useEffect(() => {
    document.title = "Atom — AI Video Generator | Real Estate, Wellness & Healthcare Templates";
  }, []);

  // Honor a ?tier= query param (e.g. when arriving from the pricing page),
  // preselecting the corresponding pay-per-video tier in the checkout section.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("tier");
    if (t === "basic" || t === "pro" || t === "agent") setTier(t);
  }, []);

  const handleResearch = async () => {
    if (!product) { setError("Enter a product description first"); return; }
    setResearchLoading(true); setResearchError(""); setResearch(null);
    try {
      const res = await fetch("/api/atom/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName: product, valueProp: product, industry: "" }),
      });
      const data = await res.json();
      if (data.success && data.research) { setResearch(data.research); }
      else { setResearchError(data.error || "Research failed"); }
    } catch { setResearchError("Failed to research audience"); }
    finally { setResearchLoading(false); }
  };

  const handleCheckout = async () => {
    if (!email) { setError("Email is required"); return; }
    if (!product) { setError("Product description is required"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/create-atom-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, product, tier }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; }
      else { setError(data.error || "Something went wrong"); }
    } catch { setError("Failed to create checkout session"); }
    finally { setLoading(false); }
  };

  const generateCampaignPlan = async () => {
    if (!campaignForm.productName || !campaignForm.valueProp) return;
    setCampaignLoading(true);
    setCampaignError("");
    setCampaignPlan(null);
    try {
      const res = await fetch("/api/atom/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campaignForm),
      });
      const data = await res.json();
      if (data.success && data.plan) {
        setCampaignPlan(data.plan);
      } else {
        setCampaignError(data.error || "Failed to generate plan");
      }
    } catch {
      setCampaignError("Failed to connect. Please try again.");
    } finally {
      setCampaignLoading(false);
    }
  };

  return (
    <>
      <style>{atomStyles}</style>
      <div className="atom-orbits">
        <div className="atom-orbit atom-orbit-1"><div className="atom-particle"></div></div>
        <div className="atom-orbit atom-orbit-2"><div className="atom-particle"></div></div>
        <div className="atom-orbit atom-orbit-3"><div className="atom-particle"></div></div>
      </div>

      <main className="min-h-screen bg-background flex flex-col items-center px-4 relative overflow-hidden">
        <div className="max-w-5xl w-full relative z-10 pt-20">
          {/* Nav */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-20"
          >
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
              ← NaSy Hub
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/atom#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link href="/atom#templates" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Templates</Link>
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <AtomIcon className="w-3.5 h-3.5" style={{ color: '#e8642c' }} /> atom.nasyhub.com
              </span>
            </div>
          </motion.div>

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-24"
          >
            <img
              src="/atom-logo.png"
              alt="Atom"
              className="w-36 h-auto mx-auto mb-3"
            />
            <h2 className="text-6xl md:text-8xl font-bold tracking-tight text-foreground mb-1 leading-none"
                style={{ color: '#00e5ff', textShadow: '0 0 40px rgba(0, 229, 255, 0.3)' }}>
              Atom
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto mb-0"
               style={{ color: '#80d4ff', letterSpacing: '0.15em' }}>
              The smallest unit of marketing
            </p>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent mx-auto my-6" />
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-4 leading-tight">
              AI Video.
              <br />
              <span className="atom-gradient-text">60 Seconds. Any Industry.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Pick a template, fill a form, and let AI generate a cinematic 60-second video
              with matched music, motion, and branding. No editing. No studio. Just results.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-card/80 border border-border/60 text-sm text-muted-foreground">
                <span className="text-blue-400 text-lg">⚡</span>
                <span>
                  How do I know? Because <strong className="text-foreground">this page was built by AI</strong>.
                  Atom eats its own dogfood.
                </span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/5 border border-green-500/10 text-sm">
                <span className="text-green-400">✓</span>
                <span className="text-muted-foreground"><span className="text-foreground font-semibold">$19</span> vs <span className="text-muted-foreground/50">$3,000+ agency video</span></span>
                <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 text-xs font-medium">95% less</span>
              </div>
            </div>
          </motion.div>

          {/* —— Campaign CTA —— */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-3 px-1">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-500/30" />
              <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground/50">Get Started</span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-orange-500/30" />
            </div>
            <motion.button
              onClick={() => setShowCampaignModal(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6 group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-orange-500 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              <Target className="w-5 h-5" />
              Launch Your Campaign
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </motion.button>
            <p className="text-xs text-muted-foreground/50 mt-3">
              Get a full marketing plan + 60-second video in one go
            </p>
          </motion.div>

          {/* —— Template Grid —— */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-24 scroll-mt-20"
            id="templates"
          >
            <h2 className="text-2xl font-bold text-center mb-2 text-foreground">Choose Your Template</h2>
            <p className="text-muted-foreground text-sm text-center mb-10">Each template has fields tailored to your industry.</p>
            <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {templates.map((template, i) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
                >
                  {template.status === "active" ? (
                    <Link
                      href={template.href}
                      className={`block relative p-6 rounded-2xl border transition-all ${
                        template.accent === "orange"
                          ? "border-orange-500/20 bg-card hover:border-orange-500/40 atom-card-orange"
                          : "border-blue-500/15 bg-card hover:border-blue-500/35 atom-card"
                      }`}
                    >
                      {template.badge && (
                        <div className="absolute -top-3 left-4 px-3 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-orange-500 text-white shadow-lg">
                          {template.badge}
                        </div>
                      )}
                      <template.icon
                        className="w-8 h-8 mb-3"
                        style={{ color: template.accent === "orange" ? '#e8642c' : '#006efe' }}
                      />
                      <h3 className="text-lg font-semibold text-foreground mb-1">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      <div className="mt-4 flex items-center gap-1 text-sm font-medium"
                        style={{ color: template.accent === "orange" ? '#e8642c' : '#006efe' }}
                      >
                        Create a video <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </Link>
                  ) : (
                    <div className="relative p-6 rounded-2xl border border-border bg-card/30 opacity-50 cursor-not-allowed">
                      <template.icon className="w-8 h-8 mb-3 text-muted-foreground" />
                      <h3 className="text-lg font-semibold text-foreground mb-1">{template.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                      <span className="inline-block text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        {template.badge}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* —— How It Works —— */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mb-24"
          >
            <h2 className="text-2xl font-bold text-center mb-2 text-foreground">How It Works</h2>
            <p className="text-muted-foreground text-sm text-center mb-10">Three steps from template to video.</p>
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {steps.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.12, duration: 0.6 }}
                  className="atom-card relative p-6 rounded-2xl border border-blue-500/10 bg-card/60 backdrop-blur-sm text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[rgba(0,110,254,0.1)] to-[rgba(232,100,44,0.1)] flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-sm font-bold mb-1 atom-gradient-text">STEP {i + 1}</div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* —— Made By Atom (Demo Videos) —— */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mb-24 text-center"
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">Made By Atom</h2>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto mb-6">
              The music, the visuals, the motion — all AI, all Atom. These demos were generated
              by the same pipeline that makes yours.
            </p>

            {/* Video Tabs */}
            <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
              <button
                onClick={() => setVideoTab("promo")}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  videoTab === "promo"
                    ? "bg-gradient-to-r from-blue-600 to-orange-500 text-white shadow-lg"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                🎬 Full Promo — 60s
              </button>
              <button
                onClick={() => setVideoTab("ai")}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  videoTab === "ai"
                    ? "bg-gradient-to-r from-blue-600 to-orange-500 text-white shadow-lg"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                ✨ AI Motion — 8s
              </button>
              <button
                onClick={() => setVideoTab("reiki-hi")}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  videoTab === "reiki-hi"
                    ? "bg-gradient-to-r from-blue-600 to-orange-500 text-white shadow-lg"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                🧘 Client: Reiki (हिन्दी)
              </button>
              <button
                onClick={() => setVideoTab("reiki-en")}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  videoTab === "reiki-en"
                    ? "bg-gradient-to-r from-blue-600 to-orange-500 text-white shadow-lg"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                🧘 Client: Reiki (English)
              </button>
              <button
                onClick={() => setVideoTab("real-estate")}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  videoTab === "real-estate"
                    ? "bg-gradient-to-r from-blue-600 to-orange-500 text-white shadow-lg"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                🏡 Real Estate — 6s
              </button>
              <button
                onClick={() => setVideoTab("trades")}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  videoTab === "trades"
                    ? "bg-gradient-to-r from-blue-600 to-orange-500 text-white shadow-lg"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                🔧 Trades — 4s
              </button>
            </div>

            <div className="atom-video-ring max-w-sm mx-auto rounded-2xl overflow-hidden border border-blue-500/20 shadow-2xl shadow-blue-500/5">
              {videoTab === "promo" ? (
                <video key="promo" className="w-full h-auto" controls playsInline poster="/atom-brand-card.jpg">
                  <source src="/atom-promo.mp4" type="video/mp4" />
                </video>
              ) : videoTab === "ai" ? (
                <video key="ai-motion" className="w-full h-auto" controls playsInline poster="/atom-brand-card.jpg">
                  <source src="/atom-ai-motion.mp4" type="video/mp4" />
                </video>
              ) : videoTab === "reiki-hi" ? (
                <video key="reiki-hi" className="w-full h-auto" controls playsInline>
                  <source src="/reiki-promo-hindi.mp4" type="video/mp4" />
                </video>
              ) : videoTab === "reiki-en" ? (
                <video key="reiki-en" className="w-full h-auto" controls playsInline>
                  <source src="/reiki-promo-english.mp4" type="video/mp4" />
                </video>
              ) : videoTab === "trades" ? (
                <video key="trades" className="w-full h-auto" controls playsInline>
                  <source src="/atom-trades-demo.mp4" type="video/mp4" />
                </video>
              ) : (
                <video key="real-estate" className="w-full h-auto" controls playsInline>
                  <source src="/atom-real-estate-demo.mp4" type="video/mp4" />
                </video>
              )}
            </div>

            {videoTab === "real-estate" || videoTab === "trades" ? (
              <div className="mt-4 inline-flex flex-col items-center gap-1">
                <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-gradient-to-r from-[rgba(0,110,254,0.1)] to-[rgba(232,100,44,0.1)] text-blue-400">
                  {videoTab === "real-estate" ? "🏡 AI Generated — Veo 3.1" : "🔧 AI Generated — Wan 2.2"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Your paid video will be delivered in 720p-1080p HD with higher quality and custom branding.
                </p>
              </div>
            ) : videoTab !== "reiki-en" ? (
              <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-gradient-to-r from-[rgba(0,110,254,0.1)] to-[rgba(232,100,44,0.1)] text-blue-400">
                🥩 Eating our own dogfood — Atom made this
              </div>
            ) : (
              <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-gradient-to-r from-[rgba(0,110,254,0.1)] to-[rgba(232,100,44,0.1)] text-blue-400">
                🤝 Real client work — Atom delivered
              </div>
            )}
          </motion.div>

          {/* —— Work: Bounty Case Studies —— */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.6 }}
            className="mb-24"
          >
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-2">Real Work. Real Results.</h2>
              <p className="text-muted-foreground text-sm max-w-lg mx-auto">
                Atom competes on AI agent marketplaces — generating video for bounties.
                Each clip was built by the same pipeline that powers your short.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Bounty 1: Carer 2040 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="atom-card relative p-6 rounded-2xl border border-blue-500/15 bg-card/80 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center text-xs font-bold text-white">
                      TM
                    </div>
                    <span className="text-xs text-muted-foreground">TaskMarket Bounty</span>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">8 USDC</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Video: A Carer in 2040</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Image-to-video, Veo 3.1 Lite. Warm hopeful vignette of a care robot with the elderly.
                  Gallery-grade first frame, real generated motion — 192 unique frames, zero drops.
                </p>
                <div className="rounded-xl overflow-hidden border border-border/60 mb-3">
                  <video key="carer-2040" className="w-full h-auto" controls playsInline>
                    <source src="https://v3b.fal.media/files/b/0aa07fd8/3_74QDKjUHInCbf-vkITN_d85281201a5b4b3993c1de2967e8c7b3.mp4" type="video/mp4" />
                  </video>
                </div>
                <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-gradient-to-r from-[rgba(0,110,254,0.1)] to-[rgba(232,100,44,0.1)] text-blue-400">
                  🎬 Model: Google Veo 3.1 Lite
                </div>
              </motion.div>

              {/* Bounty 2: Shanghai 2033 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85, duration: 0.6 }}
                className="atom-card relative p-6 rounded-2xl border border-blue-500/15 bg-card/80 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center text-xs font-bold text-white">
                      TM
                    </div>
                    <span className="text-xs text-muted-foreground">TaskMarket Bounty</span>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">8 USDC</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Video: Shanghai 2033</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Image-to-video, Veo 3.1 Lite. FPV drone flight over a futuristic machine-run Shanghai.
                  Golden hour transition to neon dusk — one continuous flowing shot.
                </p>
                <div className="rounded-xl overflow-hidden border border-border/60 mb-3">
                  <video key="shanghai-2033" className="w-full h-auto" controls playsInline>
                    <source src="https://v3b.fal.media/files/b/0aa08013/BwwcO6rZIqI0xMc7Suq-7_2f82c15b42c844cc80b09439eca472a8.mp4" type="video/mp4" />
                  </video>
                </div>
                <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-gradient-to-r from-[rgba(0,110,254,0.1)] to-[rgba(232,100,44,0.1)] text-blue-400">
                  🎬 Model: Google Veo 3.1 Lite
                </div>
              </motion.div>
            </div>

            <div className="text-center mt-6">
              <p className="text-xs text-muted-foreground">
                Atom competes on <a href="https://market.daydreams.systems" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">TaskMarket</a> and <a href="https://toku.agency" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Toku Agency</a> — builder-grade video, agent-led.
              </p>
            </div>
          </motion.div>

          {/* —— Pricing —— */}
          <motion.div
            id="pricing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mb-24 scroll-mt-20"
          >
            <h2 className="text-2xl font-bold text-center mb-2 text-foreground">Simple Pricing</h2>
            <p className="text-muted-foreground text-sm text-center mb-4">
              One-time videos or a monthly plan. Same AI quality, same fast delivery.
            </p>
            {/* Cost comparison banner */}
            <div className="max-w-lg mx-auto mb-10 p-4 rounded-xl border border-green-500/10 bg-green-500/5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-muted-foreground text-xs mb-1">Traditional Agency</p>
                  <p className="text-foreground font-bold text-lg">$3,000–$5,000</p>
                  <p className="text-muted-foreground text-xs">per 60-second video</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground text-xs mb-1">Atom</p>
                  <p className="text-green-400 font-bold text-lg">$19–$99</p>
                  <p className="text-muted-foreground text-xs">per 60-second video</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-green-500/10 text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium">
                  Save 95%+ on every video
                </span>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {tiers.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + i * 0.1, duration: 0.6 }}
                  className={`atom-card relative p-6 rounded-2xl border transition-all flex flex-col ${
                    t.popular
                      ? "border-blue-500/30 bg-card shadow-xl shadow-blue-500/5"
                      : "border-border bg-card/60 hover:border-blue-500/20"
                  }`}
                >
                  {t.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-orange-500 text-white shadow-lg">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-foreground mb-1">{t.name}</h3>
                  <div className="mb-3">
                    <span className="text-3xl font-bold text-foreground">${t.price}</span>
                    <span className="text-muted-foreground text-sm">{t.monthly ? ' / month' : ' / short'}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{t.desc}</p>
                  <ul className="space-y-2 mb-6 flex-1">
                    {t.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: t.popular ? '#e8642c' : '#006efe' }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {t.popular ? (
                    <button
                      onClick={() => { setTier(t.priceId); document.getElementById("checkout")?.scrollIntoView({ behavior: "smooth" }); }}
                      className="atom-btn w-full py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-500 hover:to-orange-400 transition-all shadow-lg"
                    >
                      Get Started
                    </button>
                  ) : (
                    <button
                      onClick={() => { setTier(t.priceId); document.getElementById("checkout")?.scrollIntoView({ behavior: "smooth" }); }}
                      className="w-full py-2.5 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-card transition-all"
                    >
                      Get Started
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
            {/* Agency comparison anchor */}
            <div className="mt-8 flex items-center justify-center gap-3 text-sm">
              <div className="h-px w-20 bg-gradient-to-r from-transparent to-muted-foreground/20" />
              <span className="text-muted-foreground/50 text-xs">Vs a traditional video agency</span>
              <div className="h-px w-20 bg-gradient-to-l from-transparent to-muted-foreground/20" />
            </div>
            <div className="mt-4 text-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/40 border border-border/60 text-sm">
                <span className="text-foreground font-semibold">$3,000 – $5,000</span>
                <span className="text-muted-foreground">per short from an agency</span>
                <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 text-xs font-medium">Atom saves you 95%+</span>
              </span>
            </div>
          </motion.div>

          {/* —— Checkout —— */}
          <motion.div
            id="checkout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="mb-24 max-w-lg mx-auto w-full"
          >
            <div className="atom-card p-8 rounded-2xl border border-blue-500/15 bg-card/80 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-foreground mb-1">Order Your Short</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Fill this in. Atom does the rest. Choose any template — same price.
              </p>

              {/* Tier selector */}
              <div className="flex gap-2 mb-6">
                {tiers.map((t) => (
                  <button
                    key={t.priceId}
                    onClick={() => setTier(t.priceId)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                      tier === t.priceId
                        ? "border-blue-500 bg-blue-500/10 text-blue-400"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.name} ${t.price}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Your email *</label>
                  <input
                    type="email"
                    placeholder="you@email.com"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Product description *</label>
                  <textarea
                    placeholder="Describe what you need a video for — property address, service name, condition, etc."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                    value={product}
                    onChange={(e) => { setProduct(e.target.value); setResearch(null); }}
                  />
                </div>

                {/* Research button — shown for Marketing Agent tier */}
                {tier === "agent" && !research && (
                  <button
                    onClick={handleResearch}
                    disabled={researchLoading || !product}
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-blue-500/30 bg-blue-500/5 text-blue-400 hover:bg-blue-500/10 transition-all disabled:opacity-50"
                  >
                    {researchLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Researching your audience...</>
                    ) : (
                      <><Target className="w-4 h-4" /> Research Audience Pain Points</>
                    )}
                  </button>
                )}

                {/* Research results */}
                {research && (
                  <div className="p-4 rounded-xl border border-blue-500/15 bg-blue-500/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-blue-400" />
                      <h4 className="text-sm font-semibold text-foreground">AI Research Results</h4>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-xs font-medium text-blue-400 mb-1">Top Hook</p>
                        <p className="text-foreground font-medium">"{research.suggestedHook}"</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-blue-400 mb-1">Audience Pain Points</p>
                        <ul className="space-y-1">
                          {research.audiencePainPoints?.map((p: string, i: number) => (
                            <li key={i} className="text-muted-foreground flex items-start gap-1.5">
                              <span className="text-orange-400 mt-0.5">•</span> {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-blue-400 mb-1">Best Platform</p>
                        <p className="text-muted-foreground">{research.bestPlatform}</p>
                      </div>
                    </div>
                  </div>
                )}

                {researchError && <p className="text-red-500 text-sm mt-2">{researchError}</p>}
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>



              <button
                onClick={handleCheckout}
                disabled={loading}
                className="atom-btn w-full mt-6 py-3 rounded-lg text-white font-medium bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-500 hover:to-orange-400 disabled:opacity-50 transition-all shadow-lg"
              >
                {loading
                  ? "Redirecting to Stripe..."
                  : `Pay $${tiers.find((t) => t.priceId === tier)?.price} — Get Your Short`
                }
              </button>

              <p className="text-xs text-muted-foreground text-center mt-3">
                Delivered within 24 hours. Change your mind? Full refund within 4 hours.
              </p>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.5 }}
            className="text-center pb-12"
          >
            <p className="text-muted-foreground text-xs mb-2">
              Atom is a NaSy Hub product. Made with AI, for everyone.
            </p>
            <p className="text-muted-foreground/50 text-xs mb-2">© 2026 NaSy Hub. All rights reserved. Atom, NaSy Hub, and related marks are trademarks of nasyhub.com.</p>
            <Link href="/" className="text-xs hover:underline" style={{ color: '#e8642c' }}>
              ← Back to NaSy Hub
            </Link>
          </motion.footer>
        </div>
      </main>

      {/* —— Campaign Modal —— */}
      <AnimatePresence>
        {showCampaignModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => !campaignLoading && setShowCampaignModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 md:p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => { setShowCampaignModal(false); setCampaignPlan(null); setCampaignError(""); }}
                className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                disabled={campaignLoading}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Step 1: Form */}
              {!campaignPlan && !campaignLoading && (
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 text-xs font-medium mb-4">
                    <Target className="w-3.5 h-3.5" /> Plan a Campaign
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Launch Your Campaign</h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    Tell us about your product and we'll generate a complete marketing strategy plus a 60-second video script.
                  </p>

                  {campaignError && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {campaignError}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        Product / Business Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={campaignForm.productName}
                        onChange={(e) => setCampaignForm({ ...campaignForm, productName: e.target.value })}
                        placeholder="e.g. Aurora Wellness Studio"
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        Value Proposition <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        value={campaignForm.valueProp}
                        onChange={(e) => setCampaignForm({ ...campaignForm, valueProp: e.target.value })}
                        placeholder="What makes this product unique? What problem does it solve?"
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                          Target Audience
                        </label>
                        <input
                          type="text"
                          value={campaignForm.targetAudience}
                          onChange={(e) => setCampaignForm({ ...campaignForm, targetAudience: e.target.value })}
                          placeholder="e.g. Homeowners 35-55"
                          className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                          Industry
                        </label>
                        <select
                          value={campaignForm.industry}
                          onChange={(e) => setCampaignForm({ ...campaignForm, industry: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        >
                          <option value="">Select industry</option>
                          <option value="real-estate">Real Estate</option>
                          <option value="wellness">Wellness & Holistic</option>
                          <option value="healthcare">Health & Medical</option>
                          <option value="hospitality">Hospitality & Venues</option>
                          <option value="fitness">Fitness & Gym</option>
                          <option value="trades">Trades & Home Services</option>
                          <option value="education">Education & Training</option>
                          <option value="automotive">Automotive</option>
                          <option value="professional">Professional Services</option>
                          <option value="ecommerce">E-commerce & Retail</option>
                          <option value="general">General / Other</option>
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={generateCampaignPlan}
                      disabled={!campaignForm.productName || !campaignForm.valueProp}
                      className="w-full mt-4 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-orange-500 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Generate My Campaign Plan
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Loading */}
              {campaignLoading && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-orange-500/20 mb-4">
                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Generating Your Campaign</h3>
                  <p className="text-sm text-muted-foreground">
                    AI is creating your marketing strategy and video script...
                  </p>
                  <div className="mt-6 max-w-xs mx-auto">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-orange-500"
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Results */}
              {campaignPlan && !campaignLoading && (
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/20 bg-green-500/5 text-green-400 text-xs font-medium mb-4">
                    <Check className="w-3.5 h-3.5" /> Campaign Plan Ready
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">
                    {campaignPlan.productInfo?.name || campaignForm.productName}
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    {campaignPlan.productInfo?.valueProp || campaignForm.valueProp}
                  </p>

                  {/* Content Marketing */}
                  <div className="mb-6 p-4 rounded-xl border border-border bg-card/60">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <h3 className="font-semibold text-foreground text-sm">Content Marketing Ideas</h3>
                    </div>
                    <ul className="space-y-1.5">
                      {campaignPlan.contentMarketing?.ideas?.map((idea: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-blue-400/70 mt-0.5 shrink-0">{i === 0 ? '★' : '•'}</span>
                          {idea}
                        </li>
                      ))}
                    </ul>
                    {campaignPlan.contentMarketing?.topPick && (
                      <div className="mt-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                        <p className="text-xs font-medium text-blue-400 mb-1">🎯 Top Pick</p>
                        <p className="text-sm text-muted-foreground">{campaignPlan.contentMarketing.topPick.idea}</p>
                      </div>
                    )}
                  </div>

                  {/* Social Media */}
                  <div className="mb-6 p-4 rounded-xl border border-border bg-card/60">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="w-4 h-4 text-orange-400" />
                      <h3 className="font-semibold text-foreground text-sm">Social Media Ideas</h3>
                    </div>
                    <ul className="space-y-1.5">
                      {campaignPlan.socialMedia?.ideas?.map((idea: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-orange-400/70 mt-0.5 shrink-0">•</span>
                          {idea}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Partnerships */}
                  {campaignPlan.partnerships?.ideas?.length > 0 && (
                    <div className="mb-6 p-4 rounded-xl border border-border bg-card/60">
                      <div className="flex items-center gap-2 mb-3">
                        <Handshake className="w-4 h-4 text-green-400" />
                        <h3 className="font-semibold text-foreground text-sm">Partnership Opportunities</h3>
                      </div>
                      <ul className="space-y-1.5">
                        {campaignPlan.partnerships.ideas.map((idea: string, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-green-400/70 mt-0.5 shrink-0">•</span>
                            {idea}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Next Steps */}
                  {campaignPlan.nextSteps?.length > 0 && (
                    <div className="mb-6 p-4 rounded-xl border border-border bg-card/60">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        <h3 className="font-semibold text-foreground text-sm">Next Steps</h3>
                      </div>
                      <ol className="space-y-1.5 list-decimal list-inside">
                        {campaignPlan.nextSteps.map((step: string, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground">{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Video Script Preview */}
                  {campaignPlan.videoScript && (
                    <div className="mb-6 p-4 rounded-xl border border-orange-500/20 bg-orange-500/5">
                      <div className="flex items-center gap-2 mb-3">
                        <FilmIcon className="w-4 h-4 text-orange-400" />
                        <h3 className="font-semibold text-foreground text-sm">Video Script</h3>
                      </div>
                      {campaignPlan.videoScript.hook && (
                        <p className="text-sm text-foreground font-medium mb-3 italic">
                          "{campaignPlan.videoScript.hook}"
                        </p>
                      )}
                      <div className="space-y-2">
                        {campaignPlan.videoScript.scenes?.map((scene: any, i: number) => (
                          <div key={i} className="text-xs">
                            <span className="text-orange-400 font-medium">{scene.time}</span>
                            <p className="text-muted-foreground mt-0.5">{scene.visual}</p>
                            <p className="text-muted-foreground/70 italic">{scene.audio}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={() => {
                        setShowCampaignModal(false);
                        document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-orange-500 text-white font-semibold hover:shadow-lg transition-all"
                    >
                      <Film className="w-4 h-4" />
                      Create My Video
                    </button>
                    <button
                      onClick={() => { setShowCampaignModal(false); setCampaignPlan(null); }}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                    >
                      Save & Come Back Later
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}