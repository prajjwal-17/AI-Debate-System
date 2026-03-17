export const PERSONA_VOICE_NAMES: Record<string, string[]> = {
  "The Professor": [
    "Microsoft Ryan Online (Natural) - English (United Kingdom)",
    "Microsoft Ryan Online",
    "Microsoft Ryan",
    "Microsoft Thomas Online",   // UK fallback
    "Microsoft Mark",            // last resort
  ],
  "The Aggressor": [
    "Microsoft Abeo Online (Natural) - English (Nigeria)",
    "Microsoft Abeo Online",
    "Microsoft Abeo",
    "Microsoft William Online",  // Australian fallback — still punchy
    "Microsoft David",
  ],
  "The Philosopher": [
    "Microsoft Connor Online (Natural) - English (Ireland)",
    "Microsoft Connor Online",
    "Microsoft Connor",
    "Microsoft Liam Online",     // Canadian fallback — calm
    "Microsoft Mark",
  ],
  "The Troll": [
    "Microsoft Wayne Online (Natural) - English (Singapore)",
    "Microsoft Wayne Online",
    "Microsoft Wayne",
    "Microsoft Prabhat Online",  // Indian fallback — still distinct
    "Microsoft Ravi",
  ],
};

export function getPersonaVoice(
  voices: SpeechSynthesisVoice[],
  personaKey: string
): SpeechSynthesisVoice | undefined {
  const preferred = PERSONA_VOICE_NAMES[personaKey] ?? [];
  const englishVoices = voices.filter((v) => v.lang.startsWith("en"));

  for (const name of preferred) {
    // Try exact match first
    const exact = englishVoices.find((v) => v.name === name);
    if (exact) return exact;
    // Then partial match
    const partial = englishVoices.find((v) => v.name.includes(name));
    if (partial) return partial;
  }

  // Fallback — any non-Google English voice
  const natural = englishVoices.filter(
    (v) => !v.name.toLowerCase().includes("google")
  );
  return natural[0] ?? englishVoices[0] ?? voices[0];
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