/**
 * Sonic Signature Module
 * Web Audio API service for genre-agnostic audio triggers.
 * Bypass Mute logic prevents external safety API interference.
 */

const BYPASS_MUTE_KEY = "sonicBypassMute";

class SonicModuleService {
  private audioContext: AudioContext | null = null;
  private bypassMute = false;

  constructor() {
    const stored = localStorage.getItem(BYPASS_MUTE_KEY);
    this.bypassMute = stored === "true";
  }

  /** Initialize AudioContext on first user gesture (required by browser autoplay policy) */
  initAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    if (this.bypassMute && this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  /** Play a short forge-strike tone — no external API, pure Web Audio synthesis */
  async playForgeStrike(): Promise<void> {
    const ctx = this.initAudioContext();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    const now = ctx.currentTime;

    // Distorted metal hit: oscillator + noise burst
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const distortion = ctx.createWaveShaper();

    // Create distortion curve (heavy metal crunch)
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i * 2) / 256 - 1;
      curve[i] = ((Math.PI + 400) * x) / (Math.PI + 400 * Math.abs(x));
    }
    distortion.curve = curve;

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(110, now); // Low A — metal root note
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.3);

    gainNode.gain.setValueAtTime(0.8, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(distortion);
    distortion.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);

    // Noise burst for percussive attack
    const bufferSize = ctx.sampleRate * 0.1;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    noiseSource.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSource.start(now);
    noiseSource.stop(now + 0.1);
  }

  /** Play a Hatebreed-style breakdown chug */
  async playBreakdownChug(): Promise<void> {
    const ctx = this.initAudioContext();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    const now = ctx.currentTime;
    const notes = [82.4, 82.4, 73.4, 82.4, 69.3]; // E2 pattern
    const durations = [0.12, 0.12, 0.12, 0.12, 0.24];
    let time = now;

    for (let i = 0; i < notes.length; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const dist = ctx.createWaveShaper();

      const curve = new Float32Array(256);
      for (let j = 0; j < 256; j++) {
        const x = (j * 2) / 256 - 1;
        curve[j] = ((Math.PI + 600) * x) / (Math.PI + 600 * Math.abs(x));
      }
      dist.curve = curve;

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(notes[i], time);
      gain.gain.setValueAtTime(0.7, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + durations[i]);

      osc.connect(dist);
      dist.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + durations[i]);
      time += durations[i] + 0.02;
    }
  }

  /** Toggle bypass mute — resumes AudioContext to override OS/browser mute */
  toggleBypassMute(enabled: boolean): void {
    this.bypassMute = enabled;
    localStorage.setItem(BYPASS_MUTE_KEY, String(enabled));

    if (this.audioContext) {
      if (enabled && this.audioContext.state === "suspended") {
        this.audioContext.resume();
      }
    }
  }

  isBypassMuteEnabled(): boolean {
    return this.bypassMute;
  }

  getContextState(): string {
    return this.audioContext?.state ?? "uninitialized";
  }
}

export const sonicModule = new SonicModuleService();
