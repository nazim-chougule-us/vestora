/**
 * Vestora Frontend — Wardrobe service.
 * Handles wardrobe CRUD, upload, and AI analysis operations.
 */

import { api } from "./api";
import type { WardrobeItem, WardrobeListResponse, WardrobeFilters } from "@/types/wardrobe";

export const wardrobeService = {
  upload: (file: File, notes?: string, purchasePrice?: number, tags?: string[]) => {
    const formData = new FormData();
    formData.append("file", file);
    if (notes) formData.append("notes", notes);
    if (purchasePrice !== undefined) formData.append("purchase_price", purchasePrice.toString());
    if (tags?.length) formData.append("tags", tags.join(","));
    return api.upload<WardrobeItem>("/wardrobe/upload", formData);
  },

  list: (filters?: WardrobeFilters, skip = 0, limit = 50) => {
    const params = new URLSearchParams();
    if (filters?.category) params.set("category", filters.category);
    if (filters?.color) params.set("color", filters.color);
    if (filters?.season) params.set("season", filters.season);
    if (filters?.fabric) params.set("fabric", filters.fabric);
    if (filters?.search) params.set("search", filters.search);
    params.set("skip", skip.toString());
    params.set("limit", limit.toString());
    const qs = params.toString();
    return api.get<WardrobeListResponse>(`/wardrobe${qs ? `?${qs}` : ""}`);
  },

  get: (id: string) => api.get<WardrobeItem>(`/wardrobe/${id}`),

  update: (id: string, data: Partial<Pick<WardrobeItem, "notes" | "tags"> & { purchase_price?: number }>) =>
    api.patch<WardrobeItem>(`/wardrobe/${id}`, data),

  delete: (id: string) => api.delete<void>(`/wardrobe/${id}`),

  markWorn: (id: string) => api.post<WardrobeItem>(`/wardrobe/${id}/wear`),

  analyze: (id: string) => api.post<WardrobeItem>(`/wardrobe/${id}/analyze`),
};
