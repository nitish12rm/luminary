"use client";

import { useEffect } from "react";
import { ThemeId } from "@/types";

interface ThemeProviderProps {
  theme: ThemeId;
  /** If provided, checks localStorage for a per-couple theme override on mount */
  coupleId?: string;
  children: React.ReactNode;
}

export function themeStorageKey(coupleId: string) {
  return `luminary_theme_${coupleId}`;
}

export default function ThemeProvider({ theme, coupleId, children }: ThemeProviderProps) {
  useEffect(() => {
    // Restore per-couple localStorage override if it exists
    const stored = coupleId
      ? (localStorage.getItem(themeStorageKey(coupleId)) as ThemeId | null)
      : null;

    const VALID: ThemeId[] = ["blush", "golden", "velvet"];
    const active = stored && VALID.includes(stored) ? stored : theme;

    document.documentElement.setAttribute("data-theme", active);

    return () => {
      document.documentElement.setAttribute("data-theme", "blush");
    };
  }, [theme, coupleId]);

  return <>{children}</>;
}
