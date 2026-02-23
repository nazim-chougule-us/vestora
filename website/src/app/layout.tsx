/**
 * Root layout for the Vestora landing/marketing website.
 * Sets up fonts, metadata, and the dark futuristic theme.
 */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vestora — Your Personal Style Intelligence",
  description:
    "AI-powered fashion operating system that digitizes your wardrobe, understands your style DNA, and generates hyper-realistic try-on visuals.",
  keywords: [
    "AI fashion",
    "wardrobe",
    "style intelligence",
    "virtual try-on",
    "outfit recommendation",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
        style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
      >
        {children}
      </body>
    </html>
  );
}
