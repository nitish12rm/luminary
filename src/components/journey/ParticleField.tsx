"use client";

import { useEffect, useState, useRef } from "react";
import { ThemeId } from "@/types";

interface ParticleFieldProps {
  /** Initial theme from server; component listens for live data-theme changes */
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

// ── Blush: layered love particles with scroll parallax ──
function FloatingHearts() {
  // Three depth layers — each responds to scroll at a different speed
  const layerARef = useRef<HTMLDivElement>(null); // close  — most parallax
  const layerBRef = useRef<HTMLDivElement>(null); // mid
  const layerCRef = useRef<HTMLDivElement>(null); // far    — least parallax

  const ghostHearts  = useParticles(14); // large & faint — layer A
  const mediumHearts = useParticles(24); // mid-size      — layer B
  const smallBits    = useParticles(22); // tiny + static — layer C

  // Scroll parallax: spring each layer toward -scrollY * factor
  useEffect(() => {
    const layers = [
      { ref: layerARef, factor: 0.045 },
      { ref: layerBRef, factor: 0.025 },
      { ref: layerCRef, factor: 0.01  },
    ];
    const current = [0, 0, 0];
    let rafId: number;

    function tick() {
      const scrollY = window.scrollY;
      layers.forEach(({ ref, factor }, i) => {
        const target = -scrollY * factor;
        current[i] += (target - current[i]) * 0.07; // spring smoothing
        if (ref.current) {
          ref.current.style.transform = `translateY(${current[i].toFixed(2)}px)`;
        }
      });
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">

      {/* ── Layer A: large ghost hearts — slowest, most parallax ── */}
      <div ref={layerARef} className="absolute inset-0">
        {ghostHearts.map((p) => (
          // Outer div controls peak opacity; inner div runs the animation
          <div
            key={p.id}
            className="absolute select-none"
            style={{ left: `${p.x}%`, bottom: "-5px", opacity: 0.08 }}
          >
            <div
              style={{
                fontSize:  `${p.size + 16}px`,
                color:     p.id % 2 === 0 ? "var(--particle-a)" : "var(--particle-c)",
                animation: `loveFloat ${p.duration + 10}s ${p.delay}s ease-in-out infinite,
                            heartbeat  ${p.swayDuration + 2}s ${p.swayDelay}s ease-in-out infinite`,
              }}
            >
              {p.id % 2 === 0 ? "♥" : "♡"}
            </div>
          </div>
        ))}
      </div>

      {/* ── Layer B: medium love symbols — moderate parallax ── */}
      <div ref={layerBRef} className="absolute inset-0">
        {mediumHearts.map((p) => {
          const SYMBOLS = ["♥", "❤", "♡", "❣", "♥", "✿", "♡", "❤"];
          const color   = p.id % 3 === 0 ? "var(--particle-a)"
                        : p.id % 3 === 1 ? "var(--particle-b)"
                        :                  "var(--particle-c)";
          return (
            <div
              key={p.id}
              className="absolute select-none"
              style={{ left: `${p.x}%`, bottom: "-5px", opacity: p.opacity * 0.72 }}
            >
              <div
                style={{
                  fontSize:  `${p.size}px`,
                  color,
                  animation: `loveFloat ${p.duration}s ${p.delay}s ease-in-out infinite,
                              sway       ${p.swayDuration}s ${p.swayDelay}s ease-in-out infinite alternate`,
                }}
              >
                {SYMBOLS[p.id % SYMBOLS.length]}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Layer C: tiny bits (rising) + sparkles (static twinkle) ── */}
      <div ref={layerCRef} className="absolute inset-0">
        {/* Rising tiny dots & sparkles */}
        {smallBits.slice(0, 14).map((p) => {
          const TINY = ["·", "✦", "✧", "·", "✦", "✩", "·"];
          return (
            <div
              key={p.id}
              className="absolute select-none"
              style={{ left: `${p.x}%`, bottom: "-5px", opacity: p.opacity * 0.5 }}
            >
              <div
                style={{
                  fontSize:  `${p.size * 0.45 + 4}px`,
                  color:     p.id % 2 === 0 ? "var(--particle-a)" : "var(--particle-b)",
                  animation: `loveFloat ${p.duration * 0.75}s ${p.delay}s ease-in-out infinite`,
                }}
              >
                {TINY[p.id % TINY.length]}
              </div>
            </div>
          );
        })}

        {/* Static twinkling sparkles & blossoms spread across the screen */}
        {smallBits.slice(14).map((p) => {
          const top      = ((p.id * 19 + 11) % 84) + 5;
          const SPARKLES = ["✦", "✧", "✿", "❀", "✩", "✦", "❋", "✧"];
          return (
            <div
              key={`tw${p.id}`}
              className="absolute select-none"
              style={{
                left:      `${p.x}%`,
                top:       `${top}%`,
                fontSize:  `${p.size * 0.5 + 5}px`,
                color:     p.id % 2 === 0 ? "var(--particle-a)" : "var(--particle-c)",
                opacity:   0,
                animation: `twinkle ${p.swayDuration + 2.5}s ${p.swayDelay}s ease-in-out infinite`,
              }}
            >
              {SPARKLES[p.id % SPARKLES.length]}
            </div>
          );
        })}
      </div>

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
  // Keep in sync with live data-theme attribute so switching themes updates particles
  const [active, setActive] = useState<ThemeId>(theme);

  useEffect(() => {
    // Read immediately in case ThemeProvider / ThemeSwitcher already changed it
    const cur = document.documentElement.getAttribute("data-theme") as ThemeId | null;
    if (cur) setActive(cur);

    const observer = new MutationObserver(() => {
      const next = document.documentElement.getAttribute("data-theme") as ThemeId | null;
      if (next) setActive(next);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  if (active === "blush")     return <FloatingHearts />;
  if (active === "golden")    return <FloatingPetals />;
  if (active === "velvet")    return <FloatingStars />;
  if (active === "scrapbook") return <ScrapbookGlitter />;
  return null;
}
