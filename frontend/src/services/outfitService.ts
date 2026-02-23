/**
 * Vestora Frontend — Outfit service.
 * Handles outfit generation, listing, and deletion.
 */

import { api } from "./api";
import type { Outfit, OutfitListResponse, OutfitGenerateRequest } from "@/types/outfit";

export const outfitService = {
  generate: (data: OutfitGenerateRequest) =>
    api.post<Outfit>("/outfits/generate", data),

  list: (skip = 0, limit = 20) =>
    api.get<OutfitListResponse>(`/outfits?skip=${skip}&limit=${limit}`),

  get: (id: string) => api.get<Outfit>(`/outfits/${id}`),

  delete: (id: string) => api.delete<void>(`/outfits/${id}`),
};
