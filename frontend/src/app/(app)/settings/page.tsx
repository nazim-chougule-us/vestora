"use client";

import { useState, useEffect, useCallback } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { profileService } from "@/services/profileService";
import { authService } from "@/services/authService";
import type { BodyProfile, StylePreferences, CulturalPreferences } from "@/types/user";
import {
  User,
  Ruler,
  Palette,
  Heart,
  Globe,
  Save,
  Loader2,
  Check,
} from "lucide-react";
import { Select } from "@/components/ui/Select";

const SKIN_TONES = ["Very Light", "Light", "Medium", "Olive", "Brown", "Dark"];
const BODY_TYPES = ["Slim", "Athletic", "Average", "Muscular", "Plus-size", "Petite", "Tall"];
const STYLE_OPTIONS = ["Casual", "Formal", "Streetwear", "Minimalist", "Bohemian", "Preppy", "Sporty", "Vintage", "Avant-garde", "Classic"];
const FIT_OPTIONS = ["Slim Fit", "Regular Fit", "Loose Fit", "Oversized", "Tailored"];
const COLOR_OPTIONS = ["Black", "White", "Navy", "Grey", "Beige", "Brown", "Red", "Blue", "Green", "Pink", "Purple", "Orange", "Yellow", "Olive", "Burgundy", "Teal"];
const COMFORT_LEVELS = [
  { value: "minimal", label: "Minimal", desc: "Stick to what I know" },
  { value: "moderate", label: "Moderate", desc: "Open to new ideas" },
  { value: "adventurous", label: "Adventurous", desc: "Surprise me!" },
];
const MODESTY_LEVELS = [
  { value: "liberal", label: "Liberal", desc: "No restrictions" },
  { value: "standard", label: "Standard", desc: "Generally modest" },
  { value: "conservative", label: "Conservative", desc: "Fully modest" },
];

