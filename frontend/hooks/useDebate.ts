"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { DEBATE_SCRIPT } from "../data/debateScript";
import { getBestVoice } from "../lib/voiceUtils";
import type { TranscriptEntry, UseDebateReturn } from "../types";

export function useDebate(): UseDebateReturn {
  const [isRunning,  setIsRunning]  = useState(false);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [speakingID, setSpeakingID] = useState<"A" | "B" | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [humanMode,  setHumanMode]  = useState(false);
  const [humanText,  setHumanText]  = useState("");
  const [statusMsg,  setStatusMsg]  = useState("PRESS START TO BEGIN THE CARNAGE");
  const [voices,     setVoices]     = useState<SpeechSynthesisVoice[]>([]);
  const [debateOver, setDebateOver] = useState(false);
  const [round,      setRound]      = useState(0);

  const synthRef      = useRef<SpeechSynthesis | null>(null);
  const loopRef       = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausedRef     = useRef(false);
  const idxRef        = useRef(-1);
  const transcriptRef = useRef<TranscriptEntry[]>([]);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    const load = () => {
      const v = synthRef.current!.getVoices();
      if (v.length) setVoices(v);
    };
    load();
    synthRef.current.onvoiceschanged = load;
    return () => {
      if (synthRef.current) {
        synthRef.current.onvoiceschanged = null;
        synthRef.current.cancel();
      }
      if (loopRef.current) clearTimeout(loopRef.current);
    };
  }, []);

  const speakTurn = useCallback(
    (idx: number) => {
      if (idx >= DEBATE_SCRIPT.length) {
        setSpeakingID(null);
        setStatusMsg("🏆 DEBATE CONCLUDED — BOTH AIs HAVE LOST THEIR MINDS");
        setDebateOver(true);
        setIsRunning(false);
        return;
      }

      const turn = DEBATE_SCRIPT[idx];
      idxRef.current = idx;
      setCurrentIdx(idx);
      setSpeakingID(turn.speakerID);
      setStatusMsg(
        turn.speakerID === "A"
          ? "⚡ DEBATER A IS COOKING..."
          : "🔥 DEBATER B IS CLAPPING BACK..."
      );

      const newTranscript: TranscriptEntry[] = [...transcriptRef.current, turn];
      transcriptRef.current = newTranscript;
      setTranscript([...newTranscript]);

      const utter = new SpeechSynthesisUtterance(turn.text);
      utter.pitch  = turn.pitch;
      utter.rate   = turn.rate;
      utter.volume = 1;
      if (voices.length) {
        const voice = getBestVoice(voices, turn.speakerID === "A");
        if (voice) utter.voice = voice;
      }

      utter.onend = () => {
        if (pausedRef.current) return;
        setSpeakingID(null);
        setStatusMsg("...");
        loopRef.current = setTimeout(() => {
          if (!pausedRef.current) speakTurn(idx + 1);
        }, 900);
      };
      utter.onerror = () => setSpeakingID(null);

      synthRef.current?.cancel();
      synthRef.current?.speak(utter);
    },
    [voices]
  );

  const startDebate = useCallback(() => {
    const available = voices.length
      ? voices
      : (synthRef.current?.getVoices() ?? []);

    if (!available.length) {
      setStatusMsg("⚠️ Loading voices... try again in a second!");
      const v = synthRef.current?.getVoices() ?? [];
      if (v.length) setVoices(v);
      return;
    }

    pausedRef.current     = false;
    transcriptRef.current = [];
    idxRef.current        = 0;
    setIsRunning(true);
    setHumanMode(false);
    setDebateOver(false);
    setTranscript([]);
    setRound((r) => r + 1);
    speakTurn(0);
  }, [voices, speakTurn]);

  const shutUp = useCallback(() => {
    synthRef.current?.cancel();
    if (loopRef.current) clearTimeout(loopRef.current);
    pausedRef.current = true;
    setSpeakingID(null);
    setHumanMode(true);
    setIsRunning(false);
    setStatusMsg("🎙️ HUMAN HAS THE FLOOR — AIs ARE SULKING");
  }, []);

  const resumeDebate = useCallback(() => {
    const nextIdx = idxRef.current >= 0 ? idxRef.current + 1 : 0;
    if (nextIdx >= DEBATE_SCRIPT.length) {
      setHumanMode(false);
      setStatusMsg("DEBATE IS OVER, BRO");
      return;
    }
    pausedRef.current = false;
    setHumanMode(false);
    setIsRunning(true);
    speakTurn(nextIdx);
  }, [speakTurn]);

  const submitHumanInput = useCallback(() => {
    if (!humanText.trim()) return;

    const humanEntry: TranscriptEntry = {
      id: Date.now(),
      speakerID: "HUMAN",
      text: humanText,
      pitch: 1,
      rate: 1,
    };

    const utter = new SpeechSynthesisUtterance(humanText);
    utter.pitch  = 1.05;
    utter.rate   = 1;
    if (voices.length) {
      const neutral = voices.find((v) => v.lang.startsWith("en"));
      if (neutral) utter.voice = neutral;
    }
    utter.onend = () => setStatusMsg("AIs REGROUPING AFTER HUMAN INTERRUPTION...");

    synthRef.current?.cancel();
    synthRef.current?.speak(utter);

    transcriptRef.current = [...transcriptRef.current, humanEntry];
    setTranscript([...transcriptRef.current]);
    setHumanText("");
    setStatusMsg("🗣️ HUMAN IS RANTING...");
  }, [humanText, voices]);

  return {
    isRunning, currentIdx, speakingID, transcript,
    humanMode, humanText, statusMsg, debateOver, round,
    setHumanText, startDebate, shutUp, resumeDebate, submitHumanInput,
  };
}