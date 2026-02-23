/**
 * Vestora Frontend — useTheme hook.
 * Wraps theme store for convenient component usage.
 */

"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/stores/themeStore";

export function useTheme() {
  const { theme, setTheme, initTheme } = useThemeStore();

  /** Initialize theme from localStorage on mount */
  useEffect(() => {
    initTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { theme, setTheme };
}
