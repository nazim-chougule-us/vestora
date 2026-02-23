/**
 * Vestora Frontend — Common/shared TypeScript interfaces.
 */

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

export interface ApiMessage {
  message: string;
}

export type ThemeName = "midnight" | "neon-cyber" | "light-minimal" | "warm-sunset" | "slate" | "rose" | "ocean" | "forest" | "paper" | "ink" | "sand" | "carbon";
