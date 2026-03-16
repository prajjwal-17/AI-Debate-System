"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center text-center px-6 pt-20 pb-12 overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="absolute top-0 bottom-0" style={{ left: `${i * 13}%`, width: "6%", background: i % 2 === 0 ? "#ffffff04" : "transparent", pointerEvents: "none" }} />
      ))}
      <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.9, repeat: Infinity }}
        style={{ background: "#FF3B3B", border: "3px solid #000", boxShadow: "4px 4px 0 #000", padding: "4px 18px", color: "#fff", fontSize: 13, fontStyle: "italic", letterSpacing: "0.25em", marginBottom: 20, display: "inline-block" }}>
        ● LIVE ON AIR
      </motion.div>
      <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ fontSize: "clamp(42px, 8vw, 96px)", fontStyle: "italic", lineHeight: 0.95, color: "#FFE000", textShadow: "6px 6px 0 #000, 8px 8px 0 #FF3B3B", marginBottom: 12 }}>
        DEBATE
        <br />
        <span style={{ color: "#fff", textShadow: "6px 6px 0 #000" }}>FORGE</span>
        <br />
        <span style={{ color: "#FF3B3B", textShadow: "6px 6px 0 #000, 8px 8px 0 #FFE000", fontSize: "0.45em", letterSpacing: "0.15em" }}>
          A.I. STUDIO
        </span>
      </motion.h1>
      <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.45 }}
        style={{ fontFamily: "'Arial',sans-serif", fontSize: "clamp(14px, 2.5vw, 18px)", color: "#c4b5fd", maxWidth: 560, lineHeight: 1.6, marginBottom: 36 }}>
        Two AI agents. One debate. Zero chill.
        <br />
        Watch them argue about absolutely anything — and interrupt whenever you want.
      </motion.p>
      <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35, duration: 0.4, type: "spring", stiffness: 200 }}>
        <Link href="/debate">
          <motion.button whileHover={{ scale: 1.07, y: -4 }} whileTap={{ scale: 0.95, rotate: -1 }}
            style={{ background: "#FFE000", border: "5px solid #000", boxShadow: "7px 7px 0 #000", padding: "16px 48px", fontSize: "clamp(16px, 3vw, 22px)", fontStyle: "italic", letterSpacing: "0.1em", color: "#000", cursor: "pointer", fontFamily: "'Impact','Arial Black',sans-serif" }}>
            ▶ ENTER THE STUDIO
          </motion.button>
        </Link>
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        style={{ marginTop: 14, fontFamily: "'Arial',sans-serif", fontSize: 11, color: "#ffffff30", letterSpacing: "0.12em", textTransform: "uppercase" }}>
        No signup. No API key. Runs in your browser.
      </motion.p>
    </section>
  );
}