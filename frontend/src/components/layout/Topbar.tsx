"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { api } from "@/services/api";
import {
  Search,
  Bell,
  Cloud,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  LayoutDashboard,
  Shirt,
  Sparkles,
  TrendingUp,
  BarChart3,
  Fingerprint,
  Smile,
  ShoppingBag,
  Users,
  Brain,
  Zap,
  Gem,
  CornerDownLeft,
} from "lucide-react";

const APP_PAGES = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, keywords: ["home", "overview"] },
  { href: "/wardrobe", label: "Wardrobe", icon: Shirt, keywords: ["clothes", "upload", "items", "garments"] },
  { href: "/outfits", label: "Outfits", icon: Sparkles, keywords: ["generate", "outfit", "recommend"] },
  { href: "/suggestions", label: "Suggestions", icon: TrendingUp, keywords: ["suggest", "trending", "outfit ideas", "recommend"] },
  { href: "/analytics", label: "Analytics", icon: BarChart3, keywords: ["stats", "data", "insights", "wear"] },
  { href: "/style-dna", label: "Style DNA", icon: Fingerprint, keywords: ["profile", "personality", "archetype"] },
  { href: "/mood", label: "Mood Styling", icon: Smile, keywords: ["feeling", "emotion", "mood"] },
  { href: "/capsule", label: "Capsule Wardrobe", icon: Gem, keywords: ["travel", "packing", "trip"] },
  { href: "/shopping", label: "Shopping", icon: ShoppingBag, keywords: ["buy", "recommend", "gap"] },
  { href: "/social", label: "Social", icon: Users, keywords: ["friends", "share", "community"] },
  { href: "/confidence", label: "Confidence", icon: Brain, keywords: ["log", "track", "feeling"] },
  { href: "/forecast", label: "Forecast", icon: Zap, keywords: ["trend", "prediction", "style shift"] },
  { href: "/notifications", label: "Notifications", icon: Bell, keywords: ["alerts", "daily"] },
  { href: "/settings", label: "Settings", icon: Settings, keywords: ["preferences", "account", "profile", "body"] },
];

export interface TopbarProps {
  sidebarCollapsed: boolean;
  onMenuToggle: () => void;
}

