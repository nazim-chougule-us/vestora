"use client";

/**
 * Vestora Frontend — App layout wrapper.
 * All authenticated app routes use this layout with Sidebar + Topbar.
 * Wrapped in ProtectedRoute to redirect unauthenticated users to /login.
 */

import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { GenderGate } from "@/components/shared/GenderGate";

export default function AppRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <GenderGate>
        <AppLayout>{children}</AppLayout>
      </GenderGate>
    </ProtectedRoute>
  );
}
