"use client";

import { useState, useEffect, useCallback } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { outfitService } from "@/services/outfitService";
import { feedbackService } from "@/services/feedbackService";
import type { Outfit } from "@/types/outfit";
import {
  Sparkles,
  Loader2,
  Trash2,
  Lightbulb,
  Heart,
  ImageIcon,
  X,
  Star,
  Send,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const FEEDBACK_TAGS = ["Loved it", "Too bold", "Too basic", "Uncomfortable", "Got compliments", "Didn't feel confident", "Perfect fit", "Wrong weather"];

const OCCASIONS = ["Casual", "Work", "Date Night", "Formal Event", "Party", "Interview", "Travel", "Gym", "Beach", "Wedding"];
const MOODS = ["Confident", "Relaxed", "Bold", "Professional", "Playful", "Elegant", "Cozy", "Energetic"];
const DRESS_CODES = ["Smart Casual", "Business Casual", "Business Formal", "Black Tie", "Cocktail", "Streetwear", "Athleisure"];

export default function OutfitsPage() {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<Record<string, number>>({});
  const [feedbackTags, setFeedbackTags] = useState<Record<string, string[]>>({});
  const [feedbackSent, setFeedbackSent] = useState<Record<string, boolean>>({});
  const [sendingFeedback, setSendingFeedback] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  // Form state
  const [occasion, setOccasion] = useState("Casual");
  const [mood, setMood] = useState("");
  const [dressCode, setDressCode] = useState("");
  const [notes, setNotes] = useState("");

  const fetchOutfits = useCallback(async () => {
    setLoading(true);
    try {
      const res = await outfitService.list();
      setOutfits(res.outfits);
      setTotal(res.total);
    } catch {
      // empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOutfits();
  }, [fetchOutfits]);

  async function handleGenerate() {
    setGenerating(true);
    setError("");
    try {
      const newOutfit = await outfitService.generate({
        occasion,
        mood: mood || undefined,
        dress_code: dressCode || undefined,
        notes: notes || undefined,
      });
      setOutfits((prev) => [newOutfit, ...prev]);
      setTotal((prev) => prev + 1);
      setSelectedOutfit(newOutfit);
    } catch (err: any) {
      setError(err?.detail || "Failed to generate outfit. Make sure you have analyzed wardrobe items.");
    } finally {
      setGenerating(false);
    }
  }

  async function loadExistingFeedback(outfitId: string) {
    if (feedbackSent[outfitId]) return;
    try {
      const res = await feedbackService.listForOutfit(outfitId);
      if (res.feedbacks.length > 0) {
        const fb = res.feedbacks[0];
        setFeedbackRating((prev) => ({ ...prev, [outfitId]: fb.rating }));
        setFeedbackTags((prev) => ({ ...prev, [outfitId]: fb.tags || [] }));
        setFeedbackSent((prev) => ({ ...prev, [outfitId]: true }));
      }
    } catch {}
  }

  async function handleDelete(id: string) {
    try {
      await outfitService.delete(id);
      setOutfits((prev) => prev.filter((o) => o.id !== id));
      setTotal((prev) => prev - 1);
      if (selectedOutfit?.id === id) setSelectedOutfit(null);
    } catch {}
    setPendingDeleteId(null);
  }

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Outfits</h1>
        <p className="text-sm text-text-secondary">
          {total} outfit{total !== 1 ? "s" : ""} generated
        </p>
      </div>

      {/* Generation form */}
      <div className="glass-card neon-glow mb-8 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <span className="text-sm font-semibold text-text-primary">Generate New Outfit</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Occasion */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Occasion</label>
            <Select
              value={occasion}
              onChange={setOccasion}
              options={OCCASIONS.map((o) => ({ value: o, label: o }))}
            />
          </div>

          {/* Mood */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Mood (optional)</label>
            <Select
              value={mood}
              onChange={setMood}
              placeholder="Any mood"
              options={[{ value: "", label: "Any mood" }, ...MOODS.map((m) => ({ value: m, label: m }))]}
            />
          </div>

          {/* Dress code */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Dress Code (optional)</label>
            <Select
              value={dressCode}
              onChange={setDressCode}
              placeholder="Any"
              options={[{ value: "", label: "Any" }, ...DRESS_CODES.map((d) => ({ value: d, label: d }))]}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Extra Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. outdoor rooftop dinner"
              className="w-full rounded-lg border border-border bg-bg-input px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-border-accent focus:outline-none"
            />
          </div>
        </div>

        {error && (
          <div className="mt-3 rounded-lg bg-error-muted px-4 py-2 text-sm text-error">{error}</div>
        )}

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="mt-4 flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-text-inverse hover:bg-accent-hover disabled:opacity-50"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Outfit
            </>
          )}
        </button>
      </div>

      {/* Outfit list */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-shimmer aspect-square rounded-xl" />
          ))}
        </div>
      ) : outfits.length === 0 ? (
        <div className="glass-card flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-muted">
            <Sparkles className="h-8 w-8 text-accent" />
          </div>
          <p className="text-text-secondary">
            No outfits yet. Upload and analyze wardrobe items, then generate your first outfit above.
          </p>
        </div>
      ) : (
        <div className="stagger-grid grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {outfits.map((outfit) => {
            const itemImages = outfit.items.filter((i) => i.image_url);
            return (
              <div
                key={outfit.id}
                className="animate-fade-in-up glass-card glass-card-hover group cursor-pointer overflow-hidden"
                onClick={() => { setSelectedOutfit(outfit); loadExistingFeedback(outfit.id); }}
              >
                <div className="relative aspect-square bg-bg-tertiary">
                  {itemImages.length >= 4 ? (
                    <div className="grid h-full w-full grid-cols-2 grid-rows-2">
                      {itemImages.slice(0, 4).map((item, i) => (
                        <img key={i} src={item.image_url} alt={item.category} className="h-full w-full object-cover" />
                      ))}
                    </div>
                  ) : itemImages.length > 0 ? (
                    <img src={itemImages[0].image_url} alt={itemImages[0].category} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2">
                      <Sparkles className="h-10 w-10 text-text-tertiary" />
                      <span className="text-xs text-text-tertiary">{outfit.items.length} items</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                  <div className="absolute left-2 top-2 rounded-full bg-bg-secondary/80 px-2 py-0.5 text-[10px] font-medium text-text-primary backdrop-blur-sm">
                    {outfit.occasion}
                  </div>
                  {outfit.mood && (
                    <div className="absolute right-2 top-2 rounded-full bg-accent/80 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                      {outfit.mood}
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); setPendingDeleteId(outfit.id); }}
                    className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-bg-secondary/80 text-text-tertiary opacity-0 backdrop-blur-sm transition-opacity hover:text-error group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium text-text-primary">
                    {outfit.occasion}
                    {outfit.mood && <span className="text-text-tertiary"> · {outfit.mood}</span>}
                  </p>
                  <p className="mt-0.5 text-[10px] text-text-tertiary">
                    {outfit.items.length} items · {new Date(outfit.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Outfit detail modal with backdrop */}
      {selectedOutfit && (
        <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-bg-overlay p-4" onClick={() => setSelectedOutfit(null)}>
          <div
            className="animate-scale-in relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-bg-secondary shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedOutfit(null)}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-bg-tertiary/80 text-text-secondary hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal header */}
            <div className="border-b border-border px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-muted">
                  <Sparkles className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-text-primary">
                    {selectedOutfit.occasion}
                    {selectedOutfit.mood && <span className="text-text-tertiary"> · {selectedOutfit.mood}</span>}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-tertiary">
                    <span>{selectedOutfit.items.length} items · {new Date(selectedOutfit.created_at).toLocaleDateString()}</span>
                    {selectedOutfit.preferences_applied && selectedOutfit.preferences_applied.length > 0 && (
                      <span className="rounded-full bg-accent-muted px-2 py-0.5 text-[10px] font-semibold text-accent">
                        Personalized
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal body */}
            <div className="space-y-5 px-6 py-5">
              {/* Item images */}
              {selectedOutfit.items.length > 0 && (
                <div>
                  <div className="mb-2 text-xs font-medium text-text-secondary">Items</div>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {selectedOutfit.items.map((item) => (
                      <div
                        key={item.item_id}
                        className="group relative h-28 w-20 shrink-0 cursor-pointer overflow-hidden rounded-lg bg-bg-tertiary transition-transform hover:scale-105"
                        onClick={() => item.image_url && setPreviewIndex(selectedOutfit.items.indexOf(item))}
                      >
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.category}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-text-tertiary" />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5 text-center text-[10px] text-white">
                          {item.category || "Item"}
                        </div>
                        {item.image_url && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                            <ImageIcon className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Reasoning */}
              {selectedOutfit.reasoning && (
                <div className="rounded-lg bg-accent-muted/50 p-4">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-accent">
                    <Sparkles className="h-3 w-3" />
                    AI Stylist Reasoning
                  </div>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    {selectedOutfit.reasoning}
                  </p>
                </div>
              )}

              {/* Confidence boost */}
              {selectedOutfit.confidence_boost && (
                <div className="rounded-lg bg-success-muted/50 p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-success">
                    <Heart className="h-3 w-3" />
                    Confidence Boost
                  </div>
                  <p className="text-sm text-text-secondary">{selectedOutfit.confidence_boost}</p>
                </div>
              )}

              {/* Styling tips */}
              {selectedOutfit.styling_tips.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-warning">
                    <Lightbulb className="h-3 w-3" />
                    Styling Tips
                  </div>
                  <ul className="space-y-1">
                    {selectedOutfit.styling_tips.map((tip, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-text-secondary">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Feedback section */}
              <div className="rounded-lg border border-border bg-bg-card p-4">
                <div className="mb-3 text-xs font-semibold text-text-secondary">Rate this outfit</div>
                {feedbackSent[selectedOutfit.id] ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <= (feedbackRating[selectedOutfit.id] || 0)
                                ? "fill-warning text-warning"
                                : "text-text-tertiary"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-success font-medium">Submitted</span>
                    </div>
                    {(feedbackTags[selectedOutfit.id] || []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {(feedbackTags[selectedOutfit.id] || []).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-accent bg-accent-muted px-2.5 py-0.5 text-[11px] font-medium text-accent"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Stars */}
                    <div className="mb-3 flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setFeedbackRating((prev) => ({ ...prev, [selectedOutfit.id]: star }))}
                          className="p-0.5"
                        >
                          <Star
                            className={`h-6 w-6 transition-colors ${
                              star <= (feedbackRating[selectedOutfit.id] || 0)
                                ? "fill-warning text-warning"
                                : "text-text-tertiary hover:text-warning"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {/* Quick tags */}
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {FEEDBACK_TAGS.map((tag) => {
                        const selected = (feedbackTags[selectedOutfit.id] || []).includes(tag);
                        return (
                          <button
                            key={tag}
                            onClick={() => {
                              setFeedbackTags((prev) => {
                                const current = prev[selectedOutfit.id] || [];
                                return {
                                  ...prev,
                                  [selectedOutfit.id]: selected
                                    ? current.filter((t) => t !== tag)
                                    : [...current, tag],
                                };
                              });
                            }}
                            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                              selected
                                ? "border-accent bg-accent-muted text-accent"
                                : "border-border text-text-tertiary hover:border-border-hover"
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                    {/* Submit */}
                    <button
                      disabled={!feedbackRating[selectedOutfit.id] || sendingFeedback === selectedOutfit.id}
                      onClick={async () => {
                        setSendingFeedback(selectedOutfit.id);
                        try {
                          await feedbackService.submit(selectedOutfit.id, {
                            rating: feedbackRating[selectedOutfit.id],
                            tags: feedbackTags[selectedOutfit.id] || [],
                          });
                          setFeedbackSent((prev) => ({ ...prev, [selectedOutfit.id]: true }));
                        } catch {}
                        setSendingFeedback(null);
                      }}
                      className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-text-inverse hover:bg-accent-hover disabled:opacity-40"
                    >
                      {sendingFeedback === selectedOutfit.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Send className="h-3 w-3" />
                      )}
                      Submit Feedback
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center gap-2 border-t border-border px-6 py-3">
              <button
                onClick={() => setPendingDeleteId(selectedOutfit.id)}
                className="flex items-center gap-1.5 rounded-lg bg-error/10 px-3 py-2 text-xs font-medium text-error hover:bg-error/20"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Outfit
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Image preview lightbox */}
      {previewIndex !== null && selectedOutfit && (() => {
        const items = selectedOutfit.items.filter((i) => i.image_url);
        const currentItem = items[previewIndex];
        if (!currentItem) return null;
        return (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setPreviewIndex(null)}
          >
            <button
              onClick={() => setPreviewIndex(null)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Prev */}
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

            {/* Next */}
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
      <ConfirmDialog
        open={!!pendingDeleteId}
        title="Delete outfit?"
        message="This outfit and its AI-generated styling data will be permanently deleted."
        onConfirm={() => pendingDeleteId && handleDelete(pendingDeleteId)}
        onCancel={() => setPendingDeleteId(null)}
      />
    </PageContainer>
  );
}
