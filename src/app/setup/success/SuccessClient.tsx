"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ICouple } from "@/types";
import ShareCard from "@/components/shared/ShareCard";
import { getTheme } from "@/lib/themes";

interface Props {
  couple: ICouple;
  totalMoments: number;
}

export default function SuccessClient({ couple, totalMoments }: Props) {
  const theme = getTheme(couple.theme);

  /* Apply theme to page */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", couple.theme);
    return () => {
      document.documentElement.removeAttribute("data-theme");
    };
  }, [couple.theme]);

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden"
      style={{ background: "var(--hero-gradient)" }}
    >
      {/* ambient blobs */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: 500, height: 500, borderRadius: "50%",
          top: "-20%", left: "-15%",
          background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          width: 400, height: 400, borderRadius: "50%",
          bottom: "-15%", right: "-10%",
          background: "radial-gradient(circle, var(--secondary-glow) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative z-10 w-full max-w-xl flex flex-col items-center text-center">

        {/* ── Animated checkmark ── */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
          className="mb-6"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl mx-auto"
            style={{
              background: "var(--accent-muted)",
              border: "2px solid var(--accent-1)",
              color: "var(--accent-1)",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            ✦
          </div>
        </motion.div>

        {/* ── Heading ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7 }}
        >
          <p
            className="uppercase mb-3"
            style={{ fontSize: "10px", letterSpacing: "0.3em", color: "var(--text-muted)" }}
          >
            Your story is live
          </p>
          <h1
            className="font-display font-light leading-tight mb-3"
            style={{
              fontSize: "clamp(2rem, 6vw, 3rem)",
              color: "var(--text-primary)",
            }}
          >
            {couple.partner1Name}{" "}
            <span className="gradient-text">&</span>{" "}
            {couple.partner2Name}
          </h1>
          <p style={{ fontSize: "15px", color: "var(--text-muted)" }}>
            {totalMoments} {totalMoments === 1 ? "memory" : "memories"} · {theme.name}
          </p>
        </motion.div>

        {/* ── Share card ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full mt-10"
        >
          <p
            className="mb-4"
            style={{ fontSize: "11px", letterSpacing: "0.2em", color: "var(--text-muted)", textTransform: "uppercase" }}
          >
            Your share card
          </p>
          <ShareCard couple={couple} totalMoments={totalMoments} />
        </motion.div>

        {/* ── CTA buttons ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-3 mt-8 w-full justify-center"
        >
          <Link
            href={`/journey/${couple.accessCode}`}
            className="px-7 py-3 rounded-full text-sm font-medium text-white transition-all hover:opacity-90 active:scale-95"
            style={{
              background: "var(--accent-1)",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            View your journey →
          </Link>
          <Link
            href="/setup"
            className="px-7 py-3 rounded-full text-sm font-medium transition-all hover:opacity-80"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
            }}
          >
            Create another story
          </Link>
        </motion.div>

        {/* ── Access code reminder ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-10 px-6 py-4 rounded-2xl text-left w-full"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            backdropFilter: "blur(16px)",
          }}
        >
          <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
            Your secret access code
          </p>
          <p
            className="font-display text-2xl"
            style={{ color: "var(--accent-1)", letterSpacing: "0.1em" }}
          >
            {couple.accessCode}
          </p>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
            Share this with your partner to view the journey together
          </p>
        </motion.div>

      </div>
    </main>
  );
}
