/**
 * Vestora Frontend — Outfit-related TypeScript interfaces.
 */

export interface OutfitItemRef {
  item_id: string;
  category: string;
  image_url: string;
}

export interface Outfit {
  id: string;
  user_id: string;
  occasion: string;
  mood?: string | null;
  dress_code?: string | null;
  items: OutfitItemRef[];
  reasoning: string;
  confidence_boost: string;
  styling_tips: string[];
  weather_note?: string | null;
  preferences_applied?: string[];
  created_at: string;
}

export interface OutfitListResponse {
  outfits: Outfit[];
  total: number;
}

export interface OutfitGenerateRequest {
  occasion: string;
  mood?: string;
  dress_code?: string;
  location?: string;
  notes?: string;
}

export interface OutfitFeedback {
  id: string;
  user_id: string;
  outfit_id: string;
  rating: number;
  tags: string[];
  notes?: string;
  confidence_before?: number;
  confidence_after?: number;
  created_at: string;
}