export function Topbar({ sidebarCollapsed, onMenuToggle }: TopbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightIdx, setHighlightIdx] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, logout } = useAuth();

  // Fetch unread notification count
  const fetchUnread = useCallback(async () => {
    try {
      const res = await api.get<{ unread_count: number }>("/notifications?limit=1");
      setUnreadCount(res.unread_count ?? 0);
    } catch {}
  }, []);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 60_000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  // Filtered search results
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return APP_PAGES.filter(
      (p) =>
        p.label.toLowerCase().includes(q) ||
        p.href.toLowerCase().includes(q) ||
        p.keywords.some((k) => k.includes(q))
    );
  }, [searchQuery]);

  // Whether to show "Search wardrobe" action
  const showWardrobeSearch = searchQuery.trim().length > 0;
  // Total selectable items = page results + wardrobe search action
  const totalResults = searchResults.length + (showWardrobeSearch ? 1 : 0);

  function closeSearch() {
    setSearchOpen(false);
    setSearchQuery("");
    setHighlightIdx(0);
  }

  function navigateTo(href: string) {
    router.push(href);
    closeSearch();
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (totalResults === 0) return;
    // If highlighted is a page result
    if (highlightIdx < searchResults.length) {
      navigateTo(searchResults[highlightIdx].href);
    } else if (showWardrobeSearch) {
      navigateTo(`/wardrobe?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  // Reset highlight when results change
  useEffect(() => { setHighlightIdx(0); }, [searchQuery]);

  // Click outside to close search
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        closeSearch();
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ⌘K / Ctrl+K shortcut + arrow key navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === "Escape" && searchOpen) {
        closeSearch();
      }
      if (searchOpen && e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIdx((i) => Math.min(i + 1, totalResults - 1));
      }
      if (searchOpen && e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIdx((i) => Math.max(i - 1, 0));
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen, totalResults]);

  return (
    <header
      className={cn(
        "fixed top-0 z-20 flex h-[var(--topbar-height)] items-center gap-4 border-b border-border bg-bg-secondary/80 px-4 backdrop-blur-md transition-all duration-300 sm:px-6",
        sidebarCollapsed
          ? "left-0 sm:left-[var(--sidebar-collapsed)]"
          : "left-0 sm:left-[var(--sidebar-width)]",
        "right-0"
      )}
    >
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-tertiary hover:text-text-primary sm:hidden"
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div ref={searchRef} className="relative flex-1">
        {searchOpen ? (
          <>
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pages, wardrobe items..."
                  className="w-full rounded-lg border border-border bg-bg-input py-2 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-tertiary focus:border-border-accent focus:outline-none"
                  autoFocus
                />
              </div>
              <button
                type="button"
                onClick={closeSearch}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </form>

            {/* Results dropdown */}
            {searchQuery.trim() && (
              <div className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-bg-secondary shadow-lg">
                <div className="max-h-72 overflow-y-auto py-1">
                  {searchResults.length === 0 && !showWardrobeSearch && (
                    <div className="px-4 py-6 text-center text-xs text-text-tertiary">No results found</div>
                  )}
                  {searchResults.map((page, idx) => {
                    const Icon = page.icon;
                    return (
                      <button
                        key={page.href}
                        type="button"
                        onMouseEnter={() => setHighlightIdx(idx)}
                        onClick={() => navigateTo(page.href)}
                        className={cn(
                          "flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors",
                          highlightIdx === idx
                            ? "bg-accent/10 text-accent"
                            : "text-text-secondary hover:bg-bg-tertiary"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1 truncate">{page.label}</span>
                        {highlightIdx === idx && <CornerDownLeft className="h-3 w-3 text-text-tertiary" />}
                      </button>
                    );
                  })}
                  {showWardrobeSearch && (
                    <>
                      {searchResults.length > 0 && <div className="mx-3 my-1 border-t border-border" />}
                      <button
                        type="button"
                        onMouseEnter={() => setHighlightIdx(searchResults.length)}
                        onClick={() => navigateTo(`/wardrobe?search=${encodeURIComponent(searchQuery.trim())}`)}
                        className={cn(
                          "flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors",
                          highlightIdx === searchResults.length
                            ? "bg-accent/10 text-accent"
                            : "text-text-secondary hover:bg-bg-tertiary"
                        )}
                      >
                        <Shirt className="h-4 w-4 shrink-0" />
                        <span className="flex-1 truncate">Search wardrobe for &ldquo;{searchQuery.trim()}&rdquo;</span>
                        {highlightIdx === searchResults.length && <CornerDownLeft className="h-3 w-3 text-text-tertiary" />}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-border bg-bg-input px-3 py-2 text-sm text-text-tertiary hover:border-border-hover"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="ml-auto hidden rounded bg-bg-tertiary px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary sm:inline">
              ⌘K
            </kbd>
          </button>
        )}
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Weather widget stub */}
        <div className="hidden items-center gap-1.5 rounded-lg border border-border bg-bg-card px-2.5 py-1.5 text-xs text-text-secondary md:flex">
          <Cloud className="h-3.5 w-3.5 text-info" />
          <span>24°C</span>
        </div>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <button
          onClick={() => { router.push("/notifications"); setUnreadCount(0); }}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-accent" />
          )}
        </button>

        {/* User avatar + dropdown */}
        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-muted text-accent hover:bg-accent hover:text-text-inverse"
            aria-label="User menu"
          >
            {user?.name ? (
              <span className="text-xs font-bold">{user.name.charAt(0).toUpperCase()}</span>
            ) : (
              <User className="h-4 w-4" />
            )}
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-bg-secondary shadow-lg">
              {user && (
                <div className="border-b border-border px-4 py-3">
                  <div className="text-sm font-medium text-text-primary truncate">{user.name}</div>
                  <div className="text-xs text-text-tertiary truncate">{user.email}</div>
                </div>
              )}
              <div className="py-1">
                <button
                  onClick={() => { setUserMenuOpen(false); router.push("/settings"); }}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
                <button
                  onClick={async () => { setUserMenuOpen(false); await logout(); router.push("/login"); }}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-error hover:bg-error-muted"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
