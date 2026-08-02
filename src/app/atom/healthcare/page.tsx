"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, CheckCircle, Upload, Stethoscope } from "lucide-react";
import Link from "next/link";

const STORAGE_KEY = "atom-healthcare-form";

interface FormData {
  clinicName: string;
  providerName: string;
  specialty: string;
  conditionName: string;
  description: string;
  benefit1: string;
  benefit2: string;
  benefit3: string;
  location: string;
  contact: string;
  email: string;
  language: string;
  ctaText: string;
  ctaLink: string;
  photos: string[];
}

const defaultForm: FormData = {
  clinicName: "",
  providerName: "",
  specialty: "General Practice",
  conditionName: "",
  description: "",
  benefit1: "",
  benefit2: "",
  benefit3: "",
  location: "",
  contact: "",
  email: "",
  language: "English",
  ctaText: "Book an Appointment",
  ctaLink: "",
  photos: [],
};

const specialties = [
  "General Practice",
  "Physiotherapy",
  "Dental",
  "Dermatology",
  "Fertility",
  "Cardiology",
  "Pediatrics",
  "Mental Health",
  "Nutrition",
  "Other",
];

const languages = [
  "English",
  "Hindi",
  "Arabic",
  "Vietnamese",
  "English+Hindi",
  "English+Arabic",
];

