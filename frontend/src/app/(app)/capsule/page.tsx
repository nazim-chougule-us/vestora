"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { api } from "@/services/api";
import { Gem, Loader2, Sparkles, Lightbulb, ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Select } from "@/components/ui/Select";

const CLIMATES = ["Hot", "Temperate", "Cold", "Tropical"];
const EVENT_PRESETS = ["Business meetings", "Dinner", "Sightseeing", "Beach", "Hiking", "Wedding", "Nightlife", "Casual hangout"];

interface CapsuleItem {
  item_id: string;
  category: string;
  color: string;
  image_url: string;
}

interface OutfitCombo {
  name: string;
  item_ids: string[];
  occasion: string;
}

interface CapsuleResult {
  capsule_name: string;
  items: CapsuleItem[];
  outfit_combos: OutfitCombo[];
  packing_tips: string[];
  total_outfits: number;
  trip_length: number;
  climate: string;
}

export default function CapsulePage() {
  const [tripLength, setTripLength] = useState(7);
  const [climate, setClimate] = useState("Temperate");
  const [events, setEvents] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CapsuleResult | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  function toggleEvent(ev: string) {
    setEvents((prev) => prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev]);
  }

  async function handleGenerate() {
    setGenerating(true);
    setError("");
    try {
      const res = await api.post<CapsuleResult>("/capsule/generate", {
        trip_length: tripLength,
        climate,
        events,
        notes: notes || undefined,
      });
      setResult(res);
    } catch (err: any) {
      setError(err?.detail || "Failed to generate capsule. Need at least 3 analyzed wardrobe items.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Capsule Wardrobe</h1>
        <p className="text-sm text-text-secondary">Travel-ready packing with maximum outfit combinations</p>
      </div>

      {/* Planner form */}
      <div className="glass-card neon-glow mb-8 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Gem className="h-5 w-5 text-accent" />
          <span className="text-sm font-semibold text-text-primary">Trip Planner</span>
        </div>

        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Trip Length (days)</label>
            <input
              type="number"
              value={tripLength}
              onChange={(e) => setTripLength(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              max={30}
              className="w-full rounded-lg border border-border bg-bg-input px-3 py-2 text-sm text-text-primary focus:border-border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Climate</label>
            <Select
              value={climate}
              onChange={setClimate}
              options={CLIMATES.map((c) => ({ value: c, label: c }))}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-xs font-medium text-text-secondary">Events</label>
          <div className="flex flex-wrap gap-2">
            {EVENT_PRESETS.map((ev) => (
              <button
                key={ev}
                onClick={() => toggleEvent(ev)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  events.includes(ev)
                    ? "border-accent bg-accent-muted text-accent"
                    : "border-border text-text-tertiary hover:border-border-hover"
                }`}
              >
                {ev}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">Extra Notes</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. destination is Paris, need walking shoes"
            className="w-full rounded-lg border border-border bg-bg-input px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-border-accent focus:outline-none"
          />
        </div>

        {error && <div className="mb-3 rounded-lg bg-error-muted px-4 py-2 text-sm text-error">{error}</div>}

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-text-inverse hover:bg-accent-hover disabled:opacity-50"
        >
          {generating ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Planning...</>
          ) : (
            <><Sparkles className="h-4 w-4" /> Generate Capsule</>
          )}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-6">
          {/* Header */}
          <div className="glass-card neon-glow p-5">
            <div className="mb-1 text-xs font-medium uppercase tracking-wider text-accent">
              {result.trip_length} days · {result.climate}
            </div>
            <div className="mb-1 text-xl font-bold text-text-primary">{result.capsule_name}</div>
            <div className="text-sm text-text-secondary">
              {result.items.length} items → {result.total_outfits} outfit combinations
            </div>
          </div>

          {/* Packing list */}
          {result.items.length > 0 && (
            <div className="glass-card p-5">
              <div className="mb-3 text-sm font-semibold text-text-primary">Pack These Items</div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {result.items.map((item, idx) => (
                  <div
                    key={item.item_id}
                    className="relative h-28 w-20 shrink-0 cursor-pointer overflow-hidden rounded-lg bg-bg-tertiary transition-transform hover:scale-105"
                    onClick={() => item.image_url && setPreviewIndex(idx)}
                  >
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.category} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-text-tertiary" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5 text-center text-[10px] text-white">
                      {item.category || "Item"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Outfit combos */}
          {result.outfit_combos.length > 0 && (
            <div className="glass-card p-5">
              <div className="mb-3 text-sm font-semibold text-text-primary">Outfit Combinations</div>
              <div className="grid gap-3 sm:grid-cols-2">
                {result.outfit_combos.map((combo, i) => (
                  <div key={i} className="rounded-lg border border-border bg-bg-card p-3">
                    <div className="text-sm font-medium text-text-primary">{combo.name}</div>
                    <div className="text-xs text-text-tertiary">{combo.occasion} · {combo.item_ids.length} items</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Packing tips */}
          {result.packing_tips.length > 0 && (
            <div className="glass-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-warning" />
                <span className="text-sm font-semibold text-text-primary">Packing Tips</span>
              </div>
              <div className="space-y-2">
                {result.packing_tips.map((tip, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-warning-muted/30 px-4 py-3">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-warning" />
                    <p className="text-sm text-text-secondary">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {/* Image preview lightbox */}
      {previewIndex !== null && result && (() => {
        const items = result.items.filter((i) => i.image_url);
        const currentItem = items[previewIndex];
        if (!currentItem) return null;
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setPreviewIndex(null)}
          >
            <button
              onClick={() => setPreviewIndex(null)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>

            {previewIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setPreviewIndex(previewIndex - 1); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            <div className="max-h-[85vh] max-w-[85vw]" onClick={(e) => e.stopPropagation()}>
              <img
                src={currentItem.image_url}
                alt={currentItem.category || "Item"}
                className="max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl"
              />
              <p className="mt-3 text-center text-sm font-medium text-white/80">
                {currentItem.category || "Item"} · {previewIndex + 1}/{items.length}
              </p>
            </div>

            {previewIndex < items.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setPreviewIndex(previewIndex + 1); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        );
      })()}
    </PageContainer>
  );
}
