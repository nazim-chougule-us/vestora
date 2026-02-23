/**
 * Vestora Frontend — Application constants.
 */

export const APP_NAME = "Vestora";
export const APP_DESCRIPTION = "Your Personal Style Intelligence";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/** Wardrobe category options */
export const CATEGORIES = [
  "Tops",
  "Bottoms",
  "Dresses",
  "Outerwear",
  "Shoes",
  "Accessories",
  "Bags",
  "Activewear",
  "Swimwear",
  "Formal",
  "Sleepwear",
  "Other",
] as const;

/** Season options */
export const SEASONS = [
  "Spring",
  "Summer",
  "Autumn",
  "Winter",
  "All-Season",
] as const;

/** Occasion options */
export const OCCASIONS = [
  "Casual",
  "Work",
  "Date Night",
  "Formal Event",
  "Party",
  "Travel",
  "Workout",
  "Interview",
  "Wedding",
  "Beach",
  "Meeting",
  "Brunch",
] as const;

/** Mood options */
export const MOODS = [
  "Confident",
  "Relaxed",
  "Energetic",
  "Mysterious",
  "Powerful",
  "Creative",
  "Romantic",
  "Professional",
  "Adventurous",
  "Cozy",
] as const;

/** Theme definitions */
export const THEMES = {
  midnight: { label: "Midnight", emoji: "🌙" },
  "neon-cyber": { label: "Neon Cyber", emoji: "⚡" },
  "light-minimal": { label: "Light Minimal", emoji: "☀️" },
  "warm-sunset": { label: "Warm Sunset", emoji: "🌅" },
} as const;
