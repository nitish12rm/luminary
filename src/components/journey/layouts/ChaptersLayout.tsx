"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { IMoment, ICouple } from "@/types";
import { getCategoryById } from "@/lib/categories";
import { formatDate } from "@/lib/utils";

interface Props {
  moments: IMoment[];
  couple: ICouple;
}

interface Chapter {
  year: string;
  moments: IMoment[];
}

function groupByYear(moments: IMoment[]): Chapter[] {
  const map = new Map<string, IMoment[]>();
  for (const m of moments) {
    const y = new Date(m.date).getFullYear().toString();
    if (!map.has(y)) map.set(y, []);
    map.get(y)!.push(m);
  }
  return Array.from(map.entries()).map(([year, moments]) => ({ year, moments }));
}

const EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

function ChapterTitle({ year, chapterIndex }: { year: string; chapterIndex: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div
      ref={ref}
      className="relative overflow-hidden mb-20 py-20 px-6 md:px-12 text-center"
      style={{
        background: "var(--hero-gradient)",
        borderRadius: "24px",
      }}
    >
      {/* Year wipe reveal */}
      <div className="overflow-hidden">
        <motion.h3
          initial={{ y: "105%" }}
          animate={inView ? { y: "0%" } : { y: "105%" }}
          transition={{ duration: 0.85, ease: EXPO, delay: 0.05 }}
          className="font-display font-light"
          style={{
            fontSize: "clamp(4rem, 20vw, 9rem)",
            color: "var(--accent-1)",
            opacity: 0.18,
            letterSpacing: "-0.04em",
            lineHeight: 0.85,
            userSelect: "none",
          }}
        >
          {year}
        </motion.h3>
      </div>

      {/* Chapter label */}
      <div className="overflow-hidden mt-4">
        <motion.p
          initial={{ y: "110%", opacity: 0 }}
          animate={inView ? { y: "0%", opacity: 1 } : { y: "110%", opacity: 0 }}
          transition={{ duration: 0.7, ease: EXPO, delay: 0.2 }}
          className="uppercase"
          style={{
            fontSize: "9px",
            letterSpacing: "0.32em",
            color: "var(--text-muted)",
          }}
        >
          Chapter {String(chapterIndex + 1).padStart(2, "0")}
        </motion.p>
      </div>

      {/* Animated rule */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.35 }}
        className="h-px w-20 mx-auto mt-6"
        style={{ background: "var(--timeline-line)", transformOrigin: "center" }}
      />
    </div>
  );
}

function ChapterMoment({ moment, index, isLast }: { moment: IMoment; index: number; isLast: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const cat = getCategoryById(moment.category);
  const label =
    moment.category === "custom" && moment.customLabel
      ? moment.customLabel
      : cat.label;
  const text = moment.poeticNarrative || moment.rawDescription;

  return (
    <div ref={ref} className="relative pl-8 md:pl-10">
      {/* Vertical connector line */}
      {!isLast && (
        <div
          className="absolute left-2.5 top-6 bottom-0 w-px"
          style={{ background: "var(--border-subtle)" }}
        />
      )}

      {/* Node dot */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ duration: 0.5, ease: "backOut", delay: 0.1 }}
        className="absolute left-0 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center"
        style={{
          borderColor: "var(--accent-1)",
          background: "var(--bg-primary)",
          boxShadow: "0 0 0 4px var(--accent-muted)",
        }}
      >
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "var(--accent-1)" }}
        />
      </motion.div>

      {/* Content */}
      <div className="pb-14">
        {/* Category + date */}
        <div className="overflow-hidden mb-3">
          <motion.div
            initial={{ y: "110%", opacity: 0 }}
            animate={inView ? { y: "0%", opacity: 1 } : { y: "110%", opacity: 0 }}
            transition={{ duration: 0.65, ease: EXPO, delay: 0.12 }}
            className="flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <span style={{ fontSize: "0.9rem" }}>{cat.emoji}</span>
              <span
                className="uppercase font-semibold"
                style={{ fontSize: "9px", letterSpacing: "0.22em", color: "var(--accent-1)" }}
              >
                {label}
              </span>
            </span>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
              {formatDate(moment.date)}
            </span>
          </motion.div>
        </div>

        {/* Photo */}
        {moment.photoPath && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.8, ease: EXPO, delay: 0.2 }}
            className="relative overflow-hidden rounded-2xl mb-5"
            style={{ height: "clamp(180px, 48vw, 280px)" }}
          >
            <img
              src={moment.photoPath}
              alt={moment.photoAlt || label}
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}

        {/* Narrative */}
        <div className="overflow-hidden">
          <motion.p
            initial={{ y: "105%", opacity: 0 }}
            animate={inView ? { y: "0%", opacity: 1 } : { y: "105%", opacity: 0 }}
            transition={{ duration: 0.85, ease: EXPO, delay: moment.photoPath ? 0.3 : 0.2 }}
            className={moment.poeticNarrative ? "font-display italic" : ""}
            style={{
              fontSize: "clamp(1rem, 3vw, 1.12rem)",
              lineHeight: 1.9,
              color: "var(--text-primary)",
            }}
          >
            {text}
          </motion.p>
        </div>
      </div>
    </div>
  );
}

export default function ChaptersLayout({ moments, couple: _couple }: Props) {
  const chapters = groupByYear(moments);

  return (
    <div className="max-w-[580px] mx-auto px-5 md:px-0">
      {chapters.map((chapter, chIdx) => (
        <div key={chapter.year}>
          <ChapterTitle year={chapter.year} chapterIndex={chIdx} />

          <div className="mb-8">
            {chapter.moments.map((moment, mIdx) => (
              <ChapterMoment
                key={moment._id}
                moment={moment}
                index={mIdx}
                isLast={mIdx === chapter.moments.length - 1}
              />
            ))}
          </div>

          {/* Space between chapters */}
          {chIdx < chapters.length - 1 && (
            <div className="h-8 flex items-center justify-center mb-8">
              <div className="w-px h-16" style={{ background: "var(--border-strong)" }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
