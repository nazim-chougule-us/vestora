/**
 * StyleDNAPreview — Animated radar chart showing a sample Style DNA profile.
 * Uses Recharts to visualize style dimensions like Minimalist, Bold, Classic, etc.
 */
"use client";

import ScrollReveal from "./ScrollReveal";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

/** Sample style DNA data points */
const STYLE_DATA = [
  { trait: "Minimalist", value: 85 },
  { trait: "Bold", value: 45 },
  { trait: "Classic", value: 70 },
  { trait: "Street", value: 60 },
  { trait: "Formal", value: 55 },
  { trait: "Creative", value: 75 },
];

/** Sample style tags for the profile card */
const STYLE_TAGS = [
  "Urban Modern",
  "Clean Lines",
  "Neutral Palette",
  "Structured Fits",
  "Subtle Patterns",
];

export default function StyleDNAPreview() {
  return (
    <section className="section-padding relative">
      {/* Background glow */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-[var(--accent-secondary)] opacity-[0.04] blur-[120px]" />

      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <ScrollReveal className="text-center mb-16">
          <p className="text-sm font-medium text-[var(--accent-light)] tracking-wider uppercase mb-3">
            Style DNA
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Discover Your{" "}
            <span className="gradient-text-accent">Style Identity</span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg">
            A unique style profile that evolves with you, powered by AI analysis
            of your wardrobe, preferences, and feedback.
          </p>
        </ScrollReveal>

        {/* Content grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Radar chart */}
          <ScrollReveal direction="left">
            <div className="glass rounded-2xl p-6">
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={STYLE_DATA} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid
                    stroke="rgba(255,255,255,0.06)"
                    strokeDasharray="3 3"
                  />
                  <PolarAngleAxis
                    dataKey="trait"
                    tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                  />
                  <Radar
                    name="Style DNA"
                    dataKey="value"
                    stroke="#7c3aed"
                    fill="#7c3aed"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </ScrollReveal>

          {/* Profile card */}
          <ScrollReveal direction="right">
            <div className="space-y-6">
              {/* Style type badge */}
              <div className="glass rounded-2xl p-6">
                <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
                  Your Style Type
                </p>
                <h3 className="text-2xl font-bold gradient-text-accent mb-3">
                  Urban Minimalist
                </h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                  You gravitate toward clean lines, structured silhouettes, and
                  a refined neutral palette. Your wardrobe is intentional —
                  every piece earns its place.
                </p>
              </div>

              {/* Style tags */}
              <div className="glass rounded-2xl p-6">
                <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">
                  Style Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {STYLE_TAGS.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent-light)] border border-[var(--accent)]/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Color preferences */}
              <div className="glass rounded-2xl p-6">
                <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">
                  Color Preferences
                </p>
                <div className="flex gap-3">
                  {["#1a1a2e", "#374151", "#f5f5f4", "#7c3aed", "#06b6d4"].map(
                    (color) => (
                      <div
                        key={color}
                        className="w-10 h-10 rounded-full border-2 border-white/10"
                        style={{ backgroundColor: color }}
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
