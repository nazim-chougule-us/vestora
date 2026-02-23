/**
 * TryOnDemo — Interactive before/after comparison demonstrating
 * the AI virtual try-on feature. Uses a draggable slider.
 */
"use client";

import { useState, useRef, useCallback } from "react";
import ScrollReveal from "./ScrollReveal";
import { Sparkles } from "lucide-react";

export default function TryOnDemo() {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  /** Update slider position based on pointer X coordinate */
  const updateSlider = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);

  const handlePointerDown = useCallback(() => {
    isDragging.current = true;
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isDragging.current) updateSlider(e.clientX);
    },
    [updateSlider]
  );

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  return (
    <section id="try-on" className="section-padding relative">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <ScrollReveal className="text-center mb-16">
          <p className="text-sm font-medium text-[var(--accent-light)] tracking-wider uppercase mb-3">
            AI Try-On
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            See Yourself in{" "}
            <span className="gradient-text-accent">Any Outfit</span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg">
            Hyper-realistic AI-generated try-on images. Studio, street-style, or
            professional — you choose.
          </p>
        </ScrollReveal>

        {/* Before/After slider */}
        <ScrollReveal>
          <div
            ref={containerRef}
            className="relative w-full max-w-3xl mx-auto aspect-[4/5] rounded-2xl overflow-hidden glass cursor-col-resize select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {/* "Before" side — casual look (simulated with gradient) */}
            <div className="absolute inset-0 bg-linear-to-br from-slate-800 via-slate-700 to-slate-900 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-44 mx-auto rounded-xl bg-linear-to-b from-slate-600 to-slate-700 border border-white/10 mb-4 flex items-center justify-center">
                  <span className="text-4xl opacity-50">👤</span>
                </div>
                <p className="text-sm text-[var(--text-muted)] font-medium">
                  Your Photo
                </p>
              </div>
            </div>

            {/* "After" side — AI styled (simulated with vibrant gradient) */}
            <div
              className="absolute inset-0 bg-linear-to-br from-violet-900 via-purple-800 to-indigo-900 flex items-center justify-center"
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
              <div className="text-center">
                <div className="w-32 h-44 mx-auto rounded-xl bg-linear-to-b from-violet-500/30 to-purple-600/30 border border-[var(--accent)]/30 mb-4 flex items-center justify-center relative overflow-hidden">
                  <span className="text-4xl">👤</span>
                  {/* Outfit overlay indicators */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-linear-to-t from-[var(--accent)]/20 to-transparent" />
                </div>
                <p className="text-sm text-[var(--accent-light)] font-medium flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Styled
                </p>
              </div>
            </div>

            {/* Slider handle */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white/80 z-10"
              style={{ left: `${sliderPos}%` }}
            >
              {/* Drag handle circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center">
                <div className="flex gap-0.5">
                  <div className="w-0.5 h-4 bg-gray-400 rounded-full" />
                  <div className="w-0.5 h-4 bg-gray-400 rounded-full" />
                </div>
              </div>
            </div>

            {/* Labels */}
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full glass text-xs font-medium z-10">
              Before
            </div>
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/30 text-xs font-medium text-[var(--accent-light)] z-10">
              After AI
            </div>
          </div>
        </ScrollReveal>

        {/* Try-on style variants */}
        <ScrollReveal delay={0.2}>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {["Studio Shot", "Street Style", "Professional"].map((style) => (
              <div
                key={style}
                className="px-5 py-2.5 rounded-full glass text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] transition-all cursor-pointer"
              >
                {style}
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
