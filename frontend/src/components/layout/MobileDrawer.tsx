"use client";

/**
 * Vestora Frontend — MobileDrawer component.
 * Slide-in sidebar overlay for mobile viewports.
 */

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Shirt,
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
  Gem,
} from "lucide-react";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

const allNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/wardrobe", label: "Wardrobe", icon: Shirt },
  { href: "/outfits", label: "Outfits", icon: Sparkles },
  { href: "/suggestions", label: "Suggestions", icon: TrendingUp },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/style-dna", label: "Style DNA", icon: Fingerprint },
  { href: "/mood", label: "Mood", icon: Smile },
  { href: "/capsule", label: "Capsule", icon: Gem },
  { href: "/shopping", label: "Shopping", icon: ShoppingBag },
  { href: "/social", label: "Social", icon: Users },
  { href: "/confidence", label: "Confidence", icon: Brain },
  { href: "/forecast", label: "Forecast", icon: Zap },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm sm:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween" as const, ease: "easeOut" as const, duration: 0.25 }}
            className="fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-bg-secondary shadow-2xl sm:hidden"
          >
            {/* Header */}
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                  <Sparkles className="h-4 w-4 text-text-inverse" />
                </div>
                <span className="text-lg font-bold text-text-primary">Vestora</span>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-bg-tertiary hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <div className="flex flex-col gap-1">
                {allNav.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-accent-muted text-accent"
                          : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5",
                          isActive ? "text-accent" : "text-text-tertiary"
                        )}
                      />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
