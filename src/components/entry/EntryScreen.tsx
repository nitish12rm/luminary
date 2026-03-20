"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";
import ParallaxBlob from "@/components/shared/ParallaxBlob";

export default function EntryScreen() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const handleInput = (i: number, val: string) => {
    const char = val.slice(-1).toLowerCase();
    if (!/[a-z0-9]/.test(char) && char !== "") return;

    const next = [...code];
    next[i] = char;
    setCode(next);

    if (char && i < 5) {
      inputRefs.current[i + 1]?.focus();
    }

    if (next.every((c) => c !== "") && next.join("").length === 6) {
      submitCode(next.join(""));
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
    if (e.key === "Enter") {
      const full = code.join("");
      if (full.length === 6) submitCode(full);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...code];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] || "";
    setCode(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    if (pasted.length === 6) submitCode(pasted);
  };

  async function submitCode(fullCode: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: fullCode }),
      });
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setShake(true);
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
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
      {/* Ambient blobs */}
      <ParallaxBlob size={500} top="-10%" left="-15%" color="accent" delay={0} />
      <ParallaxBlob size={400} bottom="-5%" right="-10%" color="secondary" delay={2} />
      <ParallaxBlob size={300} top="40%" left="60%" color="muted" delay={4} />

      {/* Floating hearts bg */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl select-none"
            style={{
              left: `${(i * 8.3) + 2}%`,
              bottom: "-30px",
              opacity: 0.25,
              fontSize: `${10 + (i % 3) * 6}px`,
              color: "var(--particle-a)",
              animation: `floatUp ${14 + i * 1.5}s ${i * 1.2}s ease-in-out infinite, sway ${4 + i % 3}s ${i * 0.5}s ease-in-out infinite alternate`,
            }}
          >
            {i % 3 === 0 ? "♥" : i % 3 === 1 ? "✦" : "·"}
          </div>
        ))}
      </div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="glass-card-strong relative z-10 w-full max-w-md mx-4 p-8 text-center"
      >
        {/* Icon */}
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-5xl mb-4"
          style={{ color: "var(--accent-1)" }}
        >
          ♥
        </motion.div>

        <h1
          className="font-display text-4xl font-light mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Luminary
        </h1>
        <p
          className="text-sm mb-8 tracking-wide"
          style={{ color: "var(--text-muted)" }}
        >
          Your love story, beautifully told
        </p>

        <p
          className="text-sm mb-4 font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          Enter your secret code to begin
        </p>

        {/* Code inputs */}
        <motion.div
          animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex gap-2 justify-center mb-6"
          onPaste={handlePaste}
        >
          {code.map((c, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="text"
              maxLength={1}
              value={c}
              onChange={(e) => handleInput(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-11 h-12 text-center text-lg font-medium rounded-xl transition-all duration-200 outline-none"
              style={{
                background: "var(--bg-secondary)",
                border: `2px solid ${c ? "var(--accent-1)" : "var(--border-subtle)"}`,
                color: "var(--text-primary)",
                boxShadow: c ? "0 0 0 3px var(--accent-muted)" : "none",
                fontFamily: "var(--font-ui)",
              }}
            />
          ))}
        </motion.div>

        <button
          onClick={() => submitCode(code.join(""))}
          disabled={code.join("").length < 6 || loading}
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
          <Link
            href="/setup"
            className="text-sm font-medium transition-colors"
            style={{ color: "var(--accent-1)" }}
          >
            Start your journey →
          </Link>
        </div>
      </motion.div>

      {/* Bottom tagline */}
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
