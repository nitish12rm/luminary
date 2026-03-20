"use client";

import { motion } from "framer-motion";
import { IMoment, ICouple } from "@/types";
import TimelineNode from "./TimelineNode";

interface Props {
  moments: IMoment[];
  couple: ICouple;
}

export default function Timeline({ moments, couple }: Props) {
  if (!moments.length) {
    return (
      <div className="py-24 text-center" style={{ color: "var(--text-muted)" }}>
        <p className="font-display text-2xl">No memories yet...</p>
      </div>
    );
  }

  return (
    <section className="relative py-20 px-5 md:px-8">
      <div className="max-w-[560px] mx-auto">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <p
            className="uppercase mb-4"
            style={{
              fontSize: "9px",
              letterSpacing: "0.32em",
              color: "var(--text-muted)",
            }}
          >
            Our Story
          </p>
          <h2
            className="font-display font-light"
            style={{
              fontSize: "clamp(1.75rem, 6vw, 2.6rem)",
              lineHeight: 1.25,
              color: "var(--text-primary)",
            }}
          >
            The moments that made us
          </h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.35, ease: "easeOut" }}
            className="h-px w-14 mx-auto mt-6"
            style={{ background: "var(--timeline-line)", transformOrigin: "center" }}
          />
        </motion.div>

        {/* ── Moments ── */}
        <div>
          {moments.map((moment, idx) => (
            <div key={moment._id}>
              <TimelineNode moment={moment} couple={couple} index={idx} />

              {/* Divider between moments */}
              {idx < moments.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  className="flex flex-col items-center my-16 md:my-20"
                  aria-hidden
                >
                  <div className="w-px h-10" style={{ background: "var(--border-strong)" }} />
                  <div
                    className="w-1.5 h-1.5 rounded-full my-2.5"
                    style={{ background: "var(--accent-1)", opacity: 0.35 }}
                  />
                  <div className="w-px h-10" style={{ background: "var(--border-strong)" }} />
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {/* ── Footer ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="text-center mt-20"
        >
          <div className="w-10 h-px mx-auto mb-8" style={{ background: "var(--border-strong)" }} />
          <motion.span
            animate={{ scale: [1, 1.18, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="text-3xl block mb-5"
            style={{ color: "var(--accent-1)" }}
          >
            ♥
          </motion.span>
          <p
            className="font-display font-light italic"
            style={{
              fontSize: "clamp(1.2rem, 4vw, 1.6rem)",
              color: "var(--text-secondary)",
              lineHeight: 1.4,
            }}
          >
            And the story continues...
          </p>
          <p className="mt-3" style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            with every sunrise you share
          </p>
        </motion.div>

      </div>
    </section>
  );
}
