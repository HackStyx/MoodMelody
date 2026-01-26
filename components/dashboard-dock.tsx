"use client";
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Custom Dashboard Icon - Modern analytics dashboard
const DashboardIcon = ({ className, isActive }: { className?: string; isActive?: boolean }) => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="dashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={isActive ? "#6366F1" : "#8B5CF6"} />
        <stop offset="100%" stopColor={isActive ? "#8B5CF6" : "#A78BFA"} />
      </linearGradient>
      <linearGradient id="dashChart1" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#EC4899" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#F472B6" stopOpacity="0.4" />
      </linearGradient>
      <linearGradient id="dashChart2" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.4" />
      </linearGradient>
    </defs>
    {/* Dashboard base */}
    <rect x="3" y="3" width="18" height="18" rx="2" fill="url(#dashGrad)" opacity={isActive ? 1 : 0.7} />
    {/* Chart bars */}
    <rect x="6" y="14" width="2" height="5" rx="1" fill="url(#dashChart1)" />
    <rect x="9" y="11" width="2" height="8" rx="1" fill="url(#dashChart2)" />
    <rect x="12" y="9" width="2" height="10" rx="1" fill="url(#dashChart1)" />
    <rect x="15" y="12" width="2" height="7" rx="1" fill="url(#dashChart2)" />
    {/* Grid lines */}
    <line x1="6" y1="10" x2="18" y2="10" stroke="white" strokeWidth="0.5" opacity="0.3" />
    <line x1="6" y1="7" x2="18" y2="7" stroke="white" strokeWidth="0.5" opacity="0.3" />
    {/* Pulse indicator */}
    {isActive && (
      <circle cx="20" cy="5" r="2" fill="#10B981">
        <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
      </circle>
    )}
  </svg>
);

// Custom Mood History Icon - Timeline with emotions
const MoodHistoryIcon = ({ className, isActive }: { className?: string; isActive?: boolean }) => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="histGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={isActive ? "#EC4899" : "#F472B6"} />
        <stop offset="100%" stopColor={isActive ? "#F472B6" : "#FB7185"} />
      </linearGradient>
      <radialGradient id="emotGlow">
        <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#F59E42" stopOpacity="0.3" />
      </radialGradient>
    </defs>
    {/* Timeline line */}
    <path d="M4 12 L20 12" stroke="url(#histGrad)" strokeWidth="2" strokeLinecap="round" opacity={isActive ? 1 : 0.6} />
    {/* Timeline points with emotions */}
    <circle cx="7" cy="12" r="3" fill="url(#emotGlow)" opacity={isActive ? 1 : 0.7}>
      <animate attributeName="r" values="3;3.5;3" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="12" cy="12" r="2.5" fill="url(#emotGlow)" opacity={isActive ? 1 : 0.6}>
      <animate attributeName="r" values="2.5;3;2.5" dur="2.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="17" cy="12" r="3" fill="url(#emotGlow)" opacity={isActive ? 1 : 0.7}>
      <animate attributeName="r" values="3;3.5;3" dur="2.2s" repeatCount="indefinite" />
    </circle>
    {/* Chart line above */}
    <path d="M5 6 Q8 4, 11 6 T17 6" stroke="url(#histGrad)" strokeWidth="1.5" fill="none" opacity={isActive ? 0.6 : 0.4} />
  </svg>
);

// Custom Profile Icon - Modern user with gradient
const ProfileIcon = ({ className, isActive }: { className?: string; isActive?: boolean }) => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="profGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={isActive ? "#F59E42" : "#FBBF24"} />
        <stop offset="100%" stopColor={isActive ? "#F97316" : "#FB923C"} />
      </linearGradient>
      <radialGradient id="profGlow" cx="50%" cy="30%">
        <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#F59E42" stopOpacity="0.2" />
      </radialGradient>
    </defs>
    {/* Head */}
    <circle cx="12" cy="9" r="4" fill="url(#profGrad)" opacity={isActive ? 1 : 0.7} />
    {/* Body */}
    <path d="M6 20 C6 16, 8.5 14, 12 14 C15.5 14, 18 16, 18 20" 
          stroke="url(#profGrad)" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          fill="none"
          opacity={isActive ? 1 : 0.7} />
    {/* Glow effect */}
    {isActive && (
      <circle cx="12" cy="9" r="5" fill="url(#profGlow)" opacity="0.5">
        <animate attributeName="r" values="5;6;5" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0.3;0.5" dur="3s" repeatCount="indefinite" />
      </circle>
    )}
  </svg>
);

