"use client";
import { useDebate }           from "../../hooks/useDebate";
import DebateHeader            from "../../components/debate/DebateHeader";
import StatusBanner            from "../../components/debate/StatusBanner";
import DebateStage             from "../../components/debate/DebateStage";
import ControlPanel            from "../../components/debate/ControlPanel";
import HumanInterventionPanel  from "../../components/debate/HumanInterventionPanel";
import TranscriptPanel         from "../../components/debate/TranscriptPanel";

export default function DebatePage() {
  const {
    isRunning, currentIdx, speakingID, transcript,
    humanMode, humanText, statusMsg, debateOver, round,
    setHumanText, startDebate, shutUp, resumeDebate, submitHumanInput,
  } = useDebate();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #0d0626 0%, #1a0a40 50%, #0d0626 100%)", fontFamily: "'Impact','Arial Black',sans-serif" }}>
      <DebateHeader isRunning={isRunning} round={round} />
      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4">
        <div className="flex-1 flex flex-col gap-4">
          <StatusBanner statusMsg={statusMsg} />
          <DebateStage speakingID={speakingID} currentIdx={currentIdx} />
          <ControlPanel
            isRunning={isRunning} humanMode={humanMode} debateOver={debateOver}
            onStart={startDebate} onShutUp={shutUp} onResume={resumeDebate}
          />
          <HumanInterventionPanel
            humanMode={humanMode} humanText={humanText}
            setHumanText={setHumanText} onSubmit={submitHumanInput}
          />
        </div>
        <TranscriptPanel transcript={transcript} currentIdx={currentIdx} speakingID={speakingID} />
      </main>
      <footer className="text-center py-2 px-4" style={{ borderTop: "4px solid #000", background: "#0a0220", color: "#ffffff30", fontFamily: "'Arial',sans-serif", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase" }}>
        DebateForge — Powered by Web Speech API — No AIs were harmed
      </footer>
    </div>
  );
}