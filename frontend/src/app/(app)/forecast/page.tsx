"use client";

import { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { api } from "@/services/api";
import { Zap, Loader2, TrendingUp, Sparkles, Lightbulb } from "lucide-react";

interface Trend {
  trend_name: string;
  description: string;
  relevance_score: number;
}

interface Prediction {
  prediction: string;
  confidence: string;
  timeframe: string;
}

interface ForecastData {
  style_shift: string;
  current_trends: Trend[];
  predictions: Prediction[];
  early_adoption: string[];
  message?: string;
}

export default function ForecastPage() {
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<ForecastData>("/forecast");
        setData(res);
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </PageContainer>
    );
  }

  if (!data || data.message) {
    return (
      <PageContainer>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Fashion Forecast</h1>
          <p className="text-sm text-text-secondary">AI-predicted style trends and your next direction</p>
        </div>
        <div className="glass-card flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-muted">
            <Zap className="h-8 w-8 text-accent" />
          </div>
          <p className="text-text-secondary">{data?.message || "Add more wardrobe items to unlock fashion forecasts."}</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Fashion Forecast</h1>
        <p className="text-sm text-text-secondary">AI-predicted style trends and your next direction</p>
      </div>

      {/* Style shift */}
      {data.style_shift && (
        <div className="glass-card neon-glow mb-6 p-5">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            <span className="text-sm font-semibold text-text-primary">Your Style Is Shifting</span>
          </div>
          <p className="text-sm leading-relaxed text-text-secondary">{data.style_shift}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current trends */}
        {data.current_trends.length > 0 && (
          <div className="glass-card p-5">
            <div className="mb-3 text-sm font-semibold text-text-primary">Current Trends For You</div>
            <div className="space-y-3">
              {data.current_trends.map((trend, i) => (
                <div key={i} className="rounded-lg border border-border bg-bg-card p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-text-primary">{trend.trend_name}</span>
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-bg-tertiary">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${(trend.relevance_score / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-text-tertiary">{trend.relevance_score}/10</span>
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary">{trend.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Predictions */}
        {data.predictions.length > 0 && (
          <div className="glass-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-text-primary">Predictions</span>
            </div>
            <div className="space-y-3">
              {data.predictions.map((pred, i) => (
                <div key={i} className="rounded-lg border border-border bg-bg-card p-3">
                  <p className="mb-1 text-sm text-text-primary">{pred.prediction}</p>
                  <div className="flex gap-3 text-[10px] text-text-tertiary">
                    <span>Confidence: {pred.confidence}</span>
                    <span>Timeframe: {pred.timeframe}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Early adoption */}
      {data.early_adoption.length > 0 && (
        <div className="mt-6 glass-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-warning" />
            <span className="text-sm font-semibold text-text-primary">Try These Trends Early</span>
          </div>
          <div className="space-y-2">
            {data.early_adoption.map((tip, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-warning-muted/30 px-4 py-3">
                <span className="h-2 w-2 shrink-0 rounded-full bg-warning" />
                <p className="text-sm text-text-secondary">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
