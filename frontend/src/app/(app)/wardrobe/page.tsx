"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { wardrobeService } from "@/services/wardrobeService";
import type { WardrobeItem, AIAttributes, WardrobeFilters } from "@/types/wardrobe";
import {
  Shirt,
  Plus,
  Upload,
  X,
  Search,
  Loader2,
  Sparkles,
  Trash2,
  ImageIcon,
  Tag,
  Palette,
  Layers,
  Star,
  RefreshCw,
  CheckCircle,
  SlidersHorizontal,
  Sun,
  Calendar,
} from "lucide-react";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/Toast";

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return "Never worn";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

const CATEGORIES = ["All", "T-Shirt", "Shirt", "Blazer", "Jacket", "Pants", "Jeans", "Shorts", "Dress", "Skirt", "Sweater", "Hoodie", "Sneakers", "Shoes", "Boots", "Accessories"];
const SEASONS = ["All", "Spring", "Summer", "Fall", "Winter"];

/* ------------------------------------------------------------------ */
/*  Detail modal                                                       */
/* ------------------------------------------------------------------ */
function ItemDetailModal({
  item,
  onClose,
  onWear,
  onAnalyze,
  onDelete,
}: {
  item: WardrobeItem;
  onClose: () => void;
  onWear: () => void;
  onAnalyze: () => void;
  onDelete: () => void;
}) {
  const detected = item.detected_items || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-overlay p-4" onClick={onClose}>
      <div
        className="relative flex w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-border bg-bg-secondary shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-bg-tertiary/80 text-text-secondary hover:text-text-primary"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Left: image preview */}
        <div className="hidden w-1/2 flex-shrink-0 bg-bg-tertiary sm:block">
          {item.image_url ? (
            <img src={item.image_url} alt="Clothing" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageIcon className="h-16 w-16 text-text-tertiary" />
            </div>
          )}
        </div>

        {/* Right: detected items + actions */}
        <div className="flex w-full flex-col sm:w-1/2">
          {/* Header */}
          <div className="border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-text-primary">
                {detected.length} Item{detected.length !== 1 ? "s" : ""} Detected
              </h2>
              {item.ai_analyzed && (
                <Sparkles className="h-4 w-4 text-accent" />
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-text-tertiary">
              <span>Worn {item.wear_count}x</span>
              <span>{timeAgo(item.last_worn_at)}</span>
              {item.cost_per_wear != null && <span>${item.cost_per_wear}/wear</span>}
              {item.notes && <span>· {item.notes}</span>}
            </div>
          </div>

          {/* Mobile image */}
          <div className="sm:hidden">
            {item.image_url && (
              <img src={item.image_url} alt="Clothing" className="w-full object-cover" style={{ maxHeight: 240 }} />
            )}
          </div>

          {/* Detected items list */}
          <div className="flex-1 overflow-y-auto space-y-3 px-5 py-4">
            {detected.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Layers className="h-8 w-8 text-text-tertiary" />
                <p className="text-sm text-text-secondary">No items detected yet.</p>
                <button
                  onClick={onAnalyze}
                  className="mt-2 flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-text-inverse hover:bg-accent-hover"
                >
                  <RefreshCw className="h-3 w-3" />
                  Analyze Now
                </button>
              </div>
            ) : (
              detected.map((d, idx) => (
                <DetectedItemCard key={idx} item={d} index={idx} />
              ))
            )}
          </div>

          {/* Wear history */}
          {item.wear_dates && item.wear_dates.length > 0 && (
            <div className="border-t border-border px-5 py-3">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                <Calendar className="h-3 w-3" />
                Wear History ({item.wear_dates.length})
              </div>
              <div className="max-h-28 overflow-y-auto space-y-1">
                {[...item.wear_dates].reverse().map((date, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] text-text-tertiary">
                    <span className="h-1 w-1 shrink-0 rounded-full bg-accent" />
                    {new Date(date).toLocaleDateString(undefined, {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions — sticky at bottom */}
          <div className="sticky bottom-0 border-t border-border bg-bg-secondary px-5 py-3">
            <div className="flex gap-2">
              <button
                onClick={onWear}
                className="flex-1 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-text-inverse hover:bg-accent-hover"
              >
                <CheckCircle className="mr-1 inline h-3.5 w-3.5" />
                Mark Worn
              </button>
              {!item.ai_analyzed && (
                <button
                  onClick={onAnalyze}
                  className="flex-1 rounded-lg bg-info px-3 py-2 text-xs font-medium text-white hover:opacity-90"
                >
                  <RefreshCw className="mr-1 inline h-3.5 w-3.5" />
                  Analyze
                </button>
              )}
              <button
                onClick={onDelete}
                className="rounded-lg bg-error/10 px-3 py-2 text-xs font-medium text-error hover:bg-error/20"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetectedItemCard({ item, index }: { item: AIAttributes; index: number }) {
  return (
    <div className="rounded-xl border border-border bg-bg-card p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-text-primary">{item.category || "Unknown"}</span>
        {item.formality_score > 0 && (
          <span className="flex items-center gap-0.5 text-[10px] text-text-tertiary">
            <Star className="h-3 w-3 text-warning" />
            {item.formality_score}/10
          </span>
        )}
      </div>
      {item.subcategory && (
        <p className="text-xs text-text-secondary">{item.subcategory}</p>
      )}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {item.primary_color && (
          <span className="inline-flex items-center gap-1 rounded-full bg-bg-tertiary px-2 py-0.5 text-[10px] text-text-secondary">
            <Palette className="h-2.5 w-2.5" /> {item.primary_color}
          </span>
        )}
        {item.fabric && (
          <span className="inline-flex items-center gap-1 rounded-full bg-bg-tertiary px-2 py-0.5 text-[10px] text-text-secondary">
            <Layers className="h-2.5 w-2.5" /> {item.fabric}
          </span>
        )}
        {item.pattern && item.pattern !== "Solid" && (
          <span className="rounded-full bg-bg-tertiary px-2 py-0.5 text-[10px] text-text-secondary">
            {item.pattern}
          </span>
        )}
        {item.fit && (
          <span className="rounded-full bg-bg-tertiary px-2 py-0.5 text-[10px] text-text-secondary">
            {item.fit}
          </span>
        )}
        {item.brand && (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent-muted px-2 py-0.5 text-[10px] text-accent">
            <Tag className="h-2.5 w-2.5" /> {item.brand}
          </span>
        )}
      </div>
      {(item.season?.length > 0 || item.occasion?.length > 0) && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {item.season?.map((s) => (
            <span key={s} className="rounded-full border border-border px-1.5 py-0.5 text-[9px] text-text-tertiary">{s}</span>
          ))}
          {item.occasion?.map((o) => (
            <span key={o} className="rounded-full border border-accent/30 bg-accent-muted px-1.5 py-0.5 text-[9px] text-accent">{o}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function WardrobePage() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSeason, setActiveSeason] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const f: WardrobeFilters = {};
      if (activeCategory !== "All") f.category = activeCategory;
      if (activeSeason !== "All") f.season = activeSeason;
      if (searchQuery) f.search = searchQuery;
      const res = await wardrobeService.list(f);
      setItems(res.items);
      setTotal(res.total);
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }, [activeCategory, activeSeason, searchQuery]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  async function handleUpload(files: FileList | File[]) {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await wardrobeService.upload(file);
      }
      setShowUpload(false);
      fetchItems();
    } catch {
      // Error handling
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) {
      handleUpload(e.dataTransfer.files);
    }
  }

  async function handleDelete(id: string) {
    try {
      await wardrobeService.delete(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setTotal((prev) => prev - 1);
      setSelectedItem(null);
    } catch {}
    setPendingDeleteId(null);
  }

  async function handleAnalyze(id: string) {
    try {
      const updated = await wardrobeService.analyze(id);
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
      setSelectedItem(updated);
    } catch {}
  }

  async function handleWear(id: string) {
    try {
      const updated = await wardrobeService.markWorn(id);
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
      setSelectedItem(updated);
      setToastMessage(`Worn ${updated.wear_count}x — logged!`);
    } catch {}
  }

  // Count total individual garments across all entries
  const totalGarments = items.reduce((acc, i) => acc + (i.detected_items?.length || 0), 0);

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Wardrobe</h1>
          <p className="text-sm text-text-secondary">
            {total} upload{total !== 1 ? "s" : ""} · {totalGarments} garment{totalGarments !== 1 ? "s" : ""} detected
          </p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-text-inverse hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" />
          Upload
        </button>
      </div>

      {/* Upload zone */}
      {showUpload && (
        <div className="mb-6">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`glass-card flex cursor-pointer flex-col items-center gap-3 border-2 border-dashed py-12 text-center transition-colors ${
              dragOver ? "border-accent bg-accent-muted" : "border-border hover:border-border-hover"
            }`}
          >
            {uploading ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-accent" />
                <p className="text-sm text-text-secondary">Uploading &amp; analyzing...</p>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 text-text-tertiary" />
                <p className="text-sm font-medium text-text-primary">
                  Drag &amp; drop images here, or click to browse
                </p>
                <p className="text-xs text-text-tertiary">
                  AI auto-detects every garment in the photo
                </p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
          />
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by category, brand, color..."
            className="w-full rounded-lg border border-border bg-bg-input py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-tertiary focus:border-border-accent focus:outline-none"
          />
        </div>

        {/* Dropdowns row */}
        <div className="flex items-center gap-2">
          <Select
            value={activeCategory}
            onChange={setActiveCategory}
            icon={SlidersHorizontal}
            options={CATEGORIES.map((cat) => ({ value: cat, label: cat === "All" ? "All Categories" : cat }))}
          />
          <Select
            value={activeSeason}
            onChange={setActiveSeason}
            icon={Sun}
            options={SEASONS.map((s) => ({ value: s, label: s === "All" ? "All Seasons" : s }))}
          />

          {/* Clear button */}
          {(activeCategory !== "All" || activeSeason !== "All" || searchQuery) && (
            <button
              onClick={() => { setActiveCategory("All"); setActiveSeason("All"); setSearchQuery(""); }}
              className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-2.5 text-xs font-medium text-text-secondary hover:border-error/40 hover:text-error transition-colors"
              title="Clear all filters"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Gallery grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer aspect-square rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-muted">
            <Shirt className="h-8 w-8 text-accent" />
          </div>
          <p className="text-text-secondary">
            {searchQuery || activeCategory !== "All" || activeSeason !== "All"
              ? "No items match your filters."
              : "No items yet. Upload your first outfit photo to get started."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => {
            const detected = item.detected_items || [];
            const label = detected.length > 0
              ? detected.map((d) => d.category).filter(Boolean).join(", ") || "Analyzed"
              : "Unanalyzed";

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="glass-card glass-card-hover group relative cursor-pointer overflow-hidden"
              >
                {/* Image */}
                <div className="relative aspect-square bg-bg-tertiary">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={label}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-10 w-10 text-text-tertiary" />
                    </div>
                  )}

                  {/* Item count badge */}
                  {detected.length > 0 && (
                    <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                      <Layers className="h-3 w-3" />
                      {detected.length}
                    </div>
                  )}

                  {/* AI badge */}
                  {item.ai_analyzed && (
                    <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent/90">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <div className="text-xs font-medium text-text-primary truncate">{label}</div>
                  <div className="mt-0.5 flex items-center justify-between text-[11px] text-text-tertiary">
                    <span>Worn {item.wear_count}x · {timeAgo(item.last_worn_at)}</span>
                    {item.cost_per_wear != null && (
                      <span className="text-accent font-medium">${item.cost_per_wear}/wear</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onWear={() => handleWear(selectedItem.id)}
          onAnalyze={() => handleAnalyze(selectedItem.id)}
          onDelete={() => setPendingDeleteId(selectedItem.id)}
        />
      )}
      <ConfirmDialog
        open={!!pendingDeleteId}
        title="Delete item?"
        message="This wardrobe item and all its detected clothing data will be permanently deleted."
        onConfirm={() => pendingDeleteId && handleDelete(pendingDeleteId)}
        onCancel={() => setPendingDeleteId(null)}
      />
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </PageContainer>
  );
}
