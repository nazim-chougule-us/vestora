"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, Mail, Loader2, ArrowLeft, User } from "lucide-react";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

type Step = "email" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const { sendOTP, verifyOTP, googleAuth } = useAuth();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // ── Google Sign-In (custom button triggers popup) ─────────────
  const handleGoogleCallback = useCallback(
    async (response: { credential: string }) => {
      setError("");
      setGoogleLoading(true);
      try {
        await googleAuth(response.credential);
        router.push("/dashboard");
      } catch (err: any) {
        setError(err?.detail || err?.message || "Google sign-in failed");
      } finally {
        setGoogleLoading(false);
      }
    },
    [googleAuth, router]
  );

  const hiddenGoogleRef = useRef<HTMLDivElement>(null);

  const initGoogle = useCallback(() => {
    if (!GOOGLE_CLIENT_ID || typeof window === "undefined") return;
    const g = (window as any).google;
    if (!g?.accounts?.id) return;
    g.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCallback,
      ux_mode: "popup",
    });
    // Render a hidden real Google button for the popup flow
    if (hiddenGoogleRef.current) {
      g.accounts.id.renderButton(hiddenGoogleRef.current, {
        type: "icon",
        size: "large",
      });
    }
  }, [handleGoogleCallback]);

  useEffect(() => {
    if ((window as any).google?.accounts?.id) initGoogle();
  }, [initGoogle]);

  function handleGoogleClick() {
    // Click the hidden real Google button to trigger the popup
    const btn = hiddenGoogleRef.current?.querySelector(
      'div[role="button"]'
    ) as HTMLElement | null;
    if (btn) btn.click();
  }

  // ── OTP Send ──────────────────────────────────────────────────
  async function handleSendOTP(e?: React.FormEvent) {
    e?.preventDefault();
    if (!email) return;
    setError("");
    setLoading(true);
    try {
      const res = await sendOTP(email);
      setStep("otp");
      setCountdown(Math.floor(res.expires_in_seconds / 6));
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err?.detail || err?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  // ── OTP Input Handlers ────────────────────────────────────────
  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    const full = newOtp.join("");
    if (full.length === 6) handleVerifyOTP(full);
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) newOtp[i] = pasted[i] || "";
    setOtp(newOtp);
    if (pasted.length === 6) handleVerifyOTP(pasted);
    else otpRefs.current[pasted.length]?.focus();
  }

  // ── OTP Verify ────────────────────────────────────────────────
  async function handleVerifyOTP(code?: string) {
    const otpCode = code || otp.join("");
    if (otpCode.length !== 6) return;
    setError("");
    setLoading(true);
    try {
      await verifyOTP(email, otpCode, name, gender || undefined);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.detail || err?.message || "Invalid OTP");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      {GOOGLE_CLIENT_ID && (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={initGoogle}
        />
      )}

      {/* Hidden real Google button — must remain clickable for popup OAuth */}
      <div
        ref={hiddenGoogleRef}
        aria-hidden="true"
        style={{ position: "fixed", top: -9999, left: -9999, opacity: 0 }}
      />

      {/* Header */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-accent neon-glow">
          <Sparkles className="h-5 w-5 text-text-inverse" />
        </div>
        <h1 className="text-xl font-bold text-text-primary">
          {step === "email" ? "Sign in to Vestora" : "Check your email"}
        </h1>
        <p className="mt-0.5 text-[13px] text-text-secondary">
          {step === "email"
            ? "Your AI-powered style companion"
            : <>We sent a code to <span className="font-medium text-text-primary">{email}</span></>}
        </p>
      </div>

      {/* Card */}
      <div className="glass-card overflow-hidden p-5">
        {error && (
          <div className="mb-3 rounded-lg bg-error-muted px-3 py-2 text-[13px] text-error">
            {error}
          </div>
        )}

        {/* ── Step 1: Email + Google ─────────────────────────── */}
        {step === "email" && (
          <div className="space-y-3">
            {/* Google Button — custom styled, full width */}
            {GOOGLE_CLIENT_ID && (
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={googleLoading}
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-bg-primary py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-input disabled:opacity-50"
              >
                {googleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <GoogleIcon className="h-4.5 w-4.5" />
                )}
                Continue with Google
              </button>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Email form */}
            <form onSubmit={handleSendOTP} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  required
                  autoFocus
                  className="w-full rounded-lg border border-border bg-bg-input py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !email}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-semibold text-text-inverse transition-colors hover:bg-accent-hover disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending code...
                  </>
                ) : (
                  "Continue with Email"
                )}
              </button>
            </form>
          </div>
        )}

        {/* ── Step 2: OTP ────────────────────────────────────── */}
        {step === "otp" && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => { setStep("email"); setError(""); }}
              className="flex items-center gap-1 text-[13px] text-text-secondary transition-colors hover:text-text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Use a different email
            </button>

            {/* Name + Gender (for new accounts) */}
            <div>
              <label htmlFor="name" className="mb-1 block text-[13px] font-medium text-text-secondary">
                Your name <span className="text-text-tertiary">(new accounts)</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="How should we call you?"
                  maxLength={100}
                  className="w-full rounded-lg border border-border bg-bg-input py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">
                Gender <span className="text-text-tertiary">(for personalization)</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGender("male")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                    gender === "male"
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border bg-bg-input text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setGender("female")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                    gender === "female"
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border bg-bg-input text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Female
                </button>
              </div>
            </div>

            {/* OTP boxes */}
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">
                6-digit code
              </label>
              <div className="flex gap-1.5" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    autoFocus={i === 0}
                    className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-bg-input text-center text-base font-semibold text-text-primary transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleVerifyOTP()}
              disabled={loading || otp.join("").length !== 6}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-semibold text-text-inverse transition-colors hover:bg-accent-hover disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Sign In"
              )}
            </button>

            <p className="text-center text-[13px] text-text-tertiary">
              {countdown > 0 ? (
                <>Resend in <span className="font-medium text-text-secondary">{countdown}s</span></>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOTP()}
                  className="font-medium text-accent transition-colors hover:text-accent-hover"
                  disabled={loading}
                >
                  Resend code
                </button>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="mt-4 text-center text-[12px] text-text-tertiary">
        By continuing, you agree to Vestora&apos;s Terms of Service
      </p>
    </div>
  );
}
