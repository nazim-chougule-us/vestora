"use client";

import { useState, useEffect, useCallback } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { api } from "@/services/api";
import { Brain, Loader2, Send, Heart, TrendingUp } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const EVENT_TYPES = ["Work meeting", "Date", "Party", "Casual outing", "Presentation", "Interview", "Wedding", "Gym"];

interface ConfidenceLog {
  id: string;
  event_type: string;
  feeling_rating: number;
  compliments_received: number;
  notes: string;
  created_at: string;
}

interface ConfidenceStats {
  avg_confidence: number | null;
  total_compliments: number;
  total_entries: number;
  power_outfit_ids: string[];
  trend: { date: string; rating: number }[];
}

export default function ConfidencePage() {
  const [stats, setStats] = useState<ConfidenceStats | null>(null);
  const [logs, setLogs] = useState<ConfidenceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [eventType, setEventType] = useState("");
  const [rating, setRating] = useState(7);
  const [compliments, setCompliments] = useState(0);
  const [notes, setNotes] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, logsRes] = await Promise.all([
        api.get<ConfidenceStats>("/confidence/stats"),
        api.get<{ logs: ConfidenceLog[] }>("/confidence/history"),
      ]);
      setStats(statsRes);
      setLogs(logsRes.logs);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await api.post("/confidence/log", {
        event_type: eventType || undefined,
        feeling_rating: rating,
        compliments_received: compliments,
        notes: notes || undefined,
      });
      setEventType("");
      setRating(7);
      setCompliments(0);
      setNotes("");
      fetchData();
    } catch {}
    setSubmitting(false);
  }

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Confidence Engine</h1>
        <p className="text-sm text-text-secondary">Track how your outfits make you feel</p>
      </div>

      {/* Stats */}
      {stats && stats.total_entries > 0 && (
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-accent">{stats.avg_confidence ?? "—"}</div>
            <div className="text-xs text-text-tertiary">Avg Confidence</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-success">{stats.total_compliments}</div>
            <div className="text-xs text-text-tertiary">Compliments</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-info">{stats.total_entries}</div>
            <div className="text-xs text-text-tertiary">Entries</div>
          </div>
        </div>
      )}

      {/* Trend chart */}
      {stats && stats.trend.length > 2 && (
        <div className="glass-card mb-6 p-5">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            <span className="text-sm font-semibold text-text-primary">Confidence Trend</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.trend}>
                <XAxis dataKey="date" tick={{ fill: "var(--color-text-tertiary)", fontSize: 10 }} />
                <YAxis domain={[1, 10]} tick={{ fill: "var(--color-text-tertiary)", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-bg-secondary)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Line type="monotone" dataKey="rating" stroke="var(--color-accent)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Log form */}
      <div className="glass-card neon-glow mb-6 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Brain className="h-5 w-5 text-accent" />
          <span className="text-sm font-semibold text-text-primary">Log Your Confidence</span>
        </div>

        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Event Type</label>
            <Select
              value={eventType}
              onChange={setEventType}
              placeholder="Select event..."
              options={[{ value: "", label: "Select event..." }, ...EVENT_TYPES.map((e) => ({ value: e, label: e }))]}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Compliments Received</label>
            <input
              type="number"
              value={compliments}
              onChange={(e) => setCompliments(Math.max(0, parseInt(e.target.value) || 0))}
              min={0}
              className="w-full rounded-lg border border-border bg-bg-input px-3 py-2 text-sm text-text-primary focus:border-border-accent focus:outline-none"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">
            How confident did you feel? <span className="text-accent font-bold">{rating}/10</span>
          </label>
          <input
            type="range"
            min={1}
            max={10}
            value={rating}
            onChange={(e) => setRating(parseInt(e.target.value))}
            className="w-full accent-accent"
          />
          <div className="flex justify-between text-[10px] text-text-tertiary">
            <span>Not confident</span>
            <span>Super confident</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">Notes (optional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. felt great in the blue blazer"
            className="w-full rounded-lg border border-border bg-bg-input px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-border-accent focus:outline-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-text-inverse hover:bg-accent-hover disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Log Entry
        </button>
      </div>

      {/* History */}
      {logs.length > 0 && (
        <div className="glass-card p-5">
          <div className="mb-3 text-sm font-semibold text-text-primary">Recent Entries</div>
          <div className="space-y-2">
            {logs.slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-center justify-between rounded-lg bg-bg-card px-4 py-3">
                <div>
                  <div className="text-sm text-text-primary">
                    {log.event_type || "General"}{" "}
                    {log.compliments_received > 0 && (
                      <span className="text-xs text-success">
                        <Heart className="mr-0.5 inline h-3 w-3" />{log.compliments_received}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-text-tertiary">
                    {new Date(log.created_at).toLocaleDateString()}
                    {log.notes && ` — ${log.notes}`}
                  </div>
                </div>
                <div className={`text-lg font-bold ${log.feeling_rating >= 7 ? "text-success" : log.feeling_rating >= 4 ? "text-warning" : "text-error"}`}>
                  {log.feeling_rating}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
