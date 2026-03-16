export function getBestVoice(
  voices: SpeechSynthesisVoice[],
  preferHigh: boolean
): SpeechSynthesisVoice | undefined {
  const highNames = ["Samantha", "Victoria", "Karen", "Zira", "Hazel", "Moira", "Tessa", "Alice"];
  const lowNames  = ["Daniel", "Alex", "Fred", "Tom", "Gordon", "Bruce", "Ralph"];
  const preferred = preferHigh ? highNames : lowNames;

  for (const name of preferred) {
    const v = voices.find((v) => v.name.includes(name));
    if (v) return v;
  }
  const natural = voices.filter(
    (v) => !v.name.toLowerCase().includes("google") && v.lang.startsWith("en")
  );
  if (natural.length) return preferHigh ? natural[0] : natural[natural.length - 1];
  return voices.find((v) => v.lang.startsWith("en")) ?? voices[0];
}