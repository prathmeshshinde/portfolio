import {
  BONUS_LIFETIME_MS,
  DIRECTION_VECTORS,
  POWER_LIFETIME_MS,
  POWER_UPS,
  isEffectActive,
  type GameState,
  type Point,
} from "./engine";

export const NEON = {
  bg: "#05050b",
  grid: "rgba(0, 234, 255, 0.07)",
  cyan: "#00eaff",
  magenta: "#ff29d0",
  yellow: "#ffe14d",
  food: "#3dffb0",
  danger: "#ff3b6b",
  text: "#e6fdff",
} as const;

type Rgb = [number, number, number];
const hex = (value: string): Rgb => {
  const n = Number.parseInt(value.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const SNAKE = { head: hex("#00eaff"), tail: hex("#6b4dff") };
const SNAKE_GOLD = { head: hex("#ffe14d"), tail: hex("#ff7a3d") };
const SNAKE_DEAD = { head: hex("#ff3b6b"), tail: hex("#4a0f24") };
const mix = (a: Rgb, b: Rgb, t: number) =>
  `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)}, ${Math.round(a[1] + (b[1] - a[1]) * t)}, ${Math.round(a[2] + (b[2] - a[2]) * t)})`;
const rgb = (c: Rgb) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;

/* ------------------------------------------------------------------ */
/*  Particles & floating score text                                    */
/* ------------------------------------------------------------------ */
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  ttl: number;
  size: number;
  color: string;
}

export interface Floater {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  ttl: number;
}

export interface Fx {
  particles: Particle[];
  floaters: Floater[];
  shake: number;
  flash: number;
  reduced: boolean;
}

export const createFx = (reduced = false): Fx => ({ particles: [], floaters: [], shake: 0, flash: 0, reduced });

/** Coordinates are in board cells, velocities in cells per ms. */
export function burst(fx: Fx, at: Point, color: string, count: number, power = 1) {
  const total = fx.reduced ? Math.ceil(count / 3) : count;
  for (let i = 0; i < total; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (0.004 + Math.random() * 0.01) * power;
    fx.particles.push({
      x: at.x + 0.5,
      y: at.y + 0.5,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      ttl: 380 + Math.random() * 420,
      size: 0.1 + Math.random() * 0.16,
      color,
    });
  }
  if (fx.particles.length > 240) fx.particles.splice(0, fx.particles.length - 240);
}

export function floatText(fx: Fx, at: Point, text: string, color: string) {
  fx.floaters.push({ x: at.x + 0.5, y: at.y + 0.2, text, color, life: 0, ttl: 900 });
  if (fx.floaters.length > 12) fx.floaters.shift();
}

export function shake(fx: Fx) {
  fx.flash = 1;
  if (!fx.reduced) fx.shake = 1;
}

export function updateFx(fx: Fx, dt: number) {
  for (const p of fx.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.986;
    p.vy *= 0.986;
    p.life += dt;
  }
  fx.particles = fx.particles.filter((p) => p.life < p.ttl);
  for (const f of fx.floaters) {
    f.y -= 0.0013 * dt;
    f.life += dt;
  }
  fx.floaters = fx.floaters.filter((f) => f.life < f.ttl);
  fx.shake = Math.max(0, fx.shake - dt / 320);
  fx.flash = Math.max(0, fx.flash - dt / 420);
}

/* ------------------------------------------------------------------ */
/*  Drawing                                                            */
/* ------------------------------------------------------------------ */
function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
  } else {
    ctx.fillRect(x, y, w, h);
  }
}

/** Grid + obstacles rarely change, so they are drawn once into an offscreen layer. */
let staticLayer: { key: string; canvas: HTMLCanvasElement } | null = null;

function getStaticLayer(s: GameState, px: number, dpr: number) {
  const key = `${px}|${dpr}|${s.size}|${s.obstacles.map((o) => o.x * 100 + o.y).join(",")}`;
  if (staticLayer?.key === key) return staticLayer.canvas;

  const canvas = staticLayer?.canvas ?? document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(px * dpr));
  canvas.height = Math.max(1, Math.round(px * dpr));
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const cell = px / s.size;

  ctx.fillStyle = NEON.bg;
  ctx.fillRect(0, 0, px, px);

  ctx.strokeStyle = NEON.grid;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 1; i < s.size; i++) {
    const o = Math.round(i * cell) + 0.5;
    ctx.moveTo(o, 0);
    ctx.lineTo(o, px);
    ctx.moveTo(0, o);
    ctx.lineTo(px, o);
  }
  ctx.stroke();

  if (s.obstacles.length) {
    const inset = cell * 0.06;
    ctx.save();
    ctx.shadowColor = NEON.magenta;
    ctx.shadowBlur = cell * 0.6;
    ctx.fillStyle = NEON.magenta;
    for (const o of s.obstacles) ctx.fillRect(o.x * cell + inset, o.y * cell + inset, cell - inset * 2, cell - inset * 2);
    ctx.restore();
    ctx.fillStyle = "rgba(5, 5, 11, 0.55)";
    for (const o of s.obstacles) {
      ctx.fillRect(o.x * cell + cell * 0.3, o.y * cell + cell * 0.3, cell * 0.4, cell * 0.4);
    }
  }

  staticLayer = { key, canvas };
  return canvas;
}

