"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, CheckCircle, Upload } from "lucide-react";
import Link from "next/link";

const STORAGE_KEY = "atom-real-estate-form";

interface FormData {
  streetAddress: string;
  suburb: string;
  state: string;
  propertyType: string;
  videoStyle: string;
  bedrooms: string;
  bathrooms: string;
  parking: string;
  price: string;
  keyFeature1: string;
  keyFeature2: string;
  keyFeature3: string;
  agentName: string;
  agency: string;
  email: string;
  ctaText: string;
  ctaLink: string;
  photos: string[];
}

const defaultForm: FormData = {
  streetAddress: "", suburb: "", state: "NSW", propertyType: "Apartment",
  videoStyle: "Standard Listing",
  bedrooms: "", bathrooms: "", parking: "", price: "",
  keyFeature1: "", keyFeature2: "", keyFeature3: "",
  agentName: "", agency: "", email: "", ctaText: "Book an Inspection", ctaLink: "",
  photos: [],
};

const states = ["NSW", "VIC", "QLD", "SA", "WA", "TAS", "ACT", "NT"];
const propertyTypes = ["Apartment", "House", "Townhouse", "Duplex", "Land"];
const videoStyles = ["Standard Listing", "Luxury Showcase", "Development/Off-Plan", "Rental", "Commercial"];

