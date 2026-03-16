"use client";
import { motion, AnimatePresence } from "framer-motion";

interface SpeechBubbleProps { text: string | null; side: "left" | "right"; active: boolean; }

export default function SpeechBubble({ text, side, active }: SpeechBubbleProps) {
  const isLeft = side === "left";
  return (
    <AnimatePresence mode="wait">
      {active && text && (
        <motion.div key={text} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ duration: 0.25 }}
          className="absolute z-10"
          style={{ top: "10%", ...(isLeft ? { left: "calc(50% - 20px)" } : { right: "calc(50% - 20px)" }), maxWidth: 200, background: "#fff", border: "4px solid #000", boxShadow: "4px 4px 0 #000", borderRadius: 10, padding: "10px 14px", fontFamily: "'Impact','Arial Black',sans-serif", fontStyle: "italic", fontSize: 13, lineHeight: 1.4, color: "#1a0a40" }}>
          {text.length > 100 ? text.slice(0, 100) + "…" : text}
          <div style={{ position: "absolute", bottom: -14, ...(isLeft ? { left: 18 } : { right: 18 }), width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: "14px solid #000" }} />
          <div style={{ position: "absolute", bottom: -9, ...(isLeft ? { left: 20 } : { right: 20 }), width: 0, height: 0, borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderTop: "11px solid #fff" }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}