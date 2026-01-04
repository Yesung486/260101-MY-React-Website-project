import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Sun, Moon, Volume2, VolumeX, Search, Sparkles, Target, Rocket } from 'lucide-react';
import { useSound } from '../../hooks/useSound';
import { useSoundState } from '../../contexts/SoundContext';
import { Theme } from '../types';
import { useNavigate } from 'react-router-dom';
import { APP_DATA } from '../constants';

interface NavbarProps {
  theme: Theme;
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ theme, toggleTheme }) => {
  const { playClick, playThemeSwitch } = useSound();
  const { volume, isMuted, toggleMute } = useSoundState();
  const navigate = useNavigate();
  
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // ✅ [에러 해결 핵심] 모든 상태값(State) 정의
  const [clickCount, setClickCount] = useState(0); // 로고 클릭 횟수
  const [activeEgg, setActiveEgg] = useState<'none' | 'blackhole' | 'gravity' | 'solar' | 'game'>('none');
  const [inputLog, setInputLog] = useState(''); // 키보드 입력 로그
  const [score, setScore] = useState(0); // 게임 점수
  
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const angleRef = useRef(0);
  const requestRef = useRef<number>();

  // ✅ 한글/영어 통합 키 입력 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      // 입력된 키를 로그에 추가 (최근 10글자 유지)
      const newLog = (inputLog + key).slice(-10);
      setInputLog(newLog);

      // 1. 무중력 (g 또는 ㅎ)
      if (key === 'g' || e.key === 'ㅎ') {
        setActiveEgg(prev => prev === 'gravity' ? 'none' : 'gravity');
      }

      // 2. 태양풍 (sun 또는 녀ㅜ)
      if (newLog.includes('sun') || newLog.includes('녀ㅜ')) {
        setActiveEgg('solar');
        setTimeout(() => setActiveEgg('none'), 4000);
        setInputLog('');
      }

      // 3. 게임 시작 (play 또는 ㅔㅣ묘)
      if (newLog.includes('play') || newLog.includes('ㅔㅣ묘')) {
        setActiveEgg('game');
        setScore(0);
        setInputLog('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputLog]);

  // ✅ 애니메이션 엔진
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      if (activeEgg === 'none' || activeEgg === 'game' || activeEgg === 'solar') {
        // 효과 없을 때 원위치 (부드럽게)
        const elements = document.querySelectorAll('.group, h1, h2, p, .app-card, footer, section');
        elements.forEach((el) => {
          (el as HTMLElement).style.transform = '';
        });
      } else {
        const elements = document.querySelectorAll('.group, h1, h2, p, .app-card, footer, section');
        angleRef.current += 0.02;

        elements.forEach((el, index) => {
          const target = el as HTMLElement;
          const rect = target.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          if (activeEgg === 'blackhole') {
            const dist = 100 + (index % 10) * 20;
            const orbitX = Math.cos(angleRef.current + index) * dist;
            const orbitY = Math.sin(angleRef.current + index) * dist;
            const pullX = (mouseRef.current.x - centerX) * 0.2;
            const pullY = (mouseRef.current.y - centerY) * 0.2;
            target.style.transform = `translate(${pullX + orbitX}px, ${pullY + orbitY}px) rotate(${angleRef.current * 40}deg)`;
          } else if (activeEgg === 'gravity') {
            const floatX = Math.sin(angleRef.current + index) * 20;
            const floatY = Math.cos(angleRef.current * 0.5 + index) * 30;
            target.style.transform = `translate(${floatX}px, ${floatY}px) rotate(${floatX * 0.5}deg)`;
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
  }, [activeEgg]);

  // ✅ 빈 공간 클릭 시 해제
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (activeEgg === 'none' || activeEgg === 'game') return;
      if (!(e.target as HTMLElement).closest('button, input, a')) {
        setActiveEgg('none');
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [activeEgg]);

  const suggestions = useMemo(() => {
    if (!search.trim()) return [];
    return APP_DATA.filter(app => app.title.toLowerCase().includes(search.toLowerCase())).slice(0, 5);
  }, [search]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300">
      {/* ☀️ 태양풍 효과 */}
      {activeEgg === 'solar' && (
        <div className="fixed inset-0 pointer-events-none bg-orange-600/30 mix-blend-overlay z-[200] animate-pulse" />
      )}

      {/* 🎮 미니 게임 레이어 */}
      {activeEgg === 'game' && (
        <div className="fixed inset-0 bg-black/90 z-[300] flex flex-col items-center justify-center">
          <div className="text-white text-5xl font-black mb-4 animate-bounce">ASTEROID ATTACK!</div>
          <div className="text-indigo-400 text-3xl font-bold mb-8">SCORE: {score}</div>
          <button 
            onClick={() => { setScore(s => s + 10); playClick('dark'); }}
            className="w-24 h-24 bg-gradient-to-tr from-gray-700 to-gray-400 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.2)] animate-ping"
          >
            <Target size={40} className="text-red-500" />
          </button>
          <button 
            onClick={() => setActiveEgg('none')}
            className="mt-20 px-8 py-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all font-bold"
          >그만하기 (EXIT)</button>
        </div>
      )}

      <div className="mx-4 mt-4 rounded-2xl border border-white/30 bg-white/20 dark:bg-black/20 backdrop-blur-md shadow-lg">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-4">
          
          {/* 로고 영역 (에러 해결됨!) */}
          <div className="flex-none">
            <button 
              onClick={() => {
                playClick(theme);
                const next = clickCount + 1;
                if (next >= 5) {
                  setActiveEgg('blackhole');
                  setClickCount(0);
                } else {
                  setClickCount(next);
                }
              }}
              className="flex items-center gap-2 group"
            >
              <div className={`p-1 ${activeEgg !== 'none' ? 'animate-spin' : 'group-hover:rotate-12'}`}>
                <img 
                  src="./images/logo.png" 
                  alt="Logo" 
                  className={`w-9 h-9 object-contain ${theme === 'dark' ? 'invert brightness-200' : ''}`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://cdn-icons-png.flaticon.com/512/1048/1048953.png"; // 로고 없으면 우주선
                  }}
                />
              </div>
              <div className="flex flex-col items-start leading-none hidden lg:flex">
                <span className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                  {activeEgg === 'none' ? 'MyFolio' : activeEgg.toUpperCase()}
                </span>
                <span className="text-[10px] font-bold opacity-70 uppercase">
                  {theme === 'dark' ? 'Wisdom of Stars' : 'Wisdom of Sun'}
                </span>
              </div>
            </button>
          </div>

          {/* 검색창 */}
          <div className="flex-1 max-w-md relative" ref={searchRef}>
            <div className="relative group">
              <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
              <input 
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="시스템 검색... (play 입력 시 게임!)"
                className="w-full bg-white/70 dark:bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm font-bold outline-none"
              />
            </div>
          </div>

          {/* 컨트롤부 */}
          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="p-2.5 rounded-xl bg-white/30 border border-white/10">
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-white/30 border border-white/10">
              {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-indigo-700" />}
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;