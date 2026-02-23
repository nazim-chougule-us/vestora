"use client";

/**
 * Vestora Frontend — ThemeToggle component.
 * Dropdown with live color previews for each theme.
 */

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { themes, type ThemeConfig } from "@/styles/themes";
import type { ThemeName } from "@/types/common";
import { Palette, Check } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-border bg-bg-card px-3 py-2 text-sm text-text-primary hover:border-border-hover hover:bg-bg-card-hover"
        aria-label="Change theme"
      >
        <Palette className="h-4 w-4 text-accent" />
        <span className="hidden sm:inline">Theme</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-bg-secondary shadow-lg">
          <div className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-text-tertiary">
            Choose Theme
          </div>
          {themes.map((t: ThemeConfig) => (
            <button
              key={t.name}
              onClick={() => {
                setTheme(t.name as ThemeName);
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-bg-tertiary"
            >
              {/* Live color preview swatch */}
              <div className="flex shrink-0 gap-0.5">
                <div
                  className="h-6 w-6 rounded-l-md border border-white/10"
                  style={{ background: t.previewColors.bg }}
                />
                <div
                  className="h-6 w-4 border-y border-white/10"
                  style={{ background: t.previewColors.accent }}
                />
                <div
                  className="h-6 w-3 rounded-r-md border border-white/10"
                  style={{ background: t.previewColors.text }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-primary">{t.label}</div>
                <div className="text-xs text-text-tertiary truncate">{t.description}</div>
              </div>

              {theme === t.name && (
                <Check className="h-4 w-4 shrink-0 text-accent" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