function drawBorder(ctx: CanvasRenderingContext2D, s: GameState, px: number, now: number) {
  const cell = px / s.size;
  const solid = s.mode === "arena" && !isEffectActive(s, "ghost");
  ctx.save();
  ctx.lineWidth = 2;
  if (solid) {
    ctx.strokeStyle = NEON.magenta;
    ctx.shadowColor = NEON.magenta;
    ctx.shadowBlur = 12;
  } else {
    ctx.strokeStyle = "rgba(0, 234, 255, 0.55)";
    ctx.setLineDash([cell * 0.5, cell * 0.5]);
    ctx.lineDashOffset = -((now / 40) % cell);
  }
  ctx.strokeRect(1, 1, px - 2, px - 2);
  ctx.restore();
}

function drawFood(ctx: CanvasRenderingContext2D, food: Point, cell: number, now: number) {
  const cx = (food.x + 0.5) * cell;
  const cy = (food.y + 0.5) * cell;
  const r = cell * (0.26 + 0.05 * Math.sin(now / 160));
  ctx.save();
  ctx.shadowColor = NEON.food;
  ctx.shadowBlur = cell * 0.9;
  ctx.fillStyle = NEON.food;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.beginPath();
  ctx.arc(cx - r * 0.32, cy - r * 0.32, r * 0.28, 0, Math.PI * 2);
  ctx.fill();
}

function blinking(remaining: number, now: number) {
  return remaining < 0.25 && Math.floor(now / 110) % 2 === 0;
}

