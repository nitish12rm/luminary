"use client";

import { useRef, useState, useCallback, useEffect, forwardRef } from "react";
import { motion } from "framer-motion";
import { ICouple } from "@/types";
import { formatDate, getDays } from "@/lib/utils";

/* ─── Per-theme palette ─── */
interface ThemePal {
  bgA: string; bgB: string; bgC: string;
  accent: string;
  text: string;
  muted: string;
  panelBg: string;
  panelBorder: string;
  qrPanelBg: string;
  isDark: boolean;
}

const CARD_THEMES: Record<string, ThemePal> = {
  blush: {
    bgA: "#fef6f8", bgB: "#fde8f0", bgC: "#ede0ff",
    accent: "#e8789a", text: "#2d1520", muted: "#7a5468",
    panelBg: "rgba(255,248,252,0.82)", panelBorder: "rgba(232,120,154,0.22)",
    qrPanelBg: "rgba(255,255,255,0.38)",
    isDark: false,
  },
  golden: {
    bgA: "#fffbf0", bgB: "#fff0c0", bgC: "#ffe4b0",
    accent: "#d4a017", text: "#2a1f00", muted: "#7a5a20",
    panelBg: "rgba(255,252,240,0.82)", panelBorder: "rgba(212,160,23,0.22)",
    qrPanelBg: "rgba(255,255,255,0.38)",
    isDark: false,
  },
  velvet: {
    bgA: "#06060f", bgB: "#0a0818", bgC: "#04040c",
    accent: "#9b5fe0", text: "#dcdce8", muted: "#a8a8c0",
    panelBg: "rgba(4,4,14,0.97)", panelBorder: "rgba(155,95,224,0.3)",
    qrPanelBg: "rgba(155,95,224,0.18)",
    isDark: true,
  },
};

/* ─── props ─── */
interface Props {
  couple: ICouple;
  totalMoments: number;
  activeTheme?: string;
}

/* ─── helper: draw rounded rect path ─── */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/* ══════════════════════════════════════════════
   ShareCard — preview + download
   ══════════════════════════════════════════════ */
