"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";
import ParallaxBlob from "@/components/shared/ParallaxBlob";

export default function EntryScreen() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const router = useRouter();

  async function submitCode(fullCode: string) {
    if (!fullCode.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: fullCode.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setShake(true);
        setCode("");
        setTimeout(() => setShake(false), 600);
        toast.error("That code doesn't match any story. Try again?");
        return;
      }

      sessionStorage.setItem(
        "luminary_session",
        JSON.stringify({
          code: data.code,
          coupleId: data.coupleId,
          theme: data.theme,
          partner1Name: data.partner1Name,
          partner2Name: data.partner2Name,
        })
      );

      router.push(`/journey/${data.code}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "var(--hero-gradient)" }}
    >
      <ParallaxBlob size={500} top="-10%" left="-15%" color="accent" delay={0} />
      <ParallaxBlob size={400} bottom="-5%" right="-10%" color="secondary" delay={2} />
      <ParallaxBlob size={300} top="40%" left="60%" color="muted" delay={4} />

      {/* Floating hearts */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute select-none"
            style={{
              left: `${i * 8.3 + 2}%`,
              bottom: "-30px",
              opacity: 0.25,
              fontSize: `${10 + (i % 3) * 6}px`,
              color: "var(--particle-a)",
              animation: `floatUp ${14 + i * 1.5}s ${i * 1.2}s ease-in-out infinite, sway ${4 + (i % 3)}s ${i * 0.5}s ease-in-out infinite alternate`,
            }}
          >
            {i % 3 === 0 ? "♥" : i % 3 === 1 ? "✦" : "·"}
          </div>
        ))}
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="glass-card-strong relative z-10 w-full max-w-md mx-4 p-8 text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-5xl mb-4"
          style={{ color: "var(--accent-1)" }}
        >
          ♥
        </motion.div>

        <h1 className="font-display text-4xl font-light mb-2" style={{ color: "var(--text-primary)" }}>
          Luminary
        </h1>
        <p className="text-sm mb-8 tracking-wide" style={{ color: "var(--text-muted)" }}>
          Your love story, beautifully told
        </p>

        <p className="text-sm mb-3 font-medium" style={{ color: "var(--text-secondary)" }}>
          Enter your secret code to begin
        </p>

        {/* Single code input */}
        <motion.div
          animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="mb-5"
        >
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toLowerCase())}
            onKeyDown={(e) => e.key === "Enter" && submitCode(code)}
            placeholder="e.g. rose24"
            maxLength={30}
            autoComplete="off"
            spellCheck={false}
            className="w-full text-center text-xl font-medium tracking-widest rounded-2xl py-4 px-6 outline-none transition-all duration-200"
            style={{
              background: "var(--bg-secondary)",
              border: `2px solid ${code ? "var(--accent-1)" : "var(--border-subtle)"}`,
              color: "var(--text-primary)",
              boxShadow: code ? "0 0 0 3px var(--accent-muted)" : "none",
              fontFamily: "var(--font-ui)",
            }}
          />
        </motion.div>

        <button
          onClick={() => submitCode(code)}
          disabled={code.trim().length < 3 || loading}
          className="btn-accent w-full mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Opening...
            </span>
          ) : (
            "Reveal Our Story ✦"
          )}
        </button>

        <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
            Want to create your own love story?
          </p>
          <Link href="/setup" className="text-sm font-medium" style={{ color: "var(--accent-1)" }}>
            Start your journey →
          </Link>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="relative z-10 mt-8 text-xs tracking-widest uppercase"
        style={{ color: "var(--text-muted)" }}
      >
        Every love story deserves to be remembered
      </motion.p>
    </div>
  );
}
