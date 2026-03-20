import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        ui: ["var(--font-ui)", "system-ui", "sans-serif"],
      },
      colors: {
        theme: {
          bg: "var(--bg-primary)",
          "bg-secondary": "var(--bg-secondary)",
          card: "var(--bg-card)",
          "border-subtle": "var(--border-subtle)",
          "border-strong": "var(--border-strong)",
          accent: "var(--accent-1)",
          "accent-deep": "var(--accent-2)",
          secondary: "var(--secondary-1)",
          text: "var(--text-primary)",
          "text-muted": "var(--text-muted)",
          "text-secondary": "var(--text-secondary)",
        },
      },
      backgroundImage: {
        "theme-hero": "var(--hero-gradient)",
        "theme-card": "var(--card-gradient)",
        "theme-line": "var(--timeline-line)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        glow: "var(--shadow-glow)",
      },
      animation: {
        "float-up": "floatUp 6s ease-in-out infinite",
        "float-sway": "floatSway 4s ease-in-out infinite",
        "twinkle": "twinkle 3s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "gradient-shift": "gradientShift 8s ease infinite",
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "slide-in-left": "slideInLeft 0.6s ease-out forwards",
        "slide-in-right": "slideInRight 0.6s ease-out forwards",
        "draw-line": "drawLine 1.5s ease-out forwards",
        "heartbeat": "heartbeat 1.5s ease-in-out infinite",
      },
      keyframes: {
        floatUp: {
          "0%": { transform: "translateY(100vh) rotate(0deg)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "0.7" },
          "100%": { transform: "translateY(-20px) rotate(360deg)", opacity: "0" },
        },
        floatSway: {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(20px)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.2", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 10px var(--accent-glow)" },
          "50%": { boxShadow: "0 0 30px var(--accent-glow), 0 0 60px var(--accent-glow)" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-60px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(60px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        drawLine: {
          "0%": { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },
        heartbeat: {
          "0%, 100%": { transform: "scale(1)" },
          "14%": { transform: "scale(1.3)" },
          "28%": { transform: "scale(1)" },
          "42%": { transform: "scale(1.3)" },
          "70%": { transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