export default function ShareCard({ couple, totalMoments, activeTheme }: Props) {
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const pal = CARD_THEMES[activeTheme ?? couple.theme] ?? CARD_THEMES.blush;
  const days = getDays(couple.startDate);
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  let duration = "";
  if (years > 0) duration += `${years}y`;
  if (months > 0) duration += ` ${months}m`;
  if (!duration) duration = `${days}d`;
  duration = duration.trim();

  const journeyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/journey/${couple.accessCode}`
      : `/journey/${couple.accessCode}`;

  /* ── Canvas-based PNG download ── */
  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const W = 900, H = 500;
      const canvas = document.createElement("canvas");
      canvas.width = W * 2;
      canvas.height = H * 2;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(2, 2);

      // background gradient
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0,   pal.bgA);
      bg.addColorStop(0.5, pal.bgB);
      bg.addColorStop(1,   pal.bgC);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // subtle radial glow blobs
      const drawBlob = (x: number, y: number, r: number, hex: string, alpha: number) => {
        const radial = ctx.createRadialGradient(x, y, 0, x, y, r);
        const a = Math.round(alpha * 255).toString(16).padStart(2, "0");
        radial.addColorStop(0, `${hex}${a}`);
        radial.addColorStop(1, `${hex}00`);
        ctx.save();
        ctx.fillStyle = radial;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };
      const blobAlpha = pal.isDark ? 0.32 : 0.18;
      drawBlob(120, 140, 200, pal.accent, blobAlpha);
      drawBlob(W - 100, H - 100, 160, pal.accent, blobAlpha * 0.65);

      // left glass panel
      const px = 48, py = 48, pw = W - 316, ph = H - 96;
      ctx.save();
      ctx.globalAlpha = pal.isDark ? 0.07 : 0.5;
      ctx.fillStyle = "#ffffff";
      roundRect(ctx, px, py, pw, ph, 20);
      ctx.fill();
      ctx.restore();
      if (pal.isDark) {
        // extra accent tint for velvet panel visibility
        ctx.save();
        ctx.globalAlpha = 0.06;
        ctx.fillStyle = pal.accent;
        roundRect(ctx, px, py, pw, ph, 20);
        ctx.fill();
        ctx.restore();
      }
      ctx.save();
      ctx.strokeStyle = pal.panelBorder;
      ctx.lineWidth = 1.5;
      roundRect(ctx, px, py, pw, ph, 20);
      ctx.stroke();
      ctx.restore();

      // luminary label
      ctx.fillStyle = pal.accent;
      ctx.globalAlpha = 0.9;
      ctx.font = "500 13px Arial, sans-serif";
      ctx.fillText("L U M I N A R Y  \u2665", px + 32, py + 44);
      ctx.globalAlpha = 1;

      // couple names
      const nameSize = couple.partner1Name.length + couple.partner2Name.length > 20 ? 36 : 44;
      ctx.fillStyle = pal.text;
      ctx.font = `300 ${nameSize}px Georgia, 'Times New Roman', serif`;
      ctx.fillText(
        `${couple.partner1Name}  &  ${couple.partner2Name}`,
        px + 32, py + 100, pw - 64
      );

      // accent underline
      const lineGrad = ctx.createLinearGradient(px + 32, 0, px + 112, 0);
      lineGrad.addColorStop(0, pal.accent);
      lineGrad.addColorStop(1, `${pal.accent}00`);
      ctx.fillStyle = lineGrad;
      ctx.fillRect(px + 32, py + 114, 80, 2);

      // since date
      ctx.fillStyle = pal.isDark ? "rgba(210,210,230,0.9)" : `${pal.muted}cc`;
      ctx.font = "italic 16px Georgia, serif";
      ctx.fillText(`Since ${formatDate(couple.startDate)}`, px + 32, py + 152);

      // bio
      if (couple.bio) {
        ctx.fillStyle = pal.isDark ? "rgba(190,190,215,0.75)" : `${pal.muted}88`;
        ctx.font = "14px Arial, sans-serif";
        const maxW = pw - 80;
        let bioLine = "";
        for (const word of couple.bio.split(" ")) {
          const test = bioLine ? bioLine + " " + word : word;
          if (ctx.measureText(test).width > maxW) break;
          bioLine = test;
        }
        ctx.fillText(bioLine + (bioLine !== couple.bio ? "\u2026" : ""), px + 32, py + 190);
      }

      // stats row
      const statsY = py + ph - 68;
      ctx.strokeStyle = pal.isDark ? "rgba(255,255,255,0.1)" : `${pal.accent}30`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px + 32, statsY - 16);
      ctx.lineTo(px + pw - 32, statsY - 16);
      ctx.stroke();

      const stats = [
        { val: days.toLocaleString(), label: "days together" },
        { val: duration,              label: "of love"        },
        { val: String(totalMoments),  label: "memories"       },
      ];
      let sx = px + 32;
      for (const s of stats) {
        ctx.fillStyle = pal.accent;
        ctx.font = "600 22px Arial, sans-serif";
        ctx.fillText(s.val, sx, statsY);
        ctx.fillStyle = pal.isDark ? "rgba(190,190,215,0.75)" : `${pal.muted}bb`;
        ctx.font = "12px Arial, sans-serif";
        ctx.fillText(s.label, sx, statsY + 20);
        sx += 120;
      }

      // QR panel
      const qx = W - 256, qy = 48, qw = 208, qh = H - 96;
      ctx.save();
      ctx.globalAlpha = pal.isDark ? 0.07 : 0.45;
      ctx.fillStyle = "#ffffff";
      roundRect(ctx, qx, qy, qw, qh, 20);
      ctx.fill();
      ctx.restore();
      if (pal.isDark) {
        ctx.save();
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = pal.accent;
        roundRect(ctx, qx, qy, qw, qh, 20);
        ctx.fill();
        ctx.restore();
      }
      ctx.save();
      ctx.strokeStyle = pal.panelBorder;
      ctx.lineWidth = 1.5;
      roundRect(ctx, qx, qy, qw, qh, 20);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = pal.isDark ? "rgba(210,210,230,0.9)" : `${pal.muted}99`;
      ctx.font = "11px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("SCAN TO VISIT", qx + qw / 2, qy + 32);
      ctx.fillText("OUR JOURNEY", qx + qw / 2, qy + 48);

      // QR image
      const qrSize = 134;
      const qrX = qx + (qw - qrSize) / 2;
      const qrY = qy + 68;

      await new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.save();
          ctx.fillStyle = "#ffffff";
          roundRect(ctx, qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 12);
          ctx.fill();
          ctx.restore();
          ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = `/api/qr?url=${encodeURIComponent(journeyUrl)}`;
      });

      ctx.fillStyle = pal.accent;
      ctx.font = "22px serif";
      ctx.textAlign = "center";
      ctx.fillText("\u2665", qx + qw / 2, qrY + qrSize + 40);

      ctx.fillStyle = pal.isDark ? "rgba(190,190,215,0.65)" : `${pal.muted}66`;
      ctx.font = "11px Arial, sans-serif";
      ctx.fillText("luminary.love", qx + qw / 2, qrY + qrSize + 60);
      ctx.textAlign = "left";

      const link = document.createElement("a");
      link.download = `${couple.partner1Name}-${couple.partner2Name}-luminary.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloading(false);
    }
  }, [couple, totalMoments, journeyUrl, pal, days, duration]);

  return (
    <>
      <CardPreview
        ref={cardRef}
        couple={couple}
        totalMoments={totalMoments}
        pal={pal}
        days={days}
        duration={duration}
        journeyUrl={journeyUrl}
      />

      {/* Download button — inherits theme accent */}
      <motion.button
        onClick={handleDownload}
        disabled={downloading}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="btn-accent mt-6 mx-auto flex items-center gap-2.5"
        style={{ paddingLeft: "2rem", paddingRight: "2rem", paddingTop: "0.85rem", paddingBottom: "0.85rem" }}
      >
        {downloading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
            Generating...
          </>
        ) : (
          <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Card
          </>
        )}
      </motion.button>
    </>
  );
}

