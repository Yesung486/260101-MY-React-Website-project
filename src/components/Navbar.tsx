import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Sun, Moon, Volume2, VolumeX, Search } from 'lucide-react';
import { useSound } from '../../hooks/useSound';
import { useSoundState } from '../../contexts/SoundContext';
import { Theme } from '../types';
import { useNavigate } from 'react-router-dom';
import StarGame from '../components/StarGame/stargame';

interface NavbarProps {
  theme: Theme;
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ theme, toggleTheme }) => {
  const { playClick, playThemeSwitch } = useSound();
  const { isMuted, toggleMute } = useSoundState();
  
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  const [clickCount, setClickCount] = useState(0); 
  const [activeEgg, setActiveEgg] = useState<'none' | 'blackhole' | 'gravity' | 'game'>('none');
  const [solarPhase, setSolarPhase] = useState<'none' | 'dark' | 'approach' | 'shatter'>('none');
  const [inputLog, setInputLog] = useState(''); 
  
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const angleRef = useRef(0);
  const requestRef = useRef<number>();

  // ✅ 1. 태양 충돌 시퀀스
  const startSolarSequence = () => {
    setSolarPhase('dark');
    setTimeout(() => setSolarPhase('approach'), 800);
    setTimeout(() => {
      setSolarPhase('shatter');
      playThemeSwitch('light');
      document.body.classList.add('animate-impact-shock');
    }, 3300);
    setTimeout(() => {
      setSolarPhase('none');
      document.body.classList.remove('animate-impact-shock');
    }, 5000);
  };

  // ✅ 2. 산산조각 파편 데이터
  const shatterPieces = useMemo(() => {
    if (solarPhase !== 'shatter') return [];
    return Array.from({ length: 120 }).map((_, i) => ({
      id: i,
      style: {
        '--x': `${(Math.random() - 0.5) * 250}vw`,
        '--y': `${(Math.random() - 0.5) * 250}vh`,
        '--r': `${Math.random() * 1000 - 500}deg`,
        '--d': `${Math.random() * 0.4}s`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      } as React.CSSProperties
    }));
  }, [solarPhase]);

  // ✅ 3. 검색창 엔터 -> 게임 실행
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const term = search.toLowerCase().trim();
      if (term === 'play' || term === 'ㅔㅣ묘') {
        e.preventDefault(); 
        setActiveEgg('game');
        setSearch('');
        playThemeSwitch('dark'); 
      }
    }
  };

  // ✅ 4. 키보드 이스터에그 리스너
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      const key = e.key.toLowerCase();
      const newLog = (inputLog + key).slice(-10);
      setInputLog(newLog);

      if (key === 'g' || e.key === 'ㅎ') setActiveEgg(prev => prev === 'gravity' ? 'none' : 'gravity');
      if (newLog.includes('sun') || newLog.includes('녀ㅜ')) {
        setInputLog('');
        startSolarSequence();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [inputLog]);

  // ✅ 5. 애니메이션 엔진 (블랙홀, 무중력)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      const elements = document.querySelectorAll('.group, h1, h2, p, .app-card, footer, section');
      if (activeEgg === 'none' || activeEgg === 'game' || solarPhase !== 'none') {
        elements.forEach((el) => { (el as HTMLElement).style.transform = ''; });
      } else {
        angleRef.current += 0.02;
        elements.forEach((el, index) => {
          const target = el as HTMLElement;
          const rect = target.getBoundingClientRect();
          if (activeEgg === 'blackhole') {
            const dist = 100 + (index % 10) * 20;
            const orbitX = Math.cos(angleRef.current + index) * dist;
            const orbitY = Math.sin(angleRef.current + index) * dist;
            target.style.transform = `translate(${(mouseRef.current.x - (rect.left + rect.width/2)) * 0.2 + orbitX}px, ${(mouseRef.current.y - (rect.top + rect.height/2)) * 0.2 + orbitY}px) rotate(${angleRef.current * 40}deg)`;
          } else if (activeEgg === 'gravity') {
            target.style.transform = `translate(${Math.sin(angleRef.current + index) * 20}px, ${Math.cos(angleRef.current * 0.5 + index) * 30}px) rotate(${Math.sin(angleRef.current) * 5}deg)`;
          }
        });
      }
      requestRef.current = requestAnimationFrame(animate);
    };
    window.addEventListener('mousemove', handleMouseMove);
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [activeEgg, solarPhase]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300">
      
      {/* ☀️ 태양 충돌 효과 레이어 */}
      {solarPhase !== 'none' && (
        <div className={`fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none
          ${solarPhase === 'dark' ? 'bg-black/90 transition-colors duration-700' : ''}
          ${solarPhase === 'approach' ? 'bg-black/95 transition-colors duration-700' : ''}
          ${solarPhase === 'shatter' ? 'bg-transparent' : ''}
        `}>
          {solarPhase === 'approach' && (
            <div className="rounded-full bg-gradient-to-r from-orange-600 to-yellow-400 shadow-[0_0_80px_30px_#ea580c] animate-solar-approach" />
          )}
          
          {solarPhase === 'shatter' && (
            <div className="fixed inset-0 overflow-hidden bg-transparent">
              {shatterPieces.map(piece => (
                <div 
                  key={piece.id}
                  className="absolute w-5 h-5 bg-white animate-shatter-piece"
                  style={{ 
                    ...piece.style, 
                    boxShadow: '0 0 15px 3px rgba(255, 255, 255, 0.9)',
                    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
                  }} 
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 🎮 스타포지(STAR-FORGE) 게임 레이어 */}
      {activeEgg === 'game' && (
        <div className="fixed inset-0 bg-black z-[500] flex flex-col items-center justify-center">
          {/* ✅ 예성이가 만든 게임 컴포넌트 본체 */}
          <StarGame />

          {/* 닫기 버튼: 게임 UI 위에 띄움 */}
          <button 
            onClick={() => { setActiveEgg('none'); playClick(theme); }}
            className="absolute top-6 right-6 z-[600] px-6 py-2 bg-white/10 hover:bg-red-500 text-white rounded-full font-bold backdrop-blur-md border border-white/20 transition-all shadow-2xl"
          >
            EXIT GAME (ESC)
          </button>
        </div>
      )}

      {/* 🛠️ CSS 애니메이션 키프레임 */}
      <style>{`
        @keyframes solarApproach {
          0% { width: 5px; height: 5px; transform: scale(1); opacity: 0.3; }
          100% { width: 5px; height: 5px; transform: scale(600); opacity: 1; }
        }
        @keyframes shatter-piece {
          0% { transform: translate(0, 0) rotate(0deg) scale(1.5); opacity: 1; }
          100% { transform: translate(var(--x), var(--y)) rotate(var(--r)) scale(0); opacity: 0; }
        }
        @keyframes impact-shock {
          0% { transform: translate(0,0) scale(1); filter: brightness(1) contrast(1); }
          10% { transform: translate(-15px, 10px) scale(1.05); filter: brightness(2.5) contrast(1.5) blur(2px); }
          20% { transform: translate(15px, -10px) scale(1.02); filter: brightness(1.8) contrast(1.2) blur(1px); }
          100% { transform: translate(0,0) scale(1); filter: brightness(1); }
        }
        .animate-solar-approach { animation: solarApproach 2.5s forwards cubic-bezier(0.7, 0, 0.84, 0); }
        .animate-shatter-piece { 
          animation: shatter-piece 1.8s forwards cubic-bezier(0.25, 0.46, 0.45, 0.94);
          animation-delay: var(--d);
        }
        .animate-impact-shock { 
          animation: impact-shock 0.8s cubic-bezier(.36,.07,.19,.97) both; 
          overflow-x: hidden;
        }
      `}</style>

      {/* Navbar UI */}
      <div className="mx-4 mt-4 rounded-2xl border border-white/30 bg-white/20 dark:bg-black/20 backdrop-blur-md shadow-lg">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-4">
          
          <div className="flex-none">
            <button 
              onClick={() => {
                playClick(theme);
                if (clickCount + 1 >= 5) { setActiveEgg('blackhole'); setClickCount(0); }
                else setClickCount(c => c + 1);
              }}
              className="flex items-center gap-2 group"
            >
              <div className={`p-1 ${activeEgg !== 'none' ? 'animate-spin' : 'group-hover:rotate-12'}`}>
                <img src="./images/logo.png" alt="Logo" className={`w-9 h-9 object-contain ${theme === 'dark' ? 'invert brightness-200' : ''}`} />
              </div>
              <div className="flex flex-col items-start leading-none hidden lg:flex">
                <span className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                  {activeEgg === 'none' ? 'MyFolio' : activeEgg.toUpperCase()}
                </span>
                <span className="text-[10px] font-bold opacity-70 uppercase">STAR-FORGE PROJECT</span>
              </div>
            </button>
          </div>

          <div className="flex-1 max-w-md relative" ref={searchRef}>
            <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="play를 입력하고 우주로..."
              className="w-full bg-white/70 dark:bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm font-bold outline-none focus:ring-2 ring-indigo-500/50 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="p-2.5 rounded-xl bg-white/30 border border-white/10 hover:bg-white/50 transition-colors">
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-white/30 border border-white/10 hover:bg-white/50 transition-colors">
              {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-indigo-700" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;