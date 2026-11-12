import type { Mode } from "./engine";
import { readJSON, writeJSON } from "@/lib/storage";

export interface ScoreEntry {
  id: string;
  name: string;
  score: number;
  level: number;
  mode: Mode;
  date: string;
}

export type LeaderboardSource = "global" | "local";

export interface LeaderboardResult {
  entries: ScoreEntry[];
  source: LeaderboardSource;
}

const LOCAL_KEY = "snake:leaderboard:v1";
export const LEADERBOARD_SIZE = 10;
const REMOTE_URL = (import.meta.env.VITE_LEADERBOARD_URL ?? "").trim();

export const hasGlobalLeaderboard = REMOTE_URL.length > 0;

export function sanitizeName(raw: string) {
  return raw
    .replace(/[^\p{L}\p{N} ._-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 12);
}

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function normalise(list: unknown, mode: Mode): ScoreEntry[] {
  if (!Array.isArray(list)) return [];
  return list
    .filter(
      (e): e is Partial<ScoreEntry> & { name: string; score: number } =>
        !!e && typeof e === "object" && typeof e.name === "string" && Number.isFinite(e.score),
    )
    .map((e, i) => ({
      id: typeof e.id === "string" ? e.id : `${e.name}-${e.score}-${i}`,
      name: sanitizeName(e.name) || "PLAYER",
      score: Math.max(0, Math.floor(e.score)),
      level: Number.isFinite(e.level) ? Number(e.level) : 1,
      mode,
      date: typeof e.date === "string" ? e.date : "",
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, LEADERBOARD_SIZE);
}

function readLocal(): Record<Mode, ScoreEntry[]> {
  const data = readJSON<Partial<Record<Mode, unknown>>>(LOCAL_KEY, {});
  return { classic: normalise(data.classic, "classic"), arena: normalise(data.arena, "arena") };
}

export function qualifies(entries: ScoreEntry[], score: number) {
  if (score <= 0) return false;
  return entries.length < LEADERBOARD_SIZE || score > entries[entries.length - 1].score;
}

export async function fetchLeaderboard(mode: Mode): Promise<LeaderboardResult> {
  if (REMOTE_URL) {
    try {
      const url = new URL(REMOTE_URL, window.location.href);
      url.searchParams.set("mode", mode);
      const response = await fetch(url, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(String(response.status));
      return { entries: normalise(await response.json(), mode), source: "global" };
    } catch {
      /* fall back to this device's scores */
    }
  }
  return { entries: readLocal()[mode], source: "local" };
}

export async function submitScore(input: {
  name: string;
  score: number;
  level: number;
  mode: Mode;
}): Promise<{ result: LeaderboardResult; entry: ScoreEntry }> {
  const entry: ScoreEntry = {
    ...input,
    name: sanitizeName(input.name) || "PLAYER",
    id: makeId(),
    date: new Date().toISOString(),
  };

  // Always keep a copy on this device.
  const local = readLocal();
  local[entry.mode] = normalise([...local[entry.mode], entry], entry.mode);
  writeJSON(LOCAL_KEY, local);

  if (REMOTE_URL) {
    try {
      const response = await fetch(new URL(REMOTE_URL, window.location.href), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name: entry.name, score: entry.score, level: entry.level, mode: entry.mode }),
      });
      if (!response.ok) throw new Error(String(response.status));
      const body: unknown = await response.json().catch(() => null);
      const entries = Array.isArray(body) ? normalise(body, entry.mode) : (await fetchLeaderboard(entry.mode)).entries;
      return { result: { entries, source: "global" }, entry };
    } catch {
      /* fall back to this device's scores */
    }
  }

  return { result: { entries: local[entry.mode], source: "local" }, entry };
}
