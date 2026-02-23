/**
 * Vestora Frontend — Outfit Suggestion service.
 * Handles AI-powered outfit suggestions based on trends and user requirements.
 */

import { api } from "./api";

export interface SuggestionOutfit {
  title: string;
  items: string[];
  why_it_works: string;
  styling_tips: string[];
  estimated_budget: string;
  trend_source: string;
  confidence_note: string;
  image_key: string;
  image_url: string;
}

export interface Suggestion {
  id: string;
  user_id: string;
  query: {
    occasion: string;
    style: string;
    budget: string;
    season: string;
    gender: string;
    notes: string;
  };
  outfits: SuggestionOutfit[];
  trending_context: string;
  created_at: string;
}

interface SuggestionListResponse {
  suggestions: Suggestion[];
  total: number;
}

interface SuggestionGenerateRequest {
  occasion: string;
  style?: string;
  budget?: string;
  season?: string;
  gender?: string;
  notes?: string;
}

export const suggestionService = {
  generate: (data: SuggestionGenerateRequest) =>
    api.post<Suggestion>("/suggestions/generate", data),

  list: (skip = 0, limit = 20) =>
    api.get<SuggestionListResponse>(`/suggestions?skip=${skip}&limit=${limit}`),

  delete: (id: string) => api.delete<void>(`/suggestions/${id}`),
};
