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

  // ✅ 1. 클릭 사운드 (기존 유지)
  const playClick = useCallback((theme: 'light' | 'dark' = 'light') => {
    const ctx = initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(getEffectiveGain(0.3), now);
    masterGain.connect(ctx.destination);

    const notes = theme === 'light' 
      ? [659.25, 830.61, 987.77] 
      : [130.81, 196.00, 311.13];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = theme === 'light' ? 'sine' : 'triangle';
      const timeGap = theme === 'light' ? 0.04 : 0.12;
      const startTime = now + i * timeGap;
      
      osc.frequency.setValueAtTime(freq, startTime);
      if (theme === 'dark') {
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

  // ✅ 2. 테마 전환 사운드 (기존 유지)
  const playThemeSwitch = useCallback((targetMode: 'light' | 'dark') => {
    const ctx = initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(getEffectiveGain(0.35), now);
    masterGain.connect(ctx.destination);

    if (targetMode === 'light') {
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
      const spaceDeep = [392.00, 311.13, 261.63, 196.00, 130.81];
      spaceDeep.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        const start = now + i * 0.15;
        osc.frequency.setValueAtTime(freq, start);
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

  // ✅ 3. 로켓 발사 사운드: 저음의 럼블과 화이트 노이즈의 조합
  const playLaunch = useCallback(() => {
    const ctx = initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(getEffectiveGain(0.5), now);
    masterGain.connect(ctx.destination);

    // 엔진 점화 소리 (Brown Noise 느낌)
    const bufferSize = ctx.sampleRate * 3; // 3초
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02; // 필터링을 통한 Brown Noise 생성
      lastOut = data[i];
      data[i] *= 3.5; // 음량 보정
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(50, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(800, now + 2); // 점점 커지는 저음

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.6, now + 0.5);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 3);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noise.start(now);
    noise.stop(now + 3);

    // 보조 사운드: 슈우우우- 하는 피치 상승음
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(40, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 2);
    
    const oscFilter = ctx.createBiquadFilter();
    oscFilter.type = 'lowpass';
    oscFilter.frequency.setValueAtTime(100, now);
    
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0, now);
    oscGain.gain.linearRampToValueAtTime(0.15, now + 1);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

    osc.connect(oscFilter);
    oscFilter.connect(oscGain);
    oscGain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 2.5);
  }, [volume, isMuted]);

  // ✅ 4. 성공/태양 사운드: 고주파 아르페지오와 리버브 느낌의 잔향
  const playSuccess = useCallback(() => {
    const ctx = initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(getEffectiveGain(0.4), now);
    masterGain.connect(ctx.destination);

    // 화음 (C Major 9 느낌: C - E - G - B - D)
    const chords = [523.25, 659.25, 783.99, 987.77, 1174.66];
    
    chords.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      
      osc.type = 'sine';
      const start = now + i * 0.1;
      
      osc.frequency.setValueAtTime(freq, start);
      // 벨 사운드처럼 뒤로 갈수록 맑게 퍼짐
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(0.2, start + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, start + 2.5);

      osc.connect(g);
      g.connect(masterGain);
      osc.start(start);
      osc.stop(start + 2.5);
    });
  }, [volume, isMuted]);

  return { playClick, playThemeSwitch, playLaunch, playSuccess };
};