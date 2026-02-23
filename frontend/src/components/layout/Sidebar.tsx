"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
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
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Gem,
} from "lucide-react";

export interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const mainNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/wardrobe", label: "Wardrobe", icon: Shirt },
  { href: "/outfits", label: "Outfits", icon: Sparkles },
  { href: "/suggestions", label: "Suggestions", icon: TrendingUp },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/style-dna", label: "Style DNA", icon: Fingerprint },
];

const secondaryNav: NavItem[] = [
  { href: "/mood", label: "Mood", icon: Smile },
  { href: "/capsule", label: "Capsule", icon: Gem },
  { href: "/shopping", label: "Shopping", icon: ShoppingBag },
  { href: "/social", label: "Social", icon: Users },
  { href: "/confidence", label: "Confidence", icon: Brain },
  { href: "/forecast", label: "Forecast", icon: Zap },
];

const bottomNav: NavItem[] = [
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavLink({
  item,
  collapsed,
  isActive,
}: {
  item: NavItem;
  collapsed: boolean;
  isActive: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
        collapsed && "justify-center px-2",
        isActive
          ? "bg-accent/10 text-accent"
          : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
      )}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 h-4 w-0.75 -translate-y-1/2 rounded-r-full bg-accent" />
      )}

      <Icon
        className={cn(
          "h-5 w-5 shrink-0 transition-colors",
          isActive ? "text-accent" : "text-text-tertiary group-hover:text-text-primary"
        )}
      />

      {!collapsed && <span className="truncate">{item.label}</span>}

      {item.badge && !collapsed && (
        <span className="ml-auto rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-text-inverse">
          {item.badge}
        </span>
      )}

      {/* Tooltip when collapsed */}
      {collapsed && (
        <div className="pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded-lg bg-bg-secondary px-3 py-1.5 text-xs font-medium text-text-primary opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          {item.label}
        </div>
      )}
    </Link>
  );
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-border bg-bg-secondary transition-all duration-300",
        collapsed ? "w-[var(--sidebar-collapsed)]" : "w-[var(--sidebar-width)]"
      )}
    >
      {/* Logo */}
      <div className="flex h-[var(--topbar-height)] items-center gap-3 border-b border-border px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent">
          <Sparkles className="h-4 w-4 text-text-inverse" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-text-primary">Vestora</span>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-6 flex flex-col gap-1">
          {!collapsed && (
            <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">
              Main
            </div>
          )}
          {mainNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
            />
          ))}
        </div>

        <div className="mb-6 flex flex-col gap-1">
          {!collapsed && (
            <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">
              Intelligence
            </div>
          )}
          {secondaryNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
            />
          ))}
        </div>
      </nav>

      {/* Bottom nav */}
      <div className="border-t border-border px-3 py-3">
        <div className="flex flex-col gap-1">
          {bottomNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              isActive={pathname === item.href}
            />
          ))}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="flex h-10 items-center justify-center border-t border-border text-text-tertiary hover:bg-bg-tertiary hover:text-text-primary"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>
    </aside>
  );
}
