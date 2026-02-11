import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '../../hooks/useSound';
import StarGame from './StarGame/Stargame';

interface EasterEggProps { theme: 'light' | 'dark'; }

const EasterEgg: React.FC<EasterEggProps> = ({ theme }) => {
  const { playThemeSwitch, playLaunch, playSuccess } = useSound();
  const [mode, setMode] = useState<'none' | 'blackhole' | 'countdown' | 'launch' | 'tour' | 'space' | 'gravity'>('none');
  const [countdown, setCountdown] = useState(3);
  const mousePos = useRef({ x: 0, y: 0 });

  const syncMode = useCallback((newMode: any) => {
    setMode(newMode);
    window.dispatchEvent(new CustomEvent('easter-sync', { detail: newMode }));
  }, []);

  useEffect(() => {
    // 1. 블랙홀 마우스 트래킹
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (mode === 'blackhole') {
        const elements = document.querySelectorAll('button, .app-card, nav');
        elements.forEach((el: any) => {
          const rect = el.getBoundingClientRect();
          const elX = rect.left + rect.width / 2;
          const elY = rect.top + rect.height / 2;
          const dist = Math.hypot(mousePos.current.x - elX, mousePos.current.y - elY);
          
          if (dist < 400) {
            const angle = Math.atan2(mousePos.current.y - elY, mousePos.current.x - elX);
            const force = (400 - dist) / 40;
            el.style.transform = `translate(${Math.cos(angle) * force}px, ${Math.sin(angle) * force}px) scale(${1 - force/50}) rotate(${force * 2}deg)`;
            el.style.transition = 'transform 0.1s ease-out';
          }
        });
      }
    };

    // 2. 이벤트 리스너들
    const handleBlackhole = () => syncMode('blackhole');
    const handleGravity = () => syncMode('gravity');
    const handleStartGame = () => { syncMode('space'); playSuccess(); };
    
    // 3. 로켓 시퀀스 (카운트다운 -> 발사 -> 3D 우주 투어)
    const handleRocketSequence = () => {
      if (mode !== 'none') return;
      syncMode('countdown');
      setCountdown(3);
      const timer = setInterval(() => setCountdown(c => (c <= 1 ? (clearInterval(timer), 0) : c - 1)), 1000);
      
      setTimeout(() => {
        syncMode('launch');
        playLaunch();
        setTimeout(() => syncMode('tour'), 4000);
      }, 3000);
    };

    const handleSync = (e: any) => { if (e.detail === 'none') {
      setMode('none');
      document.querySelectorAll('button, .app-card, nav').forEach((el: any) => el.style.transform = '');
    }};

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('trigger-easteregg', handleBlackhole);
    window.addEventListener('trigger-gravity', handleGravity);
    window.addEventListener('trigger-rocket', handleRocketSequence);
    window.addEventListener('trigger-start-game', handleStartGame);
    window.addEventListener('easter-sync', handleSync);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('trigger-easteregg', handleBlackhole);
      window.removeEventListener('trigger-gravity', handleGravity);
      window.removeEventListener('trigger-rocket', handleRocketSequence);
      window.removeEventListener('trigger-start-game', handleStartGame);
      window.removeEventListener('easter-sync', handleSync);
    };
  }, [mode, syncMode, playLaunch, playSuccess]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[10000] overflow-hidden font-sans">
      <AnimatePresence>
        
        {/* 카운트다운 */}
        {mode === 'countdown' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 flex items-center justify-center pointer-events-auto">
            <motion.h1 key={countdown} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-white text-[150px] font-black italic shadow-cyan-500/50 shadow-2xl">{countdown > 0 ? countdown : "LAUNCH"}</motion.h1>
          </motion.div>
        )}

        {/* 로켓 발사 */}
        {mode === 'launch' && (
          <motion.div initial={{ y: "100vh" }} animate={{ y: "-150vh" }} transition={{ duration: 4, ease: "circIn" }} className="absolute inset-0 flex justify-center">
            <div className="text-[100px]">🚀</div>
          </motion.div>
        )}

        {/* ✨ 3D 우주 투어 (하연이처럼 예쁘고 반짝반짝한 연출) */}
        {(mode === 'tour' || mode === 'space') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-[#00020a] pointer-events-auto">
            {/* 반짝이는 별무리 (Stardust) */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#1b2735_0%,_#090a0f_100%)]" />
            <div className="stars-container absolute inset-0">
               {[...Array(100)].map((_, i) => (
                 <div key={i} className="star absolute bg-white rounded-full animate-twinkle" 
                   style={{ 
                     top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
                     width: `${Math.random() * 3}px`, height: `${Math.random() * 3}px`,
                     animationDelay: `${Math.random() * 5}s`
                   }} 
                 />
               ))}
            </div>
            
            {/* 태양계 연출 (3D 느낌) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-70">
              <div className="w-64 h-64 bg-yellow-400 rounded-full blur-3xl animate-pulse" /> {/* 태양 */}
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute w-[500px] h-[500px] border border-white/10 rounded-full">
                <div className="absolute top-0 left-1/2 w-8 h-8 bg-blue-500 rounded-full shadow-[0_0_20px_#3b82f6]" /> {/* 지구 */}
              </motion.div>
            </div>

            {mode === 'tour' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                <h2 className="text-white text-4xl font-bold tracking-[0.5em] mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">GALAXY TOUR</h2>
                <p className="text-cyan-300 text-sm tracking-widest animate-bounce">SEARCH 'GAME' TO START MISSION</p>
              </div>
            )}

            {mode === 'space' && <div className="relative z-10 w-full h-full"><StarGame /></div>}
            
            <button onClick={() => syncMode('none')} className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[30] text-white/50 hover:text-white border border-white/20 px-8 py-2 rounded-full backdrop-blur-md transition-all">EXIT VOYAGE</button>
          </motion.div>
        )}

        {/* 무중력 모드 알림 */}
        {mode === 'gravity' && (
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] bg-indigo-600/80 px-10 py-5 rounded-3xl backdrop-blur-2xl border border-indigo-400">
            <h1 className="text-white text-2xl font-black tracking-tighter text-center">ZERO GRAVITY ACTIVE</h1>
          </motion.div>
        )}

      </AnimatePresence>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .animate-twinkle { animation: twinkle 3s infinite; }
      `}</style>
    </div>
  );
};

export default EasterEgg;