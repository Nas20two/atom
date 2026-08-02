"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, CheckCircle, Upload, Wrench } from "lucide-react";
import Link from "next/link";

const STORAGE_KEY = "atom-trades-form";

interface FormData {
  businessName: string;
  tradeType: string;
  service1: string;
  service2: string;
  service3: string;
  location: string;
  phone: string;
  email: string;
  beforeAfterDesc: string;
  certifications: string;
  language: string;
  ctaText: string;
  ctaLink: string;
  photos: string[];
}

const defaultForm: FormData = {
  businessName: "",
  tradeType: "Plumber",
  service1: "",
  service2: "",
  service3: "",
  location: "",
  phone: "",
  email: "",
  photos: [],
  beforeAfterDesc: "",
  certifications: "",
  language: "English",
  ctaText: "Get a Free Quote",
  ctaLink: "",
};

const tradeTypes = [
  "Plumber", "Electrician", "Landscaper", "Roofer", "Painter",
  "Carpenter", "Builder", "Concretor", "Tiler", "Pool Builder",
  "Pest Control", "Cleaner", "HVAC", "Other"
];
const languages = ["English", "Arabic", "Vietnamese", "Mandarin", "Spanish"];

export default function TradesPage() {
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
    document.title = "Trades & Home Services Video Template | Atom";
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
      setError("Please upload at least 4 photos of your work");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/atom-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: "trades",
          data: form,
          email: form.email,
          tier: "basic",
        }),
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

  const resetForm = () => {
    setForm(defaultForm);
    setDone(false);
    setError("");
    localStorage.removeItem(STORAGE_KEY);
  };

  const labelClass = "block text-sm font-medium text-foreground mb-1.5";
  const inputClass = "w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-foreground placeholder:text-muted-foreground placeholder:text-sm transition-shadow";
  const selectClass = "w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-foreground transition-shadow appearance-none";

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="atom-orbits" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 pt-24 pb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Trades &amp; Home Services <span className="atom-gradient-text">Video</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-3">
            A 60-second cinematic showcase for your trade business. Before &amp; after,
            services, and a call to action — all AI-generated.
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

      {/* Form */}
      {!done ? (
        <section className="max-w-2xl mx-auto px-4 pb-24 -mt-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 md:p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Upload */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Upload photos of your work * <span className="text-muted-foreground font-normal">({form.photos.length}/6)</span>
                </label>
                <p className="text-xs text-muted-foreground mb-3">Showcase before/after shots, recent projects, and your team in action. 4-6 photos recommended.</p>
                
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
              {/* Business Info */}
              <div className="p-6 rounded-2xl border border-border bg-card/80 backdrop-blur-sm space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Business Info</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Business Name</label>
                    <input type="text" value={form.businessName} onChange={(e) => updateField("businessName", e.target.value)}
                      placeholder="Smith's Plumbing & Gas" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Trade Type</label>
                    <select value={form.tradeType} onChange={(e) => updateField("tradeType", e.target.value)}
                      className={selectClass}>
                      {tradeTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Service Area / Suburb</label>
                    <input type="text" value={form.location} onChange={(e) => updateField("location", e.target.value)}
                      placeholder="Inner West, Sydney" className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="p-6 rounded-2xl border border-border bg-card/80 backdrop-blur-sm space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Services You Offer</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Service 1</label>
                    <input type="text" value={form.service1} onChange={(e) => updateField("service1", e.target.value)}
                      placeholder="Hot water systems" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Service 2</label>
                    <input type="text" value={form.service2} onChange={(e) => updateField("service2", e.target.value)}
                      placeholder="Blocked drains" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Service 3</label>
                    <input type="text" value={form.service3} onChange={(e) => updateField("service3", e.target.value)}
                      placeholder="Gas fitting" className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Before/After & Credentials */}
              <div className="p-6 rounded-2xl border border-border bg-card/80 backdrop-blur-sm space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Showcase</h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Before & After Description</label>
                    <textarea value={form.beforeAfterDesc} onChange={(e) => updateField("beforeAfterDesc", e.target.value)}
                      placeholder="Describe a recent transformation project. E.g. Complete bathroom renovation — old 80s tiles replaced with premium matte black fixtures, frameless glass shower, heated flooring."
                      className={`${inputClass} min-h-[80px] resize-y`} />
                  </div>
                  <label className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-blue-500/50 transition-colors bg-card/30 block">
                    <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-1.5" />
                    <p className="text-sm text-muted-foreground">Upload before/after or project photos <span className="text-xs">(optional — photos above required)</span></p>
                    <input type="file" accept="image/*" multiple onChange={handlePhotosUpload} className="hidden" disabled={uploadingPhoto} />
                  </label>
                  <div>
                    <label className={labelClass}>Certifications / Licences</label>
                    <input type="text" value={form.certifications} onChange={(e) => updateField("certifications", e.target.value)}
                      placeholder="Lic. 123456C, Master Plumbers Member" className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Contact & Language */}
              <div className="p-6 rounded-2xl border border-border bg-card/80 backdrop-blur-sm space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Contact & Language</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input type="tel" value={form.phone} onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="0400 123 456" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Video Language</label>
                    <select value={form.language} onChange={(e) => updateField("language", e.target.value)}
                      className={selectClass}>
                      {languages.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Your Email <span className="text-red-500">*</span></label>
                    <input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)}
                      placeholder="info@smithsplumbing.com.au" className={inputClass} required />
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="p-6 rounded-2xl border border-border bg-card/80 backdrop-blur-sm space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Call to Action</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Button Text</label>
                    <input type="text" value={form.ctaText} onChange={(e) => updateField("ctaText", e.target.value)}
                      className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Link (URL)</label>
                    <input type="url" value={form.ctaLink} onChange={(e) => updateField("ctaLink", e.target.value)}
                      placeholder="https://smithsplumbing.com.au/quote" className={inputClass} />
                  </div>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              {/* Submit */}
              <div className="text-center pt-2">
                <button type="submit" disabled={submitting}
                  className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed text-lg text-white"
                  style={{ backgroundColor: submitting ? 'hsl(var(--atom-orange, 15 65% 55%) / 0.6)' : 'hsl(var(--atom-orange, 15 65% 55%))' }}
                >
                  {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating your video...</>
                    : <><Wrench className="w-5 h-5" /> Generate Trades Video</>}
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