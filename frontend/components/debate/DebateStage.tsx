"use client";
import { motion } from "framer-motion";
import Debater from "./Debater";
import SpeechBubble from "./SpeechBubble";
import { DEBATE_SCRIPT } from "../../data/debateScript";

interface DebateStageProps {
  speakingID: "A" | "B" | null;
  currentIdx: number;
}

export default function DebateStage({ speakingID, currentIdx }: DebateStageProps) {
  const currentTurn = DEBATE_SCRIPT[currentIdx] ?? null;
  return (
    <div className="relative flex items-end justify-around pb-8 pt-12" style={{ background: "#120436", border: "6px solid #000", boxShadow: "8px 8px 0 #000", borderRadius: 4, minHeight: 300, overflow: "hidden" }}>
      <div className="absolute bottom-0 left-0 right-0" style={{ height: 40, background: "#0a0220", borderTop: "4px solid #FFE000" }} />
      {[...Array(6)].map((_, i) => (
        <div key={i} className="absolute top-0 bottom-0" style={{ left: `${i * 17}%`, width: "8%", background: i % 2 === 0 ? "#ffffff05" : "transparent" }} />
      ))}
      <SpeechBubble text={currentTurn?.speakerID === "A" ? currentTurn.text : null} side="left"  active={speakingID === "A"} />
      <SpeechBubble text={currentTurn?.speakerID === "B" ? currentTurn.text : null} side="right" active={speakingID === "B"} />
      <Debater id="A" isSpeaking={speakingID === "A"} label="DEBATER A" color="yellow" side="left"  />
      <motion.div animate={{ scale: [1, 1.08, 1], rotate: [0, -3, 3, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ background: "#FF3B3B", border: "5px solid #000", boxShadow: "5px 5px 0 #000", borderRadius: "50%", width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginBottom: 48, zIndex: 2 }}>
        <span style={{ color: "#fff", fontSize: 20, fontStyle: "italic" }}>VS</span>
      </motion.div>
      <Debater id="B" isSpeaking={speakingID === "B"} label="DEBATER B" color="red"    side="right" />
    </div>
  );
}