function drawBonus(ctx: CanvasRenderingContext2D, s: GameState, cell: number, now: number) {
  const bonus = s.bonus!;
  const remaining = Math.max(0, (bonus.expiresAt - s.time) / BONUS_LIFETIME_MS);
  if (blinking(remaining, now)) return;
  const cx = (bonus.pos.x + 0.5) * cell;
  const cy = (bonus.pos.y + 0.5) * cell;
  const r = cell * 0.34;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(now / 450);
  ctx.shadowColor = NEON.yellow;
  ctx.shadowBlur = cell;
  ctx.fillStyle = NEON.yellow;
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.lineTo(r, 0);
  ctx.lineTo(0, r);
  ctx.lineTo(-r, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = "rgba(255, 225, 77, 0.65)";
  ctx.lineWidth = Math.max(1.5, cell * 0.08);
  ctx.beginPath();
  ctx.arc(cx, cy, cell * 0.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * remaining);
  ctx.stroke();
  ctx.restore();
}

function drawPower(ctx: CanvasRenderingContext2D, s: GameState, cell: number, now: number) {
  const power = s.power!;
  const remaining = Math.max(0, (power.expiresAt - s.time) / POWER_LIFETIME_MS);
  if (blinking(remaining, now)) return;
  const meta = POWER_UPS[power.kind];
  const size = cell * (0.8 + 0.06 * Math.sin(now / 200));
  const x = (power.pos.x + 0.5) * cell - size / 2;
  const y = (power.pos.y + 0.5) * cell - size / 2;

  ctx.save();
  ctx.shadowColor = meta.color;
  ctx.shadowBlur = cell * 0.8;
  ctx.fillStyle = meta.color;
  roundedRect(ctx, x, y, size, size, size * 0.22);
  ctx.restore();

  ctx.fillStyle = NEON.bg;
  ctx.font = `700 ${Math.max(8, cell * (meta.glyph.length > 1 ? 0.38 : 0.5))}px "JetBrains Mono Variable", ui-monospace, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(meta.glyph, x + size / 2, y + size / 2 + cell * 0.03);
}

function snakePalette(s: GameState, dead: boolean) {
  if (dead) return SNAKE_DEAD;
  return isEffectActive(s, "double") ? SNAKE_GOLD : SNAKE;
}

function drawSnake(ctx: CanvasRenderingContext2D, s: GameState, cell: number, now: number, dead: boolean) {
  const palette = snakePalette(s, dead);
  const ghost = !dead && isEffectActive(s, "ghost");
  const len = s.snake.length;

  ctx.save();
  if (ghost) ctx.globalAlpha = 0.45 + 0.25 * Math.sin(now / 70);

  // Tail to head so the head is drawn on top.
  for (let i = len - 1; i >= 0; i--) {
    const seg = s.snake[i];
    const t = len > 1 ? i / (len - 1) : 0;
    const inset = cell * (i === 0 ? 0.04 : 0.1 + 0.1 * t);
    ctx.fillStyle = mix(palette.head, palette.tail, t);

    if (i > 0) {
      const prev = s.snake[i - 1];
      const dx = prev.x - seg.x;
      const dy = prev.y - seg.y;
      if (Math.abs(dx) + Math.abs(dy) === 1) {
        ctx.fillRect(
          Math.min(seg.x, prev.x) * cell + inset,
          Math.min(seg.y, prev.y) * cell + inset,
          (Math.abs(dx) + 1) * cell - inset * 2,
          (Math.abs(dy) + 1) * cell - inset * 2,
        );
      }
    }
    roundedRect(ctx, seg.x * cell + inset, seg.y * cell + inset, cell - inset * 2, cell - inset * 2, cell * 0.22);
  }

  // Glowing head with eyes facing the direction of travel.
  const head = s.snake[0];
  const inset = cell * 0.04;
  ctx.shadowColor = rgb(palette.head);
  ctx.shadowBlur = cell * 0.9;
  ctx.fillStyle = rgb(palette.head);
  roundedRect(ctx, head.x * cell + inset, head.y * cell + inset, cell - inset * 2, cell - inset * 2, cell * 0.24);
  ctx.shadowBlur = 0;

  const d = DIRECTION_VECTORS[s.dir];
  const cx = (head.x + 0.5) * cell + d.x * cell * 0.16;
  const cy = (head.y + 0.5) * cell + d.y * cell * 0.16;
  const px = d.y !== 0 ? cell * 0.2 : 0;
  const py = d.x !== 0 ? cell * 0.2 : 0;
  const eye = Math.max(2, cell * 0.15);
  ctx.fillStyle = NEON.bg;
  ctx.fillRect(cx - px - eye / 2, cy - py - eye / 2, eye, eye);
  ctx.fillRect(cx + px - eye / 2, cy + py - eye / 2, eye, eye);
  ctx.restore();
}

function drawFx(ctx: CanvasRenderingContext2D, fx: Fx, cell: number) {
  for (const p of fx.particles) {
    const alpha = 1 - p.life / p.ttl;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    const size = p.size * cell;
    ctx.fillRect(p.x * cell - size / 2, p.y * cell - size / 2, size, size);
  }
  ctx.globalAlpha = 1;

  if (!fx.floaters.length) return;
  ctx.save();
  ctx.font = `700 ${Math.max(10, cell * 0.58)}px "JetBrains Mono Variable", ui-monospace, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const f of fx.floaters) {
    ctx.globalAlpha = 1 - f.life / f.ttl;
    ctx.shadowColor = f.color;
    ctx.shadowBlur = 8;
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x * cell, f.y * cell);
  }
  ctx.restore();
}

export interface View {
  /** Board size in CSS pixels. */
  px: number;
  dpr: number;
  now: number;
}

export function drawGame(ctx: CanvasRenderingContext2D, s: GameState, fx: Fx, view: View) {
  const { px, dpr, now } = view;
  const cell = px / s.size;
  const dead = !s.alive;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalAlpha = 1;
  ctx.drawImage(getStaticLayer(s, px, dpr), 0, 0, px, px);

  ctx.save();
  if (fx.shake > 0) {
    const magnitude = fx.shake * cell * 0.55;
    ctx.translate((Math.random() - 0.5) * magnitude, (Math.random() - 0.5) * magnitude);
  }
  drawBorder(ctx, s, px, now);
  drawFood(ctx, s.food, cell, now);
  if (s.bonus) drawBonus(ctx, s, cell, now);
  if (s.power) drawPower(ctx, s, cell, now);
  drawSnake(ctx, s, cell, now, dead);
  drawFx(ctx, fx, cell);
  ctx.restore();

  if (fx.flash > 0) {
    ctx.fillStyle = `rgba(255, 59, 107, ${fx.flash * 0.3})`;
    ctx.fillRect(0, 0, px, px);
  }
}
