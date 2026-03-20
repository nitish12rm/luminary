"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { IMoment, ICouple } from "@/types";
import TimelineNode from "./TimelineNode";

interface Props {
  moments: IMoment[];
  couple: ICouple;
}

// River flow positions — the varying distances from center (50%) create
// the Amazon-from-above effect: some moments bend far, some hug the spine.
// ml = marginLeft % on desktop. Cards are 44% wide, spine is at 50%.
//   Left  cards: right edge = ml + 44 → should land just left of 50%
//   Right cards: left edge  = ml     → should start just right of 50%
const FLOW = [
  { ml: 0,  isLeft: true  },  // far left  — wide bend
  { ml: 56, isLeft: false },  // far right — wide bend
  { ml: 4,  isLeft: true  },  // left, near center — tight bend
  { ml: 51, isLeft: false },  // right, near center — tight bend
  { ml: 1,  isLeft: true  },  // very far left
  { ml: 55, isLeft: false },  // moderate right
  { ml: 3,  isLeft: true  },  // moderate left
  { ml: 53, isLeft: false },  // moderate right
  { ml: 2,  isLeft: true  },  // moderate left
  { ml: 57, isLeft: false },  // far right
];

const CARD_W = 44; // card width % of container
const SPINE  = 50; // spine x position % from left

export default function Timeline({ moments, couple }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 85%", "end 15%"],
  });
  const spineScale = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 1]),
    { stiffness: 55, damping: 22 }
  );

  if (!moments.length) {
    return (
      <div className="py-24 text-center" style={{ color: "var(--text-muted)" }}>
        <p className="font-display text-2xl">No memories yet...</p>
      </div>
    );
  }

  return (
    <section ref={containerRef} className="relative max-w-5xl mx-auto px-4 py-16 pb-32">

      {/* ── Section header ── */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-center mb-24"
      >
        <p
          className="text-[10px] tracking-[0.3em] uppercase mb-3"
          style={{ color: "var(--text-muted)" }}
        >
          Our Story
        </p>
        <h2
          className="font-display text-4xl md:text-5xl font-light"
          style={{ color: "var(--text-primary)" }}
        >
          The moments that made us
        </h2>
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
          className="h-px w-20 mx-auto mt-6"
          style={{ background: "var(--timeline-line)", transformOrigin: "center" }}
        />
      </motion.div>

      {/* ── Timeline body ── */}
      <div className="relative">

        {/* Spine — desktop: animates in as you scroll */}
        <motion.div
          className="absolute hidden md:block w-px top-0 bottom-0 pointer-events-none"
          style={{
            left: `${SPINE}%`,
            background: "var(--timeline-line)",
            transformOrigin: "top center",
            scaleY: spineScale,
          }}
        />

        {/* Spine — mobile: static left bar */}
        <div
          className="absolute md:hidden top-0 bottom-0 w-px left-[22px]"
          style={{ background: "var(--timeline-line)" }}
        />

        {/* ── Moment rows ── */}
        <div className="flex flex-col gap-20 md:gap-32">
          {moments.map((moment, idx) => {
            const flow = FLOW[idx % FLOW.length];

            // Horizontal connector geometry
            const cardEdge  = flow.isLeft ? flow.ml + CARD_W : flow.ml;
            const connLeft  = flow.isLeft ? cardEdge : SPINE;
            const connWidth = flow.isLeft
              ? SPINE - cardEdge          // left card → connector goes rightward to spine
              : cardEdge - SPINE;         // right card → connector goes leftward to spine

            return (
              <div key={moment._id} className="relative flex items-center">

                {/* ── Connector line — desktop ── */}
                {connWidth > 0 && (
                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    whileInView={{ scaleX: 1, opacity: 1 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.45, delay: 0.35, ease: "easeOut" }}
                    className="absolute hidden md:block h-px pointer-events-none z-10"
                    style={{
                      left: `${connLeft}%`,
                      width: `${connWidth}%`,
                      background: "var(--timeline-line)",
                      opacity: 0.45,
                      transformOrigin: flow.isLeft ? "right" : "left",
                    }}
                  />
                )}

                {/* ── Spine dot + chapter number — desktop ── */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ type: "spring", stiffness: 250, damping: 18, delay: 0.15 }}
                  className="absolute hidden md:flex flex-col items-center z-20"
                  style={{ left: `calc(${SPINE}% - 10px)` }}
                >
                  {/* Chapter number above dot */}
                  <span
                    className="text-[9px] font-semibold tracking-[0.18em] mb-1.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  {/* Dot with pulsing ring */}
                  <div className="relative flex items-center justify-center">
                    <motion.div
                      animate={{
                        scale:   [1, 2.6, 1],
                        opacity: [0.45, 0, 0.45],
                      }}
                      transition={{
                        duration: 2.6,
                        repeat: Infinity,
                        ease: "easeOut",
                        delay: (idx * 0.35) % 2.6,
                      }}
                      className="absolute w-5 h-5 rounded-full"
                      style={{ background: "var(--accent-1)" }}
                    />
                    <div
                      className="relative w-5 h-5 rounded-full"
                      style={{
                        background: "var(--accent-1)",
                        boxShadow: `0 0 0 3px var(--bg-primary), 0 0 18px var(--accent-glow)`,
                      }}
                    />
                  </div>
                </motion.div>

                {/* ── Mobile dot ── */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 250, damping: 18 }}
                  className="absolute md:hidden z-10 flex items-center justify-center"
                  style={{ left: "16px" }}
                >
                  <motion.div
                    animate={{ scale: [1, 2, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut" }}
                    className="absolute w-3.5 h-3.5 rounded-full"
                    style={{ background: "var(--accent-1)" }}
                  />
                  <div
                    className="relative w-3.5 h-3.5 rounded-full"
                    style={{
                      background: "var(--accent-1)",
                      boxShadow: `0 0 0 2.5px var(--bg-primary), 0 0 10px var(--accent-glow)`,
                    }}
                  />
                </motion.div>

                {/* ── Card ── */}
                <div
                  className="flow-card"
                  style={{ "--card-ml": `${flow.ml}%` } as React.CSSProperties}
                >
                  <TimelineNode
                    moment={moment}
                    couple={couple}
                    index={idx}
                    isLeft={flow.isLeft}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Footer ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
        className="text-center mt-32"
      >
        <div
          className="w-10 h-px mx-auto mb-7"
          style={{ background: "var(--border-strong)" }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="text-3xl mb-5"
          style={{ color: "var(--accent-1)" }}
        >
          ♥
        </motion.div>
        <p
          className="font-display text-2xl italic"
          style={{ color: "var(--text-secondary)" }}
        >
          And the story continues...
        </p>
        <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
          with every sunrise you share
        </p>
      </motion.div>
    </section>
  );
}
