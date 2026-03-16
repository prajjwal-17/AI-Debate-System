"use client";
import { motion } from "framer-motion";

interface ControlPanelProps {
  isRunning: boolean;
  humanMode: boolean;
  debateOver: boolean;
  onStart: () => void;
  onShutUp: () => void;
  onResume: () => void;
}

export default function ControlPanel({ isRunning, humanMode, debateOver, onStart, onShutUp, onResume }: ControlPanelProps) {
  return (
    <div className="grid grid-cols-3 gap-3" style={{ background: "#1a0a40", border: "6px solid #000", boxShadow: "6px 6px 0 #000", padding: 16, borderRadius: 4 }}>
      <motion.button whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }} onClick={onStart} disabled={isRunning}
        style={{ padding: "12px 6px", background: isRunning ? "#555" : "#FFE000", border: "4px solid #000", boxShadow: isRunning ? "3px 3px 0 #000" : "5px 5px 0 #000", color: "#000", fontStyle: "italic", fontSize: 14, cursor: isRunning ? "not-allowed" : "pointer", fontFamily: "'Impact',sans-serif", opacity: isRunning ? 0.6 : 1 }}>
        {debateOver ? "🔁 REMATCH" : isRunning ? "⏳ LIVE..." : "▶ START DEBATE"}
      </motion.button>

      <motion.button whileHover={{ scale: 1.06, y: -3 }} whileTap={{ scale: 0.94, rotate: -2 }} onClick={onShutUp} disabled={!isRunning}
        style={{ padding: "12px 6px", background: !isRunning ? "#555" : "#FF3B3B", border: "4px solid #000", boxShadow: !isRunning ? "3px 3px 0 #000" : "6px 6px 0 #000", color: "#fff", fontStyle: "italic", fontSize: 16, cursor: !isRunning ? "not-allowed" : "pointer", fontFamily: "'Impact',sans-serif", opacity: !isRunning ? 0.5 : 1 }}>
        🤫 SHUT UP!
      </motion.button>

      <motion.button whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }} onClick={onResume} disabled={!humanMode || debateOver}
        style={{ padding: "12px 6px", background: humanMode && !debateOver ? "#8b5cf6" : "#555", border: "4px solid #000", boxShadow: humanMode && !debateOver ? "5px 5px 0 #000" : "3px 3px 0 #000", color: "#fff", fontStyle: "italic", fontSize: 14, cursor: humanMode && !debateOver ? "pointer" : "not-allowed", fontFamily: "'Impact',sans-serif", opacity: humanMode && !debateOver ? 1 : 0.5 }}>
        ⏩ RESUME AIs
      </motion.button>
    </div>
  );
}