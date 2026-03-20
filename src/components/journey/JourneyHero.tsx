"use client";

import React from "react";
import { motion } from "framer-motion";
import { ICouple } from "@/types";
import { formatDate, getDays } from "@/lib/utils";
import ParallaxBlob from "@/components/shared/ParallaxBlob";

interface Props {
  couple: ICouple;
  totalMoments: number;
}

export default function JourneyHero({ couple, totalMoments }: Props) {
  const days = getDays(couple.startDate);
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);

  let duration = "";
  if (years > 0) duration += `${years} ${years === 1 ? "year" : "years"}`;
  if (years > 0 && months > 0) duration += " & ";
  if (months > 0) duration += `${months} ${months === 1 ? "month" : "months"}`;
  if (!duration) duration = `${days} days`;

  return (
    <section
      className="relative pt-20 pb-24 px-4 text-center overflow-hidden"
      style={{ background: "var(--hero-gradient)" }}
    >
      <ParallaxBlob size={500} top="-20%" left="-15%" color="accent" delay={0} />
      <ParallaxBlob size={400} top="10%" right="-10%" color="secondary" delay={2} />
      <ParallaxBlob size={300} bottom="0%" left="30%" color="muted" delay={4} />

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Cover photo if any */}
        {couple.coverPhotoPath && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="w-32 h-32 rounded-full mx-auto mb-6 overflow-hidden ring-4"
            style={{ "--tw-ring-color": "var(--accent-1)" } as React.CSSProperties}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={couple.coverPhotoPath}
              alt={`${couple.partner1Name} & ${couple.partner2Name}`}
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}

        {/* Heart */}
        {!couple.coverPhotoPath && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="text-6xl mb-6"
            style={{
              animation: "heartbeat 3s ease-in-out infinite",
              color: "var(--accent-1)",
              display: "inline-block",
            }}
          >
            ♥
          </motion.div>
        )}

        {/* Names */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="font-display text-5xl md:text-6xl font-light mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          {couple.partner1Name}{" "}
          <span className="gradient-text">&</span>{" "}
          {couple.partner2Name}
        </motion.h1>

        {/* Start date */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="text-lg font-display italic mb-6"
          style={{ color: "var(--text-secondary)" }}
        >
          Since {formatDate(couple.startDate)}
        </motion.p>

        {/* Bio */}
        {couple.bio && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.7 }}
            className="text-base max-w-md mx-auto mb-8 leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {couple.bio}
          </motion.p>
        )}

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.7 }}
          className="flex items-center justify-center gap-8 flex-wrap"
        >
          <StatPill value={duration} label="together" />
          <div className="w-1 h-1 rounded-full" style={{ background: "var(--border-strong)" }} />
          <StatPill value={`${days.toLocaleString()}`} label="days of love" />
          <div className="w-1 h-1 rounded-full" style={{ background: "var(--border-strong)" }} />
          <StatPill value={`${totalMoments}`} label={totalMoments === 1 ? "memory" : "memories"} />
        </motion.div>

      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-2xl opacity-40"
          style={{ color: "var(--accent-1)" }}
        >
          ↓
        </motion.div>
      </motion.div>
    </section>
  );
}

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-2xl" style={{ color: "var(--accent-1)" }}>
        {value}
      </div>
      <div className="text-xs tracking-wide mt-0.5" style={{ color: "var(--text-muted)" }}>
        {label}
      </div>
    </div>
  );
}
