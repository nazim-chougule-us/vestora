/**
 * Vestora Frontend — Theme configuration.
 * Defines all available themes with metadata for the ThemeToggle component.
 */

import type { ThemeName } from "@/types/common";

export interface ThemeConfig {
  name: ThemeName;
  label: string;
  description: string;
  previewColors: {
    bg: string;
    accent: string;
    text: string;
  };
}

export const themes: ThemeConfig[] = [
  {
    name: "midnight",
    label: "Midnight",
    description: "Deep dark with purple accents",
    previewColors: {
      bg: "#0a0a0f",
      accent: "#6c5ce7",
      text: "#e8e8ff",
    },
  },
  {
    name: "neon-cyber",
    label: "Neon Cyber",
    description: "Ultra-dark with cyan neon glow",
    previewColors: {
      bg: "#050510",
      accent: "#00f0ff",
      text: "#e0f7ff",
    },
  },
  {
    name: "light-minimal",
    label: "Light Minimal",
    description: "Clean light with soft purple",
    previewColors: {
      bg: "#f8f9fc",
      accent: "#5b4cdb",
      text: "#1a1a2e",
    },
  },
  {
    name: "warm-sunset",
    label: "Warm Sunset",
    description: "Rich dark with warm orange",
    previewColors: {
      bg: "#1a0f0a",
      accent: "#ff6b35",
      text: "#ffeedd",
    },
  },
  {
    name: "slate",
    label: "Slate",
    description: "Professional dark with blue accent",
    previewColors: {
      bg: "#0f172a",
      accent: "#3b82f6",
      text: "#f1f5f9",
    },
  },
  {
    name: "rose",
    label: "Rose",
    description: "Soft light with rose accent",
    previewColors: {
      bg: "#fff1f2",
      accent: "#e11d48",
      text: "#1c1917",
    },
  },
  {
    name: "ocean",
    label: "Ocean",
    description: "Deep navy with teal accent",
    previewColors: {
      bg: "#0c1222",
      accent: "#14b8a6",
      text: "#e2e8f0",
    },
  },
  {
    name: "forest",
    label: "Forest",
    description: "Dark green with emerald accent",
    previewColors: {
      bg: "#0a120e",
      accent: "#10b981",
      text: "#ecfdf5",
    },
  },
  {
    name: "paper",
    label: "Paper",
    description: "Pure white, monochrome black accent",
    previewColors: {
      bg: "#ffffff",
      accent: "#171717",
      text: "#0a0a0a",
    },
  },
  {
    name: "ink",
    label: "Ink",
    description: "True black OLED, zero color",
    previewColors: {
      bg: "#000000",
      accent: "#e5e5e5",
      text: "#fafafa",
    },
  },
  {
    name: "sand",
    label: "Sand",
    description: "Warm cream with earthy brown",
    previewColors: {
      bg: "#faf7f2",
      accent: "#92400e",
      text: "#1c1917",
    },
  },
  {
    name: "carbon",
    label: "Carbon",
    description: "Neutral dark with amber accent",
    previewColors: {
      bg: "#1a1a1a",
      accent: "#d97706",
      text: "#e5e5e5",
    },
  },
];

export const defaultTheme: ThemeName = "midnight";

export function getThemeConfig(name: ThemeName): ThemeConfig {
  return themes.find((t) => t.name === name) ?? themes[0];
}
