/**
 * Pure Snake game logic — no DOM, no React. The UI advances the game with `step()`
 * at `stepInterval()` and reacts to the events it returns.
 */

export type Mode = "classic" | "arena";
export type Dir = "up" | "down" | "left" | "right";
export type PowerKind = "slow" | "ghost" | "double" | "trim";
export type TimedEffect = Exclude<PowerKind, "trim">;
export type Rng = () => number;

export interface Point {
  x: number;
  y: number;
}

export interface TimedItem {
  pos: Point;
  spawnedAt: number;
  expiresAt: number;
}

export interface PowerItem extends TimedItem {
  kind: PowerKind;
}

export interface GameState {
  mode: Mode;
  size: number;
  /** Head first. */
  snake: Point[];
  dir: Dir;
  /** Buffered turns so quick key presses are not lost between ticks. */
  queue: Dir[];
  grow: number;
  food: Point;
  bonus: TimedItem | null;
  power: PowerItem | null;
  obstacles: Point[];
  blocked: Set<number>;
  /** Game-time (ms) at which each effect ends; 0 = never activated. */
  effects: Record<TimedEffect, number>;
  score: number;
  level: number;
  eaten: number;
  combo: number;
  lastEatAt: number;
  /** Game time in ms — only advances while playing. */
  time: number;
  alive: boolean;
}

export type GameEvent =
  | { type: "eat"; at: Point; points: number; combo: number }
  | { type: "bonus"; at: Point; points: number }
  | { type: "power"; at: Point; kind: PowerKind }
  | { type: "levelup"; level: number }
  | { type: "die"; at: Point };

export const BOARD_SIZE = 24;
export const FOODS_PER_LEVEL = 5;
export const MAX_LEVEL = 15;
export const COMBO_WINDOW_MS = 3000;
export const MAX_COMBO = 5;
export const BONUS_LIFETIME_MS = 6500;
export const POWER_LIFETIME_MS = 9000;
export const EFFECT_DURATION_MS: Record<TimedEffect, number> = { slow: 6000, ghost: 5000, double: 8000 };
const MAX_OBSTACLE_CELLS = 48;

export const MODES: Record<Mode, { label: string; tagline: string; description: string }> = {
  classic: {
    label: "Classic",
    tagline: "Wrap-around edges",
    description: "Edges are portals — leave one side, enter the opposite. Pure, endless snake.",
  },
  arena: {
    label: "Arena",
    tagline: "Walls + obstacles",
    description: "Solid walls and new obstacles every level. Higher risk, bigger points.",
  },
};

export const POWER_UPS: Record<PowerKind, { label: string; glyph: string; color: string; description: string }> = {
  slow: { label: "Slow-mo", glyph: "S", color: "#7cc8ff", description: "Slows the game for 6 seconds" },
  ghost: { label: "Ghost", glyph: "G", color: "#b48cff", description: "Pass through walls, obstacles and yourself for 5s" },
  double: { label: "Double", glyph: "2×", color: "#ffe14d", description: "Double points for 8 seconds" },
  trim: { label: "Trim", glyph: "T", color: "#5dff9a", description: "Cuts four segments off your tail" },
};

export const DIRECTION_VECTORS: Record<Dir, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export const OPPOSITE: Record<Dir, Dir> = { up: "down", down: "up", left: "right", right: "left" };

const keyOf = (size: number, p: Point) => p.y * size + p.x;
const samePoint = (a: Point | null | undefined, b: Point) => !!a && a.x === b.x && a.y === b.y;
const manhattan = (a: Point, b: Point) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
const inBounds = (size: number, p: Point) => p.x >= 0 && p.y >= 0 && p.x < size && p.y < size;

export const isEffectActive = (s: GameState, effect: TimedEffect) => s.time < s.effects[effect];
export const effectRemaining = (s: GameState, effect: TimedEffect) => Math.max(0, s.effects[effect] - s.time);

