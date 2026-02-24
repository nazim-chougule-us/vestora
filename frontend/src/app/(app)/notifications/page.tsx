"use client";

import { useState, useEffect, useCallback } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { api } from "@/services/api";
import { Bell, Loader2, Sparkles, CheckCheck, Shirt } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ notifications: Notification[]; unread_count: number }>("/notifications");
      setNotifications(res.notifications);
      setUnreadCount(res.unread_count);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  async function handleMarkAllRead() {
    try {
      await api.post("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  }

  async function handleMarkRead(id: string) {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  }

  async function handleGenerateDaily() {
    setGenerating(true);
    try {
      await api.post("/notifications/generate-daily");
      fetchNotifications();
    } catch {}
    setGenerating(false);
  }

  const typeIcon = (type: string) => {
    if (type === "daily_outfit") return <Shirt className="h-4 w-4 text-accent" />;
    return <Bell className="h-4 w-4 text-info" />;
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="skeleton-shimmer h-7 w-40 rounded-lg" />
            <div className="skeleton-shimmer mt-2 h-4 w-64 rounded-lg" />
          </div>
          <div className="skeleton-shimmer h-9 w-28 rounded-lg" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass-card flex items-start gap-3 p-4">
              <div className="skeleton-shimmer h-8 w-8 shrink-0 rounded-lg" />
              <div className="flex-1">
                <div className="skeleton-shimmer h-4 w-48 rounded-lg" />
                <div className="skeleton-shimmer mt-1.5 h-3 w-full rounded-lg" />
                <div className="skeleton-shimmer mt-1.5 h-2.5 w-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-bold text-text-inverse">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-text-secondary">Daily outfit suggestions, weather alerts, and more</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleGenerateDaily}
            disabled={generating}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-text-inverse hover:bg-accent-hover disabled:opacity-50"
          >
            {generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            Daily Outfit
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-text-secondary hover:bg-bg-card"
            >
              <CheckCheck className="h-3 w-3" />
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="glass-card flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-muted">
            <Bell className="h-8 w-8 text-accent" />
          </div>
          <p className="text-text-secondary">No notifications yet. Generate a daily outfit suggestion above!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read && handleMarkRead(n.id)}
              className={`glass-card flex cursor-pointer items-start gap-3 p-4 transition-colors ${
                !n.read ? "border-l-2 border-l-accent bg-accent-muted/10" : ""
              }`}
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bg-tertiary">
                {typeIcon(n.type)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${!n.read ? "text-text-primary" : "text-text-secondary"}`}>
                    {n.title}
                  </span>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-accent" />}
                </div>
                <p className="text-xs text-text-tertiary">{n.body}</p>
                <div className="mt-1 text-[10px] text-text-tertiary">
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
