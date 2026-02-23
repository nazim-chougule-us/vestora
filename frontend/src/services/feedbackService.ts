/**
 * Vestora Frontend — Feedback service.
 * Handles outfit feedback submission and retrieval.
 */

import { api } from "./api";
import type { OutfitFeedback } from "@/types/outfit";

interface FeedbackListResponse {
  feedbacks: OutfitFeedback[];
  total: number;
}

interface FeedbackCreateRequest {
  rating: number;
  tags?: string[];
  notes?: string;
  confidence_before?: number;
  confidence_after?: number;
}

export const feedbackService = {
  submit: (outfitId: string, data: FeedbackCreateRequest) =>
    api.post<OutfitFeedback>(`/outfits/${outfitId}/feedback`, data),

  listForOutfit: (outfitId: string) =>
    api.get<FeedbackListResponse>(`/outfits/${outfitId}/feedback`),

  history: (skip = 0, limit = 50) =>
    api.get<FeedbackListResponse>(`/outfits/history?skip=${skip}&limit=${limit}`),
};
