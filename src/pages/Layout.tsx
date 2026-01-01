import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Maximize2, Minimize2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface LayoutProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Layout: React.FC<LayoutProps> = ({ theme, toggleTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';
  const [isFull, setIsFull] = useState(false);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFull(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFull(false);
      }
    }
  };

  return (
    // 전체 컨테이너: flex-col로 쌓고 최소 높이를 100vh로 설정
    <div className="min-h-screen w-full flex flex-col bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      
      {/* 1. 상단 헤더: 고정 높이 */}
      <div className="flex-none z-50">
        <Navbar theme={theme} toggleTheme={toggleTheme} />
      </div>

      {/* 2. 메인 영역: 헤더 높이만큼 위쪽 여백(pt-16)을 주어 가려짐 방지 */}
      <main className="flex-1 flex flex-col pt-20 pb-10 px-4 md:px-6">
        
        {isHomePage ? (
          /* [홈페이지 모드] */
          <div className="w-full max-w-7xl mx-auto">
            <Outlet />
            <Footer />
          </div>
        ) : (
          /* [앱 상세 페이지 모드] */
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-4 animate-fade-in">
            
            {/* 💡 버튼 영역: 헤더 바로 아래에 위치 */}
            <div className="flex justify-between items-center bg-white/50 dark:bg-black/20 p-2 rounded-xl backdrop-blur-sm">
              {/* 왼쪽: 뒤로가기 */}
              <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-800 text-white hover:bg-black transition-all shadow-lg active:scale-95"
              >
                <ArrowLeft size={20} />
                <span className="font-medium">목록으로</span>
              </button>

              {/* 오른쪽: 전체화면 */}
              <button 
                onClick={toggleFullScreen}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
              >
                {isFull ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                <span className="font-medium">{isFull ? '화면 축소' : '전체 화면'}</span>
              </button>
            </div>

            {/* 💡 앱 본체: 그림자와 테두리로 강조 */}
            <div className="relative w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden min-h-[600px]">
                <Outlet />
            </div>

            {/* 💡 앱 페이지에서도 하단에 푸터 표시 */}
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