// Awesome Theme Toggle - Similar style to Logout Icon
const ThemeToggleIcon = ({ isDark, className }: { isDark: boolean; className?: string }) => (
  <motion.div
    className={`flex items-center justify-center w-full h-full ${className}`}
    animate={{ 
      rotate: isDark ? [0, -10, 10, 0] : [0, 10, -10, 0],
      scale: [1, 1.05, 1]
    }}
    transition={{ duration: 0.4, ease: "easeInOut" }}
  >
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="themeSunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="50%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E42" />
        </linearGradient>
        <linearGradient id="themeMoonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C4B5FD" />
          <stop offset="50%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <radialGradient id="themeGlow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#FEE2E2" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#EF4444" stopOpacity="0.2" />
        </radialGradient>
      </defs>
      {isDark ? (
        // Beautiful Moon with stars - similar to logout door style
        <g>
          {/* Moon circle - similar to door frame */}
          <circle cx="12" cy="12" r="7" fill="url(#themeMoonGrad)" opacity="0.9" />
          {/* Crescent shadow for depth */}
          <ellipse cx="10" cy="12" rx="5" ry="7" fill="url(#themeMoonGrad)" opacity="0.5" />
          {/* Stars - similar to door handle animation */}
          <circle cx="15" cy="8" r="1.2" fill="#FEF3C7" opacity="1">
            <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
            <animate attributeName="r" values="1.2;1.5;1.2" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="18" cy="10" r="0.9" fill="#FEF3C7" opacity="0.9">
            <animate attributeName="opacity" values="0.9;0.3;0.9" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="16" cy="14" r="0.7" fill="#FEF3C7" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="19" cy="15" r="0.6" fill="#FEF3C7" opacity="0.7">
            <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2.2s" repeatCount="indefinite" />
          </circle>
          {/* Glow effect - similar to logout glow */}
          <circle cx="12" cy="12" r="9" fill="url(#themeGlow)" opacity="0.3">
            <animate attributeName="r" values="9;10;9" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0.5;0.3" dur="3s" repeatCount="indefinite" />
          </circle>
        </g>
      ) : (
        // Beautiful Sun with rays - similar to logout door style
        <g>
          {/* Sun circle - similar to door frame */}
          <circle cx="12" cy="12" r="6.5" fill="url(#themeSunGrad)" opacity="0.9" />
          {/* Inner bright core */}
          <circle cx="12" cy="12" r="4" fill="#FEF3C7" opacity="0.8">
            <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
          </circle>
          {/* Sun rays - similar to door structure */}
          <g stroke="url(#themeSunGrad)" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="2" x2="12" y2="4.5" />
            <line x1="12" y1="19.5" x2="12" y2="22" />
            <line x1="2" y1="12" x2="4.5" y2="12" />
            <line x1="19.5" y1="12" x2="22" y2="12" />
            <line x1="5.66" y1="5.66" x2="7.42" y2="7.42" />
            <line x1="16.58" y1="16.58" x2="18.34" y2="18.34" />
            <line x1="5.66" y1="18.34" x2="7.42" y2="16.58" />
            <line x1="16.58" y1="7.42" x2="18.34" y2="5.66" />
          </g>
          {/* Pulsing center - similar to door handle */}
          <circle cx="12" cy="12" r="2.5" fill="#FFF9E6">
            <animate attributeName="opacity" values="0.9;0.6;0.9" dur="2s" repeatCount="indefinite" />
          </circle>
          {/* Glow effect - similar to logout glow */}
          <circle cx="12" cy="12" r="9" fill="url(#themeGlow)" opacity="0.3">
            <animate attributeName="r" values="9;10.5;9" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0.5;0.3" dur="2.5s" repeatCount="indefinite" />
          </circle>
        </g>
      )}
    </svg>
  </motion.div>
);

// Awesome Custom Logout Icon
const LogoutIcon = ({ className }: { className?: string }) => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="logoutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#EF4444" />
        <stop offset="50%" stopColor="#DC2626" />
        <stop offset="100%" stopColor="#B91C1C" />
      </linearGradient>
      <linearGradient id="logoutArrowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FCA5A5" />
        <stop offset="100%" stopColor="#EF4444" />
      </linearGradient>
      <radialGradient id="logoutGlow" cx="50%" cy="50%">
        <stop offset="0%" stopColor="#FEE2E2" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#EF4444" stopOpacity="0.2" />
      </radialGradient>
    </defs>
    {/* Door frame */}
    <rect x="4" y="3" width="10" height="18" rx="2" fill="url(#logoutGrad)" opacity="0.9" />
    {/* Door handle */}
    <circle cx="11" cy="12" r="1.5" fill="white" opacity="0.9">
      <animate attributeName="opacity" values="0.9;0.6;0.9" dur="2s" repeatCount="indefinite" />
    </circle>
    {/* Exit arrow */}
    <path d="M16 8 L20 12 L16 16" stroke="url(#logoutArrowGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <line x1="20" y1="12" x2="22" y2="12" stroke="url(#logoutArrowGrad)" strokeWidth="2.5" strokeLinecap="round" />
    {/* Glow effect */}
    <circle cx="12" cy="12" r="9" fill="url(#logoutGlow)" opacity="0.3">
      <animate attributeName="r" values="9;10;9" dur="3s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.3;0.5;0.3" dur="3s" repeatCount="indefinite" />
    </circle>
  </svg>
);

