"use client";

/**
 * Vestora Frontend — AppLayout component.
 * Combines Sidebar, Topbar, MobileDrawer, and content area.
 * Used as the wrapping layout for all authenticated app pages.
 */

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileDrawer } from "./MobileDrawer";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const toggleMobileDrawer = useCallback(() => {
    setMobileDrawerOpen((prev) => !prev);
  }, []);

  const closeMobileDrawer = useCallback(() => {
    setMobileDrawerOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden sm:block">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      </div>

      {/* Mobile drawer */}
      <MobileDrawer open={mobileDrawerOpen} onClose={closeMobileDrawer} />

      {/* Topbar */}
      <Topbar
        sidebarCollapsed={sidebarCollapsed}
        onMenuToggle={toggleMobileDrawer}
      />

      {/* Main content area */}
      <main
        className={cn(
          "min-h-screen pt-[var(--topbar-height)] transition-all duration-300",
          "sm:ml-[var(--sidebar-width)]",
          sidebarCollapsed && "sm:ml-[var(--sidebar-collapsed)]"
        )}
      >
        {children}
      </main>
    </div>
  );
}
