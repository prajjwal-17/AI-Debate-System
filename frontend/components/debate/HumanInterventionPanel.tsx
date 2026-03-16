"use client";
import { motion, AnimatePresence } from "framer-motion";

interface HumanInterventionPanelProps {
  humanMode: boolean;
  humanText: string;
  setHumanText: (text: string) => void;
  onSubmit: () => void;
}

export default function HumanInterventionPanel({ humanMode, humanText, setHumanText, onSubmit }: HumanInterventionPanelProps) {
  return (
    <AnimatePresence>
      {humanMode && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
          style={{ background: "#2d1b5e", border: "6px solid #8b5cf6", boxShadow: "6px 6px 0 #8b5cf6", borderRadius: 4, padding: 16, overflow: "hidden" }}>
          <div className="text-center mb-3" style={{ color: "#8b5cf6", fontStyle: "italic", fontSize: 16, letterSpacing: "0.1em" }}>
            🎙️ YOUR TURN, HUMAN
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={humanText}
              onChange={(e) => setHumanText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSubmit()}
              placeholder="Type your argument here..."
              className="flex-1 px-3 py-2 text-sm"
              style={{ background: "#1a0a40", border: "3px solid #8b5cf6", color: "#e0d8ff", fontFamily: "'Arial',sans-serif", outline: "none" }}
            />
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onSubmit}
              style={{ background: "#8b5cf6", border: "3px solid #000", boxShadow: "3px 3px 0 #000", color: "#fff", padding: "8px 16px", fontFamily: "'Impact',sans-serif", fontStyle: "italic", fontSize: 13, cursor: "pointer" }}>
              SPEAK
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}