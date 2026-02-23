/**
 * FeatureShowcase — 6 feature cards with scroll-triggered animations.
 * Each card highlights a core Vestora capability with an icon and description.
 */
"use client";

import ScrollReveal from "./ScrollReveal";
import {
  Camera,
  Wand2,
  Shirt,
  BarChart3,
  Fingerprint,
  Users,
} from "lucide-react";

/** Feature definitions with icon, title, and description */
const FEATURES = [
  {
    icon: Camera,
    title: "Smart Wardrobe Scan",
    description:
      "Upload photos and our AI instantly detects category, color, fabric, pattern, fit, brand, and condition.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Wand2,
    title: "AI Outfit Engine",
    description:
      "Get personalized outfit recommendations based on occasion, mood, weather, and your style DNA.",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Shirt,
    title: "Virtual Try-On",
    description:
      "See yourself in any outfit with hyper-realistic AI-generated try-on images in studio, street, or professional styles.",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    icon: BarChart3,
    title: "Closet Analytics",
    description:
      "Discover cost-per-wear, color imbalances, and surprising insights about your wardrobe habits.",
    gradient: "from-emerald-500 to-green-600",
  },
  {
    icon: Fingerprint,
    title: "Style DNA",
    description:
      "A unique style profile that evolves with you — Minimalist, Urban Modern, Classic, or Street Casual.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: Users,
    title: "Social & Battles",
    description:
      "Share AI-styled looks, get votes from friends, compete in outfit battles, and climb the style leaderboard.",
    gradient: "from-indigo-500 to-violet-600",
  },
];

export default function FeatureShowcase() {
  return (
    <section id="features" className="section-padding relative">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <ScrollReveal className="text-center mb-16">
          <p className="text-sm font-medium text-[var(--accent-light)] tracking-wider uppercase mb-3">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Everything Your Wardrobe{" "}
            <span className="gradient-text-accent">Needs</span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg">
            From intelligent clothing analysis to hyper-realistic virtual try-ons,
            Vestora transforms how you dress.
          </p>
        </ScrollReveal>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, index) => (
            <ScrollReveal key={feature.title} delay={index * 0.1}>
              <div className="group glass rounded-2xl p-6 h-full hover:bg-white/[0.04] transition-all duration-300 hover:border-white/10 hover:-translate-y-1">
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl bg-linear-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold mb-2 text-[var(--text-primary)]">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
