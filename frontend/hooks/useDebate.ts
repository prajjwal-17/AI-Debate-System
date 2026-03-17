"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PERSONAS } from "../lib/personas";
import { getPersonaVoice } from "../lib/voiceUtils";
import { apiStartDebate, apiNextTurn, apiInterrupt, apiJudge } from "../lib/api";
import type {
  PersonaKey,
  SpeakerSide,
  TranscriptLine,
  FallacyDisplay,
  JudgeResponse,
  DebateSetupConfig,
  NextTurnResponse,
} from "../types";

export type DebatePhase = "setup" | "debating" | "human_turn" | "judging" | "finished";

export interface UseDebateReturn {
  phase: DebatePhase;
  setupConfig: DebateSetupConfig;
  setSetupConfig: (c: DebateSetupConfig) => void;
  startDebate: () => void;
  isStarting: boolean;
  isRunning: boolean;
  speakingID: SpeakerSide | null;
  speakingPersona: PersonaKey | null;
  transcript: TranscriptLine[];
  statusMsg: string;
  round: number;
  proPersona: PersonaKey | null;
  conPersona: PersonaKey | null;
  topic: string;
  shutUp: () => void;
  resumeDebate: () => void;
  humanText: string;
  setHumanText: (t: string) => void;
  targetPersona: SpeakerSide;
  setTargetPersona: (t: SpeakerSide) => void;
  submitHumanInput: () => void;
  isInterrupting: boolean;
  fallacyResult: FallacyDisplay | null;
  requestJudge: () => void;
  isJudging: boolean;
  judgeResult: JudgeResponse | null;
}

