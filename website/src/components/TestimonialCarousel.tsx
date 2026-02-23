/**
 * TestimonialCarousel — Glassmorphism testimonial cards with auto-scroll.
 * Shows user feedback about Vestora with a subtle parallax scroll effect.
 */
"use client";

import { useEffect, useState } from "react";
import ScrollReveal from "./ScrollReveal";
import { Star, Quote } from "lucide-react";

/** Testimonial data */
const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "Product Designer",
    quote:
      "Vestora completely changed how I get dressed every morning. The AI stylist feels like having a fashionable best friend who actually knows my wardrobe.",
    rating: 5,
    avatar: "SC",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    name: "Marcus Johnson",
    role: "Software Engineer",
    quote:
      "I used to spend 20 minutes picking outfits. Now I open Vestora, get a suggestion, and I'm out the door looking better than ever. The try-on feature is insane.",
    rating: 5,
    avatar: "MJ",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    name: "Priya Sharma",
    role: "Marketing Director",
    quote:
      "The Style DNA analysis was eye-opening. I discovered I lean heavily into structured minimalism but was overbuying statement pieces I never wore. Saved me hundreds.",
    rating: 5,
    avatar: "PS",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    name: "Alex Rivera",
    role: "Content Creator",
    quote:
      "The AI-generated try-on images are so realistic my followers thought I did an actual photoshoot. Game changer for outfit content creation.",
    rating: 5,
    avatar: "AR",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    name: "Emma Watson",
    role: "Startup Founder",
    quote:
      "The mood-to-style feature is brilliant. I typed 'powerful but approachable' and got the perfect board meeting outfit. Vestora just gets it.",
    rating: 5,
    avatar: "EW",
    gradient: "from-emerald-500 to-green-600",
  },
];

export default function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  /* Auto-rotate testimonials every 5 seconds */
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 rounded-full bg-[var(--accent)] opacity-[0.03] blur-[120px]" />

      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <ScrollReveal className="text-center mb-16">
          <p className="text-sm font-medium text-[var(--accent-light)] tracking-wider uppercase mb-3">
            Testimonials
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Loved by{" "}
            <span className="gradient-text-accent">Style Enthusiasts</span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg">
            See what our users are saying about their Vestora experience.
          </p>
        </ScrollReveal>

        {/* Testimonial cards — scrolling row */}
        <div className="relative">
          <div
            className="flex gap-6 transition-transform duration-700 ease-out"
            style={{
              transform: `translateX(-${activeIndex * (100 / 3)}%)`,
            }}
          >
            {TESTIMONIALS.map((testimonial, index) => (
              <div
                key={index}
                className="min-w-[calc(100%-2rem)] sm:min-w-[calc(50%-1rem)] lg:min-w-[calc(33.333%-1rem)] shrink-0"
              >
                <div className="glass rounded-2xl p-6 h-full">
                  {/* Quote icon */}
                  <Quote className="w-8 h-8 text-[var(--accent)]/30 mb-4" />

                  {/* Quote text */}
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>

                  {/* Rating stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full bg-linear-to-br ${testimonial.gradient} flex items-center justify-center text-xs font-bold text-white`}
                    >
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {TESTIMONIALS.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? "w-6 bg-[var(--accent)]"
                  : "bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
