"use client";

import { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { api } from "@/services/api";
import {
  BarChart3,
  Shirt,
  TrendingUp,
  DollarSign,
  Lightbulb,
  Loader2,
  Palette,
  Activity,
  Wallet,
  Compass,
  Sun,
  Snowflake,
  Leaf,
  Flower2,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
  Tooltip,
} from "recharts";

interface DistItem {
  name: string;
  count: number;
}

interface WornItem {
  id: string;
  category: string;
  color: string;
  wear_count: number;
}

interface AnalyticsData {
  total_items: number;
  total_wears: number;
  avg_cost_per_wear: number | null;
  wardrobe_value: number | null;
  usage_rate: number;
  versatility_score: number;
  avg_formality: number | null;
  most_worn: WornItem[];
  least_worn: WornItem[];
  category_distribution: DistItem[];
  color_distribution: DistItem[];
  season_distribution: DistItem[];
  fabric_distribution: DistItem[];
  occasion_distribution: DistItem[];
  formality_distribution: DistItem[];
  ai_insights: string[];
}

const CHART_COLORS = [
  "var(--color-accent)",
  "var(--color-info)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-error)",
  "#8b5cf6",
  "#f59e0b",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];

const tooltipStyle = {
  background: "var(--color-bg-secondary)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
};

function DonutChart({ data: raw, maxSlices = 6 }: { data: DistItem[]; maxSlices?: number }) {
  const sorted = [...raw].sort((a, b) => b.count - a.count);
  const top = sorted.slice(0, maxSlices);
  const rest = sorted.slice(maxSlices);
  const otherCount = rest.reduce((sum, d) => sum + d.count, 0);
  const pieData = otherCount > 0 ? [...top, { name: "Other", count: otherCount }] : top;
  const total = pieData.reduce((sum, d) => sum + d.count, 0);

  return (
    <>
      <div className="h-44" style={{ outline: "none" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart style={{ outline: "none" }}>
            <Pie
              data={pieData}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={72}
              innerRadius={36}
              paddingAngle={2}
              label={false}
              labelLine={false}
              activeShape={(props: any) => (
                <Sector
                  cx={props.cx}
                  cy={props.cy}
                  innerRadius={props.innerRadius}
                  outerRadius={props.outerRadius}
                  startAngle={props.startAngle}
                  endAngle={props.endAngle}
                  fill={props.fill}
                  stroke="none"
                />
              )}
              isAnimationActive={false}
              style={{ outline: "none" }}
            >
              {pieData.map((_, idx) => (
                <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} stroke="none" style={{ outline: "none" }} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
        {pieData.map((d, idx) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: CHART_COLORS[idx % CHART_COLORS.length] }}
            />
            <span className="text-xs text-text-secondary">
              {d.name}{" "}
              <span className="font-medium text-text-primary">
                {total > 0 ? Math.round((d.count / total) * 100) : 0}%
              </span>
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

function ProgressBars({ data, color = "bg-accent", maxItems = 6 }: { data: DistItem[]; color?: string; maxItems?: number }) {
  const sorted = [...data].sort((a, b) => b.count - a.count);
  const top = sorted.slice(0, maxItems);
  const rest = sorted.slice(maxItems);
  const otherCount = rest.reduce((s, d) => s + d.count, 0);
  const items = otherCount > 0 ? [...top, { name: "Other", count: otherCount }] : top;
  const max = Math.max(...items.map((d) => d.count), 1);
  const total = items.reduce((s, d) => s + d.count, 0);
  return (
    <div className="space-y-2.5">
      {items.map((d) => (
        <div key={d.name} className="flex items-center gap-3">
          <span className="w-20 shrink-0 truncate text-xs font-medium text-text-primary">{d.name}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-tertiary">
            <div
              className={`h-full rounded-full ${color} transition-all`}
              style={{ width: `${(d.count / max) * 100}%` }}
            />
          </div>
          <span className="w-12 shrink-0 text-right text-[11px] text-text-tertiary">
            {total > 0 ? Math.round((d.count / total) * 100) : 0}%
          </span>
        </div>
      ))}
    </div>
  );
}

const SEASON_ICONS: Record<string, any> = {
  Spring: Flower2,
  Summer: Sun,
  Fall: Leaf,
  Winter: Snowflake,
};
const SEASON_COLORS: Record<string, string> = {
  Spring: "text-success bg-success/10",
  Summer: "text-warning bg-warning/10",
  Fall: "text-error bg-error/10",
  Winter: "text-info bg-info/10",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<AnalyticsData>("/analytics/overview");
        setData(res);
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <div className="mb-6">
          <div className="skeleton-shimmer h-7 w-48 rounded-lg" />
          <div className="skeleton-shimmer mt-2 h-4 w-64 rounded-lg" />
        </div>
        <div className="stagger-grid mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-fade-in-up glass-card p-4">
              <div className="skeleton-shimmer mb-2 h-8 w-8 rounded-lg" />
              <div className="skeleton-shimmer h-7 w-12 rounded-lg" />
              <div className="skeleton-shimmer mt-1 h-3 w-20 rounded-lg" />
            </div>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass-card p-5"><div className="skeleton-shimmer h-64 rounded-lg" /></div>
          <div className="glass-card p-5"><div className="skeleton-shimmer h-64 rounded-lg" /></div>
        </div>
      </PageContainer>
    );
  }

  if (!data || data.total_items === 0) {
    return (
      <PageContainer>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Closet Analytics</h1>
          <p className="text-sm text-text-secondary">Insights into your wardrobe usage</p>
        </div>
        <div className="glass-card flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-muted">
            <BarChart3 className="h-8 w-8 text-accent" />
          </div>
          <p className="text-text-secondary">Upload and analyze wardrobe items to see analytics.</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Closet Analytics</h1>
        <p className="text-sm text-text-secondary">Deep insights into your wardrobe</p>
      </div>

      {/* Stat cards — row 1 */}
      <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="glass-card p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-accent-muted">
            <Shirt className="h-4 w-4 text-accent" />
          </div>
          <div className="text-2xl font-bold text-text-primary">{data.total_items}</div>
          <div className="text-xs text-text-tertiary">Total Items</div>
        </div>
        <div className="glass-card p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-info-muted">
            <TrendingUp className="h-4 w-4 text-info" />
          </div>
          <div className="text-2xl font-bold text-text-primary">{data.total_wears}</div>
          <div className="text-xs text-text-tertiary">Total Wears</div>
        </div>
        <div className="glass-card p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-success-muted">
            <Wallet className="h-4 w-4 text-success" />
          </div>
          <div className="text-2xl font-bold text-text-primary">
            {data.wardrobe_value != null && data.wardrobe_value > 0 ? `$${data.wardrobe_value}` : "—"}
          </div>
          <div className="text-xs text-text-tertiary">Wardrobe Value</div>
        </div>
        <div className="glass-card p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-warning-muted">
            <DollarSign className="h-4 w-4 text-warning" />
          </div>
          <div className="text-2xl font-bold text-text-primary">
            {data.avg_cost_per_wear != null ? `$${data.avg_cost_per_wear}` : "—"}
          </div>
          <div className="text-xs text-text-tertiary">Avg Cost/Wear</div>
        </div>
        <div className="glass-card p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-accent-muted">
            <Palette className="h-4 w-4 text-accent" />
          </div>
          <div className="text-2xl font-bold text-text-primary">{data.color_distribution.length}</div>
          <div className="text-xs text-text-tertiary">Colors</div>
        </div>
        <div className="glass-card p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-info-muted">
            <Compass className="h-4 w-4 text-info" />
          </div>
          <div className="text-2xl font-bold text-text-primary">{data.versatility_score}/10</div>
          <div className="text-xs text-text-tertiary">Versatility</div>
        </div>
      </div>

      {/* Usage rate bar */}
      <div className="mb-6 glass-card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-accent" />
            <span className="text-sm font-semibold text-text-primary">Usage Rate</span>
          </div>
          <span className="text-sm font-bold text-accent">{data.usage_rate}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-bg-tertiary">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${data.usage_rate}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-text-tertiary">
          Percentage of items worn at least once
        </p>
      </div>

      {/* Charts — row 1: Category + Color */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        {data.category_distribution.length > 0 && (() => {
          const catTotal = data.category_distribution.reduce((s, d) => s + d.count, 0);
          const max = Math.max(...data.category_distribution.map((d) => d.count), 1);
          return (
            <div className="glass-card p-5">
              <div className="mb-4 text-sm font-semibold text-text-primary">Category Breakdown</div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {data.category_distribution.map((d, idx) => {
                  const pct = catTotal > 0 ? Math.round((d.count / catTotal) * 100) : 0;
                  return (
                    <div key={d.name} className="relative overflow-hidden rounded-lg bg-bg-card px-3 py-2">
                      <div
                        className="absolute inset-y-0 left-0 opacity-15"
                        style={{
                          width: `${(d.count / max) * 100}%`,
                          background: CHART_COLORS[idx % CHART_COLORS.length],
                        }}
                      />
                      <div className="relative flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ background: CHART_COLORS[idx % CHART_COLORS.length] }}
                          />
                          <span className="truncate text-xs font-medium text-text-primary">{d.name}</span>
                        </div>
                        <span className="shrink-0 text-[11px] text-text-tertiary">{d.count} · {pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {data.color_distribution.length > 0 && (
          <div className="glass-card p-5">
            <div className="mb-3 text-sm font-semibold text-text-primary">Color Distribution</div>
            <DonutChart data={data.color_distribution} />
          </div>
        )}
      </div>

      {/* Charts — row 2: Season + Fabric */}
      <div className="mb-6 grid items-stretch gap-6 lg:grid-cols-2">
        {data.season_distribution.length > 0 && (
          <div className="glass-card p-5">
            <div className="mb-4 text-sm font-semibold text-text-primary">Season Coverage</div>
            <div className="grid grid-cols-2 gap-3">
              {data.season_distribution.map((s) => {
                const Icon = SEASON_ICONS[s.name] || Sun;
                const cls = SEASON_COLORS[s.name] || "text-text-secondary bg-bg-tertiary";
                return (
                  <div key={s.name} className="flex items-center gap-3 rounded-xl border border-border bg-bg-card p-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${cls}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-text-primary">{s.name}</div>
                      <div className="text-xs text-text-tertiary">{s.count} item{s.count !== 1 ? "s" : ""}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {data.fabric_distribution.length > 0 && (
          <div className="glass-card flex flex-col p-5">
            <div className="mb-3 text-sm font-semibold text-text-primary">Fabric Mix</div>
            <div className="flex flex-1 flex-col justify-center">
              <DonutChart data={data.fabric_distribution} />
            </div>
          </div>
        )}
      </div>

      {/* Charts — row 3: Occasion + Formality */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        {(data.occasion_distribution?.length ?? 0) > 0 && (
          <div className="glass-card p-5">
            <div className="mb-4 text-sm font-semibold text-text-primary">Occasion Coverage</div>
            <div className="flex flex-wrap gap-2">
              {data.occasion_distribution.map((o, idx) => (
                <span
                  key={o.name}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: CHART_COLORS[idx % CHART_COLORS.length] }}
                  />
                  <span className="text-xs font-medium text-text-primary">{o.name}</span>
                  <span className="text-xs text-text-tertiary">{o.count}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {(data.formality_distribution?.length ?? 0) > 0 && (() => {
          const formalityTotal = data.formality_distribution.reduce((s, d) => s + d.count, 0);
          const fColors = ["var(--color-success)", "var(--color-info)", "var(--color-warning)", "var(--color-error)"];
          return (
            <div className="glass-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-text-primary">Formality Spectrum</span>
                {data.avg_formality != null && (
                  <span className="rounded-full bg-accent-muted px-2 py-0.5 text-[11px] font-medium text-accent">
                    Avg: {data.avg_formality}/10
                  </span>
                )}
              </div>
              {/* Segmented bar */}
              <div className="mb-3 flex h-4 w-full overflow-hidden rounded-full">
                {data.formality_distribution.map((d, idx) => (
                  <div
                    key={d.name}
                    className="h-full transition-all"
                    style={{
                      width: `${formalityTotal > 0 ? (d.count / formalityTotal) * 100 : 0}%`,
                      background: fColors[idx % fColors.length],
                    }}
                  />
                ))}
              </div>
              {/* Legend */}
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {data.formality_distribution.map((d, idx) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: fColors[idx % fColors.length] }} />
                    <span className="text-xs text-text-secondary">
                      {d.name} <span className="font-medium text-text-primary">{d.count}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Most / Least worn */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        {data.most_worn.length > 0 && (
          <div className="glass-card p-5">
            <div className="mb-3 text-sm font-semibold text-text-primary">Most Worn</div>
            <div className="space-y-2">
              {data.most_worn.map((item, i) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg bg-bg-card px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-accent">#{i + 1}</span>
                    <span className="text-sm text-text-primary">{item.category}</span>
                    {item.color && <span className="text-xs text-text-tertiary">({item.color})</span>}
                  </div>
                  <span className="text-sm font-semibold text-accent">{item.wear_count}x</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.least_worn.length > 0 && (
          <div className="glass-card p-5">
            <div className="mb-3 text-sm font-semibold text-text-primary">Least Worn</div>
            <div className="space-y-2">
              {data.least_worn.map((item, i) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg bg-bg-card px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-error">#{i + 1}</span>
                    <span className="text-sm text-text-primary">{item.category}</span>
                    {item.color && <span className="text-xs text-text-tertiary">({item.color})</span>}
                  </div>
                  <span className="text-sm font-semibold text-error">{item.wear_count}x</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Insights */}
      {data.ai_insights.length > 0 && (
        <div className="glass-card neon-glow p-5">
          <div className="mb-3 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-warning" />
            <span className="text-sm font-semibold text-text-primary">AI Insights</span>
            <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-medium text-warning">
              {data.ai_insights.length}
            </span>
          </div>
          <div className="space-y-2">
            {data.ai_insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg bg-warning-muted/30 px-4 py-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-warning" />
                <p className="text-sm leading-relaxed text-text-secondary">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
