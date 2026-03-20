"use client";

import { IMoment, ICouple } from "@/types";
import TimelineNode from "./TimelineNode";

interface Props {
  moments: IMoment[];
  couple: ICouple;
}

export default function Timeline({ moments, couple }: Props) {
  if (!moments.length) {
    return (
      <div className="py-24 text-center" style={{ color: "var(--text-muted)" }}>
        <p className="font-display text-2xl">No memories yet...</p>
      </div>
    );
  }

  return (
    <section className="relative max-w-4xl mx-auto px-4 py-16">
      {/* Section header */}
      <div className="text-center mb-16">
        <p
          className="text-xs tracking-widest uppercase mb-2"
          style={{ color: "var(--text-muted)" }}
        >
          Our Story
        </p>
        <h2
          className="font-display text-3xl font-light"
          style={{ color: "var(--text-primary)" }}
        >
          The moments that made us
        </h2>
      </div>

      {/* Timeline container */}
      <div className="relative">
        {/* Center line — desktop */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 hidden md:block"
          style={{ background: "var(--timeline-line)" }}
        />
        {/* Left line — mobile */}
        <div
          className="absolute left-6 top-0 bottom-0 w-0.5 md:hidden"
          style={{ background: "var(--timeline-line)" }}
        />

        {/* Moment nodes */}
        <div className="space-y-12 md:space-y-16">
          {moments.map((moment, idx) => (
            <TimelineNode
              key={moment._id}
              moment={moment}
              couple={couple}
              index={idx}
              isLeft={idx % 2 === 0}
            />
          ))}
        </div>

        {/* End dot */}
        <div className="flex justify-center md:justify-start md:ml-[calc(50%-8px)] mt-12">
          <div
            className="w-4 h-4 rounded-full"
            style={{
              background: "var(--accent-1)",
              boxShadow: "var(--shadow-glow)",
            }}
          />
        </div>
      </div>

      {/* Closing line */}
      <div className="text-center mt-20 pb-12">
        <div
          className="w-12 h-0.5 mx-auto mb-6"
          style={{ background: "var(--border-strong)" }}
        />
        <p
          className="font-display text-2xl italic"
          style={{ color: "var(--text-secondary)" }}
        >
          And the story continues...
        </p>
        <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
          with every sunrise you share ♥
        </p>
      </div>
    </section>
  );
}
