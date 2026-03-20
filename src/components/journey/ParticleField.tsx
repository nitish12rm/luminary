"use client";

import { useEffect, useState, useRef } from "react";
import { ThemeId } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// Shared types & hooks
// ─────────────────────────────────────────────────────────────────────────────

interface Particle {
  id:          number;
  x:           number;  // left  %  (0-100)
  y:           number;  // top   %  (0-105) — used for static particles & base pos
  size:        number;
  negDelay:    number;  // NEGATIVE animation delay → pre-scatters mid-cycle
  duration:    number;
  swayDuration:number;
  swayDelay:   number;
  opacity:     number;
}

function useParticles(count: number): Particle[] {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const list = Array.from({ length: count }, (_, i) => {
      const duration = Math.random() * 10 + 12;
      return {
        id:           i,
        x:            Math.random() * 100,
        y:            Math.random() * 105,          // spread across full height
        size:         Math.random() * 12 + 8,
        negDelay:     -(Math.random() * duration),  // pre-scatter in cycle
        duration,
        swayDuration: Math.random() * 3 + 3,
        swayDelay:    Math.random() * 4,
        opacity:      Math.random() * 0.4 + 0.4,
      };
    });
    setParticles(list);
  }, [count]);

  return particles;
}

/**
 * Applies smooth scroll-parallax to up to 3 layer divs.
 * Each layer springs toward  –scrollY * factor.
 */
