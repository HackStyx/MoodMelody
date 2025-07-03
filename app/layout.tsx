import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProviderClient } from "@/components/theme-provider-client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MoodMelody - Your Personal Music Mood Diary",
  description: "MoodMelody helps you track your mood and memories through music. Discover, reflect, and relive your emotional journey with a beautiful, AI-powered music diary.",
  keywords: [
    "music diary",
    "mood tracker",
    "music journal",
    "wellness app",
    "music and mood",
    "mental health",
    "AI music app",
    "MoodMelody"
  ],
  authors: [{ name: "HackStyx", url: "https://github.com/HackStyx" }],
  creator: "HackStyx",
  metadataBase: new URL("https://moodmelody.vercel.app"),
  openGraph: {
    title: "MoodMelody – Your Personal Music Mood Diary",
    description: "Track your mood and memories through music. Discover, reflect, and relive your emotional journey with MoodMelody.",
    url: "https://moodmelody.vercel.app",
    siteName: "MoodMelody",
    images: [
      {
        url: "/favicon.svg",
        width: 1200,
        height: 630,
        alt: "MoodMelody Logo"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "MoodMelody – Your Personal Music Mood Diary",
    description: "Track your mood and memories through music. Discover, reflect, and relive your emotional journey with MoodMelody.",
    site: "@MoodMelodyApp",
    creator: "@MoodMelodyApp",
    images: [
      {
        url: "/favicon.svg",
        alt: "MoodMelody Logo"
      }
    ]
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.svg",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://moodmelody.vercel.app"
  }
};

export const viewport = {
  themeColor: "#6366F1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProviderClient>
        {children}
        </ThemeProviderClient>
      </body>
    </html>
  );
}
