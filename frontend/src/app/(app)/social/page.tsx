"use client";

import { useState, useEffect, useCallback } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { api } from "@/services/api";
import { Users, Heart, Loader2, ImageIcon, Trophy, Crown } from "lucide-react";

interface Post {
  id: string;
  user_name: string;
  image_url: string;
  caption: string;
  votes: number;
  voted_by_me: boolean;
  created_at: string;
}

interface LeaderEntry {
  user_name: string;
  total_votes: number;
  post_count: number;
}

type Tab = "feed" | "leaderboard";

export default function SocialPage() {
  const [tab, setTab] = useState<Tab>("feed");
  const [posts, setPosts] = useState<Post[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ posts: Post[] }>("/social/feed");
      setPosts(res.posts);
    } catch {}
    setLoading(false);
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ leaderboard: LeaderEntry[] }>("/social/leaderboard");
      setLeaderboard(res.leaderboard);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    if (tab === "feed") fetchFeed();
    else fetchLeaderboard();
  }, [tab, fetchFeed, fetchLeaderboard]);

  async function handleVote(postId: string) {
    try {
      const res = await api.post<{ voted: boolean }>(`/social/vote/${postId}`);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, voted_by_me: res.voted, votes: p.votes + (res.voted ? 1 : -1) }
            : p
        )
      );
    } catch {}
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Social</h1>
        <p className="text-sm text-text-secondary">Share outfits, vote, and compete</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-bg-tertiary p-1">
        {(["feed", "leaderboard"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === t ? "bg-bg-card text-text-primary shadow-sm" : "text-text-tertiary hover:text-text-secondary"
            }`}
          >
            {t === "feed" ? "Style Feed" : "Leaderboard"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : tab === "feed" ? (
        posts.length === 0 ? (
          <div className="glass-card flex flex-col items-center gap-4 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-muted">
              <Users className="h-8 w-8 text-accent" />
            </div>
            <p className="text-text-secondary">No posts yet. Share your outfits and style with the community!</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <div key={post.id} className="glass-card glass-card-hover overflow-hidden">
                <div className="relative aspect-square bg-bg-tertiary">
                  {post.image_url ? (
                    <img src={post.image_url} alt={post.caption} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-text-tertiary" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-primary">{post.user_name}</span>
                    <span className="text-[10px] text-text-tertiary">{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                  {post.caption && <p className="mb-2 text-xs text-text-secondary">{post.caption}</p>}
                  <button
                    onClick={() => handleVote(post.id)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      post.voted_by_me
                        ? "bg-error-muted text-error"
                        : "bg-bg-tertiary text-text-tertiary hover:text-error"
                    }`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${post.voted_by_me ? "fill-current" : ""}`} />
                    {post.votes}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Leaderboard */
        leaderboard.length === 0 ? (
          <div className="glass-card flex flex-col items-center gap-4 py-20 text-center">
            <Trophy className="h-12 w-12 text-text-tertiary" />
            <p className="text-text-secondary">No rankings yet. Vote on posts to build the leaderboard!</p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            {leaderboard.map((entry, i) => (
              <div
                key={entry.user_name}
                className={`flex items-center justify-between border-b border-border px-5 py-4 last:border-b-0 ${i < 3 ? "bg-accent-muted/20" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    i === 0 ? "bg-warning text-black" : i === 1 ? "bg-gray-300 text-black" : i === 2 ? "bg-orange-400 text-black" : "bg-bg-tertiary text-text-secondary"
                  }`}>
                    {i < 3 ? <Crown className="h-4 w-4" /> : i + 1}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-text-primary">{entry.user_name}</div>
                    <div className="text-xs text-text-tertiary">{entry.post_count} post{entry.post_count !== 1 ? "s" : ""}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm font-bold text-accent">
                  <Heart className="h-3.5 w-3.5" />
                  {entry.total_votes}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </PageContainer>
  );
}
