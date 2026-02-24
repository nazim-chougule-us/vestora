"use client";

import { useState, useEffect, useCallback } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  suggestionService,
  type Suggestion,
  type SuggestionOutfit,
} from "@/services/suggestionService";
import {
  Sparkles,
  Loader2,
  Trash2,
  X,
  Lightbulb,
  Star,
  Heart,
  TrendingUp,
  DollarSign,
  Tag,
  ChevronRight,
  Search,
  ImageIcon,
  Eye,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Select } from "@/components/ui/Select";

const OCCASIONS = [
  "Casual Everyday",
  "Office / Work",
  "Date Night",
  "Party / Night Out",
  "Wedding Guest",
  "Job Interview",
  "Brunch",
  "Travel",
  "Gym / Athleisure",
  "Formal Event",
];

const STYLES = [
  { value: "", label: "Any Style" },
  { value: "minimalist", label: "Minimalist" },
  { value: "streetwear", label: "Streetwear" },
  { value: "classic", label: "Classic" },
  { value: "bohemian", label: "Bohemian" },
  { value: "preppy", label: "Preppy" },
  { value: "athleisure", label: "Athleisure" },
  { value: "smart casual", label: "Smart Casual" },
  { value: "edgy", label: "Edgy" },
];

const BUDGETS = [
  { value: "", label: "Any Budget" },
  { value: "under $50", label: "Under $50" },
  { value: "$50-100", label: "$50 – $100" },
  { value: "$100-200", label: "$100 – $200" },
  { value: "$200-500", label: "$200 – $500" },
  { value: "luxury", label: "Luxury" },
];

