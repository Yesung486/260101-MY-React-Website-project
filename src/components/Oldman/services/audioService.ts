class AudioService {
  private context: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.context;
  }

  public playTone(freq: number, type: OscillatorType, duration: number, startTime: number = 0) {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  }

  public playCorrect() {
    // Ding-dong effect
    this.playTone(523.25, 'sine', 0.4, 0); // C5
    this.playTone(659.25, 'sine', 0.6, 0.1); // E5
  }

  public playWrong() {
    // Dissonant buzzer
    this.playTone(150, 'sawtooth', 0.3, 0);
    this.playTone(140, 'sawtooth', 0.3, 0);
  }

  public playClick() {
    // Short blip
    this.playTone(800, 'sine', 0.1, 0);
  }
}

export const audioService = new AudioService();