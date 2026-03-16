"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function HomeNav() {
  return (
    <nav style={{ background: "#FFE000", borderBottom: "5px solid #000", boxShadow: "0 5px 0 #000", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <motion.div animate={{ rotate: [0, -3, 3, 0] }} transition={{ duration: 3, repeat: Infinity }}
        style={{ background: "#FF3B3B", border: "3px solid #000", boxShadow: "3px 3px 0 #000", padding: "3px 12px", color: "#fff", fontSize: 16, fontStyle: "italic", letterSpacing: "0.04em" }}>
        🎙️ DEBATEFORGE
      </motion.div>
      <Link href="/debate">
        <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}
          style={{ background: "#1a0a40", border: "3px solid #000", boxShadow: "3px 3px 0 #000", color: "#FFE000", padding: "6px 18px", fontSize: 13, fontStyle: "italic", letterSpacing: "0.08em", cursor: "pointer", fontFamily: "'Impact','Arial Black',sans-serif" }}>
          ▶ ENTER STUDIO
        </motion.button>
      </Link>
    </nav>
  );
}