"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { THEMES } from "@/lib/themes";
import { ThemeId, ICouple } from "@/types";
import { themeStorageKey } from "./ThemeProvider";
import ShareCard from "./ShareCard";

interface Props {
  defaultTheme: ThemeId;
  coupleId: string;
  couple?: ICouple;
  totalMoments?: number;
}

const THEME_EMOJIS: Record<ThemeId, string> = {
  blush:     "🌸",
  golden:    "✨",
  velvet:    "🌙",
  scrapbook: "✂️",
};

const EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function ThemeSwitcher({ defaultTheme, coupleId, couple, totalMoments }: Props) {
  const [open,      setOpen]      = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [active,    setActive]    = useState<ThemeId>(defaultTheme);
  const panelRef = useRef<HTMLDivElement>(null);

  // Sync with whatever ThemeProvider restored from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(themeStorageKey(coupleId)) as ThemeId | null;
    const VALID: ThemeId[] = ["blush", "golden", "velvet", "scrapbook"];
    if (stored && VALID.includes(stored)) setActive(stored);
  }, [coupleId]);

  // Close theme panel on outside click
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Close share modal on Escape
  useEffect(() => {
    if (!shareOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setShareOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shareOpen]);

  function pick(id: ThemeId) {
    setActive(id);
    document.documentElement.setAttribute("data-theme", id);
    localStorage.setItem(themeStorageKey(coupleId), id);
    setOpen(false);
  }

  const current = THEMES.find((t) => t.id === active) ?? THEMES[0];

  return (
    <>
    <div ref={panelRef} className="fixed bottom-6 right-5 z-50 flex flex-col items-end gap-3">

      {/* ── Theme panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: 12, scale: 0.92 }}
            transition={{ duration: 0.28, ease: EXPO }}
            className="glass-card-strong overflow-hidden"
            style={{ width: 230, paddingBottom: 6 }}
          >
            {/* Header */}
            <div
              className="px-4 pt-4 pb-3 mb-1"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <p
                className="uppercase"
                style={{ fontSize: "9px", letterSpacing: "0.28em", color: "var(--text-muted)" }}
              >
                Choose a vibe
              </p>
            </div>

            {/* Theme options */}
            {THEMES.map((theme, i) => {
              const isActive = theme.id === active;
              return (
                <motion.button
                  key={theme.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.22, delay: i * 0.04, ease: EXPO }}
                  onClick={() => pick(theme.id as ThemeId)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left"
                  style={{
                    background: isActive ? theme.preview.accent + "14" : "transparent",
                  }}
                >
                  {/* Accent swatch with active ring */}
                  <div
                    className="w-6 h-6 rounded-full flex-shrink-0 transition-all duration-200"
                    style={{
                      background:  theme.preview.accent,
                      boxShadow:   isActive
                        ? `0 0 0 2px var(--bg-card), 0 0 0 4px ${theme.preview.accent}`
                        : "none",
                    }}
                  />

                  {/* Labels */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-medium leading-tight"
                      style={{ fontSize: "13px", color: "var(--text-primary)" }}
                    >
                      {THEME_EMOJIS[theme.id as ThemeId]}{" "}
                      {theme.name}
                    </p>
                    <p
                      className="leading-tight mt-0.5 truncate"
                      style={{ fontSize: "10.5px", color: "var(--text-muted)" }}
                    >
                      {theme.tagline}
                    </p>
                  </div>

                  {/* Check */}
                  {isActive && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="text-xs flex-shrink-0"
                      style={{ color: theme.preview.accent }}
                    >
                      ✓
                    </motion.span>
                  )}
                </motion.button>
              );
            })}

            {/* Reset to original */}
            {active !== defaultTheme && (
              <div className="px-4 pt-2 pb-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                <button
                  onClick={() => pick(defaultTheme)}
                  className="w-full text-center transition-opacity hover:opacity-70"
                  style={{ fontSize: "10.5px", color: "var(--text-muted)" }}
                >
                  Reset to original theme
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Theme trigger button ── */}
      <motion.button
        whileHover={{ scale: 1.1  }}
        whileTap={{   scale: 0.92 }}
        onClick={() => setOpen((v) => !v)}
        aria-label="Change theme"
        aria-expanded={open}
        className="w-11 h-11 rounded-full flex items-center justify-center text-white transition-shadow"
        style={{
          background:  current.preview.accent,
          boxShadow:   open
            ? `0 0 0 3px var(--bg-primary), 0 0 0 5px ${current.preview.accent}, 0 8px 24px ${current.preview.accent}55`
            : `0 4px 18px ${current.preview.accent}66`,
        }}
      >
        <motion.span
          animate={{ rotate: open ? 30 : 0 }}
          transition={{ duration: 0.3, ease: EXPO }}
          style={{ fontSize: "1.2rem", display: "block", lineHeight: 1 }}
        >
          🎨
        </motion.span>
      </motion.button>

      {/* ── Share button ── */}
      {couple && (
        <motion.button
          whileHover={{ scale: 1.1  }}
          whileTap={{   scale: 0.92 }}
          onClick={() => setShareOpen(true)}
          aria-label="Share journey card"
          className="w-11 h-11 rounded-full flex items-center justify-center transition-shadow"
          style={{
            background: "var(--bg-card)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid var(--border-subtle)",
            boxShadow: "var(--shadow-card)",
            color: "var(--text-secondary)",
          }}
        >
          {/* Share icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </motion.button>
      )}

    </div>

    {/* ── Share modal (full-screen overlay) ── */}
    {couple && shareOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
        onClick={() => setShareOpen(false)}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col items-center w-full max-w-xl"
        >
          <div className="w-full mb-3 flex justify-between items-center">
            <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
              Share your journey
            </p>
            <button
              onClick={() => setShareOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              ✕
            </button>
          </div>
          <ShareCard couple={couple} totalMoments={totalMoments ?? 0} />
        </motion.div>
      </motion.div>
    )}
    </>
  );
}
