/**
 * HeroSection — Main landing hero with animated gradient mesh background,
 * headline, tagline, CTA buttons, and a floating app mockup.
 */
"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-[var(--nav-height)]">
      {/* Gradient mesh background blobs */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[var(--accent)] opacity-[0.07] blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-[var(--accent-secondary)] opacity-[0.05] blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full bg-pink-500 opacity-[0.04] blur-[80px] animate-pulse-glow" style={{ animationDelay: "3s" }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-[var(--accent-light)] mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
              AI-Powered Fashion Intelligence
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight tracking-tight mb-6"
            >
              Your Personal{" "}
              <span className="gradient-text-accent">Style</span>
              <br />
              Intelligence
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed"
            >
              The AI fashion operating system that digitizes your wardrobe,
              understands your style DNA, and generates hyper-realistic try-on
              visuals.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <a
                href="#pricing"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold text-white rounded-full bg-linear-to-r from-[var(--accent)] to-[var(--accent-secondary)] glow-accent hover:scale-105 transition-all duration-300"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#try-on"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-medium text-[var(--text-primary)] rounded-full glass hover:bg-white/[0.06] transition-colors duration-300"
              >
                <Play className="w-4 h-4" />
                Watch Demo
              </a>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-10 flex items-center gap-4 justify-center lg:justify-start"
            >
              {/* Overlapping avatars */}
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-[var(--bg-primary)] bg-linear-to-br from-[var(--accent)] to-[var(--accent-secondary)]"
                    style={{ opacity: 1 - i * 0.15 }}
                  />
                ))}
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                Trusted by{" "}
                <span className="text-[var(--text-primary)] font-semibold">
                  10,000+
                </span>{" "}
                style-conscious users
              </p>
            </motion.div>
          </div>

          {/* Right: App mockup */}
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative animate-float">
              {/* Glow behind mockup */}
              <div className="absolute inset-0 bg-linear-to-br from-[var(--accent)] to-[var(--accent-secondary)] opacity-20 blur-[60px] rounded-3xl" />

              {/* Mockup card */}
              <div className="relative glass rounded-3xl p-6 border border-white/10">
                {/* Mockup header */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-xs text-[var(--text-muted)]">
                    Vestora Dashboard
                  </span>
                </div>

                {/* Mockup content — simulated outfit cards */}
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-20 h-24 rounded-lg bg-linear-to-br from-violet-600/30 to-violet-800/20 border border-white/5" />
                    <div className="w-20 h-24 rounded-lg bg-linear-to-br from-cyan-600/30 to-cyan-800/20 border border-white/5" />
                    <div className="w-20 h-24 rounded-lg bg-linear-to-br from-pink-600/30 to-pink-800/20 border border-white/5" />
                  </div>
                  <div className="glass rounded-lg p-3">
                    <div className="text-xs text-[var(--accent-light)] font-medium mb-1">
                      AI Stylist Says
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      &quot;This outfit creates a confident, modern look. The dark
                      blazer pairs beautifully with your blue denim...&quot;
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 h-2 rounded-full bg-[var(--accent)]/30" />
                    <div className="flex-1 h-2 rounded-full bg-[var(--accent-secondary)]/20" />
                    <div className="flex-1 h-2 rounded-full bg-pink-500/20" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
