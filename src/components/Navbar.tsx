import React, { useState, useRef } from 'react';
import { Sun, Moon, Volume2, VolumeX, ChevronDown } from 'lucide-react';
import { useSound } from '../../hooks/useSound';
import { useSoundState } from '../../contexts/SoundContext';
import { Theme } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { APP_DATA } from '../constants';

interface NavbarProps {
  theme: Theme;
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ theme, toggleTheme }) => {
  const { playClick, playThemeSwitch } = useSound();
  // ✅ 소리 상태를 관리하는 Context 호출 (이 부분이 누락되면 버튼이 안 보일 수 있어)
  const { volume, isMuted, setVolume, toggleMute } = useSoundState();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [appsOpen, setAppsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<typeof APP_DATA>([] as typeof APP_DATA);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const recommendedApps = React.useMemo(() => {
    const targets = ['lp-cover-maker', 'glitch-game', 'aivoca', 'neon-breaker'];
    return APP_DATA.filter(app => targets.includes(app.id)).slice(0, 4);
  }, []);

  const handleHomeClick = () => {
    playClick();
    navigate('/');
  };

  const handleThemeToggle = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    playThemeSwitch(nextTheme);
    toggleTheme();
  };

  // ✅ 소리 제어 핸들러
  const handleMuteToggle = () => {
    playClick();
    toggleMute();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300">
      <div className="mx-4 mt-4 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-lg dark:bg-black/20 dark:border-white/10">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <button onClick={handleHomeClick} className="flex items-center gap-2 group">
              <div className="p-1 transition-transform group-hover:scale-110">
                <img 
                  src="logo.png" 
                  alt="MyFolio Logo" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src.indexOf('images/') === -1) target.src = 'images/logo.png';
                  }}
                  className={`w-9 h-9 object-contain transition-all duration-500 ${
                    theme === 'dark' ? 'invert brightness-200' : 'invert-0'
                  }`} 
                />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 hidden sm:block">
                MyFolio
              </span>
            </button>
            
            {/* 앱 보기 드롭다운 생략... */}
          </div>

          {/* 우측 액션 버튼 구역 */}
          <div className="flex items-center gap-3">
            {/* 🔊 소리 제어 버튼 (다시 추가됨) */}
            <div className="relative group">
              <button 
                onClick={handleMuteToggle} 
                className="p-2 rounded-full bg-white/20 hover:bg-white/40 dark:bg-black/20 dark:hover:bg-black/40 transition-colors border border-white/10"
              >
                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              
              {/* 볼륨 슬라이더 팝업 */}
              <div className="absolute top-full right-0 mt-3 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right">
                <div className="p-4 rounded-xl border border-white/20 bg-white/30 backdrop-blur-xl shadow-xl dark:bg-black/40 w-32 flex flex-col items-center gap-2">
                  <span className="text-[10px] font-bold">{isMuted ? 'Muted' : `${volume}%`}</span>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={volume} 
                    onChange={handleVolumeChange} 
                    disabled={isMuted} 
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
                  />
                </div>
              </div>
            </div>

            {/* 테마 토글 버튼 */}
            <button 
              onClick={handleThemeToggle} 
              className="p-2 rounded-full bg-white/20 hover:bg-white/40 dark:bg-black/20 dark:hover:bg-black/40 transition-colors border border-white/10"
            >
              {theme === 'dark' ? <Sun size={18} className="text-yellow-300" /> : <Moon size={18} className="text-indigo-600" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;