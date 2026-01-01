import { useCallback, useRef } from 'react';
import { useSoundState } from '../contexts/SoundContext';

export const useSound = () => {
  const { volume, isMuted } = useSoundState();
  const audioContextRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    }
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  // Helper to calculate effective gain based on global volume
  const getEffectiveGain = (baseGain: number) => {
    if (isMuted) return 0;
    // Normalize 0-100 to 0-1
    return baseGain * (volume / 100);
  };

  // General Click Sound
  const playClick = useCallback(() => {
    const ctx = initAudio();
    if (!ctx) return;

    // Base peak gain was 0.2
    const peakGain = getEffectiveGain(0.2);
    if (peakGain <= 0.0001) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(peakGain, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }, [volume, isMuted]); // Depend on volume/mute state

  // Theme Switch Sound
  const playThemeSwitch = useCallback((targetMode: 'light' | 'dark') => {
    const ctx = initAudio();
    if (!ctx) return;
    
    // Base gain for theme switch was 0.2
    const masterVol = getEffectiveGain(0.2);
    if (masterVol <= 0.0001) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.value = masterVol;
    masterGain.connect(ctx.destination);

    if (targetMode === 'light') {
      // Day Mode
      const notes = [523.25, 659.25, 783.99]; 
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const startTime = now + i * 0.08;
        const duration = 0.3;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.5, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } else {
      // Night Mode
      const notes = [392.00, 329.63, 261.63]; 
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle'; 
        osc.frequency.value = freq;
        const startTime = now + i * 0.12; 
        const duration = 0.4;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.4, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    }
  }, [volume, isMuted]);

  return { playClick, playThemeSwitch };
};