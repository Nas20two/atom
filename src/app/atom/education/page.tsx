"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, CheckCircle, Upload, GraduationCap } from "lucide-react";
import Link from "next/link";

const STORAGE_KEY = "atom-education-form";

interface FormData {
  institution: string;
  providerType: string;
  courseName: string;
  qualification: string;
  courseCode: string;
  duration: string;
  deliveryMode: string;
  outcome1: string;
  outcome2: string;
  outcome3: string;
  location: string;
  phone: string;
  email: string;
  language: string;
  ctaText: string;
  ctaLink: string;
  photos: string[];
}

const defaultForm: FormData = {
  institution: "",
  providerType: "RTO",
  courseName: "",
  qualification: "Certificate IV",
  courseCode: "",
  duration: "12 months",
  deliveryMode: "Online",
  outcome1: "",
  outcome2: "",
  outcome3: "",
  location: "",
  phone: "",
  email: "",
  language: "English",
  ctaText: "Enrol Now",
  ctaLink: "",
  photos: [],
};

const providerTypes = ["RTO", "University", "College", "Online Platform", "Community Centre", "Corporate Training", "Other"];
const qualifications = ["Short Course", "Micro-credential", "Certificate III", "Certificate IV", "Diploma", "Advanced Diploma", "Graduate Certificate", "Bachelor's Degree", "Master's Degree", "Workshop"];
const deliveryModes = ["Online", "In-Person", "Hybrid", "Workplace", "Correspondence"];
const languages = ["English", "Arabic", "Vietnamese", "Mandarin", "Spanish", "Japanese", "Korean"];

export default function EducationPage() {
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
    document.title = "Education & Course Promo Template | Atom";
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
        body: JSON.stringify({ template: "education", data: form, email: form.email, tier: "basic" }),
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
            <span className="text-xs text-muted-foreground">Education</span>
          </div>
        </nav>
        <div className="max-w-3xl mx-auto px-4 pt-8 pb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Course &amp; Education <span className="atom-gradient-text">Promo</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-3">
            A 60-second promotional video for your course, qualification, or training program.
            Enrolments, outcomes, and career pathways — all AI-generated.
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
                <p className="text-xs text-muted-foreground mb-3">Showcase your campus, facilities, and learning environment. 4-6 photos recommended.</p>
                
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
              {/* Institution & Course */}
              <div className="p-6 rounded-2xl border border-border bg-card/80 backdrop-blur-sm space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Institution &amp; Course</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Institution Name</label>
                    <input type="text" value={form.institution} onChange={(e) => updateField("institution", e.target.value)}
                      placeholder="Sydney Skills Academy" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Provider Type</label>
                    <select value={form.providerType} onChange={(e) => updateField("providerType", e.target.value)} className={selectClass}>
                      {providerTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Course Name</label>
                    <input type="text" value={form.courseName} onChange={(e) => updateField("courseName", e.target.value)}
                      placeholder="Diploma of Project Management" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Qualification Level</label>
                    <select value={form.qualification} onChange={(e) => updateField("qualification", e.target.value)} className={selectClass}>
                      {qualifications.map((q) => <option key={q} value={q}>{q}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Course Code (optional)</label>
                    <input type="text" value={form.courseCode} onChange={(e) => updateField("courseCode", e.target.value)}
                      placeholder="BSB50820" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Duration</label>
                    <input type="text" value={form.duration} onChange={(e) => updateField("duration", e.target.value)}
                      placeholder="12 months full-time" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Delivery Mode</label>
                    <select value={form.deliveryMode} onChange={(e) => updateField("deliveryMode", e.target.value)} className={selectClass}>
                      {deliveryModes.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Key Outcomes */}
              <div className="p-6 rounded-2xl border border-border bg-card/80 backdrop-blur-sm space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Key Outcomes</h2>
                <div className="space-y-3">
                  <div>
                    <label className={labelClass}>Outcome / Benefit 1</label>
                    <input type="text" value={form.outcome1} onChange={(e) => updateField("outcome1", e.target.value)}
                      placeholder="Nationally recognised qualification" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Outcome / Benefit 2</label>
                    <input type="text" value={form.outcome2} onChange={(e) => updateField("outcome2", e.target.value)}
                      placeholder="Flexible online study with mentor support" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Outcome / Benefit 3</label>
                    <input type="text" value={form.outcome3} onChange={(e) => updateField("outcome3", e.target.value)}
                      placeholder="Pathway to university or accelerated career" className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Uploads */}
              <div className="p-6 rounded-2xl border border-border bg-card/80 backdrop-blur-sm">
                <label className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-blue-500/50 transition-colors bg-card/30 block">
                    <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-1.5" />
                    <p className="text-sm text-muted-foreground">Upload campus photos or course materials <span className="text-xs">(optional — optional)</span></p>
                    <input type="file" accept="image/*" multiple onChange={handlePhotosUpload} className="hidden" disabled={uploadingPhoto} />
                  </label>
              </div>

              {/* Contact & Language */}
              <div className="p-6 rounded-2xl border border-border bg-card/80 backdrop-blur-sm space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Contact &amp; Language</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Campus Location</label>
                    <input type="text" value={form.location} onChange={(e) => updateField("location", e.target.value)}
                      placeholder="123 George Street, Sydney" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input type="tel" value={form.phone} onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="1300 123 456" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Video Language</label>
                    <select value={form.language} onChange={(e) => updateField("language", e.target.value)} className={selectClass}>
                      {languages.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Your Email <span className="text-red-500">*</span></label>
                    <input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)}
                      placeholder="info@sydneyskills.edu.au" className={inputClass} required />
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
                      placeholder="https://sydneyskills.edu.au/enrol" className={inputClass} />
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
                    : <><GraduationCap className="w-5 h-5" /> Generate Course Video</>}
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