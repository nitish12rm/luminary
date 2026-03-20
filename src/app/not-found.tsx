"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-4"
      style={{ background: "var(--hero-gradient)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-6xl mb-4" style={{ color: "var(--accent-1)" }}>
          ♥
        </div>
        <h1 className="font-display text-3xl mb-2" style={{ color: "var(--text-primary)" }}>
          Story not found
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
          This love story doesn't exist yet — or the code is wrong.
        </p>
        <Link href="/" className="btn-accent inline-block">
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