export function createGame(mode: Mode, rng: Rng = Math.random, size = BOARD_SIZE): GameState {
  const mid = Math.floor(size / 2);
  const snake = Array.from({ length: 4 }, (_, i) => ({ x: mid - 2 - i, y: mid }));
  const state: GameState = {
    mode,
    size,
    snake,
    dir: "right",
    queue: [],
    grow: 0,
    food: { x: -1, y: -1 },
    bonus: null,
    power: null,
    obstacles: [],
    blocked: new Set(),
    effects: { slow: 0, ghost: 0, double: 0 },
    score: 0,
    level: 1,
    eaten: 0,
    combo: 0,
    lastEatAt: Number.NEGATIVE_INFINITY,
    time: 0,
    alive: true,
  };
  if (mode === "arena") placeObstacles(state, 3, rng);
  state.food = randomFreeCell(state, rng, { minDistance: 4 }) ?? { x: size - 3, y: mid };
  return state;
}

/** Queue a turn. Ignores reversals and repeats relative to the last queued direction. */
export function queueDirection(s: GameState, dir: Dir) {
  const last = s.queue.length ? s.queue[s.queue.length - 1] : s.dir;
  if (dir === last || dir === OPPOSITE[last] || s.queue.length >= 3) return false;
  s.queue.push(dir);
  return true;
}

/** Milliseconds between moves for the current level / effects. */
export function stepInterval(s: GameState) {
  const base = s.mode === "arena" ? 128 : 136;
  const perLevel = s.mode === "arena" ? 6.5 : 5.5;
  const ms = Math.max(58, base - (s.level - 1) * perLevel);
  return isEffectActive(s, "slow") ? ms * 1.65 : ms;
}

function takenCells(s: GameState) {
  const taken = new Set(s.blocked);
  for (const segment of s.snake) taken.add(keyOf(s.size, segment));
  for (const p of [s.food, s.bonus?.pos, s.power?.pos]) {
    if (p && inBounds(s.size, p)) taken.add(keyOf(s.size, p));
  }
  return taken;
}

export function randomFreeCell(
  s: GameState,
  rng: Rng,
  { minDistance = 0, margin = 0 }: { minDistance?: number; margin?: number } = {},
): Point | null {
  const taken = takenCells(s);
  const head = s.snake[0];
  const free: Point[] = [];
  for (let y = margin; y < s.size - margin; y++) {
    for (let x = margin; x < s.size - margin; x++) {
      const p = { x, y };
      if (taken.has(keyOf(s.size, p))) continue;
      if (minDistance && manhattan(head, p) < minDistance) continue;
      free.push(p);
    }
  }
  return free.length ? free[Math.floor(rng() * free.length)] : null;
}

function inPathOfHead(s: GameState, p: Point, reach = 6) {
  const d = DIRECTION_VECTORS[s.dir];
  const head = s.snake[0];
  for (let i = 1; i <= reach; i++) {
    const x = (((head.x + d.x * i) % s.size) + s.size) % s.size;
    const y = (((head.y + d.y * i) % s.size) + s.size) % s.size;
    if (x === p.x && y === p.y) return true;
  }
  return false;
}

function touchesObstacle(s: GameState, p: Point) {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const q = { x: p.x + dx, y: p.y + dy };
      if (inBounds(s.size, q) && s.blocked.has(keyOf(s.size, q))) return true;
    }
  }
  return false;
}

/**
 * Adds short, isolated wall segments. They stay off the outer ring and never touch
 * each other, so they can't seal off part of the board.
 */
function placeObstacles(s: GameState, count: number, rng: Rng) {
  let placed = 0;
  for (let attempt = 0; attempt < 60 && placed < count && s.obstacles.length < MAX_OBSTACLE_CELLS; attempt++) {
    const start = randomFreeCell(s, rng, { minDistance: 6, margin: 1 });
    if (!start) return;
    const horizontal = rng() < 0.5;
    const length = 1 + Math.floor(rng() * 3);
    const taken = takenCells(s);
    const cells: Point[] = [];
    for (let i = 0; i < length; i++) {
      const p = horizontal ? { x: start.x + i, y: start.y } : { x: start.x, y: start.y + i };
      const tooClose = manhattan(s.snake[0], p) < 6;
      if (p.x < 1 || p.y < 1 || p.x > s.size - 2 || p.y > s.size - 2) break;
      if (taken.has(keyOf(s.size, p)) || tooClose || inPathOfHead(s, p) || touchesObstacle(s, p)) break;
      cells.push(p);
    }
    if (!cells.length) continue;
    for (const cell of cells) {
      s.obstacles.push(cell);
      s.blocked.add(keyOf(s.size, cell));
    }
    placed++;
  }
}

