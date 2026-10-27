/**
 * Synthesized Web Audio API sound engine and haptic feedback
 * Zero external audio dependencies = 100% reliable offline & in all browsers
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicPlaying: boolean = false;
  private musicOscillators: (OscillatorNode | GainNode)[] = [];
  private musicTimeout: number | null = null;

  constructor() {
    // AudioContext will be initialized on first user interaction to satisfy browser autoplay policies
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.musicPlaying) {
      this.stopMusic();
    }
  }

  public playMove() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // AudioContext safe fail
    }
  }

  public playRotate() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch {}
  }

  public playSoftDrop() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch {}
  }

  public playHardDrop() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      // Thump bass
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {}
  }

  public playHold() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.setValueAtTime(540, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch {}
  }

  public playLineClear(lines: number, isTetris: boolean) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = isTetris
        ? [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6 (Tetris!)
        : lines === 3
        ? [440.0, 554.37, 659.25] // A4, C#5, E5
        : lines === 2
        ? [392.0, 493.88] // G4, B4
        : [329.63, 440.0]; // E4, A4

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = isTetris ? 'square' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        const startTime = now + idx * 0.06;
        const duration = isTetris ? 0.25 : 0.15;

        gain.gain.setValueAtTime(isTetris ? 0.15 : 0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch {}
  }

  public playLevelUp() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        const startTime = now + idx * 0.08;
        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.2);
      });
    } catch {}
  }

  public playGameOver() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [392.0, 369.99, 349.23, 311.13, 277.18]; // Descending chromatic sad riff
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        const startTime = now + idx * 0.12;
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.2);
      });
    } catch {}
  }

  /**
   * Synthesizes classic Tetris (Korobeiniki) retro chiptune melody
   */
  public startMusic() {
    if (this.musicPlaying || this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    this.musicPlaying = true;
    this.scheduleNextChiptuneLoop();
  }

  public stopMusic() {
    this.musicPlaying = false;
    if (this.musicTimeout) {
      window.clearTimeout(this.musicTimeout);
      this.musicTimeout = null;
    }
  }

  private scheduleNextChiptuneLoop() {
    if (!this.musicPlaying || !this.ctx || this.isMuted) return;

    // Korobeiniki Theme snippet notes (Freq, Duration)
    const melody: [number, number][] = [
      [659.25, 0.4], // E5
      [493.88, 0.2], // B4
      [523.25, 0.2], // C5
      [587.33, 0.4], // D5
      [523.25, 0.2], // C5
      [493.88, 0.2], // B4
      [440.00, 0.4], // A4
      [440.00, 0.2], // A4
      [523.25, 0.2], // C5
      [659.25, 0.4], // E5
      [587.33, 0.2], // D5
      [523.25, 0.2], // C5
      [493.88, 0.6], // B4
      [523.25, 0.2], // C5
      [587.33, 0.4], // D5
      [659.25, 0.4], // E5
      [523.25, 0.4], // C5
      [440.00, 0.4], // A4
      [440.00, 0.4], // A4
    ];

    let currentOffset = 0;
    const now = this.ctx.currentTime;

    melody.forEach(([freq, dur]) => {
      if (!this.ctx || !this.musicPlaying) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + currentOffset);

      gain.gain.setValueAtTime(0.025, now + currentOffset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + currentOffset + dur * 0.85);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + currentOffset);
      osc.stop(now + currentOffset + dur);

      currentOffset += dur;
    });

    this.musicTimeout = window.setTimeout(() => {
      if (this.musicPlaying) {
        this.scheduleNextChiptuneLoop();
      }
    }, currentOffset * 1000);
  }
}

export const soundEngine = new SoundEngine();

/**
 * Mobile Haptic Vibration Feedback
 */
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'double' | 'success', enabled: boolean = true) {
  if (!enabled) return;
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      switch (type) {
        case 'light':
          navigator.vibrate(12);
          break;
        case 'medium':
          navigator.vibrate(25);
          break;
        case 'heavy':
          navigator.vibrate(45);
          break;
        case 'double':
          navigator.vibrate([20, 40, 25]);
          break;
        case 'success':
          navigator.vibrate([20, 50, 40, 50, 70]);
          break;
      }
    } catch {
      // Ignore vibration error on unsupported devices
    }
  }
}
