"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useAnimationControls, useInView } from "framer-motion";
import { IMoment, ICouple } from "@/types";
import { getCategoryById } from "@/lib/categories";
import { formatDate } from "@/lib/utils";

interface Props {
  moment: IMoment;
  couple: ICouple;
  index: number;
  isLeft: boolean;
}

export default function TimelineNode({ moment, index, isLeft }: Props) {
  const ref       = useRef<HTMLDivElement>(null);
  const inView    = useInView(ref, { once: true, margin: "-80px" });
  const controls  = useAnimationControls();

  const [photoOpen, setPhotoOpen] = useState(false);
  const [showRaw,   setShowRaw]   = useState(false);

  const cat         = getCategoryById(moment.category);
  const displayText = !showRaw && moment.poeticNarrative
    ? moment.poeticNarrative
    : moment.rawDescription;

  // Each card floats at its own speed and amplitude — no synchronized bobbing
  const floatDuration = 4 + (index % 5) * 0.7;
  const floatY        = 5 + (index % 4) * 1.5;
  const floatRotate   = 0.25 + (index % 3) * 0.1;

  useEffect(() => {
    if (!inView) return;
    const run = async () => {
      await controls.start("visible");
      controls.start("floating");
    };
    run();
  }, [inView, controls]);

  const variants = {
    hidden: {
      opacity: 0,
      x:       isLeft ? -80 : 80,
      y:       24,
      rotate:  isLeft ? -4 : 4,
      scale:   0.86,
    },
    visible: {
      opacity: 1,
      x:       0,
      y:       0,
      rotate:  0,
      scale:   1,
      transition: {
        type:      "spring",
        stiffness: 60,
        damping:   17,
        mass:      1.1,
        delay:     (index % 3) * 0.04,
      },
    },
    floating: {
      y:      [0, -floatY, 0, -floatY * 0.55, 0],
      rotate: [0, floatRotate, 0, -floatRotate * 0.7, 0],
      transition: {
        duration: floatDuration,
        repeat:   Infinity,
        ease:     "easeInOut",
      },
    },
  };

  return (
    <>
      <motion.div
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={variants}
        whileHover={{
          y: -6,
          scale: 1.015,
          transition: { type: "spring", stiffness: 350, damping: 22 },
        }}
      >
        <div
          className="glass-card-strong overflow-hidden"
          style={{ cursor: "default" }}
        >
          {/* ── Photo ── */}
          {moment.photoPath && (
            <div
              className="relative w-full overflow-hidden cursor-pointer"
              style={{ height: "180px" }}
              onClick={() => setPhotoOpen(true)}
            >
              <motion.img
                src={moment.photoPath}
                alt={moment.photoAlt || cat.label}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.07 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
              />
              {/* Hover overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.22)" }}
              >
                <span className="text-white/90 text-4xl">⊕</span>
              </motion.div>
              {/* Subtle gradient overlay at bottom */}
              <div
                className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
                style={{
                  background: "linear-gradient(to top, var(--bg-card), transparent)",
                }}
              />
            </div>
          )}

          {/* ── Body ── */}
          <div className="p-5">
            {/* Category pill + date */}
            <div className="flex items-start justify-between gap-2 mb-4">
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.55, duration: 0.4 }}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full flex-shrink-0"
                style={{
                  background: "var(--accent-muted)",
                  color:      "var(--accent-1)",
                  border:     "1px solid var(--border-subtle)",
                }}
              >
                <span>{cat.emoji}</span>
                <span>
                  {moment.category === "custom" && moment.customLabel
                    ? moment.customLabel
                    : cat.label}
                </span>
              </motion.span>

              <motion.span
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 0.65, duration: 0.4 }}
                className="text-[11px] mt-1 leading-tight text-right"
                style={{ color: "var(--text-muted)" }}
              >
                {formatDate(moment.date)}
              </motion.span>
            </div>

            {/* Narrative text */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.55 }}
              className={`leading-[1.9] ${
                !showRaw && moment.poeticNarrative
                  ? "font-display text-[1.02rem] italic"
                  : "text-[0.9rem]"
              }`}
              style={{ color: "var(--text-primary)" }}
            >
              {displayText}
            </motion.p>

            {/* Toggle poetic / raw */}
            {moment.poeticNarrative && moment.rawDescription && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 0.75 }}
                onClick={() => setShowRaw(!showRaw)}
                className="mt-4 text-[11px] flex items-center gap-1.5 transition-opacity hover:opacity-70"
                style={{ color: "var(--text-muted)" }}
              >
                <motion.span
                  animate={{ rotate: showRaw ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ color: "var(--accent-1)", display: "inline-block" }}
                >
                  ✦
                </motion.span>
                {showRaw ? "Show poetic version" : "Show our words"}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Photo lightbox ── */}
      {photoOpen && moment.photoPath && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.92)" }}
          onClick={() => setPhotoOpen(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img
            initial={{ scale: 0.88, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            src={moment.photoPath}
            alt={moment.photoAlt || cat.label}
            className="max-w-full rounded-2xl object-contain"
            style={{ maxHeight: "88vh" }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center text-lg text-white transition-colors"
            style={{ background: "rgba(255,255,255,0.12)" }}
            onClick={() => setPhotoOpen(false)}
          >
            ✕
          </button>
        </motion.div>
      )}
    </>
  );
}
