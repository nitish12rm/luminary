"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface Props {
  code: string;
  partner1: string;
  partner2: string;
}

export default function PinGate({ code, partner1, partner2 }: Props) {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const router = useRouter();

  const pin = digits.join("");

  function handleInput(idx: number, val: string) {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = digit;
    setDigits(next);
    setError("");
    if (digit && idx < 3) refs[idx + 1].current?.focus();
    if (next.every((d) => d !== "") && digit) {
      submit(next.join(""));
    }
  }

  function handleKeyDown(e: React.KeyboardEvent, idx: number) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      refs[idx - 1].current?.focus();
    }
  }

  async function submit(pinVal: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/pin-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, pin: pinVal }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        setError("Wrong PIN. Try again.");
        setDigits(["", "", "", ""]);
        setTimeout(() => refs[0].current?.focus(), 50);
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--hero-gradient)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card p-10 w-full max-w-sm text-center"
      >
        <div className="text-4xl mb-4">🔒</div>
        <h1
          className="font-display text-2xl font-light mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          {partner1} &amp; {partner2}
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
          Enter the PIN to view this story
        </p>

        <div className="flex gap-3 justify-center mb-4">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={refs[i]}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={d}
              autoFocus={i === 0}
              disabled={loading}
              onChange={(e) => handleInput(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className="themed-input text-center text-2xl font-bold"
              style={{
                width: "3.5rem",
                height: "3.5rem",
                padding: "0",
                opacity: loading ? 0.5 : 1,
              }}
            />
          ))}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm"
            style={{ color: "var(--accent-2)" }}
          >
            {error}
          </motion.p>
        )}

        {loading && (
          <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
            Checking...
          </p>
        )}

        {pin.length === 4 && !loading && !error && (
          <button
            onClick={() => submit(pin)}
            className="btn-accent w-full mt-4"
          >
            Unlock
          </button>
        )}
      </motion.div>
    </div>
  );
}
