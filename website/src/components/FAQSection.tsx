/**
 * FAQSection — Animated accordion FAQ with smooth expand/collapse.
 * Covers common questions about Vestora features, pricing, and privacy.
 */
"use client";

import { useState } from "react";
import ScrollReveal from "./ScrollReveal";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/** FAQ items */
const FAQS = [
  {
    question: "How does the AI wardrobe scanning work?",
    answer:
      "Simply upload photos of your clothing — individually or in bulk from your gallery. Our AI instantly analyzes each item to detect category, color, fabric, pattern, fit, brand, condition, and seasonality. No manual tagging required.",
  },
  {
    question: "How realistic are the AI try-on images?",
    answer:
      "We use state-of-the-art image generation models that consider your body type, skin tone, and the exact clothing details to produce hyper-realistic try-on images. You can choose studio, street-style, or professional headshot modes.",
  },
  {
    question: "Is my data private and secure?",
    answer:
      "Absolutely. Your photos and personal data are encrypted and stored securely. We never share your images or wardrobe data with third parties. You have full control to delete your data at any time.",
  },
  {
    question: "Can Vestora work with my existing wardrobe?",
    answer:
      "Yes! Vestora is designed to work with what you already own. Upload your current clothes, and the AI will analyze them and start generating personalized outfit suggestions immediately.",
  },
  {
    question: "What makes the outfit recommendations personalized?",
    answer:
      "Vestora considers your Style DNA (learned from your wardrobe and feedback), body type, color preferences, the occasion, current weather, your mood, and even your calendar events to suggest outfits that truly fit your life.",
  },
  {
    question: "Can I use Vestora for free?",
    answer:
      "Yes! The free tier includes 20 wardrobe items, 5 daily outfit suggestions, and 3 AI try-ons per month. Upgrade to Pro for unlimited access to all features including Style DNA, shopping assistant, and capsule wardrobe generator.",
  },
  {
    question: "How does the shopping assistant work?",
    answer:
      "The AI analyzes gaps in your wardrobe and suggests specific items that would complement your existing clothes. It searches the web for the best prices, recommends sustainable options, and even detects fake deals.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="section-padding relative">
      <div className="max-w-3xl mx-auto">
        {/* Section header */}
        <ScrollReveal className="text-center mb-16">
          <p className="text-sm font-medium text-[var(--accent-light)] tracking-wider uppercase mb-3">
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Frequently Asked{" "}
            <span className="gradient-text-accent">Questions</span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg">
            Everything you need to know about Vestora.
          </p>
        </ScrollReveal>

        {/* FAQ accordion */}
        <div className="space-y-3">
          {FAQS.map((faq, index) => (
            <ScrollReveal key={index} delay={index * 0.05}>
              <div className="glass rounded-xl overflow-hidden">
                {/* Question button */}
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-sm font-medium pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[var(--text-muted)] shrink-0 transition-transform duration-300 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Answer (animated) */}
                <AnimatePresence initial={false}>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-5 pb-5">
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
