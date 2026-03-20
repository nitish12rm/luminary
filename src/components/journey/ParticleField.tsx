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
// ── BLUSH: heart rain ──
//   Hearts scattered across the FULL screen at random positions, drifting
//   gently downward while flickering — like rain viewed through a foggy window.
//   3 depth layers with scroll parallax.
// ─────────────────────────────────────────────────────────────────────────────

function FloatingHearts() {
  const layerA = useRef<HTMLDivElement>(null); // large ghost hearts — most parallax
  const layerB = useRef<HTMLDivElement>(null); // medium raining hearts
  const layerC = useRef<HTMLDivElement>(null); // tiny hearts + sparkle accents

  const ghostHearts = useParticles(14); // huge, faint, pulse in place
  const rainHearts  = useParticles(32); // mid-size, drift down + flicker
  const tinyHearts  = useParticles(22); // small, fast rain

  useLayerParallax([layerA, layerB, layerC], [0.05, 0.028, 0.012]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">

      {/* Layer A — huge ghost hearts, pulse softly in fixed positions */}
      <div ref={layerA} className="absolute inset-0">
        {ghostHearts.map((p) => (
          <div
            key={p.id}
            className="absolute select-none"
            style={{
              left:     `${p.x}%`,
              top:      `${p.y}%`,
              fontSize: `${p.size + 22}px`,
              color:    p.id % 2 === 0 ? "var(--particle-a)" : "var(--particle-c)",
              animation:`heartPulse ${p.swayDuration + 4}s ${p.negDelay}s ease-in-out infinite`,
            }}
          >
            {p.id % 2 === 0 ? "♥" : "♡"}
          </div>
        ))}
      </div>

      {/* Layer B — medium hearts raining down with flicker */}
      <div ref={layerB} className="absolute inset-0">
        {rainHearts.map((p) => {
          const SYM   = ["♥","❤","♡","❣","♥","♡","❤","♥"];
          const color = p.id % 3 === 0 ? "var(--particle-a)"
                      : p.id % 3 === 1 ? "var(--particle-b)"
                      :                  "var(--particle-c)";
          return (
            <div
              key={p.id}
              className="absolute select-none"
              style={{ left: `${p.x}%`, top: "-4px", opacity: p.opacity * 0.82 }}
            >
              <div style={{
                fontSize:  `${p.size}px`,
                color,
                animation: `heartRain ${p.duration + 4}s ${p.negDelay}s ease-in-out infinite`,
              }}>
                {SYM[p.id % SYM.length]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Layer C — tiny fast hearts + scattered sparkle accents */}
      <div ref={layerC} className="absolute inset-0">
        {tinyHearts.map((p) => {
          const SYM = ["♥","·","♡","✦","♥","·","✧","♡"];
          return (
            <div
              key={p.id}
              className="absolute select-none"
              style={{ left: `${p.x}%`, top: "-4px", opacity: p.opacity * 0.5 }}
            >
              <div style={{
                fontSize:  `${p.size * 0.5 + 5}px`,
                color:     p.id % 2 === 0 ? "var(--particle-a)" : "var(--particle-b)",
                animation: `heartRain ${p.duration * 0.65}s ${p.negDelay}s ease-in-out infinite`,
              }}>
                {SYM[p.id % SYM.length]}
              </div>
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

  if (active === "blush")  return <FloatingHearts />;
  if (active === "golden") return <FloatingPetals />;
  if (active === "velvet") return <FloatingStars />;
  return null;
}
