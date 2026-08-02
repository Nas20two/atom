"use client";

import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const tier = searchParams.get("tier") || "premium";
  const [jobStatus, setJobStatus] = useState<string>("checking");

  useEffect(() => {
    if (!sessionId) {
      setJobStatus("completed");
      return;
    }

    const check = async () => {
      await new Promise((r) => setTimeout(r, 3000));
      try {
        const res = await fetch(`/api/atom-submit?id=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.job) setJobStatus(data.job.status);
          else setJobStatus("processing");
        } else {
          setJobStatus("processing");
        }
      } catch {
        setJobStatus("processing");
      }
    };
    check();
  }, [sessionId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-md w-full text-center"
    >
      <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
        {jobStatus === "checking" ? (
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        ) : (
          <CheckCircle className="w-8 h-8 text-green-500" />
        )}
      </div>
      <h1 className="text-3xl font-bold text-foreground mb-2">Payment Confirmed!</h1>
      <p className="text-muted-foreground mb-6">
        Your {tier === "pro" ? "Pro" : tier === "premium" ? "Premium" : "Basic"} video is queued.
        Atom will deliver your 60-second MP4 to your email within 24 hours.
      </p>
      <div className="p-4 rounded-xl bg-card/80 border border-border mb-6 text-left text-sm text-muted-foreground space-y-1">
        <p>✅ Payment received</p>
        <p>🎵 AI-generated soundtrack composing</p>
        <p>🎬 Motion visuals rendering</p>
        <p>📬 Delivery queued to your inbox</p>
      </div>
      <p className="text-xs text-muted-foreground mb-6">
        Didn't receive an email? Check your spam folder or{" "}
        <Link href="/contact" className="text-primary hover:underline">contact us</Link>.
      </p>
      <Link
        href="/atom"
        className="inline-flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium rounded-xl transition-colors border border-border"
      >
        Create another video <ArrowRight className="w-4 h-4" />
      </Link>
    </motion.div>
  );
}

export default function AtomSuccessPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <Suspense fallback={
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground mt-4">Verifying payment...</p>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </main>
  );
}