function useLayerParallax(
  refs:    [React.RefObject<HTMLDivElement>, React.RefObject<HTMLDivElement>, React.RefObject<HTMLDivElement>],
  factors: [number, number, number]
) {
  useEffect(() => {
    const curr = [0, 0, 0];
    let rafId: number;

    const tick = () => {
      const sy = window.scrollY;
      for (let i = 0; i < 3; i++) {
        curr[i] += (-sy * factors[i] - curr[i]) * 0.07;
        if (refs[i].current)
          refs[i].current!.style.transform = `translateY(${curr[i].toFixed(2)}px)`;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

// ─────────────────────────────────────────────────────────────────────────────
// ── BLUSH: love particles ──
//   Rising hearts, pre-scattered via negative delay so they fill the screen.
//   3 depth layers with scroll parallax.
// ─────────────────────────────────────────────────────────────────────────────

function FloatingHearts() {
  const layerA = useRef<HTMLDivElement>(null); // large ghost hearts  — most parallax
  const layerB = useRef<HTMLDivElement>(null); // medium love symbols
  const layerC = useRef<HTMLDivElement>(null); // tiny bits + twinkling sparkles

  const bigHearts    = useParticles(16);
  const medHearts    = useParticles(28);
  const smallBits    = useParticles(18);
  const twinkleSpots = useParticles(12);

  useLayerParallax([layerA, layerB, layerC], [0.05, 0.028, 0.012]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">

      {/* Layer A — large ghost hearts, pulse with heartbeat */}
      <div ref={layerA} className="absolute inset-0">
        {bigHearts.map((p) => (
          <div
            key={p.id}
            className="absolute select-none"
            style={{ left: `${p.x}%`, bottom: "-5px", opacity: 0.09 }}
          >
            <div style={{
              fontSize:  `${p.size + 16}px`,
              color:     p.id % 2 === 0 ? "var(--particle-a)" : "var(--particle-c)",
              animation: `loveFloat ${p.duration + 10}s ${p.negDelay}s ease-in-out infinite,
                          heartbeat  ${p.swayDuration + 2}s ${p.swayDelay}s ease-in-out infinite`,
            }}>
              {p.id % 2 === 0 ? "♥" : "♡"}
            </div>
          </div>
        ))}
      </div>

      {/* Layer B — medium love symbols, gentle sway */}
      <div ref={layerB} className="absolute inset-0">
        {medHearts.map((p) => {
          const SYM   = ["♥","❤","♡","❣","♥","✿","♡","❤","♥","♡"];
          const color = p.id % 3 === 0 ? "var(--particle-a)"
                      : p.id % 3 === 1 ? "var(--particle-b)"
                      :                  "var(--particle-c)";
          return (
            <div
              key={p.id}
              className="absolute select-none"
              style={{ left: `${p.x}%`, bottom: "-5px", opacity: p.opacity * 0.7 }}
            >
              <div style={{
                fontSize:  `${p.size}px`,
                color,
                animation: `loveFloat ${p.duration}s ${p.negDelay}s ease-in-out infinite,
                            sway       ${p.swayDuration}s ${p.swayDelay}s ease-in-out infinite alternate`,
              }}>
                {SYM[p.id % SYM.length]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Layer C — tiny rising bits */}
      <div ref={layerC} className="absolute inset-0">
        {smallBits.map((p) => {
          const SYM = ["·","✦","✧","·","✦","✩","·","·"];
          return (
            <div
              key={p.id}
              className="absolute select-none"
              style={{ left: `${p.x}%`, bottom: "-5px", opacity: p.opacity * 0.45 }}
            >
              <div style={{
                fontSize:  `${p.size * 0.45 + 4}px`,
                color:     p.id % 2 === 0 ? "var(--particle-a)" : "var(--particle-b)",
                animation: `loveFloat ${p.duration * 0.7}s ${p.negDelay}s ease-in-out infinite`,
              }}>
                {SYM[p.id % SYM.length]}
              </div>
            </div>
          );
        })}

        {/* Twinkling sparkles already scattered across screen by top: y% */}
        {twinkleSpots.map((p) => {
          const SYM = ["✦","✧","✿","❀","✩","❋","✦","✧"];
          return (
            <div
              key={`tw${p.id}`}
              className="absolute select-none"
              style={{
                left:      `${p.x}%`,
                top:       `${p.y}%`,
                fontSize:  `${p.size * 0.5 + 5}px`,
                color:     p.id % 2 === 0 ? "var(--particle-a)" : "var(--particle-c)",
                animation: `twinkle ${p.swayDuration + 2.5}s ${p.negDelay}s ease-in-out infinite`,
              }}
            >
              {SYM[p.id % SYM.length]}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── GOLDEN: falling petals ──
//   Petals fall from top, pre-scattered via negative delay.
//   Sparkles twinkle at fixed positions. 3 depth layers.
// ─────────────────────────────────────────────────────────────────────────────

function FloatingPetals() {
  const layerA = useRef<HTMLDivElement>(null);
  const layerB = useRef<HTMLDivElement>(null);
  const layerC = useRef<HTMLDivElement>(null);

  const bigPetals  = useParticles(14);
  const medPetals  = useParticles(26);
  const smallPetals= useParticles(14);
  const sparkles   = useParticles(10);

  useLayerParallax([layerA, layerB, layerC], [0.04, 0.022, 0.01]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">

      {/* Layer A — large petals, slow fall */}
      <div ref={layerA} className="absolute inset-0">
        {bigPetals.map((p) => {
          const SYM = ["✿","❋","✺","❀","✿","❋"];
          return (
            <div
              key={p.id}
              className="absolute select-none"
              style={{ left: `${p.x}%`, top: "-5px", opacity: 0.55 + p.opacity * 0.15 }}
            >
              <div style={{
                fontSize:  `${p.size + 6}px`,
                color:     p.id % 3 === 0 ? "var(--particle-a)"
                         : p.id % 3 === 1 ? "var(--particle-b)"
                         :                  "var(--particle-c)",
                animation: `petalFall ${p.duration + 6}s ${p.negDelay}s ease-in-out infinite`,
              }}>
                {SYM[p.id % SYM.length]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Layer B — medium petals with gentle sway */}
      <div ref={layerB} className="absolute inset-0">
        {medPetals.map((p) => {
          const SYM = ["✿","❋","✺","❀","✦","✿","❋","✺"];
          return (
            <div
              key={p.id}
              className="absolute select-none"
              style={{ left: `${p.x}%`, top: "-5px", opacity: p.opacity * 0.65 }}
            >
              <div style={{
                fontSize:  `${p.size}px`,
                color:     p.id % 2 === 0 ? "var(--particle-a)" : "var(--particle-b)",
                animation: `petalFall ${p.duration}s ${p.negDelay}s ease-in-out infinite,
                            sway       ${p.swayDuration}s ${p.swayDelay}s ease-in-out infinite alternate`,
              }}>
                {SYM[p.id % SYM.length]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Layer C — tiny petals (fast) + twinkling golden sparkles */}
      <div ref={layerC} className="absolute inset-0">
        {smallPetals.map((p) => (
          <div
            key={p.id}
            className="absolute select-none"
            style={{ left: `${p.x}%`, top: "-5px", opacity: p.opacity * 0.45 }}
          >
            <div style={{
              fontSize:  `${p.size * 0.55 + 4}px`,
              color:     "var(--particle-b)",
              animation: `petalFall ${p.duration * 0.7}s ${p.negDelay}s linear infinite`,
            }}>
              {p.id % 2 === 0 ? "·" : "✦"}
            </div>
          </div>
        ))}

        {sparkles.map((p) => (
          <div
            key={`sp${p.id}`}
            className="absolute select-none"
            style={{
              left:      `${p.x}%`,
              top:       `${p.y}%`,
              fontSize:  `${p.size * 0.5 + 5}px`,
              color:     p.id % 2 === 0 ? "var(--particle-a)" : "var(--particle-c)",
              animation: `twinkle ${p.swayDuration + 2}s ${p.negDelay}s ease-in-out infinite`,
            }}
          >
            {p.id % 3 === 0 ? "✦" : p.id % 3 === 1 ? "✧" : "✩"}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── VELVET: twinkling stars ──
//   Stars at random fixed positions, twinkling. 3 depth layers with parallax.
//   Shooting stars cross the sky on a separate non-parallax layer.
// ─────────────────────────────────────────────────────────────────────────────

function FloatingStars() {
  const layerA   = useRef<HTMLDivElement>(null);
  const layerB   = useRef<HTMLDivElement>(null);
  const layerC   = useRef<HTMLDivElement>(null);

  const bigStars  = useParticles(16);
  const medStars  = useParticles(28);
  const tinyStars = useParticles(26);

  const [shooting, setShooting] = useState<{ id: number; top: number; negDelay: number }[]>([]);

  useEffect(() => {
    setShooting(Array.from({ length: 5 }, (_, i) => ({
      id:       i,
      top:      Math.random() * 50 + 5,
      negDelay: -(Math.random() * 10),
    })));
  }, []);

  useLayerParallax([layerA, layerB, layerC], [0.045, 0.024, 0.01]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">

      {/* Layer A — large dim star glows */}
      <div ref={layerA} className="absolute inset-0">
        {bigStars.map((p) => (
          <div
            key={p.id}
            className="absolute select-none rounded-full"
            style={{
              left:      `${p.x}%`,
              top:       `${p.y}%`,
              width:     `${Math.max(3, p.size / 4)}px`,
              height:    `${Math.max(3, p.size / 4)}px`,
              background: p.id % 3 === 0 ? "var(--particle-a)"
                        : p.id % 3 === 1 ? "var(--particle-b)"
                        :                  "var(--particle-c)",
              boxShadow: `0 0 ${p.size / 2}px currentColor`,
              animation: `twinkle ${p.swayDuration + 2}s ${p.negDelay}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* Layer B — medium star dots + some sparkle chars */}
      <div ref={layerB} className="absolute inset-0">
        {medStars.map((p) => {
          const useDot = p.id % 3 !== 0;
          return useDot ? (
            <div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left:      `${p.x}%`,
                top:       `${p.y}%`,
                width:     `${Math.max(2, p.size / 6)}px`,
                height:    `${Math.max(2, p.size / 6)}px`,
                background: p.id % 2 === 0 ? "var(--particle-a)" : "var(--particle-b)",
                animation: `twinkle ${p.swayDuration + 1}s ${p.negDelay}s ease-in-out infinite`,
              }}
            />
          ) : (
            <div
              key={p.id}
              className="absolute select-none"
              style={{
                left:      `${p.x}%`,
                top:       `${p.y}%`,
                fontSize:  `${p.size * 0.6 + 4}px`,
                color:     "var(--particle-c)",
                animation: `twinkle ${p.swayDuration + 1.5}s ${p.negDelay}s ease-in-out infinite`,
              }}
            >
              ✦
            </div>
          );
        })}
      </div>

      {/* Layer C — tiny distant stars */}
      <div ref={layerC} className="absolute inset-0">
        {tinyStars.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left:      `${p.x}%`,
              top:       `${p.y}%`,
              width:     `${Math.max(1, p.size / 9)}px`,
              height:    `${Math.max(1, p.size / 9)}px`,
              background: "var(--particle-b)",
              animation: `twinkle ${p.swayDuration}s ${p.negDelay}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* Shooting stars — no parallax, own layer */}
      <div className="absolute inset-0 pointer-events-none">
        {shooting.map((s) => (
          <div
            key={s.id}
            className="absolute"
            style={{
              top:        `${s.top}%`,
              left:       0,
              width:      "90px",
              height:     "1px",
              background: "linear-gradient(to right, transparent, var(--particle-b), transparent)",
              borderRadius: "50%",
              animation:  `shootingStar ${9 + Math.abs(s.negDelay)}s ${s.negDelay}s linear infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── SCRAPBOOK: glitter ──
//   Sparkles/symbols scattered across the full screen, popping and drifting.
//   3 depth layers with scroll parallax.
// ─────────────────────────────────────────────────────────────────────────────

function ScrapbookGlitter() {
  const layerA = useRef<HTMLDivElement>(null);
  const layerB = useRef<HTMLDivElement>(null);
  const layerC = useRef<HTMLDivElement>(null);

  const bigGlitter = useParticles(16);
  const medGlitter = useParticles(26);
  const tiny       = useParticles(20);

  useLayerParallax([layerA, layerB, layerC], [0.045, 0.024, 0.01]);

  const COLORS = [
    "var(--particle-a)", "var(--particle-b)", "var(--particle-c)",
    "#40c8c0", "#ff8fcc", "#ffb3e0", "#ffe566", "#c77dff",
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">

      {/* Layer A — large sparkle symbols */}
      <div ref={layerA} className="absolute inset-0">
        {bigGlitter.map((p) => {
          const SYM = ["✦","★","◆","✱","❋","✦","★","◆"];
          return (
            <div
              key={p.id}
              className="absolute select-none"
              style={{
                left:      `${p.x}%`,
                top:       `${p.y}%`,
                fontSize:  `${p.size * 0.7 + 7}px`,
                color:     COLORS[p.id % COLORS.length],
                animation: `glitterPop ${p.swayDuration + 2}s ${p.negDelay}s ease-in-out infinite,
                            glitterDrift ${p.duration * 0.6}s ${p.swayDelay * -0.5}s ease-in-out infinite`,
              }}
            >
              {SYM[p.id % SYM.length]}
            </div>
          );
        })}
      </div>

      {/* Layer B — medium mixed symbols with drift */}
      <div ref={layerB} className="absolute inset-0">
        {medGlitter.map((p) => {
          const SYM = ["✦","✧","★","✩","◆","◇","✱","✲","❋","·","♥","✿","✦","✧"];
          return (
            <div
              key={p.id}
              className="absolute select-none"
              style={{
                left:      `${p.x}%`,
                top:       `${p.y}%`,
                fontSize:  `${p.size * 0.55 + 5}px`,
                color:     COLORS[p.id % COLORS.length],
                animation: `glitterPop ${p.swayDuration + 1.5}s ${p.negDelay}s ease-in-out infinite,
                            glitterDrift ${p.duration * 0.7}s ${p.swayDelay * -0.3}s ease-in-out infinite`,
              }}
            >
              {SYM[p.id % SYM.length]}
            </div>
          );
        })}
      </div>

      {/* Layer C — tiny glitter bits */}
      <div ref={layerC} className="absolute inset-0">
        {tiny.map((p) => (
          <div
            key={p.id}
            className="absolute select-none"
            style={{
              left:      `${p.x}%`,
              top:       `${p.y}%`,
              fontSize:  `${p.size * 0.35 + 3}px`,
              color:     COLORS[p.id % COLORS.length],
              animation: `glitterPop ${p.swayDuration + 1}s ${p.negDelay}s ease-in-out infinite`,
            }}
          >
            {p.id % 3 === 0 ? "·" : p.id % 3 === 1 ? "✦" : "✧"}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root export — watches data-theme attribute for live switching
// ─────────────────────────────────────────────────────────────────────────────

export default function ParticleField({ theme }: { theme: ThemeId }) {
  const [active, setActive] = useState<ThemeId>(theme);

  useEffect(() => {
    const cur = document.documentElement.getAttribute("data-theme") as ThemeId | null;
    if (cur) setActive(cur);

    const observer = new MutationObserver(() => {
      const next = document.documentElement.getAttribute("data-theme") as ThemeId | null;
      if (next) setActive(next);
    });
    observer.observe(document.documentElement, {
      attributes:      true,
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
