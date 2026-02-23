/**
 * HowItWorks — 3-step animated timeline showing the Vestora flow.
 * Upload → AI Analyzes → Get Styled
 */
"use client";

import ScrollReveal from "./ScrollReveal";
import { Upload, Brain, Sparkles } from "lucide-react";

/** Steps in the Vestora workflow */
const STEPS = [
  {
    icon: Upload,
    step: "01",
    title: "Upload Your Wardrobe",
    description:
      "Snap photos or bulk-upload your clothing. Our AI instantly detects every detail — category, color, fabric, pattern, fit, and more.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Brain,
    step: "02",
    title: "AI Understands Your Style",
    description:
      "Vestora builds your unique Style DNA — learning your preferences, body type, color palette, and comfort zone to become your personal stylist.",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Sparkles,
    step: "03",
    title: "Get Styled Instantly",
    description:
      "Receive personalized outfit suggestions with AI reasoning, hyper-realistic try-on images, and surprising wardrobe insights — every single day.",
    gradient: "from-pink-500 to-rose-600",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section-padding relative">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--accent)] opacity-[0.03] blur-[150px]" />

      <div className="max-w-5xl mx-auto relative">
        {/* Section header */}
        <ScrollReveal className="text-center mb-20">
          <p className="text-sm font-medium text-[var(--accent-light)] tracking-wider uppercase mb-3">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Three Steps to{" "}
            <span className="gradient-text-accent">Style Mastery</span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg">
            From upload to outfit — your AI stylist works in seconds.
          </p>
        </ScrollReveal>

        {/* Steps timeline */}
        <div className="relative">
          {/* Vertical connecting line (desktop only) */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-linear-to-b from-[var(--accent)]/30 via-[var(--accent-secondary)]/20 to-transparent" />

          <div className="space-y-16 lg:space-y-24">
            {STEPS.map((step, index) => (
              <ScrollReveal
                key={step.step}
                direction={index % 2 === 0 ? "left" : "right"}
                delay={index * 0.15}
              >
                <div
                  className={`flex flex-col lg:flex-row items-center gap-8 ${
                    index % 2 === 1 ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  {/* Content card */}
                  <div className="flex-1 glass rounded-2xl p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl bg-linear-to-br ${step.gradient} flex items-center justify-center shrink-0`}
                      >
                        <step.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-xs font-mono text-[var(--text-muted)] tracking-widest">
                        STEP {step.step}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Center dot (desktop) */}
                  <div className="hidden lg:flex w-12 h-12 shrink-0 items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-linear-to-br from-[var(--accent)] to-[var(--accent-secondary)] shadow-[0_0_20px_var(--accent-glow)]" />
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="flex-1 hidden lg:block" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
