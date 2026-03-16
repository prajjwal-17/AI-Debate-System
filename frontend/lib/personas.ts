import type { PersonaKey, PersonaMeta } from "../types";

export const PERSONAS: Record<PersonaKey, PersonaMeta> = {
  "The Professor": {
    key: "The Professor",
    emoji: "🎓",
    tagline: "ANALYTICAL • OXFORD-TIER",
    color: "#FFE000",
    shadow: "#c9a800",
    nameBg: "#c9a800",
    voicePitch: 0.85,
    voiceRate: 0.82,
    preferHighVoice: false,
    description:
      "Highly analytical. Uses advanced vocabulary and speaks with the tone of an elite Oxford academic. Relies on structured logic to dismantle arguments.",
  },
  "The Aggressor": {
    key: "The Aggressor",
    emoji: "🔥",
    tagline: "RUTHLESS • ZERO MERCY",
    color: "#FF3B3B",
    shadow: "#a01010",
    nameBg: "#c41a1a",
    voicePitch: 1.15,
    voiceRate: 1.4,
    preferHighVoice: false,
    description:
      "Ruthless and fiery. Uses sharp, biting sarcasm to aggressively mock the opponent's weakest points. Goes for the jugular every single time.",
  },
  "The Philosopher": {
    key: "The Philosopher",
    emoji: "🌀",
    tagline: "CALM • EXISTENTIAL",
    color: "#8b5cf6",
    shadow: "#5b21b6",
    nameBg: "#5b21b6",
    voicePitch: 0.7,
    voiceRate: 0.75,
    preferHighVoice: false,
    description:
      "Calm and existential. Constantly questions the deeper meaning, ethics, and societal implications of the topic. Makes you question reality itself.",
  },
  "The Troll": {
    key: "The Troll",
    emoji: "😈",
    tagline: "CHAOTIC • INTERNET-BRAINED",
    color: "#00ff88",
    shadow: "#00a855",
    nameBg: "#007a3d",
    voicePitch: 1.6,
    voiceRate: 1.45,
    preferHighVoice: true,
    description:
      "Dismissive and highly informal. Uses internet slang and modern jargon to annoy the opponent while still technically making logical counter-arguments.",
  },
};

export const PERSONA_KEYS = Object.keys(PERSONAS) as PersonaKey[];