function TagSelector({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (val: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onToggle(opt)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            selected.includes(opt)
              ? "border-accent bg-accent-muted text-accent"
              : "border-border bg-bg-card text-text-secondary hover:border-border-hover"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Profile fields
  const [name, setName] = useState("");

  // Body profile
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [skinTone, setSkinTone] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [chestCm, setChestCm] = useState("");
  const [waistCm, setWaistCm] = useState("");
  const [hipCm, setHipCm] = useState("");
  const [shoeSize, setShoeSize] = useState("");

  // Style preferences
  const [favoriteColors, setFavoriteColors] = useState<string[]>([]);
  const [avoidedColors, setAvoidedColors] = useState<string[]>([]);
  const [preferredFits, setPreferredFits] = useState<string[]>([]);
  const [preferredStyles, setPreferredStyles] = useState<string[]>([]);
  const [comfortLevel, setComfortLevel] = useState("moderate");

  // Cultural preferences
  const [modestyLevel, setModestyLevel] = useState("standard");
  const [culturalTags, setCulturalTags] = useState<string[]>([]);

  // Load profile data
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      if (user.body_profile) {
        setHeightCm(user.body_profile.height_cm?.toString() || "");
        setWeightKg(user.body_profile.weight_kg?.toString() || "");
        setSkinTone(user.body_profile.skin_tone || "");
        setBodyType(user.body_profile.body_type || "");
        setChestCm(user.body_profile.chest_cm?.toString() || "");
        setWaistCm(user.body_profile.waist_cm?.toString() || "");
        setHipCm(user.body_profile.hip_cm?.toString() || "");
        setShoeSize(user.body_profile.shoe_size || "");
      }
      if (user.style_preferences) {
        setFavoriteColors(user.style_preferences.favorite_colors || []);
        setAvoidedColors(user.style_preferences.avoided_colors || []);
        setPreferredFits(user.style_preferences.preferred_fits || []);
        setPreferredStyles(user.style_preferences.preferred_styles || []);
        setComfortLevel(user.style_preferences.comfort_level || "moderate");
      }
      if (user.cultural_preferences) {
        setModestyLevel(user.cultural_preferences.modesty_level || "standard");
        setCulturalTags(user.cultural_preferences.cultural_tags || []);
      }
    }
  }, [user]);

  function toggleTag(list: string[], val: string, setter: (v: string[]) => void) {
    setter(list.includes(val) ? list.filter((v) => v !== val) : [...list, val]);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);

    const body_profile: BodyProfile = {
      height_cm: heightCm ? parseFloat(heightCm) : undefined,
      weight_kg: weightKg ? parseFloat(weightKg) : undefined,
      skin_tone: skinTone || undefined,
      body_type: bodyType || undefined,
      chest_cm: chestCm ? parseFloat(chestCm) : undefined,
      waist_cm: waistCm ? parseFloat(waistCm) : undefined,
      hip_cm: hipCm ? parseFloat(hipCm) : undefined,
      shoe_size: shoeSize || undefined,
    };

    const style_preferences: StylePreferences = {
      favorite_colors: favoriteColors,
      avoided_colors: avoidedColors,
      preferred_fits: preferredFits,
      preferred_styles: preferredStyles,
      comfort_level: comfortLevel as "minimal" | "moderate" | "adventurous",
    };

    const cultural_preferences: CulturalPreferences = {
      modesty_level: modestyLevel as "standard" | "conservative" | "liberal",
      cultural_tags: culturalTags,
    };

    try {
      await profileService.updateProfile({
        name,
        body_profile,
        style_preferences,
        cultural_preferences,
      });
      // Refresh the auth store with updated user data
      const freshUser = await authService.getMe();
      setUser(freshUser);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err?.detail || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageContainer>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
          <p className="text-sm text-text-secondary">Manage your profile and preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-text-inverse hover:bg-accent-hover disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <Check className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-error-muted px-4 py-3 text-sm text-error">{error}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Info */}
        <section className="glass-card p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-muted">
              <User className="h-4 w-4 text-accent" />
            </div>
            <div>
              <div className="text-sm font-semibold text-text-primary">Basic Info</div>
              <div className="text-xs text-text-tertiary">Your name and email</div>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg-input px-3 py-2 text-sm text-text-primary focus:border-border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Email</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full rounded-lg border border-border bg-bg-tertiary px-3 py-2 text-sm text-text-tertiary"
              />
            </div>
          </div>
        </section>

        {/* Body Measurements */}
        <section className="glass-card p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-muted">
              <Ruler className="h-4 w-4 text-accent" />
            </div>
            <div>
              <div className="text-sm font-semibold text-text-primary">Body Measurements</div>
              <div className="text-xs text-text-tertiary">For accurate fit recommendations</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Height (cm)</label>
              <input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="175" className="w-full rounded-lg border border-border bg-bg-input px-3 py-2 text-sm text-text-primary focus:border-border-accent focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Weight (kg)</label>
              <input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="70" className="w-full rounded-lg border border-border bg-bg-input px-3 py-2 text-sm text-text-primary focus:border-border-accent focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Chest (cm)</label>
              <input type="number" value={chestCm} onChange={(e) => setChestCm(e.target.value)} placeholder="95" className="w-full rounded-lg border border-border bg-bg-input px-3 py-2 text-sm text-text-primary focus:border-border-accent focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Waist (cm)</label>
              <input type="number" value={waistCm} onChange={(e) => setWaistCm(e.target.value)} placeholder="80" className="w-full rounded-lg border border-border bg-bg-input px-3 py-2 text-sm text-text-primary focus:border-border-accent focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Hip (cm)</label>
              <input type="number" value={hipCm} onChange={(e) => setHipCm(e.target.value)} placeholder="95" className="w-full rounded-lg border border-border bg-bg-input px-3 py-2 text-sm text-text-primary focus:border-border-accent focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Shoe Size</label>
              <input type="text" value={shoeSize} onChange={(e) => setShoeSize(e.target.value)} placeholder="42 EU" className="w-full rounded-lg border border-border bg-bg-input px-3 py-2 text-sm text-text-primary focus:border-border-accent focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Skin Tone</label>
              <Select
                value={skinTone}
                onChange={setSkinTone}
                placeholder="Select..."
                options={[{ value: "", label: "Select..." }, ...SKIN_TONES.map((t) => ({ value: t, label: t }))]}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Body Type</label>
              <Select
                value={bodyType}
                onChange={setBodyType}
                placeholder="Select..."
                options={[{ value: "", label: "Select..." }, ...BODY_TYPES.map((t) => ({ value: t, label: t }))]}
              />
            </div>
          </div>
        </section>

        {/* Style Preferences */}
        <section className="glass-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-muted">
              <Heart className="h-4 w-4 text-accent" />
            </div>
            <div>
              <div className="text-sm font-semibold text-text-primary">Style Preferences</div>
              <div className="text-xs text-text-tertiary">What you love (and avoid) in fashion</div>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-medium text-text-secondary">Preferred Styles</label>
              <TagSelector options={STYLE_OPTIONS} selected={preferredStyles} onToggle={(v) => toggleTag(preferredStyles, v, setPreferredStyles)} />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-text-secondary">Preferred Fits</label>
              <TagSelector options={FIT_OPTIONS} selected={preferredFits} onToggle={(v) => toggleTag(preferredFits, v, setPreferredFits)} />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-text-secondary">Favorite Colors</label>
              <TagSelector options={COLOR_OPTIONS} selected={favoriteColors} onToggle={(v) => toggleTag(favoriteColors, v, setFavoriteColors)} />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-text-secondary">Colors to Avoid</label>
              <TagSelector options={COLOR_OPTIONS} selected={avoidedColors} onToggle={(v) => toggleTag(avoidedColors, v, setAvoidedColors)} />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-text-secondary">Comfort Level</label>
              <div className="grid grid-cols-3 gap-3">
                {COMFORT_LEVELS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setComfortLevel(c.value)}
                    className={`rounded-xl border p-3 text-center transition-colors ${
                      comfortLevel === c.value
                        ? "border-accent bg-accent-muted"
                        : "border-border bg-bg-card hover:border-border-hover"
                    }`}
                  >
                    <div className={`text-sm font-medium ${comfortLevel === c.value ? "text-accent" : "text-text-primary"}`}>{c.label}</div>
                    <div className="text-xs text-text-tertiary">{c.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Cultural Preferences */}
        <section className="glass-card p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-muted">
              <Globe className="h-4 w-4 text-accent" />
            </div>
            <div>
              <div className="text-sm font-semibold text-text-primary">Cultural Preferences</div>
              <div className="text-xs text-text-tertiary">Modesty and cultural considerations</div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-medium text-text-secondary">Modesty Level</label>
              <div className="grid grid-cols-3 gap-3">
                {MODESTY_LEVELS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setModestyLevel(m.value)}
                    className={`rounded-xl border p-3 text-center transition-colors ${
                      modestyLevel === m.value
                        ? "border-accent bg-accent-muted"
                        : "border-border bg-bg-card hover:border-border-hover"
                    }`}
                  >
                    <div className={`text-sm font-medium ${modestyLevel === m.value ? "text-accent" : "text-text-primary"}`}>{m.label}</div>
                    <div className="text-xs text-text-tertiary">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="glass-card p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-muted">
              <Palette className="h-4 w-4 text-accent" />
            </div>
            <div>
              <div className="text-sm font-semibold text-text-primary">Appearance</div>
              <div className="text-xs text-text-tertiary">Theme and display settings</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Theme</span>
            <ThemeToggle />
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
