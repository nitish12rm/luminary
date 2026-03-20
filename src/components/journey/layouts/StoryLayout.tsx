"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import { IMoment, ICouple } from "@/types";
import { getCategoryById } from "@/lib/categories";
import { formatDate } from "@/lib/utils";

interface Props {
  moments: IMoment[];
  couple: ICouple;
}

const EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

function StepText({
  moment,
  index,
  isActive,
  onActivate,
}: {
  moment: IMoment;
  index: number;
  isActive: boolean;
  onActivate: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-35% 0px -35% 0px" });

  // Notify parent when this step enters view
  useEffect(() => {
    if (inView) onActivate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  const cat = getCategoryById(moment.category);
  const label =
    moment.category === "custom" && moment.customLabel
      ? moment.customLabel
      : cat.label;
  const text = moment.poeticNarrative || moment.rawDescription;

  return (
    <div
      ref={ref}
      className="min-h-[70vh] flex flex-col justify-center py-16 pr-6 md:pr-10"
    >
      <motion.div
        animate={{ opacity: isActive ? 1 : 0.28 }}
        transition={{ duration: 0.5 }}
      >
        {/* Index */}
        <span
          className="font-display block mb-4"
          style={{
            fontSize: "clamp(4rem, 14vw, 6rem)",
            color: "var(--accent-1)",
            opacity: 0.08,
            lineHeight: 0.85,
            letterSpacing: "-0.04em",
            userSelect: "none",
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Category label */}
        <div className="flex items-center gap-2 mb-4">
          <span style={{ fontSize: "1rem" }}>{cat.emoji}</span>
          <span
            className="uppercase font-semibold"
            style={{
              fontSize: "9px",
              letterSpacing: "0.25em",
              color: "var(--accent-1)",
            }}
          >
            {label}
          </span>
        </div>

        {/* Divider */}
        <div
          className="h-px mb-6"
          style={{
            background: "var(--timeline-line)",
            width: isActive ? "100%" : "40%",
            transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
          }}
        />

        {/* Narrative */}
        <p
          className={moment.poeticNarrative ? "font-display italic" : "font-display"}
          style={{
            fontSize: "clamp(1.05rem, 2.8vw, 1.2rem)",
            lineHeight: 1.9,
            color: "var(--text-primary)",
            maxWidth: "480px",
          }}
        >
          {text}
        </p>

        {/* Date */}
        <p
          className="mt-5"
          style={{ fontSize: "12px", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}
        >
          {formatDate(moment.date)}
        </p>
      </motion.div>
    </div>
  );
}

const PLACEHOLDER_GRADIENT = [
  "linear-gradient(135deg, var(--bg-secondary), var(--border-subtle))",
];

export default function StoryLayout({ moments, couple: _couple }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activePhoto = moments[activeIndex]?.photoPath;
  const activeLabel =
    moments[activeIndex]
      ? getCategoryById(moments[activeIndex].category).label
      : "";

  // On mobile — render as stacked cards
  const isMoments = moments.length > 0;

  return (
    <div className="w-full">
      {/* Desktop scrollytelling — md:flex, hidden on mobile */}
      <div className="hidden md:flex relative" style={{ alignItems: "flex-start" }}>

        {/* ── Sticky photo panel (left 50%) ── */}
        <div className="sticky top-0 w-1/2 h-screen flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 1.05, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -20 }}
              transition={{ duration: 0.75, ease: EXPO }}
              className="w-full h-full"
            >
              {activePhoto ? (
                <img
                  src={activePhoto}
                  alt={activeLabel}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: PLACEHOLDER_GRADIENT[0] }}
                >
                  <span
                    className="font-display"
                    style={{
                      fontSize: "clamp(4rem, 18vw, 9rem)",
                      color: "var(--accent-1)",
                      opacity: 0.12,
                      userSelect: "none",
                    }}
                  >
                    {String(activeIndex + 1).padStart(2, "0")}
                  </span>
                </div>
              )}

              {/* Progress indicator */}
              <div className="absolute bottom-8 right-8 flex flex-col gap-1.5">
                {moments.map((_, i) => (
                  <div
                    key={i}
                    className="rounded-full transition-all duration-500"
                    style={{
                      width: i === activeIndex ? "24px" : "6px",
                      height: "6px",
                      background: i === activeIndex ? "var(--accent-1)" : "rgba(255,255,255,0.3)",
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Scrollable text steps (right 50%) ── */}
        <div className="w-1/2 pl-10 md:pl-14">
          {isMoments && moments.map((moment, idx) => (
            <StepText
              key={moment._id}
              moment={moment}
              index={idx}
              isActive={activeIndex === idx}
              onActivate={() => setActiveIndex(idx)}
            />
          ))}
        </div>
      </div>

      {/* Mobile — stacked cards with photos above text */}
      <div className="md:hidden px-5 space-y-16">
        {moments.map((moment, idx) => {
          const cat = getCategoryById(moment.category);
          const label =
            moment.category === "custom" && moment.customLabel
              ? moment.customLabel
              : cat.label;
          const text = moment.poeticNarrative || moment.rawDescription;

          return (
            <motion.div
              key={moment._id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.8, ease: EXPO }}
            >
              {moment.photoPath && (
                <div className="relative overflow-hidden rounded-2xl mb-6" style={{ height: 260 }}>
                  <img
                    src={moment.photoPath}
                    alt={moment.photoAlt || label}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 mb-3">
                <span>{cat.emoji}</span>
                <span
                  className="uppercase font-semibold"
                  style={{ fontSize: "9px", letterSpacing: "0.25em", color: "var(--accent-1)" }}
                >
                  {label}
                </span>
              </div>

              <div className="h-px mb-5" style={{ background: "var(--timeline-line)" }} />

              <p
                className={moment.poeticNarrative ? "font-display italic" : "font-display"}
                style={{ fontSize: "1.05rem", lineHeight: 1.9, color: "var(--text-primary)" }}
              >
                {text}
              </p>

              <p className="mt-4" style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                {formatDate(moment.date)}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
