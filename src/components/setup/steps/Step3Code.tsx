"use client";

import { useState } from "react";
import { CoupleForm } from "../SetupWizard";

interface Props {
  couple: CoupleForm;
  updateCouple: (u: Partial<CoupleForm>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step3Code({ couple, updateCouple, onNext, onBack }: Props) {
  const [confirm, setConfirm] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  const validateCode = (val: string) => /^[a-z0-9_-]{3,20}$/.test(val);

  async function checkAvailability(code: string) {
    if (!validateCode(code)) return;
    setChecking(true);
    setAvailable(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      setAvailable(!data.valid); // available if NOT found
    } catch {
      setAvailable(null);
    } finally {
      setChecking(false);
    }
  }

  const isValid =
    validateCode(couple.accessCode) &&
    couple.accessCode === confirm &&
    available === true;

  function handleNext() {
    if (!validateCode(couple.accessCode)) {
      setError("Use 3–20 lowercase letters, numbers, or - _");
      return;
    }
    if (couple.accessCode !== confirm) {
      setError("Codes don't match");
      return;
    }
    if (!available) {
      setError("Code already taken, try another");
      return;
    }
    setError("");
    onNext();
  }

  return (
    <div className="glass-card p-8">
      <div className="text-center mb-6">
        <span className="text-3xl">🔑</span>
        <h2
          className="font-display text-2xl font-light mt-2"
          style={{ color: "var(--text-primary)" }}
        >
          Your secret code
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Share this with your partner to unlock the story
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            className="block text-xs font-medium mb-1.5 tracking-wide"
            style={{ color: "var(--text-secondary)" }}
          >
            Choose a code
          </label>
          <div className="relative">
            <input
              className="themed-input pr-10"
              placeholder="e.g. sofia-and-marco"
              value={couple.accessCode}
              onChange={(e) => {
                const val = e.target.value.toLowerCase().replace(/\s+/g, "-");
                updateCouple({ accessCode: val });
                setAvailable(null);
                setError("");
              }}
              onBlur={() => checkAvailability(couple.accessCode)}
              maxLength={20}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
              {checking ? (
                <span className="inline-block w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" style={{ color: "var(--text-muted)" }} />
              ) : available === true ? (
                <span style={{ color: "#22c55e" }}>✓</span>
              ) : available === false ? (
                <span style={{ color: "var(--accent-2)" }}>✗</span>
              ) : null}
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            3–20 chars · lowercase · letters, numbers, - and _
          </p>
          {available === false && (
            <p className="text-xs mt-1" style={{ color: "var(--accent-2)" }}>
              This code is taken. Try a different one.
            </p>
          )}
          {available === true && (
            <p className="text-xs mt-1" style={{ color: "#22c55e" }}>
              ✓ This code is available!
            </p>
          )}
        </div>

        <div>
          <label
            className="block text-xs font-medium mb-1.5 tracking-wide"
            style={{ color: "var(--text-secondary)" }}
          >
            Confirm the code
          </label>
          <input
            className="themed-input"
            placeholder="Re-enter your code"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value.toLowerCase());
              setError("");
            }}
            maxLength={20}
          />
          {confirm && couple.accessCode !== confirm && (
            <p className="text-xs mt-1" style={{ color: "var(--accent-2)" }}>
              Codes don't match yet
            </p>
          )}
        </div>

        {/* Tip box */}
        <div
          className="rounded-xl p-3 text-sm"
          style={{ background: "var(--accent-muted)", color: "var(--text-secondary)" }}
        >
          💡 Pick something meaningful — your song name, a date, an inside joke
        </div>

        {error && (
          <p className="text-sm text-center" style={{ color: "var(--accent-2)" }}>
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button onClick={onBack} className="btn-ghost flex-1">← Back</button>
          <button
            onClick={handleNext}
            disabled={!isValid}
            className="btn-accent flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
