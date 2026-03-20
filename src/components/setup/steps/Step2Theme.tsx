"use client";

import { motion } from "framer-motion";
import { THEMES } from "@/lib/themes";
import { ThemeId } from "@/types";
import { CoupleForm } from "../SetupWizard";

interface Props {
  couple: CoupleForm;
  updateCouple: (u: Partial<CoupleForm>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2Theme({ couple, updateCouple, onNext, onBack }: Props) {
  return (
    <div className="glass-card p-8">
      <div className="text-center mb-6">
        <span className="text-3xl">🎨</span>
        <h2
          className="font-display text-2xl font-light mt-2"
          style={{ color: "var(--text-primary)" }}
        >
          How should it feel?
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Pick the mood that captures your love
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {THEMES.map((theme) => (
          <motion.button
            key={theme.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => updateCouple({ theme: theme.id as ThemeId })}
            className="w-full rounded-2xl p-4 text-left transition-all duration-300 relative overflow-hidden"
            style={{
              background: theme.preview.bg,
              border: `2px solid ${couple.theme === theme.id ? theme.preview.accent : "transparent"}`,
              boxShadow: couple.theme === theme.id
                ? `0 0 0 3px ${theme.preview.accent}30, 0 4px 20px ${theme.preview.accent}20`
                : "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            {/* Preview strip */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: theme.preview.accent + "20", color: theme.preview.accent }}
              >
                {theme.id === "blush" ? "🌸" : theme.id === "golden" ? "✨" : theme.id === "velvet" ? "🌙" : "✂️"}
              </div>

              <div className="flex-1 min-w-0">
                <div
                  className="font-display text-lg font-normal"
                  style={{ color: theme.preview.text }}
                >
                  {theme.name}
                </div>
                <div className="text-xs mt-0.5" style={{ color: theme.preview.text + "90" }}>
                  {theme.tagline}
                </div>
              </div>

              {/* Color palette */}
              <div className="flex gap-1 flex-shrink-0">
                {[theme.preview.accent, theme.preview.line.includes("gradient") ? theme.preview.accent : theme.preview.accent, theme.preview.card].map((c, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full border border-white/30"
                    style={{ background: i === 0 ? theme.preview.accent : i === 1 ? theme.preview.bg : theme.preview.card }}
                  />
                ))}
              </div>

              {couple.theme === theme.id && (
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                  style={{ background: theme.preview.accent }}
                >
                  ✓
                </div>
              )}
            </div>

            {/* Mini timeline preview */}
            <div className="mt-3 flex items-center gap-2 px-1">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: theme.preview.accent }}
              />
              <div
                className="h-0.5 flex-1 rounded-full opacity-40"
                style={{ background: theme.preview.line }}
              />
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: theme.preview.accent }}
              />
              <div
                className="h-0.5 flex-1 rounded-full opacity-40"
                style={{ background: theme.preview.line }}
              />
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: theme.preview.accent }}
              />
            </div>
          </motion.button>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-ghost flex-1">← Back</button>
        <button onClick={onNext} className="btn-accent flex-1">Continue →</button>
      </div>
    </div>
  );
}
