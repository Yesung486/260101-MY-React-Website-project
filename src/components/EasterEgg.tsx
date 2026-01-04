import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '../../hooks/useSound';

interface EasterEggProps {
  theme: 'light' | 'dark';
}

const EasterEgg: React.FC<EasterEggProps> = ({ theme }) => {
  const { playClick, playThemeSwitch } = useSound();
  const [mode, setMode] = useState<'none' | 'gravity' | 'solar'>('none');
  const [inputLog, setInputLog] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const newInput = (inputLog + e.key).slice(-3);
      setInputLog(newInput);

      // 1. 무중력 모드 (G키)
      if (e.key.toLowerCase() === 'g') {
        playThemeSwitch(theme === 'light' ? 'dark' : 'light');
        setMode(prev => prev === 'gravity' ? 'none' : 'gravity');
      }

      // 2. 태양풍 모드 (sun 입력)
      if (newInput === 'sun') {
        playClick('light');
        setMode('solar');
        setTimeout(() => setMode('none'), 3000); // 3초 뒤 종료
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputLog, theme, playClick, playThemeSwitch]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[999]">
      <AnimatePresence>
        {/* 무중력 모드일 때 나타나는 우주 먼지 효과 */}
        {mode === 'gravity' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-indigo-500/10 backdrop-blur-[2px]"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/20 text-8xl font-black italic">
              ZERO GRAVITY
            </div>
          </motion.div>
        )}

        {/* 태양풍 효과 */}
        {mode === 'solar' && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: [0, 1, 0.8, 0], scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-orange-500/40 via-yellow-400/20 to-transparent"
          />
        )}
      </AnimatePresence>

      <style>{`
        ${mode === 'gravity' ? `
          img, .group, h1, h2, p, button:not(.nav-button) {
            animation: float 6s ease-in-out infinite !important;
            transition: transform 1s cubic-bezier(0.2, 0, 0.2, 1) !important;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            33% { transform: translateY(-20px) rotate(2deg); }
            66% { transform: translateY(10px) rotate(-1deg); }
          }
        ` : ''}
        ${mode === 'solar' ? `
          body { filter: contrast(1.2) brightness(1.2) sepia(0.3); }
        ` : ''}
      `}</style>
    </div>
  );
};

export default EasterEgg;