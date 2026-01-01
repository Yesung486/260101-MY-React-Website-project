import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Home, Volume2, VolumeX } from 'lucide-react';
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
  const { volume, isMuted, setVolume, toggleMute } = useSoundState();
  const navigate = useNavigate();
  const [appsOpen, setAppsOpen] = useState(false);
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<typeof APP_DATA>([] as typeof APP_DATA);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const isAppPage = React.useMemo(() => {
    if (location.pathname.startsWith('/app/')) return true;
    return APP_DATA.some(a => {
      if (!a.path) return false;
      return location.pathname === a.path || location.pathname.startsWith(a.path + '/') || location.pathname.startsWith(a.path);
    });
  }, [location.pathname]);

  const handleHomeClick = () => {
    playClick();
    navigate('/');
  };

  const handleThemeToggle = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    playThemeSwitch(nextTheme);
    toggleTheme();
  };

  const handleMuteToggle = () => {
    playClick();
    toggleMute();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };

  return (
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="mx-4 mt-4 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-lg dark:bg-black/20 dark:border-white/10">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo / Home */}
          <button 
            onClick={handleHomeClick}
            className="flex items-center gap-2 group"
          >
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-md group-hover:scale-105 transition-transform">
              <Home size={20} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              MyFolio
            </span>
          </button>

          {/* Apps dropdown (left) */}
          <div className="relative">
            <button onClick={() => setAppsOpen(v => !v)} className="ml-4 px-3 py-2 rounded-md hover:bg-white/10 transition">앱 보기</button>
            {appsOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-white/90 dark:bg-black/80 rounded-lg border border-white/10 shadow-lg py-2">
                <button onClick={() => { playClick(); navigate('/aivoca'); setAppsOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">AIVOCA</button>
                <button onClick={() => { playClick(); navigate('/virtual-try-on'); setAppsOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">Virtual Try-On</button>
                <button onClick={() => { playClick(); navigate('/lp-cover-maker'); setAppsOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">LP Cover Maker</button>
                <button onClick={() => { playClick(); navigate('/draw-bridge'); setAppsOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">Draw Bridge</button>
                <button onClick={() => { playClick(); navigate('/neon-breaker'); setAppsOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">Neon Breaker</button>
              </div>
            )}
          </div>

          {/* Center Search */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-full max-w-md">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const q = search.trim().toLowerCase();
                  if (!q) return;
                  if (q.startsWith('/')) {
                    navigate(q);
                    setSearch('');
                    setShowSuggestions(false);
                    return;
                  }
                  const match = APP_DATA.find(a => (a.title || '').toLowerCase().includes(q) || (a.id || '').toLowerCase().includes(q) || ((a.path || '').toLowerCase().includes(q)));
                  if (match && match.path) {
                    navigate(match.path);
                    setSearch('');
                    setShowSuggestions(false);
                    return;
                  }
                  navigate('/');
                  setSearch('');
                  setShowSuggestions(false);
                }}
              >
                <input
                  ref={inputRef}
                  aria-label="페이지 검색"
                  value={search}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSearch(v);
                    const q = v.trim().toLowerCase();
                    if (!q) {
                      setSuggestions([]);
                      setShowSuggestions(false);
                      setActiveIndex(-1);
                      return;
                    }
                    const matches = APP_DATA.filter(a => (a.title || '').toLowerCase().includes(q) || (a.id || '').toLowerCase().includes(q) || ((a.path || '').toLowerCase().includes(q))).slice(0,6);
                    setSuggestions(matches);
                    setShowSuggestions(matches.length > 0);
                    setActiveIndex(-1);
                  }}
                  onKeyDown={(e) => {
                    if (!showSuggestions) return;
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setActiveIndex(i => Math.max(i - 1, 0));
                    } else if (e.key === 'Enter') {
                      if (activeIndex >= 0 && suggestions[activeIndex]) {
                        const s = suggestions[activeIndex];
                        if (s.path) navigate(s.path);
                        setSearch('');
                        setShowSuggestions(false);
                        e.preventDefault();
                      }
                    } else if (e.key === 'Escape') {
                      setShowSuggestions(false);
                    }
                  }}
                  placeholder="앱 또는 페이지 검색..."
                  className="w-full px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </form>

              {showSuggestions && (
                <ul className="absolute left-0 right-0 mt-2 bg-white/90 dark:bg-black/80 border border-white/10 rounded-xl shadow-lg overflow-hidden z-50">
                  {suggestions.map((s, idx) => (
                    <li
                      key={s.id}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${idx === activeIndex ? 'bg-indigo-100/40 dark:bg-indigo-700/30' : ''}`}
                      onMouseDown={(ev) => {
                        // onMouseDown to prevent blur before click
                        ev.preventDefault();
                        if (s.path) navigate(s.path);
                        setSearch('');
                        setShowSuggestions(false);
                      }}
                      onMouseEnter={() => setActiveIndex(idx)}
                    >
                      <div className="text-sm font-medium">{s.title}</div>
                      <div className="text-xs opacity-70">{s.path}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Volume Control Group */}
            <div className="relative group">
              <button
                onClick={handleMuteToggle}
                className="p-2 rounded-full bg-white/20 hover:bg-white/40 dark:bg-black/20 dark:hover:bg-black/40 transition-colors border border-white/10 text-gray-700 dark:text-gray-200"
                aria-label="Toggle Mute"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX size={20} />
                ) : (
                  <Volume2 size={20} />
                )}
              </button>
              
              {/* Volume Slider Dropdown */}
              <div className="absolute top-full right-0 mt-3 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right">
                <div className="p-4 rounded-xl border border-white/20 bg-white/30 backdrop-blur-xl shadow-xl dark:bg-black/40 w-32 flex flex-col items-center gap-2">
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{isMuted ? 'Muted' : `${volume}%`}</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={handleVolumeChange}
                    disabled={isMuted}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-500 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              className="p-2 rounded-full bg-white/20 hover:bg-white/40 dark:bg-black/20 dark:hover:bg-black/40 transition-colors border border-white/10"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun size={20} className="text-yellow-300" />
              ) : (
                <Moon size={20} className="text-indigo-600" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>

  );
};

export default Navbar;