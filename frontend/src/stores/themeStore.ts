/**
 * Vestora Frontend — Theme Zustand store.
 * Manages theme state and persists to localStorage + data-theme attribute.
 */

import { create } from "zustand";
import type { ThemeName } from "@/types/common";

interface ThemeState {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "midnight",

  setTheme: (theme) => {
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("vestora-theme", theme);
    }
    set({ theme });
  },

  initTheme: () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("vestora-theme") as ThemeName | null;
      const theme = saved || "midnight";
      document.documentElement.setAttribute("data-theme", theme);
      set({ theme });
    }
  },
}));
