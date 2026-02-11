import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Maximize2, Minimize2, Grid } from 'lucide-react'; 
import { useSound } from '../../hooks/useSound'; 
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface LayoutProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Layout: React.FC<LayoutProps> = ({ theme, toggleTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { playClick, playThemeSwitch } = useSound();
  const isHomePage = location.pathname === '/';
  const isFullscreenGame = location.pathname.includes('worms') || location.pathname.includes('glitch-game');
  
  const appContainerRef = useRef<HTMLDivElement>(null);
  const [isInternalFull, setIsInternalFull] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [logoClicks, setLogoClicks] = useState(0);
  const [isLogoPressing, setIsLogoPressing] = useState(false);
  
  // ✅ 이스터에그 상태 확장
  const [easterMode, setEasterMode] = useState<'none' | 'blackhole' | 'gravity' | 'rocket' | 'countdown'>('none');

  useEffect(() => {
    const handleFullscreenChange = () => setIsInternalFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // ✅ 커스텀 이벤트 리스너들
    const handleBlackhole = () => setEasterMode('blackhole');
    const handleGravity = () => setEasterMode('gravity');
    const handleRocket = () => {
      setEasterMode('rocket');
      setTimeout(() => setEasterMode('none'), 4000); // 로켓은 4초 후 자동 종료
    };
    const handleSync = (e: any) => setEasterMode(e.detail);

    window.addEventListener('trigger-easteregg', handleBlackhole);
    window.addEventListener('trigger-gravity', handleGravity);
    window.addEventListener('trigger-rocket', handleRocket);
    window.addEventListener('easter-sync', handleSync);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('trigger-easteregg', handleBlackhole);
      window.removeEventListener('trigger-gravity', handleGravity);
      window.removeEventListener('trigger-rocket', handleRocket);
      window.removeEventListener('easter-sync', handleSync);
    };
  }, []);

  // ✅ [추가] 화면 클릭 시 이스터에그 리셋 (버튼 클릭 제외)
  const handleContainerClick = (e: React.MouseEvent) => {
    if (easterMode !== 'none' && easterMode !== 'rocket') {
      const target = e.target as HTMLElement;
      if (!target.closest('button') && !target.closest('input')) {
        setEasterMode('none');
      }
    }
  };

  const handleLogoClick = () => {
    playClick(theme); 
    setIsLogoPressing(true);
    setTimeout(() => setIsLogoPressing(false), 150);
    if (location.pathname !== '/') navigate('/');
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    if (newCount >= 5) {
      playThemeSwitch(theme === 'light' ? 'dark' : 'light'); 
      window.dispatchEvent(new CustomEvent('trigger-easteregg'));
      setLogoClicks(0);
    }
    const timeout = setTimeout(() => setLogoClicks(0), 1000);
    return () => clearTimeout(timeout);
  };

  const toggleAppFullscreen = () => {
    playClick(theme); 
    if (!document.fullscreenElement) {
      appContainerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  return (
    <div 
      onClick={handleContainerClick}
      className={`min-h-screen w-full flex flex-col transition-all duration-1000 
        ${easterMode === 'blackhole' ? 'bg-black scale-0 rotate-[360deg] opacity-0' : ''}
        ${isHomePage ? 'bg-[#020205]' : 'bg-gray-100 dark:bg-[#0f0f15]'} 
        transition-colors duration-300 overflow-hidden relative`}
      style={{ perspective: '1000px' }}
    >
      {/* ✅ 무중력 및 로켓 애니메이션 스타일 */}
      <style>{`
        ${easterMode === 'gravity' ? `
          main, nav, footer { 
            animation: float 3s ease-in-out infinite alternate;
            pointer-events: none; 
          }
          button, input, [role="button"] { pointer-events: auto !important; }
          @keyframes float {
            from { transform: translateY(0) rotate(0); }
            to { transform: translateY(-30px) rotate(3deg); }
          }
        ` : ''}
        ${easterMode === 'rocket' ? `
          .rocket-ship {
            position: fixed;
            bottom: -150px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 8rem;
            z-index: 9999;
            animation: launch 4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
          @keyframes launch {
            0% { bottom: -150px; transform: translateX(-50%) scale(1); }
            20% { transform: translateX(-50%) scale(1.2) shake(2deg); }
            100% { bottom: 150vh; transform: translateX(-50%) scale(0.5); }
          }
        ` : ''}
      `}</style>

      {easterMode === 'rocket' && <div className="rocket-ship">🚀</div>}
      {easterMode === 'countdown' && <div className="fixed inset-0 bg-black/40 z-[45] animate-fade-in" />}

      {/* 1. Navbar */}
      <div className={`flex-none z-[200] relative transition-transform duration-700 
        ${(easterMode !== 'none' && easterMode !== 'countdown' && easterMode !== 'rocket' && easterMode !== 'gravity') ? '-translate-y-full' : 'translate-y-0'}`}>
        <div className={`transition-transform duration-150 ${isLogoPressing ? 'scale-95 -rotate-2' : ''}`}>
          <Navbar theme={theme} toggleTheme={toggleTheme} searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        </div>
        <div onClick={handleLogoClick} className="absolute top-4 left-1/2 -translate-x-[450px] w-48 h-16 cursor-pointer z-[210] rounded-xl" />
      </div>

      <main className={`flex-1 flex flex-col transition-all duration-[1000ms]
        ${(easterMode === 'atmosphere' || easterMode === 'sun') ? 'translate-y-[100vh] opacity-0' : 'translate-y-0 opacity-100'}
        ${isHomePage ? 'pt-0' : isFullscreenGame ? 'pt-0' : 'pt-28 pb-10 px-4 md:px-6'}`}>
        
        {isHomePage ? (
          <div className="w-full"><Outlet context={{ searchTerm }} /></div>
        ) : (
          <div className={`w-full mx-auto flex flex-col transition-all ${isFullscreenGame ? 'max-w-none h-screen' : 'max-w-7xl gap-6 animate-fade-in'}`}>
            
            <div className={`flex justify-between items-center px-4 ${isFullscreenGame ? 'fixed top-24 left-0 right-0 z-[150] max-w-7xl mx-auto w-full' : 'relative z-10'}`}>
              <div className="flex gap-3">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-white/10 border border-black/5 dark:border-white/10 text-gray-800 dark:text-white font-bold shadow-lg hover:bg-gray-50 dark:hover:bg-white/20 transition-all active:scale-95">
                  <ArrowLeft size={18} /><span>Back</span>
                </button>
                <button onClick={() => navigate('/')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-white/10 border border-black/5 dark:border-white/10 text-gray-800 dark:text-white font-bold shadow-lg hover:bg-gray-50 dark:hover:bg-white/20 transition-all active:scale-95">
                  <Grid size={18} /><span>All Apps</span>
                </button>
              </div>
              <button onClick={toggleAppFullscreen} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-xl hover:scale-105 active:scale-95 transition-all">
                <Maximize2 size={18} /><span>Full Screen</span>
              </button>
            </div>

            <div ref={appContainerRef} className={`relative z-0 w-full bg-white dark:bg-[#161620] shadow-2xl overflow-hidden transition-all duration-500 
              ${(isInternalFull || isFullscreenGame) ? 'rounded-none border-none h-full' : 'rounded-[2.5rem] border border-gray-200 dark:border-white/5 min-h-[700px]'}`}>
                
                {isInternalFull && (
                  <button onClick={toggleAppFullscreen} className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-2 px-5 py-3 rounded-xl bg-black/60 backdrop-blur-md text-white border border-white/20 hover:bg-black/80 transition-all shadow-2xl">
                    <Minimize2 size={20} /><span className="font-bold">Exit Fullscreen</span>
                  </button>
                )}
                <Outlet />
            </div>
            {!isFullscreenGame && <div className="mt-6"><Footer /></div>}
          </div>
        )}
      </main>
    </div>
  );
};

export default Layout;