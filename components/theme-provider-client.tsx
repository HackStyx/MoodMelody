"use client";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeProviderClient({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Prevent rendering until after mount to avoid hydration mismatch
    return null;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
} 