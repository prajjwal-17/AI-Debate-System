"use client";
import { motion } from "framer-motion";
import type { TranscriptEntry as TEntry } from "../../types";

interface TranscriptEntryProps {
  entry: TEntry;
  isActive: boolean;
}

export default function TranscriptEntry({ entry, isActive }: TranscriptEntryProps) {
  const isA     = entry.speakerID === "A";
  const isHuman = entry.speakerID === "HUMAN";

  if (isHuman) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="inline-block px-3 py-2 text-xs" style={{ background: "#2d1b5e", border: "3px solid #8b5cf6", boxShadow: "3px 3px 0 #8b5cf6", color: "#c4b5fd", fontFamily: "'Arial',sans-serif", borderRadius: 4, maxWidth: 240 }}>
          🗣️ <em>Human says:</em> {entry.text}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, x: isA ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className={`flex gap-2 ${isA ? "flex-row" : "flex-row-reverse"}`}>
      <div style={{ width: 28, height: 28, background: isA ? "#FFE000" : "#FF3B3B", border: "3px solid #000", borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Impact',sans-serif", fontSize: 12, fontWeight: "bold", color: "#000" }}>
        {entry.speakerID}
      </div>
      <div className={`max-w-xs px-3 py-2 text-xs leading-relaxed ${isActive ? "animate-pulse" : ""}`}
        style={{ background: isActive ? (isA ? "#FFE00033" : "#FF3B3B33") : "#ffffff15", border: `3px solid ${isActive ? (isA ? "#FFE000" : "#FF3B3B") : "#ffffff30"}`, boxShadow: isActive ? `3px 3px 0 ${isA ? "#FFE000" : "#FF3B3B"}` : "none", color: "#e0d8ff", fontFamily: "'Arial',sans-serif", borderRadius: 6, transition: "all 0.3s" }}>
        {entry.text}
      </div>
    </motion.div>
  );
}