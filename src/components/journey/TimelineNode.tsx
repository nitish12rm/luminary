"use client";

import { useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { IMoment, ICouple } from "@/types";
import { getCategoryById } from "@/lib/categories";
import { formatDate } from "@/lib/utils";

interface Props {
  moment: IMoment;
  couple: ICouple;
  index: number;
  isLeft: boolean;
}

const CARD_VARIANTS = {
  hidden: (isLeft: boolean) => ({
    opacity: 0,
    x: isLeft ? -50 : 50,
    y: 20,
  }),
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export default function TimelineNode({ moment, couple: _couple, index, isLeft }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [photoOpen, setPhotoOpen] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const cat = getCategoryById(moment.category);
  const displayText =
    !showRaw && moment.poeticNarrative ? moment.poeticNarrative : moment.rawDescription;

  return (
    <div
      ref={ref}
      className={`relative flex items-start gap-0 ${
        isLeft
          ? "md:flex-row flex-row"
          : "md:flex-row-reverse flex-row"
      }`}
    >
      {/* Mobile: left side spacer */}
      <div className="md:hidden w-12 flex-shrink-0" />

      {/* Desktop: spacer for alignment */}
      <div className="hidden md:flex md:flex-1 justify-end pr-8">
        {isLeft && (
          <motion.div
            custom={true}
            variants={CARD_VARIANTS}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="w-full max-w-sm"
          >
            <MomentCard
              moment={moment}
              cat={cat}
              displayText={displayText}
              showRaw={showRaw}
              setShowRaw={setShowRaw}
              photoOpen={photoOpen}
              setPhotoOpen={setPhotoOpen}
            />
          </motion.div>
        )}
      </div>

      {/* Center dot */}
      <div className="relative flex-shrink-0 flex items-start justify-center z-10 md:w-16">
        {/* Mobile dot */}
        <div
          className="absolute left-0 md:hidden w-4 h-4 rounded-full mt-5 -translate-x-[22px]"
          style={{
            background: "var(--accent-1)",
            boxShadow: "0 0 0 4px var(--bg-primary), 0 0 12px var(--accent-glow)",
          }}
        />
        {/* Desktop dot */}
        <div
          className="hidden md:flex w-4 h-4 rounded-full mt-6 ring-4"
          style={{
            background: "var(--accent-1)",
            boxShadow: "0 0 12px var(--accent-glow)",
            ringColor: "var(--bg-primary)",
          }}
        />
      </div>

      {/* Desktop: right side */}
      <div className="hidden md:flex md:flex-1 pl-8">
        {!isLeft && (
          <motion.div
            custom={false}
            variants={CARD_VARIANTS}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="w-full max-w-sm"
          >
            <MomentCard
              moment={moment}
              cat={cat}
              displayText={displayText}
              showRaw={showRaw}
              setShowRaw={setShowRaw}
              photoOpen={photoOpen}
              setPhotoOpen={setPhotoOpen}
            />
          </motion.div>
        )}
        {isLeft && <div />}
      </div>

      {/* Mobile card */}
      <motion.div
        custom={isLeft}
        variants={CARD_VARIANTS}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="flex-1 md:hidden"
      >
        <MomentCard
          moment={moment}
          cat={cat}
          displayText={displayText}
          showRaw={showRaw}
          setShowRaw={setShowRaw}
          photoOpen={photoOpen}
          setPhotoOpen={setPhotoOpen}
        />
      </motion.div>

      {/* Photo lightbox */}
      {photoOpen && moment.photoPath && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setPhotoOpen(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={moment.photoPath}
            alt={moment.photoAlt || cat.label}
            className="max-w-full max-h-full rounded-2xl object-contain"
            style={{ maxHeight: "85vh" }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center text-xl"
            onClick={() => setPhotoOpen(false)}
          >
            ✕
          </button>
        </motion.div>
      )}
    </div>
  );
}

interface CardProps {
  moment: IMoment;
  cat: ReturnType<typeof getCategoryById>;
  displayText: string;
  showRaw: boolean;
  setShowRaw: (v: boolean) => void;
  photoOpen: boolean;
  setPhotoOpen: (v: boolean) => void;
}

function MomentCard({
  moment,
  cat,
  displayText,
  showRaw,
  setShowRaw,
  photoOpen: _photoOpen,
  setPhotoOpen,
}: CardProps) {
  return (
    <div
      className="glass-card-strong overflow-hidden transition-all duration-300 hover:shadow-glow"
      style={{ cursor: "default" }}
    >
      {/* Photo */}
      {moment.photoPath && (
        <div
          className="w-full h-48 overflow-hidden cursor-pointer"
          onClick={() => setPhotoOpen(true)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={moment.photoPath}
            alt={moment.photoAlt || cat.label}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      )}

      <div className="p-5">
        {/* Category + date */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full"
            style={{
              background: "var(--accent-muted)",
              color: "var(--accent-1)",
            }}
          >
            {cat.emoji} {moment.category === "custom" && moment.customLabel ? moment.customLabel : cat.label}
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {formatDate(moment.date)}
          </span>
        </div>

        {/* Narrative */}
        <p
          className={`text-sm leading-relaxed ${!showRaw && moment.poeticNarrative ? "font-display text-base italic" : ""}`}
          style={{ color: "var(--text-primary)" }}
        >
          {displayText}
        </p>

        {/* Toggle raw/poetic */}
        {moment.poeticNarrative && moment.rawDescription && (
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="text-xs mt-3 transition-colors flex items-center gap-1"
            style={{ color: "var(--text-muted)" }}
          >
            {showRaw ? "✦ Show poetic version" : "Show our words"}
          </button>
        )}
      </div>
    </div>
  );
}
