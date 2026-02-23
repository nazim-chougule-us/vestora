/**
 * Vestora Frontend — useAuth hook.
 * OTP-based login + Google OAuth. No passwords.
 */

"use client";

import { useCallback, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { authService } from "@/services/authService";

export function useAuth() {
  const { user, isAuthenticated, isLoading, login, logout, setUser, setLoading } =
    useAuthStore();

  /** Fetch current user on mount if token exists */
  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;

    if (token && !user) {
      authService
        .getMe()
        .then((u) => {
          setUser(u);
          setLoading(false);
        })
        .catch(() => {
          logout();
        });
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Send OTP to email */
  const sendOTP = useCallback(async (email: string) => {
    return authService.sendOTP(email);
  }, []);

  /** Verify OTP and authenticate */
  const verifyOTP = useCallback(
    async (email: string, otp: string, name?: string, gender?: string) => {
      const res = await authService.verifyOTP(email, otp, name, gender);
      const me = await authService.getMe();
      login(me, res.access_token, res.refresh_token);
      return { user: me, isNewUser: res.is_new_user };
    },
    [login]
  );

  /** Authenticate with Google */
  const googleAuth = useCallback(
    async (idToken: string) => {
      const res = await authService.googleAuth(idToken);
      const me = await authService.getMe();
      login(me, res.access_token, res.refresh_token);
      return { user: me, isNewUser: res.is_new_user };
    },
    [login]
  );

  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout API errors
    }
    logout();
  }, [logout]);

  return {
    user,
    isAuthenticated,
    isLoading,
    sendOTP,
    verifyOTP,
    googleAuth,
    logout: handleLogout,
  };
}
