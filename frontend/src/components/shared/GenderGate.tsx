"use client";

/**
 * Vestora — GenderGate component.
 * If the authenticated user has no gender set, shows a full-screen modal
 * asking them to pick one before they can use the app.
 */

import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { profileService } from "@/services/profileService";
import { Loader2, Sparkles } from "lucide-react";
import type { Gender } from "@/types/user";

export function GenderGate({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Gender | null>(null);
  const [error, setError] = useState("");

  // If user already has gender, render children normally
  if (!user || user.gender) {
    return <>{children}</>;
  }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      const updated = await profileService.updateProfile({ gender: selected });
      setUser({ ...user!, gender: updated.gender as Gender });
    } catch (err: any) {
      setError(err?.detail || err?.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-bg-primary/95 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-bg-secondary p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
            <Sparkles className="h-5 w-5 text-text-inverse" />
          </div>
          <h2 className="text-lg font-bold text-text-primary">One more thing!</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Select your gender so we can personalize your experience.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-error-muted px-3 py-2 text-[13px] text-error">
            {error}
          </div>
        )}

        {/* Gender buttons */}
        <div className="mb-5 flex gap-3">
          <button
            type="button"
            onClick={() => setSelected("male")}
            className={`flex flex-1 flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
              selected === "male"
                ? "border-accent bg-accent/10"
                : "border-border bg-bg-tertiary hover:border-text-tertiary"
            }`}
          >
            <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke={selected === "male" ? "var(--accent)" : "var(--text-secondary)"} strokeWidth={1.5}>
              <circle cx="12" cy="7" r="4" />
              <path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2" />
            </svg>
            <span className={`text-sm font-semibold ${selected === "male" ? "text-accent" : "text-text-primary"}`}>
              Male
            </span>
          </button>
          <button
            type="button"
            onClick={() => setSelected("female")}
            className={`flex flex-1 flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
              selected === "female"
                ? "border-accent bg-accent/10"
                : "border-border bg-bg-tertiary hover:border-text-tertiary"
            }`}
          >
            <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke={selected === "female" ? "var(--accent)" : "var(--text-secondary)"} strokeWidth={1.5}>
              <circle cx="12" cy="7" r="4" />
              <path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2" />
            </svg>
            <span className={`text-sm font-semibold ${selected === "female" ? "text-accent" : "text-text-primary"}`}>
              Female
            </span>
          </button>
        </div>

        {/* Continue button */}
        <button
          onClick={handleSave}
          disabled={!selected || saving}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-semibold text-text-inverse transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Continue"
          )}
        </button>

        <p className="mt-3 text-center text-[11px] text-text-tertiary">
          You can change this later in Settings.
        </p>
      </div>
    </div>
  );
}
