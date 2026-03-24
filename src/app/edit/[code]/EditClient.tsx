"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ICouple, IMoment, MomentCategory, MomentDraft } from "@/types";
import { CATEGORIES, getCategoryById } from "@/lib/categories";
import MomentForm from "@/components/setup/MomentForm";
import ParallaxBlob from "@/components/shared/ParallaxBlob";
import { CoupleForm } from "@/components/setup/SetupWizard";

interface Props {
  couple: ICouple;
  initialMoments: IMoment[];
}

// IMoment → MomentDraft adapter so MomentForm can edit existing moments
function toDraft(m: IMoment): MomentDraft {
  return {
    id: m._id,
    category: m.category,
    customLabel: m.customLabel,
    date: m.date.slice(0, 10),
    rawDescription: m.rawDescription,
    poeticNarrative: m.poeticNarrative,
    photoPath: m.photoPath,
    photoPreview: m.photoPath,
    order: m.order,
  };
}

// ICouple → CoupleForm adapter for MomentForm (only needs names)
function toCoupleForm(c: ICouple): CoupleForm {
  return {
    partner1Name: c.partner1Name,
    partner2Name: c.partner2Name,
    startDate: c.startDate.slice(0, 10),
    bio: c.bio || "",
    theme: c.theme,
    accessCode: c.accessCode,
    pin: "",
  };
}

export default function EditClient({ couple, initialMoments }: Props) {
  const router = useRouter();
  const coupleForm = toCoupleForm(couple);

  const [moments, setMoments] = useState<IMoment[]>(initialMoments);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<MomentCategory>("first_meeting");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* ── Add new moment ── */
  async function handleAdd(draft: Omit<MomentDraft, "id" | "order">) {
    try {
      const res = await fetch("/api/moment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-code": couple.accessCode,
        },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMoments((prev) =>
        [...prev, data.moment].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )
      );
      setShowAddForm(false);
      toast.success("Memory added! ✦");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add memory");
    }
  }

  /* ── Update existing moment ── */
  async function handleUpdate(id: string, draft: Omit<MomentDraft, "id" | "order">) {
    try {
      const res = await fetch(`/api/moment/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-access-code": couple.accessCode,
        },
        body: JSON.stringify({
          ...draft,
          date: draft.date,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMoments((prev) =>
        prev
          .map((m) => (m._id === id ? { ...m, ...data.moment } : m))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      );
      setEditingId(null);
      toast.success("Memory updated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update memory");
    }
  }

  /* ── Delete moment ── */
  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/moment/${id}`, {
        method: "DELETE",
        headers: { "x-access-code": couple.accessCode },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setMoments((prev) => prev.filter((m) => m._id !== id));
      toast.success("Memory removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete memory");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: "var(--hero-gradient)" }}
    >
      <ParallaxBlob size={400} top="-5%" left="-10%" color="accent" delay={0} />
      <ParallaxBlob size={350} bottom="10%" right="-8%" color="secondary" delay={3} />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="text-3xl mb-2" style={{ color: "var(--accent-1)" }}>✦</div>
          <h1
            className="font-display text-3xl font-light"
            style={{ color: "var(--text-primary)" }}
          >
            Edit Your Story
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {couple.partner1Name} & {couple.partner2Name}
          </p>
        </motion.div>

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3 mb-6"
        >
          <button
            onClick={() => router.push(`/journey/${couple.accessCode}`)}
            className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-60"
            style={{ color: "var(--text-muted)" }}
          >
            ← Back to journey
          </button>
        </motion.div>

        <div className="space-y-4">

          {/* Existing moments */}
          <AnimatePresence>
            {moments.map((m, idx) => {
              const cat = getCategoryById(m.category);
              const label = m.category === "custom" && m.customLabel ? m.customLabel : cat.label;

              if (editingId === m._id) {
                return (
                  <motion.div
                    key={m._id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                  >
                    <MomentForm
                      couple={coupleForm}
                      initial={toDraft(m)}
                      onSave={(draft) => handleUpdate(m._id, draft)}
                      onCancel={() => setEditingId(null)}
                    />
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={m._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.04 }}
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
                          <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                            {label}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                            {new Date(m.date).toLocaleDateString("en-US", {
                              month: "long", day: "numeric", year: "numeric",
                            })}
                          </p>
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => { setShowAddForm(false); setEditingId(m._id); }}
                            className="text-xs px-2 py-1 rounded-lg transition-colors"
                            style={{ color: "var(--accent-1)", background: "var(--accent-muted)" }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(m._id)}
                            disabled={deletingId === m._id}
                            className="text-xs px-2 py-1 rounded-lg transition-colors disabled:opacity-40"
                            style={{ color: "var(--text-muted)", background: "var(--bg-secondary)" }}
                          >
                            {deletingId === m._id ? (
                              <span className="inline-block w-3 h-3 border border-current/30 border-t-current rounded-full animate-spin" />
                            ) : "✕"}
                          </button>
                        </div>
                      </div>

                      {(m.poeticNarrative || m.rawDescription) && (
                        <p className="text-xs mt-2 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                          {m.poeticNarrative || m.rawDescription}
                        </p>
                      )}

                      {m.photoPath && (
                        <div className="mt-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={m.photoPath}
                            alt={label}
                            className="h-14 w-20 object-cover rounded-lg"
                          />
                        </div>
                      )}

                      {m.poeticNarrative && (
                        <span
                          className="inline-flex items-center gap-1 mt-2 text-xs px-2 py-0.5 rounded-full"
                          style={{ background: "var(--accent-muted)", color: "var(--accent-1)" }}
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

          {/* Add form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
              >
                <MomentForm
                  couple={coupleForm}
                  defaultCategory={pendingCategory}
                  onSave={handleAdd}
                  onCancel={() => setShowAddForm(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick-add bubbles */}
          {!showAddForm && !editingId && (
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
                      onClick={() => { setPendingCategory(cat.id as MomentCategory); setShowAddForm(true); }}
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
                onClick={() => { setPendingCategory("custom"); setShowAddForm(true); }}
                className="w-full mt-3 py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  border: "2px dashed var(--border-strong)",
                  color: "var(--text-muted)",
                  background: "transparent",
                }}
              >
                + Add custom memory
              </button>
            </div>
          )}

          {/* Summary */}
          {!showAddForm && !editingId && (
            <div className="glass-card p-4 text-center">
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                ✦ {moments.length} {moments.length === 1 ? "memory" : "memories"} in your story
              </p>
              <button
                onClick={() => router.push(`/journey/${couple.accessCode}`)}
                className="btn-accent mt-4 w-full"
              >
                View Journey ♥
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
