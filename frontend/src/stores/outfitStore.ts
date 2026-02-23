/**
 * Vestora Frontend — Outfit Zustand store.
 * Manages outfit state, generation results, and history.
 */

import { create } from "zustand";
import type { Outfit } from "@/types/outfit";

interface OutfitState {
  outfits: Outfit[];
  currentOutfit: Outfit | null;
  isGenerating: boolean;

  setOutfits: (outfits: Outfit[]) => void;
  setCurrentOutfit: (outfit: Outfit | null) => void;
  addOutfit: (outfit: Outfit) => void;
  setGenerating: (generating: boolean) => void;
}

export const useOutfitStore = create<OutfitState>((set) => ({
  outfits: [],
  currentOutfit: null,
  isGenerating: false,

  setOutfits: (outfits) => set({ outfits }),
  setCurrentOutfit: (currentOutfit) => set({ currentOutfit }),
  addOutfit: (outfit) => set((state) => ({ outfits: [outfit, ...state.outfits] })),
  setGenerating: (isGenerating) => set({ isGenerating }),
}));
