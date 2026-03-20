"use client";

import { motion } from "framer-motion";
import { IMoment, ICouple } from "@/types";
import TimelineNode from "../TimelineNode";

interface Props {
  moments: IMoment[];
  couple: ICouple;
}

export default function EditorialLayout({ moments, couple }: Props) {
  return (
    <div className="max-w-[560px] mx-auto px-5 md:px-0">
      <div>
        {moments.map((moment, idx) => (
          <div key={moment._id}>
            <TimelineNode moment={moment} couple={couple} index={idx} />
            {idx < moments.length - 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="flex flex-col items-center my-16 md:my-20"
                aria-hidden
              >
                <div className="w-px h-10" style={{ background: "var(--border-strong)" }} />
                <div
                  className="w-1.5 h-1.5 rounded-full my-2.5"
                  style={{ background: "var(--accent-1)", opacity: 0.35 }}
                />
                <div className="w-px h-10" style={{ background: "var(--border-strong)" }} />
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
