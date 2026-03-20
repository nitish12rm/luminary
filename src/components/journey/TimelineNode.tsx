"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { IMoment, ICouple } from "@/types";
import { getCategoryById } from "@/lib/categories";
import { formatDate } from "@/lib/utils";

interface Props {
  moment: IMoment;
  couple: ICouple;
  index: number;
}

// Custom ease — fast start, silky deceleration (signature of editorial reveals)
const EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Reveal — wraps children in an overflow:hidden container.
 * The inner div slides up from below, giving the "text emerges
 * from behind a baseline" effect characteristic of Wondrous/Awwwards sites.
 */
function Reveal({
  children,
  delay = 0,
  inView,
  duration = 0.78,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  inView: boolean;
  duration?: number;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: "108%", opacity: 0 }}
        animate={
          inView
            ? { y: "0%", opacity: 1 }
            : { y: "108%", opacity: 0 }
        }
        transition={{ duration, ease: EXPO, delay }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export default function TimelineNode({
  moment,
  index,
  couple: _couple,
}: Props) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const [showRaw,    setShowRaw]    = useState(false);
  const [photoOpen,  setPhotoOpen]  = useState(false);

  const cat   = getCategoryById(moment.category);
  const label =
    moment.category === "custom" && moment.customLabel
      ? moment.customLabel
      : cat.label;

  const displayText =
    !showRaw && moment.poeticNarrative
      ? moment.poeticNarrative
      : moment.rawDescription;

  // Photo appears before or after text based on index — adds visual rhythm
  const photoFirst = index % 2 === 0;

  return (
    <>
      <article ref={ref} className="relative">

        {/* ── Content ── */}
        <div className="relative">

          {/* Row: index number + category label + date */}
          <div className="flex items-center justify-between gap-3 mb-5">
          <Reveal inView={inView} delay={0}>
            <div className="flex items-center gap-3">
              {/* Chapter number */}
              <span
                className="font-display font-light select-none"
                style={{
                  fontSize: "clamp(1.1rem, 3vw, 1.35rem)",
                  color: "var(--accent-1)",
                  opacity: 0.55,
                  letterSpacing: "0.04em",
                  lineHeight: 1,
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span
                style={{
                  width: "1px",
                  height: "14px",
                  background: "var(--border-strong)",
                  display: "inline-block",
                  opacity: 0.5,
                }}
              />
              <span style={{ fontSize: "1rem", lineHeight: 1 }}>{cat.emoji}</span>
              <span
                className="font-semibold uppercase"
                style={{
                  fontSize: "9.5px",
                  letterSpacing: "0.22em",
                  color: "var(--accent-1)",
                }}
              >
                {label}
              </span>
            </div>
          </Reveal>
            <Reveal inView={inView} delay={0.06}>
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  fontVariantNumeric: "tabular-nums",
                  whiteSpace: "nowrap",
                }}
              >
                {formatDate(moment.date)}
              </span>
            </Reveal>
          </div>

          {/* Accent rule — expands from left */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.12 }}
            className="h-px mb-7"
            style={{
              background: "var(--timeline-line)",
              transformOrigin: "left",
            }}
          />

          {/* Photo — even-indexed moments show photo FIRST */}
          {moment.photoPath && photoFirst && (
            <PhotoBlock
              photoPath={moment.photoPath}
              photoAlt={moment.photoAlt || label}
              inView={inView}
              delay={0.2}
              onOpen={() => setPhotoOpen(true)}
              className="mb-7"
            />
          )}

          {/* Narrative */}
          <Reveal inView={inView} delay={moment.photoPath && photoFirst ? 0.3 : 0.2}>
            <p
              className={
                !showRaw && moment.poeticNarrative
                  ? "font-display italic"
                  : ""
              }
              style={{
                fontSize: "clamp(1.04rem, 3vw, 1.16rem)",
                lineHeight: 1.95,
                color: "var(--text-primary)",
              }}
            >
              {displayText}
            </p>
          </Reveal>

          {/* Photo — odd-indexed moments show photo AFTER text */}
          {moment.photoPath && !photoFirst && (
            <PhotoBlock
              photoPath={moment.photoPath}
              photoAlt={moment.photoAlt || label}
              inView={inView}
              delay={0.32}
              onOpen={() => setPhotoOpen(true)}
              className="mt-7"
            />
          )}

          {/* Toggle poetic ↔ raw */}
          {moment.poeticNarrative && moment.rawDescription && (
            <Reveal inView={inView} delay={0.42} className="mt-5">
              <button
                onClick={() => setShowRaw(!showRaw)}
                className="flex items-center gap-2 transition-opacity hover:opacity-55"
                style={{ fontSize: "11px", color: "var(--text-muted)" }}
              >
                <motion.span
                  animate={{ rotate: showRaw ? 45 : 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ color: "var(--accent-1)", display: "inline-block" }}
                >
                  ✦
                </motion.span>
                {showRaw ? "Show poetic version" : "Show our words"}
              </button>
            </Reveal>
          )}

        </div>
      </article>

      {/* ── Photo lightbox ── */}
      {photoOpen && moment.photoPath && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.93)" }}
          onClick={() => setPhotoOpen(false)}
        >
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.45, ease: EXPO }}
            src={moment.photoPath}
            alt={moment.photoAlt || label}
            className="max-w-full rounded-2xl object-contain"
            style={{ maxHeight: "88vh" }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors"
            style={{ background: "rgba(255,255,255,0.1)" }}
            onClick={() => setPhotoOpen(false)}
          >
            ✕
          </button>
        </motion.div>
      )}
    </>
  );
}

/* ── PhotoBlock ────────────────────────────────────────────────── */
function PhotoBlock({
  photoPath,
  photoAlt,
  inView,
  delay,
  onOpen,
  className = "",
}: {
  photoPath: string;
  photoAlt: string;
  inView: boolean;
  delay: number;
  onOpen: () => void;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={
        inView
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 20, scale: 0.97 }
      }
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay }}
      className={`relative overflow-hidden rounded-2xl cursor-pointer group ${className}`}
      style={{ height: "clamp(210px, 52vw, 320px)" }}
      onClick={onOpen}
    >
      <motion.img
        src={photoPath}
        alt={photoAlt}
        className="w-full h-full object-cover"
        whileHover={{ scale: 1.06 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
      />
      {/* Subtle dark overlay on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.15)" }}
      >
        <span className="text-white/75 text-4xl">⊕</span>
      </div>
      {/* Bottom fade so it sits nicely against the background */}
      <div
        className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, var(--bg-primary) 0%, transparent 100%)",
          opacity: 0.4,
        }}
      />
    </motion.div>
  );
}
