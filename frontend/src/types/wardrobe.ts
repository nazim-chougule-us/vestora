/**
 * Vestora Frontend — Wardrobe-related TypeScript interfaces.
 */

export interface AIAttributes {
  category: string;
  subcategory: string;
  primary_color: string;
  secondary_color: string;
  fabric: string;
  pattern: string;
  fit: string;
  brand: string;
  condition: string;
  season: string[];
  occasion: string[];
  formality_score: number;
}

export interface WardrobeItem {
  id: string;
  user_id: string;
  image_key: string;
  image_url: string;
  detected_items: AIAttributes[];
  notes: string;
  purchase_price?: number | null;
  tags: string[];
  wear_count: number;
  cost_per_wear?: number | null;
  last_worn_at?: string | null;
  wear_dates: string[];
  ai_analyzed: boolean;
  created_at: string;
}

export interface WardrobeListResponse {
  items: WardrobeItem[];
  total: number;
}

export interface WardrobeFilters {
  category?: string;
  color?: string;
  season?: string;
  fabric?: string;
  search?: string;
}
