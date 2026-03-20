"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { CATEGORIES, getCategoryById } from "@/lib/categories";
import { MomentDraft, MomentCategory } from "@/types";
import { CoupleForm } from "../SetupWizard";
import MomentForm from "../MomentForm";
import { v4 as uuidv4 } from "uuid";

interface Props {
  couple: CoupleForm;
  moments: MomentDraft[];
  setMoments: (m: MomentDraft[]) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}

export default function Step4Moments({
  couple,
  moments,
  setMoments,
  onBack,
  onSubmit,
  submitting,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<MomentCategory>("first_meeting");
  const [editingId, setEditingId] = useState<string | null>(null);

  function addMoment(draft: Omit<MomentDraft, "id" | "order">) {
    const newMoment: MomentDraft = {
      ...draft,
      id: uuidv4(),
      order: moments.length,
    };
    setMoments([...moments, newMoment]);
    setShowForm(false);
    toast.success("Memory added! ✦");
  }

  function updateMoment(id: string, draft: Omit<MomentDraft, "id" | "order">) {
    setMoments(moments.map((m) => (m.id === id ? { ...m, ...draft } : m)));
    setEditingId(null);
    toast.success("Memory updated!");
  }

  function deleteMoment(id: string) {
    setMoments(moments.filter((m) => m.id !== id).map((m, i) => ({ ...m, order: i })));
  }

  const sortedMoments = [...moments].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="glass-card p-6 text-center">
        <span className="text-3xl">📸</span>
        <h2
          className="font-display text-2xl font-light mt-2"
          style={{ color: "var(--text-primary)" }}
        >
          Your memories
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Add the moments that shaped your story
        </p>
      </div>

      {/* Moments list */}
      {sortedMoments.length > 0 && (
        <div className="space-y-3">
          <AnimatePresence>
            {sortedMoments.map((m, idx) => {
              const cat = getCategoryById(m.category);
              if (editingId === m.id) {
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                  >
                    <MomentForm
                      couple={couple}
                      initial={m}
                      onSave={(draft) => updateMoment(m.id, draft)}
                      onCancel={() => setEditingId(null)}
                    />
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card p-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: "var(--accent-muted)" }}
                    >
                      {cat.emoji}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p
                            className="font-medium text-sm"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {m.category === "custom" && m.customLabel
                              ? m.customLabel
                              : cat.label}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                            {new Date(m.date).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => setEditingId(m.id)}
                            className="text-xs px-2 py-1 rounded-lg transition-colors"
                            style={{
                              color: "var(--accent-1)",
                              background: "var(--accent-muted)",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteMoment(m.id)}
                            className="text-xs px-2 py-1 rounded-lg transition-colors"
                            style={{
                              color: "var(--text-muted)",
                              background: "var(--bg-secondary)",
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {(m.poeticNarrative || m.rawDescription) && (
                        <p
                          className="text-xs mt-2 line-clamp-2"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {m.poeticNarrative || m.rawDescription}
                        </p>
                      )}

                      {m.photoPreview && (
                        <div className="mt-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={m.photoPreview}
                            alt="moment"
                            className="h-14 w-20 object-cover rounded-lg"
                          />
                        </div>
                      )}

                      {m.poeticNarrative && (
                        <span
                          className="inline-flex items-center gap-1 mt-2 text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: "var(--accent-muted)",
                            color: "var(--accent-1)",
                          }}
                        >
                          ✦ AI enhanced
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add new moment form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
          >
            <MomentForm
              couple={couple}
              defaultCategory={pendingCategory}
              onSave={addMoment}
              onCancel={() => setShowForm(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick-add buttons */}
      {!showForm && !editingId && (
        <div className="glass-card p-4">
          <p
            className="text-xs font-medium mb-3 tracking-wide"
            style={{ color: "var(--text-secondary)" }}
          >
            Add a milestone
          </p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const alreadyAdded = moments.some(
                (m) => m.category === cat.id && cat.id !== "custom"
              );
              return (
                <button
                  key={cat.id}
                  onClick={() => { setPendingCategory(cat.id as MomentCategory); setShowForm(true); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all"
                  style={{
                    background: alreadyAdded ? "var(--accent-muted)" : "var(--bg-secondary)",
                    border: `1px solid ${alreadyAdded ? "var(--accent-1)" : "var(--border-subtle)"}`,
                    color: alreadyAdded ? "var(--accent-1)" : "var(--text-secondary)",
                    opacity: alreadyAdded ? 0.7 : 1,
                  }}
                >
                  {cat.emoji} {cat.label}
                  {alreadyAdded && " ✓"}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => { setPendingCategory("custom"); setShowForm(true); }}
            className="w-full mt-3 py-3 rounded-xl text-sm font-medium transition-all"
            style={{
              border: `2px dashed var(--border-strong)`,
              color: "var(--text-muted)",
              background: "transparent",
            }}
          >
            + Add custom memory
          </button>
        </div>
      )}

      {/* Submit */}
      {!showForm && !editingId && (
        <div className="glass-card p-4">
          {moments.length === 0 ? (
            <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
              Add at least one memory to continue
            </p>
          ) : (
            <p className="text-center text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              ✦ {moments.length} {moments.length === 1 ? "memory" : "memories"} added
            </p>
          )}

          <div className="flex gap-3">
            <button onClick={onBack} className="btn-ghost flex-1">← Back</button>
            <button
              onClick={onSubmit}
              disabled={moments.length === 0 || submitting}
              className="btn-accent flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating...
                </span>
              ) : (
                "Publish Our Story ♥"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
