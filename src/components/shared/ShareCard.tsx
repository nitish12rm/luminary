"use client";

import { useRef, useState, useCallback, useEffect, forwardRef } from "react";
import { motion } from "framer-motion";
import { ICouple } from "@/types";
import { formatDate, getDays } from "@/lib/utils";

/* ─── theme palettes for canvas drawing ─── */
const CARD_THEMES: Record<string, { bgA: string; bgB: string; bgC: string; accent: string; text: string }> = {
  blush:     { bgA: "#1a0018", bgB: "#3d0030", bgC: "#160025", accent: "#e8789a", text: "#fff0f6" },
  golden:    { bgA: "#1a1000", bgB: "#3d2800", bgC: "#160a00", accent: "#d4a017", text: "#fffaf0" },
  velvet:    { bgA: "#0c071a", bgB: "#1a0a38", bgC: "#070614", accent: "#9b5fe0", text: "#f0e8ff" },
  scrapbook: { bgA: "#1a1230", bgB: "#2e1a50", bgC: "#100a28", accent: "#ff4da6", text: "#fff0fa" },
};

/* ─── props ─── */
interface Props {
  couple: ICouple;
  totalMoments: number;
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
export default function ShareCard({ couple, totalMoments }: Props) {
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const pal = CARD_THEMES[couple.theme] ?? CARD_THEMES.blush;
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

      // radial glow blobs
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
      drawBlob(120, 140, 200, pal.accent, 0.3);
      drawBlob(W - 100, H - 100, 160, pal.accent, 0.2);

      // left glass panel
      const px = 48, py = 48, pw = W - 316, ph = H - 96;
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = "#ffffff";
      roundRect(ctx, px, py, pw, ph, 20);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1;
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
        px + 32, py + 100,
        pw - 64
      );

      // accent underline
      const lineGrad = ctx.createLinearGradient(px + 32, 0, px + 112, 0);
      lineGrad.addColorStop(0, pal.accent);
      lineGrad.addColorStop(1, `${pal.accent}00`);
      ctx.fillStyle = lineGrad;
      ctx.fillRect(px + 32, py + 114, 80, 2);

      // since date
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.font = "italic 16px Georgia, serif";
      ctx.fillText(`Since ${formatDate(couple.startDate)}`, px + 32, py + 152);

      // bio (truncated)
      if (couple.bio) {
        ctx.fillStyle = "rgba(255,255,255,0.35)";
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
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
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
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.font = "12px Arial, sans-serif";
        ctx.fillText(s.label, sx, statsY + 20);
        sx += 120;
      }

      // QR panel
      const qx = W - 256, qy = 48, qw = 208, qh = H - 96;
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = "#ffffff";
      roundRect(ctx, qx, qy, qw, qh, 20);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1;
      roundRect(ctx, qx, qy, qw, qh, 20);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = "rgba(255,255,255,0.4)";
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

      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.font = "11px Arial, sans-serif";
      ctx.fillText("luminary.love", qx + qw / 2, qrY + qrSize + 60);
      ctx.textAlign = "left";

      // trigger download
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

      <motion.button
        onClick={handleDownload}
        disabled={downloading}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="mt-6 mx-auto flex items-center gap-3 px-8 py-3.5 rounded-full font-medium text-white"
        style={{
          background: `linear-gradient(135deg, ${pal.accent}, ${pal.bgB})`,
          boxShadow: `0 8px 32px ${pal.accent}40`,
          fontSize: "15px",
        }}
      >
        {downloading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
            Generating...
          </>
        ) : (
          <>
            <span>⬇</span>
            Download Card
          </>
        )}
      </motion.button>
    </>
  );
}

/* ══════════════════════════════════════════════
   ShareCardModal — floating trigger for JourneyHero
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
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center w-full max-w-xl"
          >
            <div className="w-full mb-3 flex justify-end">
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.1)" }}
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
   CardPreview — CSS-rendered card (visual preview)
   ══════════════════════════════════════════════ */
