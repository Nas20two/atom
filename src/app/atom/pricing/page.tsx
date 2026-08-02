"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, AtomIcon } from "lucide-react";
import Link from "next/link";
import { TIERS, TIER_ORDER } from "@/lib/pricing";

/**
 * Pay-per-video pricing. Every tier is a one-time purchase — no subscriptions.
 * Each CTA sends the buyer to the checkout section with the tier preselected
 * (`/atom#checkout?tier=<id>`), which creates a one-time Stripe Checkout session.
 */
export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background px-4 relative overflow-hidden">
      {/* Orbital decoration */}
      <div
        className="fixed top-0 right-0 w-96 h-96 opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, hsla(var(--atom-orange, 15 65% 55%), 0.08) 0%, transparent 70%)",
        }}
      />

      {/* Nav */}
      <nav className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between py-4">
          <Link
            href="/atom"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            <ArrowRight className="w-4 h-4 mr-1 rotate-180" /> Back
          </Link>
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <AtomIcon
              className="w-3.5 h-3.5"
              style={{ color: "hsl(var(--atom-orange, 15 65% 55%))" }}
            />{" "}
            Pricing
          </span>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16 pb-12">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
              style={{
                backgroundColor: "hsla(var(--atom-orange, 15 65% 55%), 0.1)",
                color: "hsl(var(--atom-orange, 15 65% 55%))",
              }}
            >
              <AtomIcon className="w-4 h-4" />
              Simple, one-time pricing
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-foreground">
              Pay per video. No subscription.
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              One price per video, per template. You only pay when you order.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 items-start max-w-4xl mx-auto">
            {TIER_ORDER.map((tierId, index) => {
              const plan = TIERS[tierId];
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className={`relative p-8 rounded-2xl border transition-all ${
                    plan.popular
                      ? "border-blue-500/40 bg-card shadow-xl shadow-blue-500/5 scale-105 md:scale-110"
                      : "border-border bg-card/80 hover:bg-card hover:shadow-lg"
                  }`}
                >
                  {plan.popular && (
                    <div
                      className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-full text-sm font-semibold shadow-lg"
                      style={{
                        backgroundColor: "hsl(var(--atom-orange, 15 65% 55%))",
                        color: "white",
                      }}
                    >
                      Most Popular
                    </div>
                  )}

                  <div className={plan.popular ? "mt-4" : ""}>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-5xl font-bold text-foreground">
                        ${plan.price}
                      </span>
                      <span className="text-muted-foreground">/video</span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-8">
                      {plan.description}
                    </p>

                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <Check
                            className="w-5 h-5 shrink-0 mt-0.5"
                            style={{
                              color: plan.popular
                                ? "hsl(var(--atom-orange, 15 65% 55%))"
                                : undefined,
                            }}
                          />
                          <span className="text-sm text-foreground">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={`/atom#checkout?tier=${plan.id}`}
                      className="block w-full py-4 rounded-xl font-medium transition-all text-center text-white shadow-lg hover:shadow-xl"
                      style={{
                        backgroundColor: plan.popular
                          ? "hsl(var(--atom-orange, 15 65% 55%))"
                          : "hsl(var(--atom-blue, 218 100% 50%))",
                      }}
                    >
                      Order {plan.name}
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border text-center">
        <p className="text-xs text-muted-foreground mb-2">
          Need custom pricing for your agency?{" "}
          <Link
            href="/atom"
            className="hover:underline"
            style={{ color: "hsl(var(--atom-orange, 15 65% 55%))" }}
          >
            Contact us
          </Link>
        </p>
        <Link
          href="/atom"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Atom
        </Link>
      </footer>
    </main>
  );
}
