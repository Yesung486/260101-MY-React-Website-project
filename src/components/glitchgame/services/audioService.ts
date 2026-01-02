class AudioService {
  private context: AudioContext | null = null;
  private gainNode: GainNode | null = null;

  constructor() {
    // Lazy initialization handled in init()
  }

  public init() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.context.createGain();
      this.gainNode.connect(this.context.destination);
      this.gainNode.gain.value = 0.1; // Low volume
    }
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  public playBeep(frequency: number = 440, type: OscillatorType = 'sine', duration: number = 0.1) {
    if (!this.context || !this.gainNode) return;

    const osc = this.context.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.context.currentTime);
    osc.connect(this.gainNode);
    osc.start();
    osc.stop(this.context.currentTime + duration);
  }

  public playTypingSound() {
    // Quick random tick
    this.playBeep(800 + Math.random() * 200, 'square', 0.03);
  }

  public playError() {
    this.playBeep(150, 'sawtooth', 0.2);
    setTimeout(() => this.playBeep(100, 'sawtooth', 0.3), 150);
  }

  public playAlarm() {
    // Siren effect
    if (!this.context) return;
    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.linearRampToValueAtTime(400, now + 0.3);
    osc.connect(this.gainNode!);
    osc.start();
    osc.stop(now + 0.3);
  }

  public playSuccess() {
    this.playBeep(600, 'sine', 0.1);
    setTimeout(() => this.playBeep(1200, 'sine', 0.2), 100);
  }

  public playGlitch() {
    if (!this.context) return;
    const count = 5;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        this.playBeep(Math.random() * 1000 + 200, 'square', 0.05);
      }, i * 40);
    }
  }
}

export const audioService = new AudioService();