"use client";

import { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { api } from "@/services/api";
import {
  Fingerprint,
  Loader2,
  Sparkles,
  Palette,
  TrendingUp,
} from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface StyleProfile {
  style_archetype?: string;
  style_tags?: string[];
  color_palette?: string[];
  style_dimensions?: Record<string, number>;
  summary?: string;
  growth_areas?: string[];
}

export default function StyleDnaPage() {
  const [profile, setProfile] = useState<StyleProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<{ profile: StyleProfile | null }>("/style-dna");
        setProfile(res.profile);
      } catch {}
      setLoading(false);
    })();
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    setError("");
    try {
      const res = await api.post<{ profile: StyleProfile }>("/style-dna/generate");
      setProfile(res.profile);
    } catch (err: any) {
      setError(err?.detail || "Failed to generate Style DNA. Need at least 3 analyzed wardrobe items.");
    } finally {
      setGenerating(false);
    }
  }

  const dimensionLabels: Record<string, string> = {
    casual_formal: "Casual ↔ Formal",
    minimal_maximal: "Minimal ↔ Maximal",
    classic_trendy: "Classic ↔ Trendy",
    subtle_bold: "Subtle ↔ Bold",
    comfort_style: "Comfort ↔ Style",
  };

  const radarData = profile?.style_dimensions
    ? Object.entries(profile.style_dimensions).map(([key, val]) => ({
        dimension: dimensionLabels[key] || key,
        value: val,
      }))
    : [];

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Style DNA</h1>
          <p className="text-sm text-text-secondary">Your unique fashion identity</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-text-inverse hover:bg-accent-hover disabled:opacity-50"
        >
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {profile ? "Regenerate" : "Generate"} Style DNA
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-error-muted px-4 py-3 text-sm text-error">{error}</div>
      )}

      {!profile ? (
        <div className="glass-card flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-muted">
            <Fingerprint className="h-8 w-8 text-accent" />
          </div>
          <p className="text-text-secondary">Generate your Style DNA to discover your fashion identity.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Archetype card */}
          <div className="glass-card neon-glow p-6">
            <div className="mb-1 text-xs font-medium uppercase tracking-wider text-accent">Style Archetype</div>
            <div className="mb-3 text-2xl font-bold text-text-primary">{profile.style_archetype || "Unknown"}</div>
            {profile.summary && (
              <p className="mb-4 text-sm leading-relaxed text-text-secondary">{profile.summary}</p>
            )}
            {profile.style_tags && profile.style_tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.style_tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-accent bg-accent-muted px-3 py-1 text-xs font-medium text-accent">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Radar chart */}
          {radarData.length > 0 && (
            <div className="glass-card p-5">
              <div className="mb-3 text-sm font-semibold text-text-primary">Style Dimensions</div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--color-border)" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fill: "var(--color-text-secondary)", fontSize: 10 }} />
                    <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                    <Radar dataKey="value" stroke="var(--color-accent)" fill="var(--color-accent)" fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Color palette */}
          {profile.color_palette && profile.color_palette.length > 0 && (
            <div className="glass-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <Palette className="h-4 w-4 text-accent" />
                <span className="text-sm font-semibold text-text-primary">Your Color Palette</span>
              </div>
              <div className="flex gap-3">
                {profile.color_palette.map((color) => (
                  <div key={color} className="flex flex-col items-center gap-1">
                    <div className="h-12 w-12 rounded-xl border border-border" style={{ backgroundColor: color.toLowerCase() }} />
                    <span className="text-[10px] text-text-tertiary">{color}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Growth areas */}
          {profile.growth_areas && profile.growth_areas.length > 0 && (
            <div className="glass-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-info" />
                <span className="text-sm font-semibold text-text-primary">Growth Areas</span>
              </div>
              <div className="space-y-2">
                {profile.growth_areas.map((area, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-info-muted/30 px-4 py-3">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-info" />
                    <p className="text-sm text-text-secondary">{area}</p>
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