export default function RealEstatePage() {
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
    document.title = "Real Estate Video Template | Atom";
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
        body: JSON.stringify({
          template: "real-estate",
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
    localStorage.removeItem(STORAGE_KEY);
    setDone(false);
  };

  const inputClass = "w-full px-4 py-3 rounded-xl bg-card border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors";
  const labelClass = "block text-sm font-medium text-foreground mb-1.5";

  return (
    <main className="min-h-screen bg-background overflow-hidden relative">
      {/* Orbital */}
      <div className="fixed top-0 right-0 w-96 h-96 opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsla(var(--atom-orange, 15 65% 55%), 0.08) 0%, transparent 70%)' }}
      />

      <nav className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <Link href="/atom" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
            <ArrowRight className="w-4 h-4 mr-1 rotate-180" /> Back to Templates
          </Link>
          <span className="text-xs text-muted-foreground">Real Estate</span>
        </div>
      </nav>

      <section className="pt-8 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
              style={{ backgroundColor: 'hsla(var(--atom-blue, 218 100% 50%), 0.1)', color: 'hsl(var(--atom-blue, 218 100% 50%))' }}
            >
              Real Estate Template
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Create Your Property Video</h1>
            <p className="text-muted-foreground mb-10">Enter your listing details and let AI do the rest.</p>
          </motion.div>

          {done ? (
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
          ) : (
            <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
              onSubmit={handleSubmit} className="space-y-6"
            >
              {/* Photo Upload */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Upload photos of your work * <span className="text-muted-foreground font-normal">({form.photos.length}/6)</span>
                </label>
                <p className="text-xs text-muted-foreground mb-3">Showcase shots of your business, services, and team in action. 4-6 photos recommended.</p>
                
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
              {/* Property Details */}
              <div className="p-6 rounded-2xl border border-border bg-card/80 backdrop-blur-sm">
                <h2 className="text-lg font-semibold mb-5 text-foreground">Property Details</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Street Address</label>
                    <input type="text" value={form.streetAddress} onChange={(e) => updateField("streetAddress", e.target.value)}
                      placeholder="123 Example Street" className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Suburb</label>
                    <input type="text" value={form.suburb} onChange={(e) => updateField("suburb", e.target.value)}
                      placeholder="Sydney CBD" className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>State</label>
                    <select value={form.state} onChange={(e) => updateField("state", e.target.value)} className={inputClass}>
                      {states.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Property Type</label>
                    <select value={form.propertyType} onChange={(e) => updateField("propertyType", e.target.value)} className={inputClass}>
                      {propertyTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Video Style</label>
                    <select value={form.videoStyle} onChange={(e) => updateField("videoStyle", e.target.value)} className={inputClass}>
                      {videoStyles.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={labelClass}>Beds</label>
                      <input type="number" min="0" value={form.bedrooms} onChange={(e) => updateField("bedrooms", e.target.value)}
                        placeholder="3" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Baths</label>
                      <input type="number" min="0" value={form.bathrooms} onChange={(e) => updateField("bathrooms", e.target.value)}
                        placeholder="2" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Parking</label>
                      <input type="number" min="0" value={form.parking} onChange={(e) => updateField("parking", e.target.value)}
                        placeholder="1" className={inputClass} />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Price</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                      <input type="text" value={form.price} onChange={(e) => updateField("price", e.target.value)}
                        placeholder="1,200,000" className={`${inputClass} pl-8`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Features */}
              <div className="p-6 rounded-2xl border border-border bg-card/80 backdrop-blur-sm">
                <h2 className="text-lg font-semibold mb-5 text-foreground">Key Features</h2>
                <div className="space-y-3">
                  {(["keyFeature1", "keyFeature2", "keyFeature3"] as const).map((field, i) => (
                    <div key={field}>
                      <label className={labelClass}>Feature {i + 1}</label>
                      <input type="text" maxLength={100} value={form[field]}
                        onChange={(e) => updateField(field, e.target.value)}
                        placeholder="e.g. Ocean views from every room" className={inputClass} />
                      <p className="text-xs text-muted-foreground mt-1 text-right">{form[field].length}/100</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agent Info */}
              <div className="p-6 rounded-2xl border border-border bg-card/80 backdrop-blur-sm">
                <h2 className="text-lg font-semibold mb-5 text-foreground">Agent Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Agent Name</label>
                    <input type="text" value={form.agentName} onChange={(e) => updateField("agentName", e.target.value)}
                      placeholder="Jane Smith" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Agency</label>
                    <input type="text" value={form.agency} onChange={(e) => updateField("agency", e.target.value)}
                      placeholder="Smith & Associates" className={inputClass} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Your Email <span className="text-red-500">*</span></label>
                    <input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)}
                      placeholder="jane@smithrealty.com" className={inputClass} required />
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="p-6 rounded-2xl border border-border bg-card/80 backdrop-blur-sm">
                <h2 className="text-lg font-semibold mb-5 text-foreground">Call to Action</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>CTA Text</label>
                    <input type="text" value={form.ctaText} onChange={(e) => updateField("ctaText", e.target.value)}
                      placeholder="Book an Inspection" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>CTA Link</label>
                    <input type="url" value={form.ctaLink} onChange={(e) => updateField("ctaLink", e.target.value)}
                      placeholder="https://..." className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Uploads */}
              <div className="p-6 rounded-2xl border border-border bg-card/80 backdrop-blur-sm">
                <h2 className="text-lg font-semibold mb-5 text-foreground">Uploads</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Agency Logo</label>
                    <label className="flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed border-input bg-card/50 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                      <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Upload logo</span>
                      <input type="file" accept="image/*" className="hidden" />
                    </label>
                  </div>
                  <div>
                    <label className={labelClass}>Listing Photos (max 3)</label>
                    <label className="flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed border-input bg-card/50 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                      <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Upload photos</span>
                      <input type="file" accept="image/*" multiple className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
              {/* Submit */}
              <div className="text-center pt-2">
                <button type="submit" disabled={submitting}
                  className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed text-lg text-white"
                  style={{ backgroundColor: submitting ? 'hsl(var(--atom-orange, 15 65% 55%) / 0.6)' : 'hsl(var(--atom-orange, 15 65% 55%))' }}
                >
                  {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating your video...</>
                    : <>Generate Real Estate Video</>}
                </button>
              </div>
            </motion.form>
          )}
        </div>
      </section>

      <footer className="py-6 px-4 border-t border-border text-center">
        <Link href="/atom" className="text-xs text-muted-foreground hover:text-foreground transition-colors">← Back to Templates</Link>
      </footer>
    </main>
  );
}