"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Step1Names from "./steps/Step1Names";
import Step2Theme from "./steps/Step2Theme";
import Step3Code from "./steps/Step3Code";
import Step4Moments from "./steps/Step4Moments";
import { ThemeId } from "@/types";
import type { MomentDraft } from "@/types";
import ParallaxBlob from "@/components/shared/ParallaxBlob";

export interface CoupleForm {
  partner1Name: string;
  partner2Name: string;
  startDate: string;
  bio: string;
  theme: ThemeId;
  accessCode: string;
  pin: string;
}

const TOTAL_STEPS = 4;

const stepVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -80 : 80,
    opacity: 0,
    transition: { duration: 0.25 },
  }),
};

export default function SetupWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [couple, setCouple] = useState<CoupleForm>({
    partner1Name: "",
    partner2Name: "",
    startDate: "",
    bio: "",
    theme: "blush",
    accessCode: "",
    pin: "",
  });
  const [moments, setMoments] = useState<MomentDraft[]>([]);

  const updateCouple = (updates: Partial<CoupleForm>) => {
    setCouple((prev) => ({ ...prev, ...updates }));
    // Apply theme immediately for live preview
    if (updates.theme) {
      document.documentElement.setAttribute("data-theme", updates.theme);
    }
  };

  const goNext = () => {
    setDir(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };
  const goBack = () => {
    setDir(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  async function handleSubmit() {
    if (moments.length === 0) {
      toast.error("Add at least one memory to your story!");
      return;
    }
    setSubmitting(true);

    try {
      const res = await fetch("/api/couple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couple, moments }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to save your story");
        return;
      }

      toast.success("Your love story is live! ✦");
      setTimeout(() => {
        router.push(`/setup/success?code=${couple.accessCode}`);
      }, 1000);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const stepTitles = [
    "Who are you?",
    "Choose your theme",
    "Your secret code",
    "Add your memories",
  ];

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: "var(--hero-gradient)" }}
    >
      <ParallaxBlob size={400} top="-5%" left="-10%" color="accent" delay={0} />
      <ParallaxBlob size={350} bottom="10%" right="-8%" color="secondary" delay={3} />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="text-3xl mb-2" style={{ color: "var(--accent-1)" }}>♥</div>
          <h1
            className="font-display text-3xl font-light"
            style={{ color: "var(--text-primary)" }}
          >
            Create Your Story
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {stepTitles[step - 1]}
          </p>
        </motion.div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: i + 1 === step ? "32px" : "10px",
                background: i + 1 <= step ? "var(--accent-1)" : "var(--border-strong)",
              }}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="relative overflow-hidden" style={{ minHeight: "420px" }}>
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full"
            >
              {step === 1 && (
                <Step1Names couple={couple} updateCouple={updateCouple} onNext={goNext} />
              )}
              {step === 2 && (
                <Step2Theme couple={couple} updateCouple={updateCouple} onNext={goNext} onBack={goBack} />
              )}
              {step === 3 && (
                <Step3Code couple={couple} updateCouple={updateCouple} onNext={goNext} onBack={goBack} />
              )}
              {step === 4 && (
                <Step4Moments
                  couple={couple}
                  moments={moments}
                  setMoments={setMoments}
                  onBack={goBack}
                  onSubmit={handleSubmit}
                  submitting={submitting}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
