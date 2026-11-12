/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Optional endpoint for a shared Snake leaderboard.
   * GET  {url}?mode=classic|arena  -> ScoreEntry[]
   * POST {url} { name, score, level, mode } -> ScoreEntry[] (or any 2xx)
   * When unset, scores are stored on the player's device only.
   */
  readonly VITE_LEADERBOARD_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
