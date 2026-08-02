"use client";

import { motion } from "framer-motion";
import { Building2, Heart, Stethoscope, Wrench, UtensilsCrossed, GraduationCap, Dumbbell, Car, Briefcase, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

const industries = [
  {
    id: "real-estate",
    name: "Real Estate",
    icon: Building2,
    accent: "blue",
    color: "hsl(218, 100%, 50%)",
    bg: "hsla(218, 100%, 50%, 0.08)",
    href: "/atom/real-estate",
    tagline: "Sell properties faster with cinematic AI videos",
    bullets: [
      "Convert listing descriptions into 60-second walkthroughs",
      "5 video styles: Standard, Luxury, Development, Rental, Commercial",
      "Perfect for REA, Domain, social media, and email campaigns",
      "No videographer, no scheduling, no editing — just paste your listing",
    ],
    price: "From $19",
  },
  {
    id: "trades",
    name: "Trades & Home Services",
    icon: Wrench,
    accent: "orange",
    color: "hsl(15, 65%, 55%)",
    bg: "hsla(15, 65%, 55%, 0.08)",
    href: "/atom/trades",
    tagline: "Showcase your craft with before & after videos",
    bullets: [
      "Plumbers, electricians, landscapers, roofers, painters — all covered",
      "Before/after transformation footage to build trust and credibility",
      "Highlights licences, certifications, and service areas",
      "Replace expensive videographers with a single form submission",
    ],
    price: "From $19",
  },
  {
    id: "wellness",
    name: "Wellness & Reiki",
    icon: Heart,
    accent: "orange",
    color: "hsl(15, 65%, 55%)",
    bg: "hsla(15, 65%, 55%, 0.08)",
    href: "/atom/wellness",
    tagline: "Brand promos for holistic health practitioners",
    bullets: [
      "Reiki, yoga, massage, acupuncture — any wellness practice",
      "Hindi, English, or bilingual voiceover options",
      "Calm, cinematic visuals matched to your brand vibe",
      "Book more clients with professional-looking video content",
    ],
    price: "From $19",
  },
  {
    id: "healthcare",
    name: "Health Education",
    icon: Stethoscope,
    accent: "blue",
    color: "hsl(218, 100%, 50%)",
    bg: "hsla(218, 100%, 50%, 0.08)",
    href: "/atom/healthcare",
    tagline: "Patient-friendly explainer videos for clinics",
    bullets: [
      "Explain conditions, procedures, and treatments visually",
      "Build trust with educational content before appointments",
      "GP clinics, specialists, dentists, physios, allied health",
      "Professional, clinical tone that reassures patients",
    ],
    price: "From $19",
  },
  {
    id: "hospitality",
    name: "Hospitality & Venues",
    icon: UtensilsCrossed,
    accent: "orange",
    color: "hsl(15, 65%, 55%)",
    bg: "hsla(15, 65%, 55%, 0.08)",
    href: "/atom/hospitality",
    tagline: "Cinematic venue showcases for restaurants, cafes & hotels",
    bullets: [
      "Showcase your atmosphere, signature dishes, and experience",
      "Perfect for Instagram Reels, TikTok, and Google Business Profile",
      "Music overlay matches your venue's vibe",
      "Replace $3k+ videography with a single form submission",
    ],
    price: "From $19",
  },
  {
    id: "education",
    name: "Education & Training",
    icon: GraduationCap,
    accent: "blue",
    color: "hsl(218, 100%, 50%)",
    bg: "hsla(218, 100%, 50%, 0.08)",
    href: "/atom/education",
    tagline: "Course promos for RTOs, universities & training providers",
    bullets: [
      "Promote courses, qualifications, and micro-credentials visually",
      "Highlight career outcomes, delivery modes, and enrolment paths",
      "10 qualification levels from short courses to master's degrees",
      "Replace $2k+ video production with a single form submission",
    ],
    price: "From $19",
  },
  {
    id: "fitness",
    name: "Fitness & Gym",
    icon: Dumbbell,
    accent: "orange",
    color: "hsl(15, 65%, 55%)",
    bg: "hsla(15, 65%, 55%, 0.08)",
    href: "/atom/fitness",
    tagline: "High-energy promos for gyms, trainers & studios",
    bullets: [
      "Showcase your training, transformations, and community",
      "Perfect for Instagram Reels, TikTok, and Google ads",
      "12 business types: PT, yoga, CrossFit, martial arts, online coaching",
      "6 vibes: high energy, mindful, community, premium, outdoor, rehab",
    ],
    price: "From $19",
  },
  {
    id: "automotive",
    name: "Automotive & Dealerships",
    icon: Car,
    accent: "blue",
    color: "hsl(218, 100%, 50%)",
    bg: "hsla(218, 100%, 50%, 0.08)",
    href: "/atom/automotive",
    tagline: "Showcases for car dealers, detailers, mechanics & auto shops",
    bullets: [
      "Showcase inventory, service quality, and customer trust",
      "11 business types: dealers, detailers, mechanics, car wash, rentals",
      "6 vibes: premium, professional, sporty, family, fast, budget",
      "Replace $3k+ commercial shoots with a single form submission",
    ],
    price: "From $19",
  },
  {
    id: "professional-services",
    name: "Professional Services",
    icon: Briefcase,
    accent: "blue",
    color: "hsl(218, 100%, 50%)",
    bg: "hsla(218, 100%, 50%, 0.08)",
    href: "/atom/professional-services",
    tagline: "Brand videos for consultants, accountants, lawyers & agencies",
    bullets: [
      "Showcase your expertise, services, and client relationships",
      "13 professions: consultant, accountant, lawyer, broker, coach, agency",
      "6 brand styles: professional, modern, boutique, corporate, creative, friendly",
      "Replace $2k+ corporate video production with one form",
    ],
    price: "From $19",
  },
];

const iconComponents: Record<string, React.ElementType> = {
  Building2, Heart, Stethoscope, Wrench, UtensilsCrossed, GraduationCap, Dumbbell,
};

export default function IndustriesPage() {
  useEffect(() => {
    document.title = "Industries | Atom — AI Video Generator";
  }, []);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-12 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              AI Video Templates by <span className="atom-gradient-text">Industry</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              One form. One template. A cinematic 60-second video for your business.
              Pick your industry below and let Atom do the rest.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Industry Cards */}
      <section className="max-w-5xl mx-auto px-4 pb-24 space-y-8">
        {industries.map((ind, idx) => {
          const Icon = iconComponents[ind.icon.name as keyof typeof iconComponents] || ind.icon;
          return (
            <motion.div
              key={ind.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="rounded-2xl border border-border overflow-hidden bg-card/40 backdrop-blur-sm"
            >
              <div className="p-8 md:p-10">
                <div className="flex items-start gap-6 flex-col md:flex-row">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: ind.bg }}
                  >
                    <Icon className="w-7 h-7" style={{ color: ind.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h2 className="text-2xl font-bold text-foreground">{ind.name}</h2>
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: ind.bg, color: ind.color }}
                      >
                        {ind.price}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-4">{ind.tagline}</p>
                    <ul className="space-y-2 mb-6">
                      {ind.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Sparkles className="w-4 h-4 mt-0.5 shrink-0" style={{ color: ind.color }} />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={ind.href}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all text-sm"
                      style={{
                        backgroundColor: ind.color,
                        color: "#fff",
                      }}
                    >
                      Create Your {ind.name} Video <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Coming Soon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="rounded-2xl border border-dashed border-muted-foreground/30 p-8 text-center"
        >
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">More Industries Coming</h3>
          <p className="text-sm text-muted-foreground/70 mb-4">
            Hospitality, Education, Fitness, Automotive, Professional Services &mdash; on the roadmap.
          </p>
          <Link
            href="/atom"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            Back to Atom <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>
    </main>
  );
}