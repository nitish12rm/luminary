"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { CATEGORIES } from "@/lib/categories";
import { MomentDraft, MomentCategory } from "@/types";
import { CoupleForm } from "./SetupWizard";
import { formatDate } from "@/lib/utils";

interface Props {
  couple: CoupleForm;
  initial?: MomentDraft;
  defaultCategory?: MomentCategory;
  onSave: (draft: Omit<MomentDraft, "id" | "order">) => void;
  onCancel: () => void;
}

export default function MomentForm({ couple, initial, defaultCategory, onSave, onCancel }: Props) {
  const [category, setCategory] = useState<MomentCategory>(initial?.category || defaultCategory || "first_meeting");
  const [customLabel, setCustomLabel] = useState(initial?.customLabel || "");
  const [date, setDate] = useState(initial?.date || "");
  const [rawDescription, setRawDescription] = useState(initial?.rawDescription || "");
  const [poeticNarrative, setPoeticNarrative] = useState(initial?.poeticNarrative || "");
  const [photoPath, setPhotoPath] = useState(initial?.photoPath || "");
  const [photoPreview, setPhotoPreview] = useState(initial?.photoPreview || "");
  const [enhancing, setEnhancing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCat = CATEGORIES.find((c) => c.id === category)!;
  const isValid = date && rawDescription.trim().length >= 10;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload immediately
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("coupleId", "setup-temp");

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");
      setPhotoPath(data.path);
    } catch (err) {
      toast.error("Photo upload failed. Try again.");
      setPhotoPreview("");
    } finally {
      setUploading(false);
    }
  }

  async function handleEnhance() {
    if (!rawDescription.trim()) {
      toast.error("Write a description first!");
      return;
    }
    setEnhancing(true);
    try {
      const res = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: rawDescription,
          category,
          partner1: couple.partner1Name,
          partner2: couple.partner2Name,
          date: date ? formatDate(date) : "a special day",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPoeticNarrative(data.narrative);
      toast.success("✦ Story enhanced with AI!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Enhancement failed");
    } finally {
      setEnhancing(false);
    }
  }

  function handleSave() {
    if (!isValid) return;
    onSave({
      category,
      customLabel,
      date,
      rawDescription,
      poeticNarrative,
      photoPath,
      photoPreview,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-xl font-light" style={{ color: "var(--text-primary)" }}>
          {initial ? "Edit memory" : "New memory"}
        </h3>
        <button
          onClick={onCancel}
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors"
          style={{
            background: "var(--bg-secondary)",
            color: "var(--text-muted)",
          }}
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        {/* Category */}
        <div>
          <label className="block text-xs font-medium mb-1.5 tracking-wide" style={{ color: "var(--text-secondary)" }}>
            What kind of moment?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className="py-2 px-2 rounded-xl text-xs text-center transition-all"
                style={{
                  background: category === cat.id ? "var(--accent-muted)" : "var(--bg-secondary)",
                  border: `1.5px solid ${category === cat.id ? "var(--accent-1)" : "var(--border-subtle)"}`,
                  color: category === cat.id ? "var(--accent-1)" : "var(--text-secondary)",
                }}
              >
                <span className="block text-base mb-0.5">{cat.emoji}</span>
                <span className="leading-tight">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom label */}
        {category === "custom" && (
          <div>
            <label className="block text-xs font-medium mb-1.5 tracking-wide" style={{ color: "var(--text-secondary)" }}>
              Name this moment
            </label>
            <input
              className="themed-input"
              placeholder="e.g. First stargazing night"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
            />
          </div>
        )}

        {/* Date */}
        <div>
          <label className="block text-xs font-medium mb-1.5 tracking-wide" style={{ color: "var(--text-secondary)" }}>
            When did this happen?
          </label>
          <input
            type="date"
            className="themed-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium mb-1.5 tracking-wide" style={{ color: "var(--text-secondary)" }}>
            Describe this memory
          </label>
          <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
            {selectedCat.prompt}
          </p>
          <textarea
            className="themed-input resize-none"
            rows={3}
            placeholder="Write freely — the more detail, the more beautiful the story..."
            value={rawDescription}
            onChange={(e) => setRawDescription(e.target.value)}
            maxLength={1000}
          />
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {rawDescription.length}/1000
            </p>
            <button
              onClick={handleEnhance}
              disabled={enhancing || rawDescription.trim().length < 10}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all disabled:opacity-50"
              style={{
                background: "var(--accent-muted)",
                color: "var(--accent-1)",
                border: "1px solid var(--accent-1)",
              }}
            >
              {enhancing ? (
                <>
                  <span className="inline-block w-3 h-3 border border-current/30 border-t-current rounded-full animate-spin" />
                  Enhancing...
                </>
              ) : (
                <>✦ Enhance with AI</>
              )}
            </button>
          </div>
        </div>

        {/* AI narrative result */}
        {poeticNarrative && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-4"
            style={{
              background: "var(--accent-muted)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <p className="text-xs font-medium mb-2 flex items-center gap-1.5" style={{ color: "var(--accent-1)" }}>
              ✦ AI-enhanced narrative
            </p>
            <p className="text-sm font-display leading-relaxed" style={{ color: "var(--text-primary)" }}>
              {poeticNarrative}
            </p>
            <button
              onClick={() => setPoeticNarrative("")}
              className="text-xs mt-2 transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              Remove and use my original text
            </button>
          </motion.div>
        )}

        {/* Photo upload */}
        <div>
          <label className="block text-xs font-medium mb-1.5 tracking-wide" style={{ color: "var(--text-secondary)" }}>
            Add a photo{" "}
            <span style={{ color: "var(--text-muted)" }}>(optional)</span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />

          {photoPreview ? (
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoPreview}
                alt="preview"
                className="h-32 w-48 object-cover rounded-xl"
              />
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl" style={{ background: "rgba(0,0,0,0.4)" }}>
                  <span className="inline-block w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                </div>
              )}
              <button
                onClick={() => { setPhotoPreview(""); setPhotoPath(""); }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-8 rounded-xl text-sm transition-all"
              style={{
                border: "2px dashed var(--border-strong)",
                color: "var(--text-muted)",
                background: "var(--bg-secondary)",
              }}
            >
              📷 Tap to add a photo
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button onClick={onCancel} className="btn-ghost flex-1">Cancel</button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="btn-accent flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save Memory ♥
          </button>
        </div>
      </div>
    </motion.div>
  );
}