interface PreviewProps {
  couple: ICouple;
  totalMoments: number;
  pal: { bgA: string; bgB: string; bgC: string; accent: string; text: string };
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
          background: `linear-gradient(135deg, ${pal.bgA} 0%, ${pal.bgB} 55%, ${pal.bgC} 100%)`,
          boxShadow: `0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)`,
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        {/* glow blobs */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: "45%", height: "80%",
            top: "-20%", left: "-10%",
            background: `radial-gradient(circle, ${pal.accent}50 0%, transparent 70%)`,
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: "35%", height: "60%",
            bottom: "-20%", right: "28%",
            background: `radial-gradient(circle, ${pal.accent}30 0%, transparent 70%)`,
            filter: "blur(32px)",
          }}
        />

        {/* left panel */}
        <div
          className="absolute inset-y-0 left-0 flex flex-col justify-between"
          style={{ width: "63%", padding: "7%" }}
        >
          {/* label */}
          <div
            style={{
              fontSize: "clamp(7px, 1.1vw, 10px)",
              fontWeight: 500,
              letterSpacing: "0.3em",
              color: pal.accent,
              opacity: 0.9,
              fontFamily: "Arial, sans-serif",
            }}
          >
            L U M I N A R Y  ♥
          </div>

          {/* names + date */}
          <div>
            <div
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontWeight: 300,
                fontSize: "clamp(16px, 3.6vw, 40px)",
                color: pal.text,
                lineHeight: 1.1,
                marginBottom: "clamp(6px, 1vw, 12px)",
              }}
            >
              {couple.partner1Name}
              <span style={{ opacity: 0.45 }}> & </span>
              {couple.partner2Name}
            </div>
            <div
              style={{
                width: "clamp(36px, 7%, 64px)",
                height: "2px",
                background: `linear-gradient(to right, ${pal.accent}, transparent)`,
                marginBottom: "clamp(6px, 1.2vw, 12px)",
              }}
            />
            <div
              style={{
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                fontSize: "clamp(9px, 1.4vw, 13px)",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              Since {formatDate(couple.startDate)}
            </div>
            {couple.bio && (
              <div
                style={{
                  fontFamily: "Arial, sans-serif",
                  fontSize: "clamp(8px, 1.1vw, 11px)",
                  color: "rgba(255,255,255,0.28)",
                  marginTop: "clamp(4px, 0.8vw, 8px)",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  maxWidth: "85%",
                }}
              >
                {couple.bio}
              </div>
            )}
          </div>

          {/* stats */}
          <div>
            <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", marginBottom: "clamp(6px, 1.2vw, 12px)" }} />
            <div className="flex items-end gap-[5%]">
              {stats.map((s) => (
                <div key={s.label}>
                  <div
                    style={{
                      fontFamily: "Arial, sans-serif",
                      fontWeight: 600,
                      fontSize: "clamp(11px, 1.9vw, 18px)",
                      color: pal.accent,
                      lineHeight: 1,
                    }}
                  >
                    {s.val}
                  </div>
                  <div
                    style={{
                      fontFamily: "Arial, sans-serif",
                      fontSize: "clamp(6px, 0.9vw, 9px)",
                      color: "rgba(255,255,255,0.33)",
                      marginTop: "2px",
                    }}
                  >
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
            width: "35%",
            background: "rgba(255,255,255,0.05)",
            borderLeft: "1px solid rgba(255,255,255,0.08)",
            gap: "clamp(6px, 1.5vw, 14px)",
            padding: "5%",
          }}
        >
          <div
            style={{
              fontFamily: "Arial, sans-serif",
              fontSize: "clamp(6px, 0.95vw, 9px)",
              fontWeight: 500,
              letterSpacing: "0.18em",
              color: "rgba(255,255,255,0.35)",
              textAlign: "center",
              lineHeight: 1.7,
            }}
          >
            SCAN TO VISIT<br />OUR JOURNEY
          </div>

          {/* QR image */}
          <div
            style={{
              background: "white",
              borderRadius: "clamp(6px, 1vw, 10px)",
              padding: "clamp(4px, 0.8vw, 7px)",
              width: "clamp(52px, 11vw, 100px)",
              height: "clamp(52px, 11vw, 100px)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/qr?url=${encodeURIComponent(journeyUrl)}`}
              alt="QR code"
              style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
            />
          </div>

          <div style={{ fontSize: "clamp(12px, 1.8vw, 18px)", color: pal.accent }}>♥</div>

          <div
            style={{
              fontFamily: "Arial, sans-serif",
              fontSize: "clamp(6px, 0.9vw, 9px)",
              color: "rgba(255,255,255,0.2)",
              letterSpacing: "0.1em",
            }}
          >
            luminary.love
          </div>
        </div>
      </div>
    );
  }
);
CardPreview.displayName = "CardPreview";
