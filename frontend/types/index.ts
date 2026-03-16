export interface DebateTurn {
  id: number;
  speakerID: "A" | "B";
  text: string;
  pitch: number;
  rate: number;
}

export interface HumanTurn {
  id: number;
  speakerID: "HUMAN";
  text: string;
  pitch: number;
  rate: number;
}

export type TranscriptEntry = DebateTurn | HumanTurn;

export interface DebateState {
  isRunning: boolean;
  currentIdx: number;
  speakingID: "A" | "B" | null;
  transcript: TranscriptEntry[];
  humanMode: boolean;
  humanText: string;
  statusMsg: string;
  debateOver: boolean;
  round: number;
}

export interface DebateActions {
  setHumanText: (text: string) => void;
  startDebate: () => void;
  shutUp: () => void;
  resumeDebate: () => void;
  submitHumanInput: () => void;
}

export type UseDebateReturn = DebateState & DebateActions;