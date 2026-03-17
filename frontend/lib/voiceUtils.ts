import type { DebateLanguage } from "../types";

export const PERSONA_VOICE_NAMES: Record<string, string[]> = {
  "The Professor": [
    "Microsoft Ryan Online (Natural) - English (United Kingdom)",
    "Microsoft Ryan Online",
    "Microsoft Ryan",
    "Microsoft Thomas Online",
    "Microsoft Mark",
  ],
  "The Aggressor": [
    "Microsoft Abeo Online (Natural) - English (Nigeria)",
    "Microsoft Abeo Online",
    "Microsoft Abeo",
    "Microsoft William Online",
    "Microsoft David",
  ],
  "The Philosopher": [
    "Microsoft Connor Online (Natural) - English (Ireland)",
    "Microsoft Connor Online",
    "Microsoft Connor",
    "Microsoft Liam Online",
    "Microsoft Mark",
  ],
  "The Troll": [
    "Microsoft Wayne Online (Natural) - English (Singapore)",
    "Microsoft Wayne Online",
    "Microsoft Wayne",
    "Microsoft Prabhat Online",
    "Microsoft Ravi",
  ],
};

// Per-language voice assignments per persona
const LANGUAGE_VOICE_NAMES: Record<DebateLanguage, Record<string, string[]>> = {
  english: PERSONA_VOICE_NAMES,
  hindi: {
    "The Professor":  ["Microsoft कुनाल",  "Microsoft मधुर",  "Microsoft अर्जुन"],
    "The Aggressor":  ["Microsoft अर्जुन", "Microsoft रेहान", "Microsoft कुनाल"],
    "The Philosopher":["Microsoft मधुर",   "Microsoft कुनाल", "Microsoft आरव"],
    "The Troll":      ["Microsoft रेहान",  "Microsoft आरव",   "Microsoft स्वरा"],
  },
  bengali: {
    "The Professor":  ["Microsoft ভাস্কর",   "Microsoft প্রদ্বীপ"],
    "The Aggressor":  ["Microsoft প্রদ্বীপ", "Microsoft ভাস্কর"],
    "The Philosopher":["Microsoft ভাস্কর",   "Microsoft তানিশা"],
    "The Troll":      ["Microsoft নবনীতা",   "Microsoft তানিশা"],
  },
  tamil: {
    "The Professor":  ["Microsoft வள்ளுவர்", "Microsoft குமார்"],
    "The Aggressor":  ["Microsoft குமார்",   "Microsoft சூர்யா"],
    "The Philosopher":["Microsoft பல்லவி",   "Microsoft வள்ளுவர்"],
    "The Troll":      ["Microsoft சூர்யா",   "Microsoft அன்பு"],
  },
  telugu: {
    "The Professor":  ["Microsoft మోహన్",  "Microsoft శ్రుతి"],
    "The Aggressor":  ["Microsoft మోహన్",  "Microsoft శ్రుతి"],
    "The Philosopher":["Microsoft శ్రుతి", "Microsoft మోహన్"],
    "The Troll":      ["Microsoft శ్రుతి", "Microsoft మోహన్"],
  },
};

export function getPersonaVoice(
  voices: SpeechSynthesisVoice[],
  personaKey: string
): SpeechSynthesisVoice | undefined {
  const preferred     = PERSONA_VOICE_NAMES[personaKey] ?? [];
  const englishVoices = voices.filter((v) => v.lang.startsWith("en"));

  for (const name of preferred) {
    const exact   = englishVoices.find((v) => v.name === name);
    if (exact) return exact;
    const partial = englishVoices.find((v) => v.name.includes(name));
    if (partial) return partial;
  }

  const natural = englishVoices.filter(
    (v) => !v.name.toLowerCase().includes("google")
  );
  return natural[0] ?? englishVoices[0] ?? voices[0];
}

export function getPersonaVoiceForLanguage(
  voices: SpeechSynthesisVoice[],
  personaKey: string,
  language: DebateLanguage
): SpeechSynthesisVoice | undefined {
  if (language === "english") return getPersonaVoice(voices, personaKey);

  const langMap   = LANGUAGE_VOICE_NAMES[language] ?? {};
  const preferred = langMap[personaKey] ?? [];

  const langPrefix =
    language === "hindi"   ? "hi" :
    language === "bengali" ? "bn" :
    language === "tamil"   ? "ta" :
    language === "telugu"  ? "te" : "en";

  const langVoices = voices.filter((v) => v.lang.startsWith(langPrefix));

  for (const name of preferred) {
    const exact   = langVoices.find((v) => v.name === name);
    if (exact) return exact;
    const partial = langVoices.find((v) => v.name.includes(name));
    if (partial) return partial;
  }

  return langVoices[0] ?? voices[0];
}

export function getBestVoice(
  voices: SpeechSynthesisVoice[],
  preferHigh: boolean
): SpeechSynthesisVoice | undefined {
  return getPersonaVoice(
    voices,
    preferHigh ? "The Troll" : "The Professor"
  );
}