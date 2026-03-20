"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PWAInstallBanner() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Already installed as PWA — don't show
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // User already dismissed — don't show again this session
    if (sessionStorage.getItem("pwa-banner-dismissed")) return;
    // Only show on mobile
    if (window.innerWidth > 768) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase());
    setIsIOS(ios);

    if (ios) {
      // iOS Safari: no install event, just show manual instructions
      setShow(true);
    } else {
      // Android / Chrome: intercept the native install prompt
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShow(true);
      };
      window.addEventListener("beforeinstallprompt", handler);
      return () => window.removeEventListener("beforeinstallprompt", handler);
    }
  }, []);

  function dismiss() {
    setShow(false);
    sessionStorage.setItem("pwa-banner-dismissed", "1");
  }

  async function install() {
    if (!deferredPrompt) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (deferredPrompt as any).prompt();
    dismiss();
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 z-[300]"
        >
          <div
            className="glass-card-strong rounded-2xl p-4 flex items-center gap-3"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            <div className="text-2xl flex-shrink-0">📱</div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Add to Home Screen
              </p>
              {isIOS ? (
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  Tap{" "}
                  <span className="font-medium" style={{ color: "var(--accent-1)" }}>
                    Share ⬆
                  </span>{" "}
                  then{" "}
                  <span className="font-medium" style={{ color: "var(--accent-1)" }}>
                    "Add to Home Screen"
                  </span>{" "}
                  for the full app experience
                </p>
              ) : (
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  Install Luminary for a beautiful offline experience
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {!isIOS && deferredPrompt && (
                <button
                  onClick={install}
                  className="btn-accent text-xs"
                  style={{ padding: "0.4rem 0.85rem" }}
                >
                  Install
                </button>
              )}
              <button
                onClick={dismiss}
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-opacity hover:opacity-60"
                style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}
              >
                ✕
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
