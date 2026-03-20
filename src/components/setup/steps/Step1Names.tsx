"use client";

import { CoupleForm } from "../SetupWizard";

interface Props {
  couple: CoupleForm;
  updateCouple: (u: Partial<CoupleForm>) => void;
  onNext: () => void;
}

export default function Step1Names({ couple, updateCouple, onNext }: Props) {
  const isValid =
    couple.partner1Name.trim() &&
    couple.partner2Name.trim() &&
    couple.startDate;

  return (
    <div className="glass-card p-8">
      <div className="text-center mb-6">
        <span className="text-3xl">💕</span>
        <h2
          className="font-display text-2xl font-light mt-2"
          style={{ color: "var(--text-primary)" }}
        >
          Tell us about you two
        </h2>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              className="block text-xs font-medium mb-1.5 tracking-wide"
              style={{ color: "var(--text-secondary)" }}
            >
              Your Name
            </label>
            <input
              className="themed-input"
              placeholder="e.g. Sofia"
              value={couple.partner1Name}
              onChange={(e) => updateCouple({ partner1Name: e.target.value })}
            />
          </div>
          <div>
            <label
              className="block text-xs font-medium mb-1.5 tracking-wide"
              style={{ color: "var(--text-secondary)" }}
            >
              Their Name
            </label>
            <input
              className="themed-input"
              placeholder="e.g. Marco"
              value={couple.partner2Name}
              onChange={(e) => updateCouple({ partner2Name: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label
            className="block text-xs font-medium mb-1.5 tracking-wide"
            style={{ color: "var(--text-secondary)" }}
          >
            When did your story begin?
          </label>
          <input
            type="date"
            className="themed-input"
            value={couple.startDate}
            onChange={(e) => updateCouple({ startDate: e.target.value })}
            max={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div>
          <label
            className="block text-xs font-medium mb-1.5 tracking-wide"
            style={{ color: "var(--text-secondary)" }}
          >
            A little note about you two{" "}
            <span style={{ color: "var(--text-muted)" }}>(optional)</span>
          </label>
          <textarea
            className="themed-input resize-none"
            rows={3}
            placeholder="What makes your story unique..."
            value={couple.bio}
            onChange={(e) => updateCouple({ bio: e.target.value })}
            maxLength={300}
          />
          <p className="text-xs mt-1 text-right" style={{ color: "var(--text-muted)" }}>
            {couple.bio.length}/300
          </p>
        </div>

        <button
          onClick={onNext}
          disabled={!isValid}
          className="btn-accent w-full mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
