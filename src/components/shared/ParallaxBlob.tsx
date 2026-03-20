"use client";

interface ParallaxBlobProps {
  size?: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  color?: "accent" | "secondary" | "muted";
  delay?: number;
}

export default function ParallaxBlob({
  size = 400,
  top,
  left,
  right,
  bottom,
  color = "accent",
  delay = 0,
}: ParallaxBlobProps) {
  const colorMap = {
    accent: "var(--accent-glow)",
    secondary: "var(--secondary-glow)",
    muted: "var(--accent-muted)",
  };

  return (
    <div
      className="absolute rounded-full pointer-events-none select-none"
      style={{
        width: size,
        height: size,
        top,
        left,
        right,
        bottom,
        background: `radial-gradient(circle, ${colorMap[color]}, transparent 70%)`,
        filter: "blur(60px)",
        animation: `blobPulse ${10 + delay * 2}s ${delay}s ease-in-out infinite`,
        zIndex: 0,
      }}
    />
  );
}
