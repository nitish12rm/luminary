"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IMoment, ICouple } from "@/types";
import LayoutPicker, { LayoutId } from "./LayoutPicker";
import EditorialLayout from "./layouts/EditorialLayout";
import StoryLayout     from "./layouts/StoryLayout";
import ChaptersLayout  from "./layouts/ChaptersLayout";

interface Props {
  moments: IMoment[];
  couple: ICouple;
}

const LS_KEY = "luminary_layout";

function getStoredLayout(): LayoutId {
  if (typeof window === "undefined") return "editorial";
  const v = window.localStorage.getItem(LS_KEY);
  const valid: LayoutId[] = ["editorial", "story", "chapters"];
  return valid.includes(v as LayoutId) ? (v as LayoutId) : "editorial";
}

export default function Timeline({ moments, couple }: Props) {
  const [layout, setLayout] = useState<LayoutId>("editorial");

  // Hydrate from localStorage after mount
  useEffect(() => {
    setLayout(getStoredLayout());
  }, []);

  function handleChange(id: LayoutId) {
    setLayout(id);
    localStorage.setItem(LS_KEY, id);
  }

  if (!moments.length) {
    return (
      <div className="py-24 text-center" style={{ color: "var(--text-muted)" }}>
        <p className="font-display text-2xl">No memories yet...</p>
      </div>
    );
  }

  return (
    <section className="relative py-16">

      {/* ── Section header ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-10 px-5"
      >
        <p
          className="uppercase mb-4"
          style={{ fontSize: "9px", letterSpacing: "0.32em", color: "var(--text-muted)" }}
        >
          Our Story
        </p>
        <h2
          className="font-display font-light"
          style={{
            fontSize: "clamp(1.75rem, 6vw, 2.6rem)",
            lineHeight: 1.25,
            color: "var(--text-primary)",
          }}
        >
          The moments that made us
        </h2>
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.35, ease: "easeOut" }}
          className="h-px w-14 mx-auto mt-6"
          style={{ background: "var(--timeline-line)", transformOrigin: "center" }}
        />
      </motion.div>

      {/* ── Layout picker ── */}
      <LayoutPicker active={layout} onChange={handleChange} />

      {/* ── Layout content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={layout}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {layout === "editorial" && <EditorialLayout moments={moments} couple={couple} />}
          {layout === "story"     && <StoryLayout     moments={moments} couple={couple} />}
          {layout === "chapters"  && <ChaptersLayout  moments={moments} couple={couple} />}
        </motion.div>
      </AnimatePresence>

      {/* ── Footer ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
        className="text-center mt-24 px-5"
      >
        <div className="w-10 h-px mx-auto mb-8" style={{ background: "var(--border-strong)" }} />
        <motion.span
          animate={{ scale: [1, 1.18, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="text-3xl block mb-5"
          style={{ color: "var(--accent-1)" }}
        >
          ♥
        </motion.span>
        <p
          className="font-display font-light italic"
          style={{
            fontSize: "clamp(1.2rem, 4vw, 1.6rem)",
            color: "var(--text-secondary)",
            lineHeight: 1.4,
          }}
        >
          And the story continues...
        </p>
        <p className="mt-3" style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          with every sunrise you share
        </p>
      </motion.div>

    </section>
  );
}