/* ══════════════════════════════════════════════
   ShareCardModal — floating trigger for journey page
   ══════════════════════════════════════════════ */
export function ShareCardModal({ couple, totalMoments }: { couple: ICouple; totalMoments: number }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
        style={{
          background: "var(--bg-card)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid var(--border-subtle)",
          color: "var(--text-secondary)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <span>⬇</span> Share
      </motion.button>

      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center w-full max-w-xl"
          >
            <div className="w-full mb-3 flex justify-between items-center">
              <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Share your journey
              </p>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }}
              >
                ✕
              </button>
            </div>
            <ShareCard couple={couple} totalMoments={totalMoments} />
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════
   CardPreview — CSS card using theme CSS variables
   ══════════════════════════════════════════════ */
interface PreviewProps {
  couple: ICouple;
  totalMoments: number;
  pal: ThemePal;
  days: number;
  duration: string;
  journeyUrl: string;
}


const CardPreview = forwardRef<HTMLDivElement, PreviewProps>(
  ({ couple, totalMoments, pal, days, duration, journeyUrl }, ref) => {
    const stats = [
      { val: days.toLocaleString(), label: "days together" },
      { val: duration,              label: "of love"        },
      { val: String(totalMoments),  label: "memories"       },
    ];

    return (
      <div
        ref={ref}
        className="relative w-full overflow-hidden select-none"
        style={{
          aspectRatio: "9 / 5",
          borderRadius: "20px",
          background: `linear-gradient(135deg, ${pal.bgA} 0%, ${pal.bgB} 50%, ${pal.bgC} 100%)`,
          boxShadow: `0 0 0 1px ${pal.panelBorder}, 0 8px 32px ${pal.isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.1)"}`,
        }}
      >
        {/* accent glow blobs */}
        <div className="absolute rounded-full pointer-events-none" style={{
          width: "45%", height: "80%", top: "-20%", left: "-10%",
          background: `radial-gradient(circle, ${pal.accent}40 0%, transparent 70%)`,
          filter: "blur(40px)",
        }} />
        <div className="absolute rounded-full pointer-events-none" style={{
          width: "30%", height: "55%", bottom: "-15%", right: "28%",
          background: `radial-gradient(circle, ${pal.accent}25 0%, transparent 70%)`,
          filter: "blur(32px)",
        }} />

        {/* left panel */}
        <div
          className="absolute inset-y-0 left-0 flex flex-col justify-between"
          style={{
            width: "63%", padding: "7%",
            background: pal.panelBg,
            borderRight: `1px solid ${pal.panelBorder}`,
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        >
          <div style={{
            fontSize: "clamp(7px, 1.1vw, 10px)", fontWeight: 500,
            letterSpacing: "0.3em", color: pal.accent, opacity: 0.9,
          }}>
            L U M I N A R Y  ♥
          </div>

          <div>
            <div style={{
              fontWeight: 300, fontSize: "clamp(16px, 3.6vw, 40px)",
              color: pal.text, lineHeight: 1.1,
              marginBottom: "clamp(6px, 1vw, 12px)",
            }}>
              {couple.partner1Name}
              <span style={{ color: pal.muted }}> & </span>
              {couple.partner2Name}
            </div>
            <div style={{
              width: "clamp(36px, 7%, 64px)", height: "2px",
              background: `linear-gradient(to right, ${pal.accent}, transparent)`,
              marginBottom: "clamp(6px, 1.2vw, 12px)",
            }} />
            <div style={{
              fontStyle: "italic", fontSize: "clamp(9px, 1.4vw, 13px)",
              color: pal.muted,
            }}>
              Since {formatDate(couple.startDate)}
            </div>
            {couple.bio && (
              <div style={{
                fontSize: "clamp(8px, 1.1vw, 11px)", color: pal.muted,
                marginTop: "clamp(4px, 0.8vw, 8px)",
                overflow: "hidden", display: "-webkit-box",
                WebkitLineClamp: 2, WebkitBoxOrient: "vertical", maxWidth: "85%",
              }}>
                {couple.bio}
              </div>
            )}
          </div>

          <div>
            <div style={{ height: "1px", background: pal.panelBorder, marginBottom: "clamp(6px, 1.2vw, 12px)" }} />
            <div className="flex items-end gap-[5%]">
              {stats.map((s) => (
                <div key={s.label}>
                  <div style={{ fontWeight: 600, fontSize: "clamp(11px, 1.9vw, 18px)", color: pal.accent, lineHeight: 1 }}>
                    {s.val}
                  </div>
                  <div style={{ fontSize: "clamp(6px, 0.9vw, 9px)", color: pal.muted, marginTop: "2px" }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* right QR panel */}
        <div
          className="absolute inset-y-0 right-0 flex flex-col items-center justify-center"
          style={{
            width: "35%", background: pal.qrPanelBg,
            backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
            borderLeft: `1px solid ${pal.panelBorder}`,
            gap: "clamp(6px, 1.5vw, 14px)", padding: "5%",
          }}
        >
          <div style={{
            fontSize: "clamp(6px, 0.95vw, 9px)", fontWeight: 500,
            letterSpacing: "0.18em", color: pal.muted, textAlign: "center", lineHeight: 1.7,
          }}>
            SCAN TO VISIT<br />OUR JOURNEY
          </div>

          <div style={{
            background: "white", borderRadius: "clamp(6px, 1vw, 10px)",
            padding: "clamp(4px, 0.8vw, 7px)",
            width: "clamp(52px, 11vw, 100px)", height: "clamp(52px, 11vw, 100px)",
            boxShadow: `0 2px 12px ${pal.accent}44`,
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/qr?url=${encodeURIComponent(journeyUrl)}`}
              alt="QR code"
              style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
            />
          </div>

          <div style={{ fontSize: "clamp(12px, 1.8vw, 18px)", color: pal.accent }}>♥</div>

          <div style={{ fontSize: "clamp(6px, 0.9vw, 9px)", color: pal.muted, letterSpacing: "0.1em" }}>
            luminary.love
          </div>
        </div>
      </div>
    );
  }
);
CardPreview.displayName = "CardPreview";
