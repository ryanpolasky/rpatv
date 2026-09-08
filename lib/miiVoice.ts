type MiiVoiceRole = "chip" | "ryan";

const VOICE_PREFERENCES: Record<MiiVoiceRole, string[]> = {
  ryan: [
    "Google US English",
    "Microsoft Zira",
    "Samantha",
    "English United States",
  ],
  chip: [
    "Microsoft David",
    "Alex",
    "Google UK English Male",
    "English United States",
  ],
};

const VOICE_SETTINGS: Record<
  MiiVoiceRole,
  { pitch: number; rate: number }
> = {
  ryan: { pitch: 1.38, rate: 1.08 },
  chip: { pitch: 0.92, rate: 0.96 },
};

function chooseVoice(
  voices: SpeechSynthesisVoice[],
  role: MiiVoiceRole,
) {
  const englishVoices = voices.filter((voice) =>
    voice.lang.toLowerCase().startsWith("en"),
  );

  for (const preference of VOICE_PREFERENCES[role]) {
    const match = englishVoices.find((voice) =>
      voice.name.toLowerCase().includes(preference.toLowerCase()),
    );
    if (match) return match;
  }

  return englishVoices[0] ?? voices[0];
}

function splitIntoPhrases(text: string) {
  return (
    text
      .match(/[^,.;!?]+[,.;!?]?/g)
      ?.map((phrase) => phrase.trim())
      .filter(Boolean) ?? [text]
  );
}

export function speakMiiLine(text: string, role: MiiVoiceRole) {
  if (!("speechSynthesis" in window)) return;

  const synth = window.speechSynthesis;
  const settings = VOICE_SETTINGS[role];
  const voice = chooseVoice(synth.getVoices(), role);
  const phrases = splitIntoPhrases(text);

  synth.cancel();

  phrases.forEach((phrase, index) => {
    const line = new SpeechSynthesisUtterance(phrase);
    const contour = index % 3 === 0 ? 0.08 : index % 3 === 1 ? -0.03 : 0.03;

    line.voice = voice;
    line.lang = voice?.lang ?? "en-US";
    line.pitch = Math.max(0.1, Math.min(2, settings.pitch + contour));
    line.rate = settings.rate + (index % 2 === 0 ? 0.035 : -0.025);
    line.volume = 0.92;
    synth.speak(line);
  });
}
