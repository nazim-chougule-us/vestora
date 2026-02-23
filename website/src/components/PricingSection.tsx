/**
 * PricingSection — 3-tier pricing cards (Free, Pro, Enterprise).
 * The recommended "Pro" tier has an animated neon border glow.
 */
"use client";

import ScrollReveal from "./ScrollReveal";
import { Check, Sparkles, Zap, Building2 } from "lucide-react";

/** Pricing tier definitions */
const TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for exploring Vestora",
    icon: Sparkles,
    gradient: "from-slate-500 to-slate-600",
    highlighted: false,
    features: [
      "20 wardrobe items",
      "5 outfit suggestions/day",
      "3 AI try-ons/month",
      "Basic analytics",
      "Social feed (view only)",
    ],
    cta: "Get Started",
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/month",
    description: "For the style-conscious individual",
    icon: Zap,
    gradient: "from-violet-500 to-purple-600",
    highlighted: true,
    features: [
      "Unlimited wardrobe items",
      "Unlimited outfit suggestions",
      "Unlimited AI try-ons",
      "Full analytics + AI advice",
      "Style DNA profile",
      "Shopping assistant",
      "Capsule wardrobe generator",
      "Full social features",
      "Mood-to-style generator",
      "Confidence tracking",
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For stylists, influencers & brands",
    icon: Building2,
    gradient: "from-cyan-500 to-blue-600",
    highlighted: false,
    features: [
      "Everything in Pro",
      "API access",
      "White-label options",
      "Team management",
      "Priority support",
      "Custom integrations",
    ],
    cta: "Contact Sales",
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="section-padding relative">
      {/* Background glow behind Pro card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[var(--accent)] opacity-[0.05] blur-[150px]" />

      <div className="max-w-6xl mx-auto relative">
        {/* Section header */}
        <ScrollReveal className="text-center mb-16">
          <p className="text-sm font-medium text-[var(--accent-light)] tracking-wider uppercase mb-3">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Simple,{" "}
            <span className="gradient-text-accent">Transparent</span> Pricing
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg">
            Start free, upgrade when you need more power.
          </p>
        </ScrollReveal>

        {/* Pricing cards grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {TIERS.map((tier, index) => (
            <ScrollReveal key={tier.name} delay={index * 0.15}>
              <div
                className={`rounded-2xl p-6 lg:p-8 h-full flex flex-col ${
                  tier.highlighted
                    ? "border-glow glass relative scale-105 z-10"
                    : "glass"
                }`}
              >
                {/* Popular badge */}
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-linear-to-r from-[var(--accent)] to-[var(--accent-secondary)] text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}

                {/* Icon + Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl bg-linear-to-br ${tier.gradient} flex items-center justify-center`}
                  >
                    <tier.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">{tier.name}</h3>
                </div>

                {/* Price */}
                <div className="mb-2">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.period && (
                    <span className="text-[var(--text-muted)] text-sm ml-1">
                      {tier.period}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-[var(--text-secondary)] mb-6">
                  {tier.description}
                </p>

                {/* Feature list */}
                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2.5 text-sm"
                    >
                      <Check
                        className={`w-4 h-4 shrink-0 ${
                          tier.highlighted
                            ? "text-[var(--accent-light)]"
                            : "text-[var(--text-muted)]"
                        }`}
                      />
                      <span className="text-[var(--text-secondary)]">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  className={`w-full py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                    tier.highlighted
                      ? "bg-linear-to-r from-[var(--accent)] to-[var(--accent-secondary)] text-white glow-accent hover:scale-105"
                      : "glass text-[var(--text-primary)] hover:bg-white/[0.06]"
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
