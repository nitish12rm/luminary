"use client";

import { useEffect, useState } from "react";
import { ThemeId } from "@/types";

interface ParticleFieldProps {
  theme: ThemeId;
}

interface Particle {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
  swayDuration: number;
  swayDelay: number;
  opacity: number;
}

function useParticles(count: number): Particle[] {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 12 + 8,
      delay: Math.random() * 8,
      duration: Math.random() * 10 + 12,
      swayDuration: Math.random() * 3 + 3,
      swayDelay: Math.random() * 4,
      opacity: Math.random() * 0.4 + 0.4,
    }));
    setParticles(generated);
  }, [count]);

  return particles;
}

// ── Blush: floating hearts ──
function FloatingHearts() {
  const particles = useParticles(18);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute select-none"
          style={{
            left: `${p.x}%`,
            bottom: "-20px",
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            animation: `floatUp ${p.duration}s ${p.delay}s ease-in-out infinite, sway ${p.swayDuration}s ${p.swayDelay}s ease-in-out infinite alternate`,
          }}
        >
          {p.id % 3 === 0 ? "♥" : p.id % 3 === 1 ? "✦" : "·"}
        </div>
      ))}
    </div>
  );
}

// ── Golden: falling petals ──
function FloatingPetals() {
  const particles = useParticles(16);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute select-none"
          style={{
            left: `${p.x}%`,
            top: "-20px",
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            animation: `petalFall ${p.duration}s ${p.delay}s linear infinite`,
          }}
        >
          {p.id % 4 === 0 ? "✿" : p.id % 4 === 1 ? "❋" : p.id % 4 === 2 ? "✺" : "✦"}
        </div>
      ))}
    </div>
  );
}

// ── Velvet: twinkling stars ──
function FloatingStars() {
  const particles = useParticles(30);
  const [shooting, setShooting] = useState<{ id: number; top: number; delay: number }[]>([]);

  useEffect(() => {
    setShooting(
      Array.from({ length: 4 }, (_, i) => ({
        id: i,
        top: Math.random() * 40 + 5,
        delay: Math.random() * 12,
      }))
    );
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute select-none rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${Math.random() * 90}%`,
            width: `${Math.max(2, p.size / 6)}px`,
            height: `${Math.max(2, p.size / 6)}px`,
            background: p.id % 3 === 0 ? "var(--particle-a)" : p.id % 3 === 1 ? "var(--particle-b)" : "var(--particle-c)",
            animation: `twinkle ${p.swayDuration + 1}s ${p.swayDelay}s ease-in-out infinite`,
          }}
        />
      ))}
      {shooting.map((s) => (
        <div
          key={s.id}
          className="absolute select-none"
          style={{
            top: `${s.top}%`,
            left: 0,
            width: "80px",
            height: "1px",
            background: "linear-gradient(to right, transparent, var(--particle-b), transparent)",
            borderRadius: "50%",
            animation: `shootingStar ${8 + s.delay}s ${s.delay}s linear infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ── Scrapbook: floating glitter ──
function ScrapbookGlitter() {
  const particles = useParticles(44);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => {
        const symbols = ["✦", "✧", "★", "✩", "◆", "◇", "✱", "✲", "❋", "·", "♥", "✿"];
        const colors  = [
          "var(--particle-a)", "var(--particle-b)", "var(--particle-c)",
          "#40c8c0", "#ff8fcc", "#ffb3e0", "#ffe566", "#c77dff",
        ];
        const sym   = symbols[p.id % symbols.length];
        const color = colors[p.id % colors.length];
        const top   = ((p.id * 13 + 8) % 88) + 4; // deterministic vertical spread

        return (
          <div
            key={p.id}
            className="absolute select-none"
            style={{
              left:      `${p.x}%`,
              top:       `${top}%`,
              fontSize:  `${p.size * 0.55 + 5}px`,
              color,
              animation: [
                `glitterPop ${p.swayDuration + 1.5}s ${p.swayDelay}s ease-in-out infinite`,
                `glitterDrift ${p.duration * 0.7}s ${p.swayDelay * 0.5}s ease-in-out infinite`,
              ].join(", "),
            }}
          >
            {sym}
          </div>
        );
      })}
    </div>
  );
}

export default function ParticleField({ theme }: ParticleFieldProps) {
  if (theme === "blush")     return <FloatingHearts />;
  if (theme === "golden")    return <FloatingPetals />;
  if (theme === "velvet")    return <FloatingStars />;
  if (theme === "scrapbook") return <ScrapbookGlitter />;
  return null;
}
