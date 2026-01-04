import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Maximize2, Minimize2 } from 'lucide-react';
import { useSound } from '../../hooks/useSound'; // ✅ 소리 훅 추가
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface LayoutProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Layout: React.FC<LayoutProps> = ({ theme, toggleTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { playClick } = useSound(); // ✅ 소리 함수 가져오기
  const isHomePage = location.pathname === '/';
  
  const appContainerRef = useRef<HTMLDivElement>(null);
  const [isInternalFull, setIsInternalFull] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsInternalFull(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleAppFullscreen = () => {
    // ✅ 현재 테마를 넘겨서 낮/밤 소리를 다르게 재생!
    playClick(theme); 
    
    if (!document.fullscreenElement) {
      if (appContainerRef.current?.requestFullscreen) {
        appContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleBackToList = () => {
    // ✅ 목록으로 돌아갈 때도 테마에 맞는 소리 재생
    playClick(theme);
    navigate('/');
  };

  return (
    <div className={`min-h-screen w-full flex flex-col ${isHomePage ? 'bg-[#020205]' : 'bg-gray-100 dark:bg-[#0f0f15]'} transition-colors duration-300`}>
      <div className="flex-none z-50">
        <Navbar theme={theme} toggleTheme={toggleTheme} />
      </div>

      <main className={`flex-1 flex flex-col ${isHomePage ? 'pt-0' : 'pt-24 pb-10 px-4 md:px-6'}`}>
        {isHomePage ? (
          <div className="w-full">
            <Outlet />
          </div>
        ) : (
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 animate-fade-in">
            
            {/* 상단 버튼 바 */}
            <div className="flex justify-between items-center px-2">
              <button 
                onClick={handleBackToList} 
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                <ArrowLeft size={20} />
                <span>목록으로</span>
              </button>

              <button 
                onClick={toggleAppFullscreen}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#3b82f6] to-[#2dd4bf] text-white font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                <Maximize2 size={20} />
                <span>전체 화면</span>
              </button>
            </div>

            {/* 📺 앱이 담기는 컨테이너 */}
            <div 
              ref={appContainerRef}
              className={`relative w-full bg-white dark:bg-[#161620] shadow-2xl overflow-hidden transition-all duration-500
                ${isInternalFull ? 'rounded-0' : 'rounded-[2.5rem] border border-gray-200 dark:border-white/5 min-h-[700px]'}
              `}
            >
                {/* 🔳 화면 축소 버튼 */}
                {isInternalFull && (
                  <button 
                    onClick={toggleAppFullscreen}
                    className="fixed top-6 right-6 z-[9999] flex items-center gap-2 px-5 py-3 rounded-xl bg-black/50 backdrop-blur-md text-white border border-white/20 hover:bg-black/70 transition-all animate-in fade-in zoom-in"
                  >
                    <Minimize2 size={20} />
                    <span className="font-bold">화면 축소</span>
                  </button>
                )}

                <Outlet />
            </div>

            <div className="mt-10">
              <Footer />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Layout;