"use client";

import { useEffect } from "react";
import { ThemeId } from "@/types";

interface ThemeProviderProps {
  theme: ThemeId;
  children: React.ReactNode;
}

export default function ThemeProvider({ theme, children }: ThemeProviderProps) {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    return () => {
      document.documentElement.setAttribute("data-theme", "blush");
    };
  }, [theme]);

  return <>{children}</>;
}
