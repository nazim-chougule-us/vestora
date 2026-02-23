"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { api } from "@/services/api";
import { ShoppingBag, Loader2, Sparkles, Leaf, AlertTriangle } from "lucide-react";

interface Recommendation {
  item_name: string;
  category: string;
  color: string;
  reason: string;
  estimated_price: number | string;
  priority: string;
  match_count: number;
}

interface ShoppingResult {
  gap_analysis: string[];
  recommendations: Recommendation[];
  sustainable_tips: string[];
  total_items_analyzed: number;
}

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-error-muted text-error",
  medium: "bg-warning-muted text-warning",
  low: "bg-info-muted text-info",
};

export default function ShoppingPage() {
  const [budget, setBudget] = useState("");
  const [occasion, setOccasion] = useState("");
  const [notes, setNotes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ShoppingResult | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setError("");
    try {
      const res = await api.post<ShoppingResult>("/shopping/recommend", {
        budget: budget ? parseFloat(budget) : undefined,
        occasion: occasion || undefined,
        notes: notes || undefined,
      });
      setResult(res);
    } catch (err: any) {
      setError(err?.detail || "Failed to get recommendations.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Shopping Assistant</h1>
        <p className="text-sm text-text-secondary">Smart recommendations to fill wardrobe gaps</p>
      </div>

      {/* Form */}
      <div className="glass-card neon-glow mb-8 p-5">
        <div className="mb-4 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-accent" />
          <span className="text-sm font-semibold text-text-primary">What should I buy next?</span>
        </div>

        <div className="mb-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Budget ($)</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Optional"
              className="w-full rounded-lg border border-border bg-bg-input px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Occasion Focus</label>
            <input
              type="text"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              placeholder="e.g. Work, Summer vacation"
              className="w-full rounded-lg border border-border bg-bg-input px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. prefer sustainable brands"
              className="w-full rounded-lg border border-border bg-bg-input px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-border-accent focus:outline-none"
            />
          </div>
        </div>

        {error && <div className="mb-3 rounded-lg bg-error-muted px-4 py-2 text-sm text-error">{error}</div>}

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-text-inverse hover:bg-accent-hover disabled:opacity-50"
        >
          {generating ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</>
          ) : (
            <><Sparkles className="h-4 w-4" /> Get Recommendations</>
          )}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-6">
          {/* Gap analysis */}
          {result.gap_analysis.length > 0 && (
            <div className="glass-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="text-sm font-semibold text-text-primary">Wardrobe Gaps</span>
                <span className="text-xs text-text-tertiary">({result.total_items_analyzed} items analyzed)</span>
              </div>
              <div className="space-y-2">
                {result.gap_analysis.map((gap, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-warning-muted/30 px-4 py-3">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-warning" />
                    <p className="text-sm text-text-secondary">{gap}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="glass-card p-5">
              <div className="mb-3 text-sm font-semibold text-text-primary">Recommended Purchases</div>
              <div className="grid gap-3 sm:grid-cols-2">
                {result.recommendations.map((rec, i) => (
                  <div key={i} className="rounded-xl border border-border bg-bg-card p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-text-primary">{rec.item_name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${PRIORITY_COLORS[rec.priority?.toLowerCase()] || PRIORITY_COLORS.medium}`}>
                        {rec.priority}
                      </span>
                    </div>
                    <div className="mb-2 flex items-center gap-2 text-xs text-text-tertiary">
                      <span>{rec.category}</span>
                      {rec.color && <><span>·</span><span>{rec.color}</span></>}
                      {rec.estimated_price && <><span>·</span><span>~${rec.estimated_price}</span></>}
                    </div>
                    <p className="mb-2 text-xs leading-relaxed text-text-secondary">{rec.reason}</p>
                    {rec.match_count > 0 && (
                      <div className="text-[11px] font-medium text-accent">
                        Matches {rec.match_count} item{rec.match_count > 1 ? "s" : ""} in your wardrobe
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sustainable tips */}
          {result.sustainable_tips.length > 0 && (
            <div className="glass-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <Leaf className="h-4 w-4 text-success" />
                <span className="text-sm font-semibold text-text-primary">Sustainable Shopping Tips</span>
              </div>
              <div className="space-y-2">
                {result.sustainable_tips.map((tip, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-success-muted/30 px-4 py-3">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-success" />
                    <p className="text-sm text-text-secondary">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}