export function useDebate(): UseDebateReturn {
  const [phase, setPhase]                     = useState<DebatePhase>("setup");
  const [setupConfig, setSetupConfig]         = useState<DebateSetupConfig>({ topic: "", proPersona: "The Professor", conPersona: "The Aggressor" });
  const [isStarting, setIsStarting]           = useState(false);
  const [isRunning, setIsRunning]             = useState(false);
  const [speakingID, setSpeakingID]           = useState<SpeakerSide | null>(null);
  const [speakingPersona, setSpeakingPersona] = useState<PersonaKey | null>(null);
  const [transcript, setTranscript]           = useState<TranscriptLine[]>([]);
  const [statusMsg, setStatusMsg]             = useState("PRESS START TO BEGIN THE CARNAGE");
  const [round, setRound]                     = useState(0);
  const [proPersona, setProPersona]           = useState<PersonaKey | null>(null);
  const [conPersona, setConPersona]           = useState<PersonaKey | null>(null);
  const [topic, setTopic]                     = useState("");
  const [humanText, setHumanText]             = useState("");
  const [targetPersona, setTargetPersona]     = useState<SpeakerSide>("Con");
  const [isInterrupting, setIsInterrupting]   = useState(false);
  const [fallacyResult, setFallacyResult]     = useState<FallacyDisplay | null>(null);
  const [isJudging, setIsJudging]             = useState(false);
  const [judgeResult, setJudgeResult]         = useState<JudgeResponse | null>(null);
  const [voices, setVoices]                   = useState<SpeechSynthesisVoice[]>([]);

  const synthRef      = useRef<SpeechSynthesis | null>(null);
  const loopRef       = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausedRef     = useRef(false);
  const sessionRef    = useRef<string | null>(null);
  const proPersonaRef = useRef<PersonaKey | null>(null);
  const conPersonaRef = useRef<PersonaKey | null>(null);

  // ── Persistent prefetch slot ─────────────────────────────────────────────
  // Holds a promise for the NEXT turn's data while current turn is speaking.
  // Every speakText call immediately fires the next fetch into this slot.
  const prefetchSlotRef = useRef<Promise<NextTurnResponse> | null>(null);

  // ── Init speech synthesis ────────────────────────────────────────────────
  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    const load = () => {
      const v = synthRef.current!.getVoices();
      if (v.length) setVoices(v);
    };
    load();
    synthRef.current.onvoiceschanged = load;
    return () => {
      if (synthRef.current) { synthRef.current.onvoiceschanged = null; synthRef.current.cancel(); }
      if (loopRef.current) clearTimeout(loopRef.current);
    };
  }, []);

  // ── Speak a single utterance ─────────────────────────────────────────────
  const speakText = useCallback(
    (text: string, speaker: SpeakerSide, personaKey: PersonaKey, onEnd: () => void) => {
      if (!synthRef.current) { onEnd(); return; }
      const persona = PERSONAS[personaKey];
      const utter   = new SpeechSynthesisUtterance(text);
      utter.pitch   = persona.voicePitch;
      utter.rate    = persona.voiceRate;
      utter.volume  = 1;
      if (voices.length) {
        const voice = getPersonaVoice(voices, personaKey);
        if (voice) { utter.voice = voice; utter.lang = voice.lang; }
      }
      setSpeakingID(speaker);
      setSpeakingPersona(personaKey);
      utter.onend   = () => { setSpeakingID(null); setSpeakingPersona(null); onEnd(); };
      utter.onerror = () => { setSpeakingID(null); setSpeakingPersona(null); onEnd(); };
      synthRef.current.speak(utter);
    },
    [voices]
  );

  // ── Add line to transcript ───────────────────────────────────────────────
  const addTranscriptLine = useCallback(
    (speaker: SpeakerSide, text: string, isHuman = false, isSteelmanned = false) => {
      const pro = proPersonaRef.current;
      const con = conPersonaRef.current;
      const personaName =
        speaker === "Pro" ? (pro ?? "Pro") :
        speaker === "Con" ? (con ?? "Con") : "You";
      setTranscript((prev) => [...prev, {
        id: `${Date.now()}-${Math.random()}`,
        speaker, personaName, text, isHuman, isSteelmanned,
      }]);
    },
    []
  );

  // ── Fire next fetch into the prefetch slot ───────────────────────────────
  // Call this the moment a speech starts so the backend is working
  // in parallel while the current utterance is playing.
  const firePrefetch = useCallback(() => {
    const sid = sessionRef.current;
    if (!sid || pausedRef.current) return;
    prefetchSlotRef.current = apiNextTurn(sid);
  }, []);

  // ── Consume prefetch slot (or fall back to fresh fetch) ──────────────────
  const consumePrefetch = useCallback((): Promise<NextTurnResponse> => {
    const sid = sessionRef.current!;
    if (prefetchSlotRef.current) {
      const p = prefetchSlotRef.current;
      prefetchSlotRef.current = null;
      return p;
    }
    // Slot was empty (first call after resume, etc.) — fetch fresh
    return apiNextTurn(sid);
  }, []);

  // ── Core loop — consume prefetch, speak, fire next prefetch ─────────────
  //
  // Timeline per turn:
  //   [speech starts] → firePrefetch() → backend generates next turn
  //   [speech ends]   → consumePrefetch() → data already ready → speak immediately
  //
  const fetchAndSpeakNext = useCallback(async () => {
    if (pausedRef.current || !sessionRef.current) return;
    const pro = proPersonaRef.current;
    const con = conPersonaRef.current;
    if (!pro || !con) return;

    try {
      const data = await consumePrefetch();
      if (pausedRef.current) return;
      if (data.status === "paused") return;

      const personaKey = data.speaker === "Pro" ? pro : con;
      setStatusMsg(data.speaker === "Pro"
        ? `⚡ ${pro.toUpperCase()} IS COOKING...`
        : `🔥 ${con.toUpperCase()} CLAPPING BACK...`);
      setRound((r) => r + 1);
      addTranscriptLine(data.speaker, data.text);

      // Fire the NEXT fetch the moment we start speaking this turn
      firePrefetch();

      speakText(data.text, data.speaker, personaKey, () => {
        if (pausedRef.current) return;
        // Next fetch is already in-flight (or done). Loop immediately.
        fetchAndSpeakNext();
      });

    } catch (err) {
      console.error("Next turn error:", err);
      setStatusMsg("⚠️ BACKEND ERROR — CHECK OLLAMA IS RUNNING");
      setIsRunning(false);
    }
  }, [speakText, addTranscriptLine, firePrefetch, consumePrefetch]);

  // ── Start debate ─────────────────────────────────────────────────────────
  const startDebate = useCallback(async () => {
    if (!setupConfig.topic.trim()) { setStatusMsg("⚠️ ENTER A TOPIC FIRST!"); return; }
    if (setupConfig.proPersona === setupConfig.conPersona) { setStatusMsg("⚠️ PICK TWO DIFFERENT PERSONAS!"); return; }
    setIsStarting(true);
    setStatusMsg("⏳ CONNECTING TO BACKEND...");
    try {
      const data = await apiStartDebate(setupConfig.topic, setupConfig.proPersona, setupConfig.conPersona);
      sessionRef.current    = data.session_id;
      proPersonaRef.current = data.pro_character;
      conPersonaRef.current = data.con_character;
      prefetchSlotRef.current = null; // clear any stale slot from previous debate
      setProPersona(data.pro_character);
      setConPersona(data.con_character);
      setTopic(data.topic);
      pausedRef.current = false;
      setTranscript([]);
      setFallacyResult(null);
      setJudgeResult(null);
      setRound(1);
      setIsRunning(true);
      setPhase("debating");

      const ft = data.first_turn;
      setStatusMsg(`⚡ ${data.pro_character.toUpperCase()} OPENS THE DEBATE...`);
      addTranscriptLine(ft.speaker, ft.text);

      // Pro argument 1: always slow (cold start — nothing to prefetch before this).
      // Fire Con's fetch immediately when Pro starts speaking.
      firePrefetch();

      speakText(ft.text, ft.speaker, data.pro_character, () => {
        if (pausedRef.current) return;
        // Con's data is already in-flight (or ready). fetchAndSpeakNext will consume it.
        fetchAndSpeakNext();
      });

    } catch (err) {
      console.error("Start error:", err);
      setStatusMsg("⚠️ BACKEND ERROR — IS UVICORN RUNNING?");
    } finally {
      setIsStarting(false);
    }
  }, [setupConfig, speakText, addTranscriptLine, firePrefetch, fetchAndSpeakNext]);

  // ── Shut up ──────────────────────────────────────────────────────────────
  const shutUp = useCallback(() => {
    synthRef.current?.cancel();
    if (loopRef.current) clearTimeout(loopRef.current);
    pausedRef.current = true;
    prefetchSlotRef.current = null; // discard any in-flight prefetch
    setSpeakingID(null);
    setSpeakingPersona(null);
    setIsRunning(false);
    setPhase("human_turn");
    setStatusMsg("🎙️ HUMAN HAS THE FLOOR — AIs ARE SULKING");
  }, []);

  // ── Resume after human turn ──────────────────────────────────────────────
  const resumeDebate = useCallback(() => {
    if (!sessionRef.current) return;
    pausedRef.current = false;
    prefetchSlotRef.current = null; // start fresh — no stale prefetch
    setIsRunning(true);
    setPhase("debating");
    setFallacyResult(null);
    setStatusMsg("▶ RESUMING DEBATE...");
    fetchAndSpeakNext();
  }, [fetchAndSpeakNext]);

  // ── Human interrupt ──────────────────────────────────────────────────────
  const submitHumanInput = useCallback(async () => {
    if (!humanText.trim() || !sessionRef.current) return;
    setIsInterrupting(true);
    setStatusMsg("🔍 ANALYSING YOUR ARGUMENT...");
    try {
      const data = await apiInterrupt(sessionRef.current, humanText, targetPersona);
      setFallacyResult({
        fallacy:     data.fallacies_detected.fallacy,
        explanation: data.fallacies_detected.explanation,
        steelmanned: data.steelmanned_version,
      });
      addTranscriptLine("User", humanText, true, false);
      if (data.steelmanned_version && data.steelmanned_version !== humanText) {
        addTranscriptLine("User", data.steelmanned_version, true, true);
      }
      const utter  = new SpeechSynthesisUtterance(data.steelmanned_version);
      utter.pitch  = 1.05;
      utter.rate   = 1.0;
      utter.volume = 1;
      if (voices.length) {
        const n = voices.find((v) => v.lang.startsWith("en"));
        if (n) utter.voice = n;
      }
      setSpeakingID("User");
      utter.onend   = () => { setSpeakingID(null); setStatusMsg("AIs REGROUPING..."); };
      utter.onerror = () => setSpeakingID(null);
      synthRef.current?.cancel();
      synthRef.current?.speak(utter);
      setHumanText("");
      setStatusMsg("🗣️ HUMAN IS RANTING...");
    } catch (err) {
      console.error("Interrupt error:", err);
      setStatusMsg("⚠️ INTERRUPT FAILED");
    } finally {
      setIsInterrupting(false);
    }
  }, [humanText, targetPersona, voices, addTranscriptLine]);

  // ── Judge ────────────────────────────────────────────────────────────────
  const requestJudge = useCallback(async () => {
    if (!sessionRef.current) return;
    synthRef.current?.cancel();
    if (loopRef.current) clearTimeout(loopRef.current);
    pausedRef.current = true;
    prefetchSlotRef.current = null;
    setIsRunning(false);
    setIsJudging(true);
    setPhase("judging");
    setStatusMsg("⚖️ THE JUDGE IS DELIBERATING...");
    try {
      const data = await apiJudge(sessionRef.current);
      setJudgeResult(data);
      setPhase("finished");
      setStatusMsg(`🏆 ${data.winning_character.toUpperCase()} WINS THE DEBATE!`);
    } catch (err) {
      console.error("Judge error:", err);
      setStatusMsg("⚠️ JUDGE FAILED");
      setPhase("debating");
    } finally {
      setIsJudging(false);
    }
  }, []);

  return {
    phase, setupConfig, setSetupConfig, startDebate, isStarting,
    isRunning, speakingID, speakingPersona, transcript, statusMsg, round,
    proPersona, conPersona, topic,
    shutUp, resumeDebate,
    humanText, setHumanText, targetPersona, setTargetPersona,
    submitHumanInput, isInterrupting, fallacyResult,
    requestJudge, isJudging, judgeResult,
  };
}