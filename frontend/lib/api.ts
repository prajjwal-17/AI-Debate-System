import type {
  StartDebateResponse,
  NextTurnResponse,
  InterruptResponse,
  JudgeResponse,
  LeaderboardData,
  PersonaKey,
} from "../types";

const BASE = "http://localhost:8000";

export async function apiStartDebate(
  topic: string,
  proPersona: PersonaKey,
  conPersona: PersonaKey
): Promise<StartDebateResponse> {
  const res = await fetch(`${BASE}/api/debate/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, pro_persona: proPersona, con_persona: conPersona }),
  });
  if (!res.ok) throw new Error(`Start failed: ${res.status}`);
  return res.json();
}

export async function apiNextTurn(sessionId: string): Promise<NextTurnResponse> {
  const res = await fetch(`${BASE}/api/debate/next`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId }),
  });
  if (!res.ok) throw new Error(`Next turn failed: ${res.status}`);
  return res.json();
}

export async function apiInterrupt(
  sessionId: string,
  userArgument: string,
  targetPersona: string
): Promise<InterruptResponse> {
  const res = await fetch(`${BASE}/api/debate/interrupt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      user_argument: userArgument,
      target_persona: targetPersona,
    }),
  });
  if (!res.ok) throw new Error(`Interrupt failed: ${res.status}`);
  return res.json();
}

export async function apiJudge(sessionId: string): Promise<JudgeResponse> {
  const res = await fetch(`${BASE}/api/debate/judge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId }),
  });
  if (!res.ok) throw new Error(`Judge failed: ${res.status}`);
  return res.json();
}

export async function apiGetLeaderboard(): Promise<LeaderboardData> {
  const res = await fetch(`${BASE}/api/personas/stats`);
  if (!res.ok) throw new Error(`Leaderboard failed: ${res.status}`);
  return res.json();
}