export default function HealthcarePage() {
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
    document.title = "Health Education Video Template | Atom";
  }, []);

  const updateField = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const compressImage = (file: File): Promise<string> => {
    const maxW = 1080;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setDone(true); }, 5000);
  };

  const resetForm = () => {
    setForm(defaultForm);
    localStorage.removeItem(STORAGE_KEY);
    setDone(false);
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-card border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors";
  const labelClass = "block text-sm font-medium text-foreground mb-1.5";

  return (
    <main className="min-h-screen bg-background overflow-hidden relative">
      {/* Orbital glow */}
      <div
        className="fixed top-0 right-0 w-96 h-96 opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, hsla(var(--atom-blue, 218 100% 50%), 0.08) 0%, transparent 70%)",
        }}
      />

      <nav className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <Link
            href="/atom"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            <ArrowRight className="w-4 h-4 mr-1 rotate-180" /> Back to
            Templates
          </Link>
          <span className="text-xs text-muted-foreground">
            Patient Education
          </span>
        </div>
      </nav>

      <section className="pt-8 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
              style={{
                backgroundColor:
                  "hsla(var(--atom-blue, 218 100% 50%), 0.1)",
                color: "hsl(var(--atom-blue, 218 100% 50%))",
              }}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              Healthcare / Patient Education
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Create Your Patient Education Video
            </h1>
            <p className="text-muted-foreground mb-10">
              Enter your practice details and let AI generate an engaging
              patient education video.
            </p>
          </motion.div>

          {done ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
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
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              onSubmit={handleSubmit}
              className="space-y-6"
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
              {/* Practice Information */}
              <div className="p-6 rounded-2xl border border-border bg-card/80 backdrop-blur-sm">
                <h2 className="text-lg font-semibold mb-5 text-foreground">
                  Practice Information
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>
                      Practice / Clinic Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.clinicName}
                      onChange={(e) =>
                        updateField("clinicName", e.target.value)
                      }
                      placeholder="Sydney Health Clinic"
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Provider / Specialist Name{" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.providerName}
                      onChange={(e) =>
                        updateField("providerName", e.target.value)
                      }
                      placeholder="Dr. Sarah Chen"
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Specialty</label>
                    <select
                      value={form.specialty}
                      onChange={(e) =>
                        updateField("specialty", e.target.value)
                      }
                      className={inputClass}
                    >
                      {specialties.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>
                      Condition / Procedure Name{" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.conditionName}
                      onChange={(e) =>
                        updateField("conditionName", e.target.value)
                      }
                      placeholder="Knee Replacement, Teeth Whitening"
                      className={inputClass}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="p-6 rounded-2xl border border-border bg-card/80 backdrop-blur-sm">
                <h2 className="text-lg font-semibold mb-5 text-foreground">
                  Description
                </h2>
                <div>
                  <label className={labelClass}>
                    Brief description / what to expect
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      updateField(
                        "description",
                        e.target.value.slice(0, 300)
                      )
                    }
                    placeholder="Describe the procedure, treatment, or condition — what patients should know and expect..."
                    rows={4}
                    maxLength={300}
                    className={`${inputClass} resize-none`}
                  />
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    {form.description.length}/300
                  </p>
                </div>
              </div>

              {/* Key Benefits */}
              <div className="p-6 rounded-2xl border border-border bg-card/80 backdrop-blur-sm">
                <h2 className="text-lg font-semibold mb-5 text-foreground">
                  Key Benefits
                </h2>
                <div className="space-y-3">
                  {(["benefit1", "benefit2", "benefit3"] as const).map(
                    (field, i) => (
                      <div key={field}>
                        <label className={labelClass}>
                          Benefit {i + 1}
                        </label>
                        <input
                          type="text"
                          maxLength={100}
                          value={form[field]}
                          onChange={(e) =>
                            updateField(field, e.target.value)
                          }
                          placeholder={`e.g. ${
                            i === 0
                              ? "Minimally invasive procedure"
                              : i === 1
                                ? "Fast recovery time"
                                : "Covered by most insurances"
                          }`}
                          className={inputClass}
                        />
                        <p className="text-xs text-muted-foreground mt-1 text-right">
                          {form[field].length}/100
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Contact & Language */}
              <div className="p-6 rounded-2xl border border-border bg-card/80 backdrop-blur-sm">
                <h2 className="text-lg font-semibold mb-5 text-foreground">
                  Contact & Language
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Location</label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) =>
                        updateField("location", e.target.value)
                      }
                      placeholder="Suite 1, 123 Medical Ave, Sydney"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Phone / Contact</label>
                    <input
                      type="text"
                      value={form.contact}
                      onChange={(e) =>
                        updateField("contact", e.target.value)
                      }
                      placeholder="(02) 9123 4567"
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Your Email <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        updateField("email", e.target.value)
                      }
                      placeholder="info@cityclinic.com.au"
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Language Preference
                    </label>
                    <select
                      value={form.language}
                      onChange={(e) =>
                        updateField("language", e.target.value)
                      }
                      className={inputClass}
                    >
                      {languages.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="p-6 rounded-2xl border border-border bg-card/80 backdrop-blur-sm">
                <h2 className="text-lg font-semibold mb-5 text-foreground">
                  Call to Action
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>CTA Text</label>
                    <input
                      type="text"
                      value={form.ctaText}
                      onChange={(e) =>
                        updateField("ctaText", e.target.value)
                      }
                      placeholder="Book an Appointment"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>CTA Link</label>
                    <input
                      type="url"
                      value={form.ctaLink}
                      onChange={(e) =>
                        updateField("ctaLink", e.target.value)
                      }
                      placeholder="https://..."
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Uploads */}
              <div className="p-6 rounded-2xl border border-border bg-card/80 backdrop-blur-sm">
                <h2 className="text-lg font-semibold mb-5 text-foreground">
                  Uploads
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Clinic Logo</label>
                    <label className="flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed border-input bg-card/50 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                      <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">
                        Upload logo
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div>
                    <label className={labelClass}>
                      Photos / Diagrams (max 3)
                    </label>
                    <label className="flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed border-input bg-card/50 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                      <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">
                        Upload images
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

              {/* Submit */}
              <div className="text-center pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed text-lg text-white"
                  style={{
                    backgroundColor: submitting
                      ? "hsl(var(--atom-orange, 15 65% 55%) / 0.6)"
                      : "hsl(var(--atom-orange, 15 65% 55%))",
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />{" "}
                      Generating your video...
                    </>
                  ) : (
                    <>Generate Patient Education Video</>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </div>
      </section>

      <footer className="py-6 px-4 border-t border-border text-center">
        <Link
          href="/atom"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Templates
        </Link>
      </footer>
    </main>
  );
}