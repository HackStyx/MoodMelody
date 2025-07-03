"use client";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import React from "react";

export default function DashboardNavbar({ onSignOut }: { onSignOut?: () => void }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/mood-history", label: "Mood History" },
    { href: "/dashboard/profile", label: "Profile" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="fixed top-0 left-0 z-40 w-full md:top-6 md:left-1/2 md:w-auto md:max-w-3xl md:transform md:-translate-x-1/2 flex justify-center animate-navbar-fade-in px-0 md:px-0">
      <nav className="flex items-center justify-between w-full gap-x-4 md:gap-x-8 px-2 py-2 md:px-8 md:py-3 rounded-none md:rounded-2xl border-b md:border md:border-border bg-background/80 md:bg-background/70 shadow-none md:shadow-xl md:shadow-black/10 backdrop-blur-lg ring-0 md:ring-1 md:ring-black/5 md:dark:ring-white/10 transition-all duration-300">
        <div className="flex items-center gap-2 md:gap-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex items-center gap-2 font-serif italic tracking-tight text-lg md:text-2xl">
              <svg width="32" height="32" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-9 md:w-9 drop-shadow-lg">
                <defs>
                  <radialGradient id="badgeGlowDash" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor="#A5B4FC" stopOpacity="0.7" />
                    <stop offset="60%" stopColor="#6366F1" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#312E81" stopOpacity="0.3" />
                  </radialGradient>
                  <linearGradient id="bookGradientDash" x1="10" y1="10" x2="34" y2="34" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FDE68A" />
                    <stop offset="1" stopColor="#F59E42" />
                  </linearGradient>
                  <linearGradient id="noteGradientDash" x1="28" y1="14" x2="36" y2="34" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F472B6" />
                    <stop offset="1" stopColor="#7C3AED" />
                  </linearGradient>
                </defs>
                <circle cx="22" cy="22" r="20" fill="url(#badgeGlowDash)" />
                <g>
                  <rect x="11" y="13" width="10" height="18" rx="3" fill="url(#bookGradientDash)" stroke="#fff" strokeWidth="1.5" />
                  <rect x="23" y="13" width="10" height="18" rx="3" fill="#fff" fillOpacity="0.95" stroke="#fff" strokeWidth="1.5" />
                  <rect x="20.5" y="13" width="3" height="18" rx="1.2" fill="#F59E42" fillOpacity="0.7" />
                  <line x1="14" y1="18" x2="19" y2="18" stroke="#F59E42" strokeWidth="0.8" opacity="0.5" />
                  <line x1="14" y1="22" x2="19" y2="22" stroke="#F59E42" strokeWidth="0.8" opacity="0.3" />
                  <line x1="14" y1="26" x2="19" y2="26" stroke="#F59E42" strokeWidth="0.8" opacity="0.2" />
                </g>
                <g filter="url(#shadowDash)">
                  <path d="M32 16V29A3 3 0 1 1 28 26" stroke="url(#noteGradientDash)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="28" cy="29" r="2.2" fill="url(#noteGradientDash)" />
                  <rect x="32" y="13" width="2.5" height="5" rx="1.2" fill="url(#noteGradientDash)" />
                </g>
                <filter id="shadowDash" x="0" y="0" width="44" height="44" filterUnits="userSpaceOnUse">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#7C3AED" floodOpacity="0.25" />
                </filter>
              </svg>
              <span>MoodMelody</span>
            </span>
          </Link>
        </div>
        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className={`font-medium transition-all duration-200 relative ${
                isActive(item.href)
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-accent-foreground"
              }`}
            >
              {item.label}
              {isActive(item.href) && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full animate-in slide-in-from-left duration-200" />
              )}
            </Link>
          ))}
        </div>
        {/* Theme toggle and sign out */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {onSignOut && (
            <Button variant="outline" size="sm" onClick={onSignOut} className="ml-2">Sign Out</Button>
          )}
          {/* Mobile menu button */}
          <button className="flex md:hidden ml-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle Menu">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>
      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background/95 border-b border-border px-4 pb-4 pt-2 rounded-b-2xl shadow-xl animate-navbar-fade-in z-50">
          {navItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className={`block py-2 font-medium transition-all duration-200 ${
                isActive(item.href)
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-accent-foreground"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
              {isActive(item.href) && (
                <span className="inline-block ml-2 w-1.5 h-1.5 bg-primary rounded-full" />
              )}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
} 