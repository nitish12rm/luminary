"use client";

import { motion } from "framer-motion";

export type LayoutId = "editorial" | "story" | "chapters";

interface LayoutOption {
  id: LayoutId;
  label: string;
  icon: string;
  desc: string;
}

const OPTIONS: LayoutOption[] = [
  { id: "editorial", label: "Editorial", icon: "✦", desc: "Clean text-reveal columns" },
  { id: "story",     label: "Story",     icon: "◎", desc: "Sticky split scrollytelling" },
  { id: "chapters",  label: "Chapters",  icon: "◗", desc: "Grouped by year" },
];

interface Props {
  active: LayoutId;
  onChange: (id: LayoutId) => void;
}

export default function LayoutPicker({ active, onChange }: Props) {
  return (
    <div className="flex justify-center mb-14 px-4">
      <div
        className="inline-flex items-center gap-1 p-1.5 rounded-full"
        style={{
          background: "var(--bg-card)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "var(--shadow-card)",
        }}
        role="tablist"
        aria-label="Choose timeline layout"
      >
        {OPTIONS.map((opt) => {
          const isActive = opt.id === active;
          return (
            <motion.button
              key={opt.id}
              role="tab"
              aria-selected={isActive}
              aria-label={`${opt.label}: ${opt.desc}`}
              onClick={() => onChange(opt.id)}
              className="relative rounded-full px-4 py-2 flex items-center gap-2 transition-colors focus-visible:outline-none"
              style={{ color: isActive ? "white" : "var(--text-muted)" }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.2 }}
            >
              {/* Active pill background */}
              {isActive && (
                <motion.span
                  layoutId="layout-pill"
                  className="absolute inset-0 rounded-full"
                  style={{ background: "var(--accent-1)" }}
                  transition={{ type: "spring", stiffness: 340, damping: 30 }}
                />
              )}

              <span
                className="relative z-10"
                style={{ fontSize: "0.85rem", lineHeight: 1 }}
              >
                {opt.icon}
              </span>
              <span
                className="relative z-10 hidden sm:inline"
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  whiteSpace: "nowrap",
                }}
              >
                {opt.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
