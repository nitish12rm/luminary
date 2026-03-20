"use client";

import { useRef, useState, useLayoutEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { IMoment, ICouple } from "@/types";
import { getCategoryById } from "@/lib/categories";
import { formatDate } from "@/lib/utils";

interface Props {
  moments: IMoment[];
  couple: ICouple;
}

const CARD_W = 340; // px — base card width
const CARD_GAP = 32; // px — gap between cards
const SIDE_PAD = 80; // px — left/right padding for first/last card breathing room

export default function ReelLayout({ moments, couple: _couple }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [vw, setVw] = useState(800);

  useLayoutEffect(() => {
    setVw(window.innerWidth);
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const totalWidth = SIDE_PAD + moments.length * (CARD_W + CARD_GAP) + SIDE_PAD;
  const scrollDistance = totalWidth - vw;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const xRaw = useTransform(scrollYProgress, [0, 1], [0, -Math.max(scrollDistance, 0)]);
  const x = useSpring(xRaw, { stiffness: 80, damping: 20, mass: 0.6 });

  // Scroll height: 100vh (sticky view) + scrollDistance for the horizontal travel
  const sectionH = `calc(100vh + ${Math.max(scrollDistance, 0)}px)`;

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: sectionH }}
    >
      {/* Sticky track */}
      <div className="sticky top-0 w-full h-screen overflow-hidden flex flex-col justify-center">

        {/* Progress bar */}
        <motion.div
          className="absolute top-0 left-0 h-0.5 origin-left"
          style={{
            scaleX: scrollYProgress,
            background: "var(--timeline-line)",
          }}
        />

        {/* Scroll hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 uppercase"
          style={{ fontSize: "9px", letterSpacing: "0.25em", color: "var(--text-muted)" }}
        >
          scroll to explore
        </motion.p>

        {/* Card reel */}
        <motion.div
          style={{ x, paddingLeft: SIDE_PAD, paddingRight: SIDE_PAD }}
          className="flex items-center gap-8"
        >
          {moments.map((moment, idx) => (
            <ReelCard key={moment._id} moment={moment} index={idx} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function ReelCard({ moment, index }: { moment: IMoment; index: number }) {
  const cat = getCategoryById(moment.category);
  const label =
    moment.category === "custom" && moment.customLabel
      ? moment.customLabel
      : cat.label;
  const text = moment.poeticNarrative || moment.rawDescription;

  // Alternate card heights for visual rhythm
  const isShort = index % 3 === 1;

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="flex-shrink-0 relative overflow-hidden rounded-3xl glass-card-strong"
      style={{
        width: `${CARD_W}px`,
        height: isShort ? "460px" : "560px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Photo or gradient top half */}
      {moment.photoPath ? (
        <div className="flex-shrink-0 overflow-hidden" style={{ height: isShort ? 220 : 280 }}>
          <motion.img
            src={moment.photoPath}
            alt={moment.photoAlt || label}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      ) : (
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{
            height: isShort ? 220 : 280,
            background: "var(--card-gradient)",
          }}
        >
          <span
            className="font-display"
            style={{
              fontSize: "clamp(4rem, 15vw, 7rem)",
              color: "var(--accent-1)",
              opacity: 0.12,
              userSelect: "none",
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      )}

      {/* Text body */}
      <div className="flex-1 p-7 flex flex-col justify-between overflow-hidden">
        <div>
          {/* Category */}
          <div className="flex items-center gap-2 mb-3">
            <span style={{ fontSize: "0.95rem" }}>{cat.emoji}</span>
            <span
              className="uppercase font-semibold"
              style={{ fontSize: "8.5px", letterSpacing: "0.24em", color: "var(--accent-1)" }}
            >
              {label}
            </span>
          </div>

          {/* Accent rule */}
          <div className="h-px mb-4" style={{ background: "var(--timeline-line)" }} />

          {/* Narrative — clamp to 4 lines */}
          <p
            className={moment.poeticNarrative ? "font-display italic" : ""}
            style={{
              fontSize: "clamp(0.95rem, 2.5vw, 1.05rem)",
              lineHeight: 1.8,
              color: "var(--text-primary)",
              display: "-webkit-box",
              WebkitLineClamp: 5,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {text}
          </p>
        </div>

        {/* Date */}
        <p
          className="mt-4"
          style={{ fontSize: "11px", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}
        >
          {formatDate(moment.date)}
        </p>
      </div>

      {/* Ghost index */}
      <span
        className="absolute top-3 right-4 font-display pointer-events-none select-none"
        style={{
          fontSize: "clamp(2.5rem, 10vw, 4.5rem)",
          color: "var(--accent-1)",
          opacity: 0.06,
          lineHeight: 1,
          letterSpacing: "-0.04em",
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
    </motion.article>
  );
}
