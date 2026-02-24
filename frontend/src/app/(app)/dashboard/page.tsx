"use client";

import { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { api } from "@/services/api";
import {
  Shirt,
  Sparkles,
  TrendingUp,
  BarChart3,
  Calendar,
  Cloud,
  Sun,
  Brain,
  Smile,
  ShoppingBag,
  Gem,
  Users,
} from "lucide-react";

interface DashStats {
  wardrobe: number;
  outfits: number;
  suggestions: number;
  confidence: number | null;
}

const quickActions = [
  { label: "Upload Item", href: "/wardrobe", icon: Shirt, color: "text-accent" },
  { label: "Generate Outfit", href: "/outfits", icon: Sparkles, color: "text-success" },
  { label: "Suggestions", href: "/suggestions", icon: TrendingUp, color: "text-info" },
  { label: "Analytics", href: "/analytics", icon: BarChart3, color: "text-warning" },
  { label: "Mood Style", href: "/mood", icon: Smile, color: "text-accent" },
  { label: "Capsule", href: "/capsule", icon: Gem, color: "text-info" },
  { label: "Shopping", href: "/shopping", icon: ShoppingBag, color: "text-success" },
  { label: "Social", href: "/social", icon: Users, color: "text-warning" },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashStats>({ wardrobe: 0, outfits: 0, suggestions: 0, confidence: null });

  useEffect(() => {
    (async () => {
      try {
        const [wRes, oRes, tRes, cRes] = await Promise.allSettled([
          api.get<{ items: any[]; total: number }>("/wardrobe?limit=1"),
          api.get<{ outfits: any[]; total: number }>("/outfits?limit=1"),
          api.get<{ suggestions: any[]; total: number }>("/suggestions?limit=1"),
          api.get<{ avg_confidence: number | null }>("/confidence/stats"),
        ]);
        setStats({
          wardrobe: wRes.status === "fulfilled" ? wRes.value.total : 0,
          outfits: oRes.status === "fulfilled" ? oRes.value.total : 0,
          suggestions: tRes.status === "fulfilled" ? tRes.value.total : 0,
          confidence: cRes.status === "fulfilled" ? cRes.value.avg_confidence : null,
        });
      } catch {}
    })();
  }, []);

  const statCards = [
    { label: "Wardrobe Items", value: stats.wardrobe, icon: Shirt },
    { label: "Outfits Created", value: stats.outfits, icon: Sparkles },
    { label: "Suggestions", value: stats.suggestions, icon: TrendingUp },
    { label: "Confidence", value: stats.confidence != null ? `${stats.confidence}/10` : "—", icon: Brain },
  ];

  return (
    <PageContainer>
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
          Welcome to <span className="gradient-text">Vestora</span>
        </h1>
        <p className="mt-1 text-text-secondary">
          Your AI-powered personal style intelligence — let&apos;s get you styled.
        </p>
      </div>

      {/* Today's context bar */}
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-bg-card px-3 py-2 text-sm text-text-secondary">
          <Calendar className="h-4 w-4 text-accent" />
          <span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-bg-card px-3 py-2 text-sm text-text-secondary">
          <Sun className="h-4 w-4 text-warning" />
          <span>24°C, Clear</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-bg-card px-3 py-2 text-sm text-text-secondary">
          <Cloud className="h-4 w-4 text-info" />
          <span>No rain expected</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="stagger-grid mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="animate-fade-in-up glass-card glass-card-hover p-4">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-accent-muted">
                <Icon className="h-4 w-4 text-accent" />
              </div>
              <div className="text-2xl font-bold text-text-primary">{s.value}</div>
              <div className="text-xs text-text-tertiary">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Quick Actions</h2>
        <div className="stagger-grid grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <a
                key={a.label}
                href={a.href}
                className="animate-fade-in-up glass-card glass-card-hover group flex flex-col items-center gap-3 p-5 text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-bg-tertiary">
                  <Icon className={`h-6 w-6 ${a.color}`} />
                </div>
                <span className="text-sm font-medium text-text-primary">{a.label}</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Today's outfit suggestion */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          Today&apos;s Suggestion
        </h2>
        <div className="glass-card neon-glow p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent-muted">
              <Sparkles className="h-7 w-7 text-accent" />
            </div>
            <div>
              <div className="mb-1 text-sm font-semibold text-accent">AI Stylist</div>
              <p className="text-sm leading-relaxed text-text-secondary">
                {stats.wardrobe >= 5
                  ? "You have enough items for personalized outfits! Head to Outfits to generate a look, or try Mood-to-Style for something expressive."
                  : "Upload your first wardrobe items to unlock personalized outfit recommendations. Start by adding 5 items and I\u2019ll craft your first styled look."}
              </p>
              <a
                href={stats.wardrobe >= 5 ? "/outfits" : "/wardrobe"}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-text-inverse hover:bg-accent-hover"
              >
                {stats.wardrobe >= 5 ? (
                  <><Sparkles className="h-4 w-4" /> Generate Outfit</>
                ) : (
                  <><Shirt className="h-4 w-4" /> Upload Items</>
                )}
              </a>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
