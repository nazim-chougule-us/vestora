"use client";

/**
 * Vestora Frontend — ThemeProvider component.
 * Initializes theme from localStorage on mount and sets data-theme on <html>.
 * Wrap the app with this to ensure theme is applied before first paint.
 */

import { useEffect } from "react";
import { useThemeStore } from "@/stores/themeStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const initTheme = useThemeStore((s) => s.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return <>{children}</>;
}
