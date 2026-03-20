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
// ── SCRAPBOOK: paper confetti + washi tape + stickers ──
//   Distinctly crafted feel:
//     Layer A — washi tape strips (actual CSS rectangles with stripe pattern)
//     Layer B — paper confetti squares tumbling & flipping
//     Layer C — tiny sticker chars (★ ♥ ✂ ☆) + micro confetti dots
// ─────────────────────────────────────────────────────────────────────────────

// Washi tape stripe patterns — each a repeating diagonal gradient
const WASHI = [
  // pink
  `repeating-linear-gradient(-45deg,#ff4da6 0px,#ff4da6 4px,#ffb3e0 4px,#ffb3e0 8px)`,
  // yellow
  `repeating-linear-gradient(-45deg,#ffe566 0px,#ffe566 4px,#fff3a0 4px,#fff3a0 8px)`,
  // mint
  `repeating-linear-gradient(-45deg,#40c8c0 0px,#40c8c0 4px,#a0f0ec 4px,#a0f0ec 8px)`,
  // lavender
  `repeating-linear-gradient(-45deg,#c77dff 0px,#c77dff 4px,#e8c0ff 4px,#e8c0ff 8px)`,
  // coral
  `repeating-linear-gradient(-45deg,#ff7055 0px,#ff7055 4px,#ffb0a0 4px,#ffb0a0 8px)`,
  // sky
  `repeating-linear-gradient(-45deg,#60c8ff 0px,#60c8ff 4px,#b0e4ff 4px,#b0e4ff 8px)`,
];

// Solid confetti colours
const CONFETTI_COLORS = [
  "#ff4da6","#ffe566","#40c8c0","#c77dff",
  "#ff7055","#60c8ff","#80ffcc","#ffb347",
];

function ScrapbookGlitter() {
  const layerA = useRef<HTMLDivElement>(null); // washi tape strips
  const layerB = useRef<HTMLDivElement>(null); // paper confetti
  const layerC = useRef<HTMLDivElement>(null); // sticker chars + tiny bits

  const washiP    = useParticles(18);
  const confettiP = useParticles(28);
  const stickerP  = useParticles(24);

  useLayerParallax([layerA, layerB, layerC], [0.05, 0.028, 0.012]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">

      {/* Layer A — washi tape strips tumbling down */}
      <div ref={layerA} className="absolute inset-0">
        {washiP.map((p) => {
          const w = p.size * 3.5 + 20; // 48–90 px wide
          const h = p.size * 0.7 + 8;  // 14–20 px tall
          return (
            <div
              key={p.id}
              className="absolute"
              style={{
                left:    `${p.x}%`,
                top:     "-20px",
                width:   `${w}px`,
                height:  `${h}px`,
                borderRadius: "2px",
                background:   WASHI[p.id % WASHI.length],
                opacity:      0,
                animation:    `washiFall ${p.duration + 4}s ${p.negDelay}s ease-in-out infinite`,
              }}
            />
          );
        })}
      </div>

      {/* Layer B — paper confetti rectangles & squares */}
      <div ref={layerB} className="absolute inset-0">
        {confettiP.map((p) => {
          // alternate squares and wider rectangles
          const isRect = p.id % 3 !== 0;
          const w = isRect ? p.size * 1.6 + 5 : p.size * 0.9 + 4;
          const h = p.size * 0.7 + 3;
          const color = CONFETTI_COLORS[p.id % CONFETTI_COLORS.length];
          return (
            <div
              key={p.id}
              className="absolute"
              style={{
                left:         `${p.x}%`,
                top:          "-10px",
                width:        `${w}px`,
                height:       `${h}px`,
                borderRadius: "1px",
                background:   color,
                opacity:      0,
                animation:    `confettiFall ${p.duration}s ${p.negDelay}s linear infinite`,
              }}
            />
          );
        })}
      </div>

      {/* Layer C — sticker chars + tiny confetti dots */}
      <div ref={layerC} className="absolute inset-0">
        {stickerP.map((p) => {
          // odd ones are tiny confetti dots, even ones are sticker chars
          const isDot = p.id % 4 === 0;
          const STICKERS = ["★","♥","✂","☆","✿","★","♥","☆","✂","✿"];
          const color = CONFETTI_COLORS[p.id % CONFETTI_COLORS.length];

          return isDot ? (
            // Tiny confetti dot
            <div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left:      `${p.x}%`,
                top:       "-6px",
                width:     `${p.size * 0.4 + 3}px`,
                height:    `${p.size * 0.4 + 3}px`,
                background: color,
                opacity:   0,
                animation: `confettiFall ${p.duration * 0.7}s ${p.negDelay}s linear infinite`,
              }}
            />
          ) : (
            // Sticker character
            <div
              key={p.id}
              className="absolute select-none"
              style={{
                left:      `${p.x}%`,
                top:       "-6px",
                fontSize:  `${p.size * 0.6 + 7}px`,
                color,
                fontWeight: 700,
                opacity:   0,
                animation: `confettiFall ${p.duration * 0.85}s ${p.negDelay}s ease-in-out infinite`,
              }}
            >
              {STICKERS[p.id % STICKERS.length]}
            </div>
          );
        })}
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
