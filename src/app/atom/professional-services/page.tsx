"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, CheckCircle, Briefcase , Upload } from "lucide-react";
import Link from "next/link";

const STORAGE_KEY = "atom-p…form";

interface FormData {
  businessName: string;
  profession: string;
  speciality: string;
  location: string;
  style: string;
  service1: string;
  service2: string;
  service3: string;
  phone: string;
  email: string;
  language: string;
  ctaText: string;
  ctaLink: string;
  photos: string[];
}

const defaultForm: FormData = {
  businessName: "",
  profession: "Consultant",
  speciality: "",
  location: "",
  style: "Professional & Trusted",
  service1: "",
  service2: "",
  service3: "",
  phone: "",
  email: "",
  language: "English",
  ctaText: "Book a Consultation",
  ctaLink: "",
  photos: [],
};

const professions = ["Consultant", "Accountant", "Lawyer", "Architect", "Financial Advisor", "Mortgage Broker", "Real Estate Agent", "Insurance Broker", "Marketing Agency", "IT Services", "Recruitment", "Coach", "Other"];
const styles = ["Professional & Trusted", "Modern & Innovative", "Boutique & Personal", "Corporate & Established", "Creative & Bold", "Friendly & Approachable"];

export default function ProfessionalServicesPage() {
  const [form, setForm] = useState<FormData>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return { ...defaultForm, ...JSON.parse(saved) };
      } catch { /* ignore */ }
    }
    return defaultForm;
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [jobId, setJobId] = useState("");
  const [error, setError] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    document.title = "Professional Services Template | Atom";
  }, []);

  const updateField = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);


  const compressImage = (file: File, maxW = 1080): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > maxW) { height = (maxW / width) * height; width = maxW; }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
        URL.revokeObjectURL(url);
      };
      img.src = url;
    });
  };

  const handlePhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadingPhoto(true);
    const newPhotos: string[] = [];
    const maxNew = 6 - form.photos.length;
    for (const file of Array.from(files).slice(0, maxNew)) {
      const compressed = await compressImage(file);
      newPhotos.push(compressed);
    }
    updateField("photos", [...form.photos, ...newPhotos]);
    setUploadingPhoto(false);
  };

  const removePhoto = (index: number) => {
    updateField("photos", form.photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.photos.length < 4) {
      setError("Please upload at least 4 photos of your business");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/atom-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template: "professional-services", data: form, email: form.email, tier: "basic" }),
      });
      const result = await res.json();
      if (result.success) {
        setJobId(result.jobId);
        setDone(true);
        localStorage.removeItem(STORAGE_KEY);
      } else {
        setError(result.error || "Something went wrong");
      }
    } catch {
      setError("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const labelClass = "block text-sm font-medium text-foreground mb-1.5";
  const inputClass = "w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-foreground placeholder:text-muted-foreground placeholder:text-sm transition-shadow";
  const selectClass = "w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-foreground transition-shadow appearance-none";

  return (
    <main className="min-h-screen bg-background">
      <section className="relative overflow-hidden">
        <div className="fixed top-0 right-0 w-96 h-96 opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsla(var(--atom-blue, 218 100% 50%), 0.08) 0%, transparent 70%)' }}
        />
        <nav className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <Link href="/atom" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
              <ArrowRight className="w-4 h-4 mr-1 rotate-180" /> Back to Templates
            </Link>
            <span className="text-xs text-muted-foreground">Professional Services</span>
          </div>
        </nav>
        <div className="max-w-3xl mx-auto px-4 pt-8 pb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Professional <span className="atom-gradient-text">Services</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-3">
            A 60-second brand video for consultants, accountants, lawyers, brokers, and agencies.
            Expertise, trust, and your value proposition — all AI-generated.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>⏱️ Ready in 24h</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
            <span>🎵 Music included</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
            <span>🎬 $19 — $69</span>
          </div>
        </div>
      </section>

      {!done ? (
        <section className="max-w-2xl mx-auto px-4 pb-24 -mt-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 md:p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Photo Upload */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Upload photos of your work * <span className="text-muted-foreground font-normal">({form.photos.length}/6)</span>
                </label>
                <p className="text-xs text-muted-foreground mb-3">Showcase your office, team, and work environment. 4-6 photos recommended.</p>
                
                {form.photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {form.photos.map((photo, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                        <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {form.photos.length < 6 && (
                      <label className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-blue-500/50 transition-colors bg-card/30">
                        <div className="text-center">
                          <Upload className="w-5 h-5 mx-auto text-muted-foreground" />
                          <span className="text-xs text-muted-foreground mt-1 block">Add more</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotosUpload}
                          className="hidden"
                          disabled={uploadingPhoto}
                        />
                      </label>
                    )}
                  </div>
                )}
                
                {form.photos.length === 0 && (
                  <label className="block p-8 rounded-xl border-2 border-dashed border-border cursor-pointer hover:border-blue-500/50 transition-colors bg-card/30 text-center">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload photos</p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP — 4 minimum</p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotosUpload}
                      className="hidden"
                      disabled={uploadingPhoto}
                    />
                  </label>
                )}
                {uploadingPhoto && <p className="text-xs text-blue-400 mt-1">Processing photos...</p>}
              </div>
              {/* Business */}
              <div className="p-6 rounded-2xl border border-border bg-card/80 backdrop-blur-sm space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Business Details</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Business / Practice Name</label>
                    <input type="text" value={form.businessName} onChange={(e) => updateField("businessName", e.target.value)}
                      placeholder="Smith & Associates Consulting" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Profession</label>
                    <select value={form.profession} onChange={(e) => updateField("profession", e.target.value)} className={selectClass}>
                      {professions.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Speciality</label>
                    <input type="text" value={form.speciality} onChange={(e) => updateField("speciality", e.target.value)}
                      placeholder="Tax & business advisory, corporate law, strategic planning" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Location</label>
                    <input type="text" value={form.location} onChange={(e) => updateField("location", e.target.value)}
                      placeholder="Sydney CBD" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Brand Style</label>
                    <select value={form.style} onChange={(e) => updateField("style", e.target.value)} className={selectClass}>
                      {styles.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="p-6 rounded-2xl border border-border bg-card/80 backdrop-blur-sm space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Services &amp; Expertise</h2>
                <div className="space-y-3">
                  <div>
                    <label className={labelClass}>Service 1</label>
                    <input type="text" value={form.service1} onChange={(e) => updateField("service1", e.target.value)}
                      placeholder="Tax planning & compliance for SMEs" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Service 2</label>
                    <input type="text" value={form.service2} onChange={(e) => updateField("service2", e.target.value)}
                      placeholder="Business structuring & entity setup" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Service 3</label>
                    <input type="text" value={form.service3} onChange={(e) => updateField("service3", e.target.value)}
                      placeholder="Strategic growth & exit planning" className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="p-6 rounded-2xl border border-border bg-card/80 backdrop-blur-sm space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Contact &amp; Language</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input type="tel" value={form.phone} onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="(02) 9123 4567" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Video Language</label>
                    <select value={form.language} onChange={(e) => updateField("language", e.target.value)} className={selectClass}>
                      {["English", "Arabic", "Vietnamese", "Mandarin", "Spanish", "Korean"].map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Your Email <span className="text-red-500">*</span></label>
                    <input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)}
                      placeholder="info@smithassociates.com.au" className={inputClass} required />
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="p-6 rounded-2xl border border-border bg-card/80 backdrop-blur-sm space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Call to Action</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Button Text</label>
                    <input type="text" value={form.ctaText} onChange={(e) => updateField("ctaText", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Link (URL)</label>
                    <input type="url" value={form.ctaLink} onChange={(e) => updateField("ctaLink", e.target.value)}
                      placeholder="https://smithassociates.com.au/book" className={inputClass} />
                  </div>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              <div className="text-center pt-2">
                <button type="submit" disabled={submitting}
                  className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed text-lg text-white"
                  style={{ backgroundColor: submitting ? 'hsla(218, 100%, 50%, 0.6)' : 'hsl(218, 100%, 50%)' }}
                >
                  {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating your video...</>
                    : <><Briefcase className="w-5 h-5" /> Generate Brand Video</>}
                </button>
              </div>
            </form>
          </motion.div>
        </section>
      ) : (
        <section className="max-w-2xl mx-auto px-4 pb-24 -mt-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="text-center p-12 rounded-2xl border border-border bg-card/80 backdrop-blur-sm"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">Video queued for generation!</h2>
            <p className="text-muted-foreground mb-2">We&apos;ll deliver your 60-second video to <strong>{form.email}</strong> within 24 hours.</p>
            <p className="text-xs text-muted-foreground mb-8">Job ID: {jobId}</p>
            <Link href="/atom"
              className="inline-flex items-center gap-2 px-8 py-4 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium rounded-xl transition-colors border border-border"
            >
              Create another video
            </Link>
          </motion.div>
        </section>
      )}
    </main>
  );
}