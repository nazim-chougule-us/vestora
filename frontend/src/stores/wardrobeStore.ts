/**
 * Vestora Frontend — Wardrobe Zustand store.
 * Manages wardrobe items state, filters, and loading.
 */

import { create } from "zustand";
import type { WardrobeItem, WardrobeFilters } from "@/types/wardrobe";

interface WardrobeState {
  items: WardrobeItem[];
  selectedItem: WardrobeItem | null;
  filters: WardrobeFilters;
  isLoading: boolean;

  setItems: (items: WardrobeItem[]) => void;
  addItem: (item: WardrobeItem) => void;
  removeItem: (id: string) => void;
  setSelectedItem: (item: WardrobeItem | null) => void;
  setFilters: (filters: Partial<WardrobeFilters>) => void;
  setLoading: (loading: boolean) => void;
}

export const useWardrobeStore = create<WardrobeState>((set) => ({
  items: [],
  selectedItem: null,
  filters: {},
  isLoading: false,

  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [item, ...state.items] })),
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  setSelectedItem: (selectedItem) => set({ selectedItem }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  setLoading: (isLoading) => set({ isLoading }),
}));
