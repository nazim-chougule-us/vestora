/**
 * Vestora Frontend — User-related TypeScript interfaces.
 */

export interface BodyProfile {
  height_cm?: number;
  weight_kg?: number;
  skin_tone?: string;
  body_type?: string;
  chest_cm?: number;
  waist_cm?: number;
  hip_cm?: number;
  shoe_size?: string;
}

export interface StylePreferences {
  favorite_colors: string[];
  avoided_colors: string[];
  preferred_fits: string[];
  preferred_styles: string[];
  comfort_level: "minimal" | "moderate" | "adventurous";
}

export interface CulturalPreferences {
  modesty_level: "standard" | "conservative" | "liberal";
  cultural_tags: string[];
}

export type Gender = "male" | "female";

export interface User {
  id: string;
  email: string;
  name: string;
  gender?: Gender | null;
  body_profile?: BodyProfile | null;
  style_preferences?: StylePreferences | null;
  cultural_preferences?: CulturalPreferences | null;
  theme: string;
  auth_provider?: string;
  created_at?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  is_new_user: boolean;
}

export interface OTPSendResponse {
  message: string;
  expires_in_seconds: number;
}

export interface ProfileUpdateRequest {
  name?: string;
  gender?: Gender;
  body_profile?: BodyProfile;
  style_preferences?: StylePreferences;
  cultural_preferences?: CulturalPreferences;
  theme?: string;
}