function pickPower(s: GameState, rng: Rng): PowerKind {
  const pool: Array<[PowerKind, number]> = [
    ["slow", 3],
    ["ghost", s.mode === "arena" ? 3 : 2],
    ["double", 3],
    ["trim", s.snake.length > 10 ? 2 : 0],
  ];
  const total = pool.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = rng() * total;
  for (const [kind, weight] of pool) {
    roll -= weight;
    if (roll < 0) return kind;
  }
  return "double";
}

function die(s: GameState, at: Point, events: GameEvent[]) {
  s.alive = false;
  events.push({ type: "die", at });
  return events;
}

/** Advance the snake by one cell. */
export function step(s: GameState, rng: Rng = Math.random): GameEvent[] {
  const events: GameEvent[] = [];
  if (!s.alive) return events;

  if (s.bonus && s.time >= s.bonus.expiresAt) s.bonus = null;
  if (s.power && s.time >= s.power.expiresAt) s.power = null;

  while (s.queue.length) {
    const next = s.queue.shift()!;
    if (next !== s.dir && next !== OPPOSITE[s.dir]) {
      s.dir = next;
      break;
    }
  }

  const head = s.snake[0];
  const d = DIRECTION_VECTORS[s.dir];
  const ghost = isEffectActive(s, "ghost");
  let x = head.x + d.x;
  let y = head.y + d.y;

  if (!inBounds(s.size, { x, y })) {
    if (s.mode === "arena" && !ghost) return die(s, head, events);
    x = (x + s.size) % s.size;
    y = (y + s.size) % s.size;
  }

  const next = { x, y };
  if (!ghost) {
    if (s.blocked.has(keyOf(s.size, next))) return die(s, next, events);
    // The tail vacates its cell this tick unless the snake is growing.
    const checkLength = s.snake.length - (s.grow > 0 ? 0 : 1);
    for (let i = 0; i < checkLength; i++) {
      if (samePoint(s.snake[i], next)) return die(s, next, events);
    }
  }

  s.snake.unshift(next);
  if (s.grow > 0) s.grow--;
  else s.snake.pop();

  const multiplier = isEffectActive(s, "double") ? 2 : 1;

  if (samePoint(s.food, next)) {
    s.combo = s.time - s.lastEatAt <= COMBO_WINDOW_MS ? Math.min(s.combo + 1, MAX_COMBO) : 1;
    s.lastEatAt = s.time;
    const base = (s.mode === "arena" ? 15 : 10) + (s.level - 1) * 2;
    const points = base * s.combo * multiplier;
    s.score += points;
    s.eaten++;
    s.grow++;
    events.push({ type: "eat", at: next, points, combo: s.combo });

    if (s.eaten % FOODS_PER_LEVEL === 0 && s.level < MAX_LEVEL) {
      s.level++;
      events.push({ type: "levelup", level: s.level });
      if (s.mode === "arena") placeObstacles(s, 2, rng);
    }

    s.food = randomFreeCell(s, rng, { minDistance: 2 }) ?? randomFreeCell(s, rng) ?? s.food;

    if (!s.bonus && s.eaten >= 3 && rng() < 0.2) {
      const pos = randomFreeCell(s, rng, { minDistance: 4 });
      if (pos) s.bonus = { pos, spawnedAt: s.time, expiresAt: s.time + BONUS_LIFETIME_MS };
    }
    if (!s.power && s.eaten >= 2 && rng() < 0.25) {
      const pos = randomFreeCell(s, rng, { minDistance: 4 });
      if (pos) s.power = { pos, kind: pickPower(s, rng), spawnedAt: s.time, expiresAt: s.time + POWER_LIFETIME_MS };
    }
  } else if (s.bonus && samePoint(s.bonus.pos, next)) {
    const points = (s.mode === "arena" ? 75 : 50) * multiplier;
    s.score += points;
    s.grow += 2;
    s.bonus = null;
    events.push({ type: "bonus", at: next, points });
  } else if (s.power && samePoint(s.power.pos, next)) {
    const { kind } = s.power;
    s.power = null;
    if (kind === "trim") {
      const cut = Math.min(4, s.snake.length - 3);
      if (cut > 0) s.snake.length -= cut;
      s.grow = 0;
      s.score += 5 * multiplier;
    } else {
      s.effects[kind] = s.time + EFFECT_DURATION_MS[kind];
    }
    events.push({ type: "power", at: next, kind });
  }

  return events;
}
