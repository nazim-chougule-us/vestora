/**
 * LandingFooter — Site footer with link grid, social icons,
 * newsletter signup, and "Built with AI" badge.
 */
"use client";

import { Sparkles, Github, Twitter, Instagram, Linkedin, Mail } from "lucide-react";

/** Footer link groups */
const FOOTER_LINKS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Try-On", href: "#try-on" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Cookie Policy", href: "#" },
    ],
  },
];

/** Social media icons */
const SOCIALS = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Github, href: "#", label: "GitHub" },
];

export default function LandingFooter() {
  return (
    <footer className="border-t border-[var(--border)] mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2">
            {/* Logo */}
            <a href="#" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-linear-to-br from-[var(--accent)] to-[var(--accent-secondary)] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">Vestora</span>
            </a>
            <p className="text-sm text-[var(--text-secondary)] max-w-xs mb-6 leading-relaxed">
              Your Personal Style Intelligence. AI-powered fashion OS that
              understands your style DNA and transforms how you dress.
            </p>

            {/* Newsletter signup */}
            <div className="flex gap-2 max-w-xs">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 rounded-full glass text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]/50 border border-transparent transition-colors"
              />
              <button className="px-5 py-2.5 rounded-full bg-linear-to-r from-[var(--accent)] to-[var(--accent-secondary)] text-sm font-medium text-white hover:scale-105 transition-transform">
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Link groups */}
          {FOOTER_LINKS.map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-semibold mb-4">{group.title}</h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-xs text-[var(--text-muted)]">
            &copy; {new Date().getFullYear()} Vestora. All rights reserved.
          </p>

          {/* Built with AI badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs text-[var(--text-muted)]">
            <Sparkles className="w-3 h-3 text-[var(--accent-light)]" />
            Built with AI
          </div>

          {/* Social icons */}
          <div className="flex gap-3">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="w-9 h-9 rounded-full glass flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.06] transition-all"
              >
                <social.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
