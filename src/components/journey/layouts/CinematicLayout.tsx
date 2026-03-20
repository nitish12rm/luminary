"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { IMoment, ICouple } from "@/types";
import { getCategoryById } from "@/lib/categories";
import { formatDate } from "@/lib/utils";

interface Props {
  moments: IMoment[];
  couple: ICouple;
}

const SLOW: [number, number, number, number] = [0, 0, 0.2, 1];

function CinematicMoment({
  moment,
  index,
}: {
  moment: IMoment;
  index: number;
  couple: ICouple;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  const cat = getCategoryById(moment.category);
  const label =
    moment.category === "custom" && moment.customLabel
      ? moment.customLabel
      : cat.label;
  const text = moment.poeticNarrative || moment.rawDescription;

  return (
    <div ref={ref} className="relative mb-0">
      {/* Full-bleed image panel with parallax */}
      {moment.photoPath ? (
        <div className="relative overflow-hidden" style={{ height: "70vh", minHeight: 420 }}>
          {/* Parallax image */}
          <motion.div
            className="absolute inset-0"
            style={{ y: imgY, scale: 1.15 }}
          >
            <img
              src={moment.photoPath}
              alt={moment.photoAlt || label}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Dark vignette overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.85) 100%)",
            }}
          />

          {/* Text over image */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            {/* Chapter index */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 1.2, delay: 0.1 }}
              className="block font-display"
              style={{
                fontSize: "clamp(5rem, 20vw, 9rem)",
                color: "rgba(255,255,255,0.06)",
                lineHeight: 0.85,
                letterSpacing: "-0.04em",
                marginBottom: "0.5rem",
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              {String(index + 1).padStart(2, "0")}
            </motion.span>

            {/* Category */}
            <div className="overflow-hidden mb-3">
              <motion.div
                initial={{ y: "110%" }}
                animate={inView ? { y: "0%" } : { y: "110%" }}
                transition={{ duration: 0.7, ease: SLOW, delay: 0.15 }}
                className="flex items-center gap-2"
              >
                <span style={{ fontSize: "0.9rem" }}>{cat.emoji}</span>
                <span
                  className="uppercase font-semibold"
                  style={{
                    fontSize: "9px",
                    letterSpacing: "0.28em",
                    color: "var(--accent-1)",
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.45)",
                    marginLeft: "auto",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formatDate(moment.date)}
                </span>
              </motion.div>
            </div>

            {/* Narrative */}
            <div className="overflow-hidden">
              <motion.p
                initial={{ y: "105%", opacity: 0 }}
                animate={inView ? { y: "0%", opacity: 1 } : { y: "105%", opacity: 0 }}
                transition={{ duration: 0.9, ease: SLOW, delay: 0.28 }}
                className="font-display italic"
                style={{
                  fontSize: "clamp(1.15rem, 3.5vw, 1.5rem)",
                  lineHeight: 1.6,
                  color: "rgba(255,255,255,0.92)",
                  maxWidth: "620px",
                }}
              >
                {text}
              </motion.p>
            </div>
          </div>
        </div>
      ) : (
        /* Text-only cinematic card — no photo */
        <div
          className="relative py-24 px-8 md:px-16"
          style={{
            background:
              "linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)",
          }}
        >
          {/* Ghost number */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1.4, delay: 0.05 }}
            className="absolute top-8 right-8 font-display pointer-events-none select-none"
            style={{
              fontSize: "clamp(6rem, 24vw, 11rem)",
              color: "var(--accent-1)",
              opacity: 0.05,
              lineHeight: 1,
              letterSpacing: "-0.04em",
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </motion.span>

          <div className="relative z-10 max-w-[600px] mx-auto">
            {/* Accent rule */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
              className="h-px mb-8"
              style={{ background: "var(--timeline-line)", transformOrigin: "left" }}
            />

            {/* Category + date */}
            <div className="overflow-hidden mb-4">
              <motion.div
                initial={{ y: "110%" }}
                animate={inView ? { y: "0%" } : { y: "110%" }}
                transition={{ duration: 0.7, ease: SLOW, delay: 0.15 }}
                className="flex items-center justify-between"
              >
                <span
                  className="flex items-center gap-2 uppercase font-semibold"
                  style={{ fontSize: "9px", letterSpacing: "0.28em", color: "var(--accent-1)" }}
                >
                  <span style={{ fontSize: "0.9rem" }}>{cat.emoji}</span>
                  {label}
                </span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                  {formatDate(moment.date)}
                </span>
              </motion.div>
            </div>

            {/* Narrative */}
            <div className="overflow-hidden">
              <motion.p
                initial={{ y: "105%", opacity: 0 }}
                animate={inView ? { y: "0%", opacity: 1 } : { y: "105%", opacity: 0 }}
                transition={{ duration: 0.95, ease: SLOW, delay: 0.28 }}
                className="font-display italic"
                style={{
                  fontSize: "clamp(1.2rem, 4vw, 1.65rem)",
                  lineHeight: 1.7,
                  color: "var(--text-primary)",
                }}
              >
                {text}
              </motion.p>
            </div>
          </div>
        </div>
      )}

      {/* Thin separator line between moments */}
      <div className="w-full h-px" style={{ background: "var(--border-subtle)", opacity: 0.5 }} />
    </div>
  );
}

export default function CinematicLayout({ moments, couple }: Props) {
  return (
    <div className="w-full">
      {moments.map((moment, idx) => (
        <CinematicMoment key={moment._id} moment={moment} couple={couple} index={idx} />
      ))}
    </div>
  );
}
