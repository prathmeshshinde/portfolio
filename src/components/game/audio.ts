/** Tiny synthesised arcade sound effects — no audio files needed. */

interface ToneOptions {
  at?: number;
  duration?: number;
  type?: OscillatorType;
  slideTo?: number;
  volume?: number;
}

type AudioContextCtor = typeof AudioContext;

export class ArcadeAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  muted = false;

  /** Must be called from (or after) a user gesture for browsers to allow sound. */
  unlock() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const Ctor: AudioContextCtor | undefined =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;
      if (!Ctor) return;
      try {
        this.ctx = new Ctor();
      } catch {
        return;
      }
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.16;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume().catch(() => undefined);
  }

  private tone(frequency: number, { at = 0, duration = 0.08, type = "square", slideTo, volume = 1 }: ToneOptions = {}) {
    if (this.muted || !this.ctx || !this.master || this.ctx.state !== "running") return;
    const start = this.ctx.currentTime + at;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain).connect(this.master);
    osc.start(start);
    osc.stop(start + duration + 0.03);
  }

  eat(combo: number) {
    const base = 520 + Math.min(combo, 5) * 70;
    this.tone(base, { duration: 0.06 });
    this.tone(base * 1.5, { at: 0.05, duration: 0.07 });
  }

  bonus() {
    [660, 880, 1100, 1320].forEach((f, i) => this.tone(f, { at: i * 0.05, duration: 0.08, type: "triangle" }));
  }

  power() {
    this.tone(280, { duration: 0.28, slideTo: 1240, type: "sawtooth", volume: 0.55 });
  }

  levelUp() {
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, { at: i * 0.08, duration: 0.1 }));
  }

  die() {
    this.tone(440, { duration: 0.55, slideTo: 55, type: "sawtooth" });
    this.tone(220, { at: 0.06, duration: 0.5, slideTo: 40, volume: 0.5 });
  }

  countdown() {
    this.tone(880, { duration: 0.06, volume: 0.5 });
  }

  go() {
    this.tone(1320, { duration: 0.16 });
  }

  dispose() {
    void this.ctx?.close().catch(() => undefined);
    this.ctx = null;
    this.master = null;
  }
}
