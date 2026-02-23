/**
 * Vestora Frontend — Auth service.
 * OTP-based login + Google OAuth. No passwords.
 */

import { api } from "./api";
import type { User, TokenResponse, OTPSendResponse } from "@/types/user";

export const authService = {
  /** Send a 6-digit OTP to the user's email */
  sendOTP: (email: string) =>
    api.post<OTPSendResponse>("/auth/otp/send", { email }),

  /** Verify OTP and get tokens (creates account if new user) */
  verifyOTP: (email: string, otp: string, name?: string, gender?: string) =>
    api.post<TokenResponse>("/auth/otp/verify", { email, otp, name: name || "", gender: gender || null }),

  /** Authenticate with Google ID token */
  googleAuth: (idToken: string) =>
    api.post<TokenResponse>("/auth/google", { id_token: idToken }),

  /** Refresh tokens */
  refreshTokens: (refreshToken: string) =>
    api.post<TokenResponse>("/auth/refresh", { refresh_token: refreshToken }),

  logout: () => api.post<{ message: string }>("/auth/logout"),

  getMe: () => api.get<User>("/auth/me"),
};
