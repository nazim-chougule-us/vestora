"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { api } from "@/services/api";
import { Smile, Loader2, Sparkles, Heart, ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react";

const MOOD_PRESETS = [
  "Confident & powerful",
  "Calm & relaxed",
  "Bold & adventurous",
  "Mysterious & edgy",
  "Playful & energetic",
  "Elegant & sophisticated",
  "Cozy & comfortable",
  "Romantic & soft",
];

interface MoodItem {
  item_id: string;
  category: string;
  color: string;
  image_url: string;
}

interface MoodResult {
  mood_text: string;
  mood_interpretation: string;
  color_palette: string[];
  outfit_name: string;
  items: MoodItem[];
  reasoning: string;
  affirmation: string;
}

export default function MoodPage() {
  const [moodText, setMoodText] = useState("");
  const [occasion, setOccasion] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<MoodResult | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  async function handleGenerate() {
    if (!moodText.trim()) return;
    setGenerating(true);
    setError("");
    try {
      const res = await api.post<MoodResult>("/mood/generate", {
        mood_text: moodText,
        occasion: occasion || undefined,
      });
      setResult(res);
    } catch (err: any) {
      setError(err?.detail || "Failed to generate. Need at least 2 analyzed wardrobe items.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Mood-to-Style</h1>
        <p className="text-sm text-text-secondary">Tell me how you feel, I&apos;ll dress you for it</p>
      </div>

      {/* Input form */}
      <div className="glass-card neon-glow mb-8 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Smile className="h-5 w-5 text-accent" />
          <span className="text-sm font-semibold text-text-primary">How are you feeling?</span>
        </div>

        <textarea
          value={moodText}
          onChange={(e) => setMoodText(e.target.value)}
          placeholder="I feel powerful but mysterious today..."
          rows={3}
          className="mb-3 w-full rounded-lg border border-border bg-bg-input px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-border-accent focus:outline-none"
        />

        {/* Preset moods */}
        <div className="mb-4 flex flex-wrap gap-2">
          {MOOD_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => setMoodText(preset)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                moodText === preset
                  ? "border-accent bg-accent-muted text-accent"
                  : "border-border text-text-tertiary hover:border-border-hover"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">Occasion (optional)</label>
          <input
            type="text"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            placeholder="e.g. dinner date, office, brunch"
            className="w-full rounded-lg border border-border bg-bg-input px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-border-accent focus:outline-none"
          />
        </div>

        {error && (
          <div className="mb-3 rounded-lg bg-error-muted px-4 py-2 text-sm text-error">{error}</div>
        )}

        <button
          onClick={handleGenerate}
          disabled={generating || !moodText.trim()}
          className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-text-inverse hover:bg-accent-hover disabled:opacity-50"
        >
          {generating ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Feeling your vibe...</>
          ) : (
            <><Sparkles className="h-4 w-4" /> Style My Mood</>
          )}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-6">
          {/* Outfit name + mood interpretation */}
          <div className="glass-card neon-glow p-6">
            <div className="mb-1 text-xs font-medium uppercase tracking-wider text-accent">
              {result.mood_interpretation}
            </div>
            <div className="mb-3 text-xl font-bold text-text-primary">{result.outfit_name}</div>

            {/* Color palette */}
            {result.color_palette.length > 0 && (
              <div className="mb-4 flex gap-2">
                {result.color_palette.map((c, i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-lg border border-border"
                    style={{ backgroundColor: c.toLowerCase() }}
                    title={c}
                  />
                ))}
              </div>
            )}

            {/* Items */}
            {result.items.length > 0 && (
              <div className="mb-4 flex gap-3 overflow-x-auto pb-2">
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
            )}

            {/* Reasoning */}
            {result.reasoning && (
              <div className="mb-4 rounded-lg bg-accent-muted/50 p-4">
                <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-accent">
                  <Sparkles className="h-3 w-3" /> Why This Look
                </div>
                <p className="text-sm leading-relaxed text-text-secondary">{result.reasoning}</p>
              </div>
            )}

            {/* Affirmation */}
            {result.affirmation && (
              <div className="rounded-lg bg-success-muted/50 p-4">
                <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-success">
                  <Heart className="h-3 w-3" /> Your Affirmation
                </div>
                <p className="text-sm italic text-text-secondary">&ldquo;{result.affirmation}&rdquo;</p>
              </div>
            )}
          </div>
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
