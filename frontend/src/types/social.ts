/**
 * Vestora Frontend — Social-related TypeScript interfaces.
 */

export interface SocialPost {
  id: string;
  user_id: string;
  image_url: string;
  caption?: string;
  votes_up: number;
  votes_down: number;
  created_at: string;
}

export interface Battle {
  id: string;
  challenger_id: string;
  opponent_id: string;
  challenger_outfit: string;
  opponent_outfit: string;
  votes: Record<string, string>;
  status: "pending" | "active" | "completed";
  created_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  name: string;
  style_score: number;
  rank: number;
}