const SEASONS = [
  { value: "", label: "Any Season" },
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "fall", label: "Fall" },
  { value: "winter", label: "Winter" },
];

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  // Form
  const [occasion, setOccasion] = useState("");
  const [customOccasion, setCustomOccasion] = useState("");
  const [style, setStyle] = useState("");
  const [budget, setBudget] = useState("");
  const [season, setSeason] = useState("");
  const [notes, setNotes] = useState("");

  // Detail view
  const [selected, setSelected] = useState<Suggestion | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await suggestionService.list();
      setSuggestions(res.suggestions);
      setTotal(res.total);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  async function handleGenerate() {
    const occ = occasion === "__custom" ? customOccasion.trim() : occasion;
    if (!occ) {
      setError("Select or type an occasion");
      return;
    }
    setGenerating(true);
    setError("");
    try {
      const result = await suggestionService.generate({
        occasion: occ,
        style: style || undefined,
        budget: budget || undefined,
        season: season || undefined,
        notes: notes || undefined,
      });
      setSuggestions((prev) => [result, ...prev]);
      setTotal((prev) => prev + 1);
      setSelected(result);
    } catch (err: any) {
      setError(err?.detail || "Failed to generate suggestions. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await suggestionService.delete(id);
      setSuggestions((prev) => prev.filter((s) => s.id !== id));
      setTotal((prev) => prev - 1);
      if (selected?.id === id) setSelected(null);
    } catch {}
    setPendingDeleteId(null);
  }

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Outfit Suggestions</h1>
        <p className="text-sm text-text-secondary">
          AI-powered trending outfit ideas tailored to you
        </p>
      </div>

      {/* Generation form */}
      <div className="glass-card neon-glow mb-8 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Search className="h-5 w-5 text-accent" />
          <span className="text-sm font-semibold text-text-primary">What are you dressing for?</span>
        </div>

        {/* Occasion chips */}
        <div className="mb-4">
          <label className="mb-2 block text-xs font-medium text-text-secondary">Occasion</label>
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((occ) => (
              <button
                key={occ}
                onClick={() => { setOccasion(occ); setCustomOccasion(""); }}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  occasion === occ
                    ? "border-accent bg-accent-muted text-accent"
                    : "border-border bg-bg-card text-text-secondary hover:border-border-hover hover:text-text-primary"
                }`}
              >
                {occ}
              </button>
            ))}
            <button
              onClick={() => setOccasion("__custom")}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                occasion === "__custom"
                  ? "border-accent bg-accent-muted text-accent"
                  : "border-border border-dashed bg-bg-card text-text-tertiary hover:text-text-secondary"
              }`}
            >
              + Custom
            </button>
          </div>
          {occasion === "__custom" && (
            <input
              type="text"
              value={customOccasion}
              onChange={(e) => setCustomOccasion(e.target.value)}
              placeholder="e.g. Music festival, Beach vacation..."
              className="mt-2 w-full rounded-lg border border-border bg-bg-input px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-border-accent focus:outline-none"
              autoFocus
            />
          )}
        </div>

        {/* Filters row */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Style</label>
            <Select
              value={style}
              onChange={setStyle}
              placeholder="Any Style"
              options={STYLES}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Budget</label>
            <Select
              value={budget}
              onChange={setBudget}
              placeholder="Any Budget"
              options={BUDGETS}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Season</label>
            <Select
              value={season}
              onChange={setSeason}
              placeholder="Any Season"
              options={SEASONS}
            />
          </div>
        </div>

        {/* Extra notes */}
        <div className="mt-3">
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything else? e.g. 'I prefer earth tones', 'no heels'..."
            className="w-full rounded-lg border border-border bg-bg-input px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-border-accent focus:outline-none"
          />
        </div>

        {error && (
          <div className="mt-3 rounded-lg bg-error-muted px-4 py-2 text-sm text-error">{error}</div>
        )}

        <button
          onClick={handleGenerate}
          disabled={generating || (!occasion || (occasion === "__custom" && !customOccasion.trim()))}
          className="mt-4 flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-text-inverse hover:bg-accent-hover disabled:opacity-50"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching trends...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Get Suggestions
            </>
          )}
        </button>
      </div>

      {/* Past suggestions */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-shimmer aspect-[3/4] rounded-xl" />
          ))}
        </div>
      ) : suggestions.length === 0 ? (
        <div className="glass-card flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-muted">
            <TrendingUp className="h-8 w-8 text-accent" />
          </div>
          <p className="text-text-secondary">
            No suggestions yet. Tell us the occasion and we&apos;ll find trending outfits for you!
          </p>
        </div>
      ) : (
        <div className="stagger-grid grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {suggestions.map((s) => {
            const firstImage = s.outfits.find((o) => o.image_url)?.image_url;
            return (
              <div
                key={s.id}
                onClick={() => setSelected(s)}
                className="animate-fade-in-up glass-card glass-card-hover group cursor-pointer overflow-hidden"
              >
                <div className="relative aspect-square bg-bg-tertiary">
                  {firstImage ? (
                    <img src={firstImage} alt={s.query.occasion} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2">
                      <Sparkles className="h-10 w-10 text-text-tertiary" />
                      <span className="text-xs text-text-tertiary">{s.outfits.length} outfits</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                  <div className="absolute left-2 top-2 rounded-full bg-bg-secondary/80 px-2 py-0.5 text-[10px] font-medium text-text-primary backdrop-blur-sm">
                    {s.query.occasion}
                  </div>
                  {s.query.style && (
                    <div className="absolute right-2 top-2 rounded-full bg-accent/80 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                      {s.query.style}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium text-text-primary line-clamp-1">
                    {s.outfits[0]?.title || s.query.occasion}
                  </p>
                  <p className="mt-0.5 text-[10px] text-text-tertiary">
                    {s.outfits.length} outfit{s.outfits.length !== 1 ? "s" : ""} · {new Date(s.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setSelected(null)}>
          <div
            className="animate-scale-in relative flex flex-col w-full max-w-3xl max-h-[95vh] overflow-hidden rounded-2xl border border-border bg-bg-secondary shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fixed header */}
            <div className="shrink-0 border-b border-border px-6 py-4 flex flex-wrap items-center gap-2 pr-14">
              <span className="rounded-full bg-accent-muted px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                {selected.query.occasion}
              </span>
              {selected.query.style && (
                <span className="rounded-full bg-bg-tertiary px-2 py-0.5 text-[10px] font-medium text-text-tertiary">
                  {selected.query.style}
                </span>
              )}
              {selected.query.budget && (
                <span className="rounded-full bg-bg-tertiary px-2 py-0.5 text-[10px] font-medium text-text-tertiary">
                  {selected.query.budget}
                </span>
              )}
              <span className="ml-auto text-xs text-text-tertiary">
                {new Date(selected.created_at).toLocaleDateString()}
              </span>
              <button
                onClick={() => setSelected(null)}
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-bg-tertiary/80 text-text-secondary hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Trending context */}
              {selected.trending_context && (
                <div className="mb-5 rounded-lg bg-accent-muted/30 p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-accent">
                    <TrendingUp className="h-3 w-3" />
                    What&apos;s Trending
                  </div>
                  <p className="text-sm text-text-secondary">{selected.trending_context}</p>
                </div>
              )}

              {/* Outfits */}
              <div className="space-y-5">
                {selected.outfits.map((outfit, i) => (
                  <OutfitCard key={i} outfit={outfit} index={i} />
                ))}
              </div>
            </div>

            {/* Fixed footer */}
            <div className="shrink-0 border-t border-border px-6 py-3 flex gap-2">
              <button
                onClick={() => {
                  setPendingDeleteId(selected.id);
                  setSelected(null);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-error/10 px-3 py-2 text-xs font-medium text-error hover:bg-error/20"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDeleteId}
        title="Delete suggestion?"
        message="This outfit suggestion will be permanently deleted."
        onConfirm={() => pendingDeleteId && handleDelete(pendingDeleteId)}
        onCancel={() => setPendingDeleteId(null)}
      />
    </PageContainer>
  );
}

function OutfitCard({ outfit, index }: { outfit: SuggestionOutfit; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const [preview, setPreview] = useState(false);

  return (
    <>
      <div className="rounded-xl border border-border bg-bg-card overflow-hidden">
        <button
          onClick={() => setOpen(!open)}
          className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-bg-tertiary/50 transition-colors"
        >
          {/* Thumbnail */}
          {outfit.image_url ? (
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-bg-tertiary">
              <img src={outfit.image_url} alt={outfit.title} className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-muted text-xs font-bold text-accent">
              {index + 1}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <span className="text-sm font-semibold text-text-primary">{outfit.title || `Outfit ${index + 1}`}</span>
            {outfit.estimated_budget && (
              <span className="ml-2 text-xs text-text-tertiary">({outfit.estimated_budget})</span>
            )}
          </div>
          <ChevronRight className={`h-4 w-4 text-text-tertiary transition-transform ${open ? "rotate-90" : ""}`} />
        </button>

        {open && (
          <div className="border-t border-border px-4 py-4 space-y-3">
            {/* Outfit image */}
            {outfit.image_url ? (
              <div
                className="group relative cursor-pointer overflow-hidden rounded-xl bg-bg-tertiary"
                onClick={() => setPreview(true)}
              >
                <img
                  src={outfit.image_url}
                  alt={outfit.title}
                  className="w-full max-h-80 object-contain"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                  <Eye className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-xl bg-bg-tertiary py-8">
                <div className="flex flex-col items-center gap-1 text-text-tertiary">
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-xs">Image generating...</span>
                </div>
              </div>
            )}

            {/* Items list */}
            <div>
              <div className="mb-2 text-xs font-semibold text-text-primary">Items</div>
              <ul className="space-y-1.5">
                {outfit.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-text-secondary">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Why it works */}
            {outfit.why_it_works && (
              <div className="rounded-lg bg-accent-muted/40 p-3">
                <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-accent">
                  <Star className="h-3 w-3" />
                  Why It Works
                </div>
                <p className="text-sm text-text-secondary">{outfit.why_it_works}</p>
              </div>
            )}

            {/* Styling tips */}
            {outfit.styling_tips.length > 0 && (
              <div>
                <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-warning">
                  <Lightbulb className="h-3 w-3" />
                  Styling Tips
                </div>
                <ul className="space-y-1">
                  {outfit.styling_tips.map((tip, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Budget + trend source */}
            <div className="flex flex-wrap gap-3 pt-1">
              {outfit.estimated_budget && (
                <div className="flex items-center gap-1 text-xs text-text-tertiary">
                  <DollarSign className="h-3 w-3" />
                  {outfit.estimated_budget}
                </div>
              )}
              {outfit.trend_source && (
                <div className="flex items-center gap-1 text-xs text-text-tertiary">
                  <Tag className="h-3 w-3" />
                  {outfit.trend_source}
                </div>
              )}
            </div>

            {/* Confidence note */}
            {outfit.confidence_note && (
              <div className="rounded-lg border border-accent/20 bg-accent-muted/20 p-3">
                <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-accent">
                  <Heart className="h-3 w-3" />
                  Confidence Boost
                </div>
                <p className="text-sm italic text-text-secondary">{outfit.confidence_note}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Full-screen image preview */}
      {preview && outfit.image_url && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreview(false)}
        >
          <button
            onClick={() => setPreview(false)}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={outfit.image_url}
            alt={outfit.title}
            className="max-h-[90vh] max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
