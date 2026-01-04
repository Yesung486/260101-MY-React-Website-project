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

  const getEffectiveGain = (baseGain: number) => {
    if (isMuted) return 0;
    return baseGain * (volume / 100);
  };

  // ✅ 태양과 우주의 소리 분석 기반 클릭 사운드
  const playClick = useCallback((theme: 'light' | 'dark' = 'light') => {
    const ctx = initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(getEffectiveGain(0.3), now);
    masterGain.connect(ctx.destination);

    // 🎹 분석 기반 아르페지오 구성
    // 태양: 고주파의 화려한 공명 (E Major 기반)
    // 우주: 저주파의 깊은 잔향과 신비로운 음정 (C Minor Add9 기반)
    const notes = theme === 'light' 
      ? [659.25, 830.61, 987.77] // ☀️ 태양: 따-다-단! (밝고 에너제틱한 고음)
      : [130.81, 196.00, 311.13]; // 🌙 우주: 웅...웅...웅... (깊고 묵직한 공간감)

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      
      // 낮에는 깨끗한 Sine파, 밤에는 살짝 더 부드러운 Triangle파로 공간감 부여
      osc.type = theme === 'light' ? 'sine' : 'triangle';
      
      // 태양은 음이 살짝 위로 튀고, 우주는 음이 깊게 깔리도록 설정
      const timeGap = theme === 'light' ? 0.04 : 0.12; // 태양은 빠르게, 우주는 느긋하게
      const startTime = now + i * timeGap;
      
      osc.frequency.setValueAtTime(freq, startTime);
      if (theme === 'dark') {
        // 우주는 끝음이 아주 미세하게 떨어지며 광활한 느낌 전달
        osc.frequency.exponentialRampToValueAtTime(freq * 0.95, startTime + 0.5);
      }

      g.gain.setValueAtTime(0, startTime);
      g.gain.linearRampToValueAtTime(theme === 'light' ? 0.3 : 0.2, startTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, startTime + (theme === 'light' ? 0.3 : 0.8));

      osc.connect(g);
      g.connect(masterGain);
      osc.start(startTime);
      osc.stop(startTime + (theme === 'light' ? 0.3 : 0.8));
    });
  }, [volume, isMuted]);

  // ✅ 테마 전환 사운드: 태양의 폭발적 빛 vs 우주의 광활한 진입
  const playThemeSwitch = useCallback((targetMode: 'light' | 'dark') => {
    const ctx = initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(getEffectiveGain(0.35), now);
    masterGain.connect(ctx.destination);

    if (targetMode === 'light') {
      // ☀️ 태양으로 전환: 빛이 확산되는 듯한 빠른 상승 아르페지오
      const sunRise = [329.63, 415.30, 493.88, 659.25, 830.61, 1318.51];
      sunRise.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        const start = now + i * 0.05;
        osc.frequency.setValueAtTime(freq, start);
        g.gain.setValueAtTime(0, start);
        g.gain.linearRampToValueAtTime(0.2, start + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(start);
        osc.stop(start + 0.4);
      });
    } else {
      // 🌙 우주로 전환: 심해나 성운 속으로 가라앉는 듯한 무겁고 몽환적인 소리
      const spaceDeep = [392.00, 311.13, 261.63, 196.00, 130.81];
      spaceDeep.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        const start = now + i * 0.15;
        osc.frequency.setValueAtTime(freq, start);
        // 우주 진입 시에는 소리가 더 부드럽게 감싸안도록
        g.gain.setValueAtTime(0, start);
        g.gain.linearRampToValueAtTime(0.2, start + 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, start + 1.0);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(start);
        osc.stop(start + 1.0);
      });
    }
  }, [volume, isMuted]);

  return { playClick, playThemeSwitch };
};