export default function DashboardDock({ onSignOut }: { onSignOut?: () => void }) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogoutConfirm = () => {
    setShowLogoutDialog(false);
    if (onSignOut) {
      onSignOut();
    }
  };

  const navItems = [
    { 
      href: "/dashboard", 
      label: "Dashboard",
      isActive: pathname === "/dashboard"
    },
    { 
      href: "/dashboard/mood-history", 
      label: "Mood History",
      isActive: pathname === "/dashboard/mood-history"
    },
    { 
      href: "/dashboard/profile", 
      label: "Profile",
      isActive: pathname === "/dashboard/profile"
    },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4">
      <Dock className="bg-background/80 backdrop-blur-lg border border-border shadow-xl">
        {/* Logo Item */}
        <DockItem>
          <DockIcon>
            <Link href="/dashboard" className="flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 drop-shadow-lg">
                <defs>
                  <radialGradient id="badgeGlowDock" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor="#A5B4FC" stopOpacity="0.7" />
                    <stop offset="60%" stopColor="#6366F1" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#312E81" stopOpacity="0.3" />
                  </radialGradient>
                  <linearGradient id="bookGradientDock" x1="10" y1="10" x2="34" y2="34" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FDE68A" />
                    <stop offset="1" stopColor="#F59E42" />
                  </linearGradient>
                  <linearGradient id="noteGradientDock" x1="28" y1="14" x2="36" y2="34" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F472B6" />
                    <stop offset="1" stopColor="#7C3AED" />
                  </linearGradient>
                </defs>
                <circle cx="22" cy="22" r="20" fill="url(#badgeGlowDock)" />
                <g>
                  <rect x="11" y="13" width="10" height="18" rx="3" fill="url(#bookGradientDock)" stroke="#fff" strokeWidth="1.5" />
                  <rect x="23" y="13" width="10" height="18" rx="3" fill="#fff" fillOpacity="0.95" stroke="#fff" strokeWidth="1.5" />
                  <rect x="20.5" y="13" width="3" height="18" rx="1.2" fill="#F59E42" fillOpacity="0.7" />
                  <line x1="14" y1="18" x2="19" y2="18" stroke="#F59E42" strokeWidth="0.8" opacity="0.5" />
                  <line x1="14" y1="22" x2="19" y2="22" stroke="#F59E42" strokeWidth="0.8" opacity="0.3" />
                  <line x1="14" y1="26" x2="19" y2="26" stroke="#F59E42" strokeWidth="0.8" opacity="0.2" />
                </g>
                <g filter="url(#shadowDock)">
                  <path d="M32 16V29A3 3 0 1 1 28 26" stroke="url(#noteGradientDock)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="28" cy="29" r="2.2" fill="url(#noteGradientDock)" />
                  <rect x="32" y="13" width="2.5" height="5" rx="1.2" fill="url(#noteGradientDock)" />
                </g>
                <filter id="shadowDock" x="0" y="0" width="44" height="44" filterUnits="userSpaceOnUse">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#7C3AED" floodOpacity="0.25" />
                </filter>
              </svg>
            </Link>
          </DockIcon>
          <DockLabel>MoodMelody</DockLabel>
        </DockItem>

        {/* Navigation Items */}
        {navItems.map((item) => {
          let IconComponent;
          if (item.href === "/dashboard") {
            IconComponent = DashboardIcon;
          } else if (item.href === "/dashboard/mood-history") {
            IconComponent = MoodHistoryIcon;
          } else if (item.href === "/dashboard/profile") {
            IconComponent = ProfileIcon;
          }
          
          return (
            <DockItem key={item.href}>
              <DockIcon>
                <Link 
                  href={item.href}
                  className="flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  {IconComponent && <IconComponent isActive={item.isActive} className="w-10 h-10" />}
                </Link>
              </DockIcon>
              <DockLabel>{item.label}</DockLabel>
            </DockItem>
          );
        })}

        {/* Theme Toggle */}
        <DockItem>
          <DockIcon>
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
            >
              <ThemeToggleIcon isDark={isDark} className="w-10 h-10" />
            </button>
          </DockIcon>
          <DockLabel>{isDark ? "Light Mode" : "Dark Mode"}</DockLabel>
        </DockItem>

        {/* Sign Out Button */}
        {onSignOut && (
          <>
            <DockItem>
              <DockIcon>
                <button
                  onClick={() => setShowLogoutDialog(true)}
                  className="flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
                >
                  <LogoutIcon className="w-10 h-10" />
                </button>
              </DockIcon>
              <DockLabel>Sign Out</DockLabel>
            </DockItem>

            {/* Logout Confirmation Dialog */}
            <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
              <DialogContent className="bg-background/95 backdrop-blur-lg border border-border shadow-xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">Sign Out</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Are you sure you want to sign out? You'll need to sign in again to access your mood tracking data.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    variant="outline"
                    onClick={() => setShowLogoutDialog(false)}
                    className="border-border hover:bg-accent"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleLogoutConfirm}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Sign Out
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </Dock>
    </div>
  );
}
