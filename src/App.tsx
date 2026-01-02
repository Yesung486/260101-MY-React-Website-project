import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './pages/Layout';
import Home from './pages/Home';
import AppRunner from './pages/AppRunner';
import AivocaPage from './pages/AivocaPage';
import VirtualTryOnPage from './pages/VirtualTryOnPage';
import LPCoverMakerPage from './pages/LPCoverMakerPage'; 
import DrawBridgeGamePage from './pages/DrawBridgeGamePage';
import NeonStackPage from './pages/NeonStackPage';
import GenerativeArtPage from './pages/GenerativeArtPage';
import TypoStudioPage from './pages/TypoStudioPage';
import SliceGamePage from './pages/SliceGamePage';
import SpaceShooter from './pages/SpaceShooter';
import SubwayRunnerGamePage from './pages/SubwayRunnerGamePage';
import SurvivorGamePage from './pages/SurvivorGamePage';
import GlitchPage from './components/glitchgame/GlitchApp';
import { Theme } from './types';

// ✅ 페이지 이동 및 버튼 클릭 시 스크롤이 멋대로 움직이는 걸 방지하는 컴포넌트
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    // 1. 페이지 경로가 바뀌면 무조건 맨 위로
    window.scrollTo(0, 0);
    
    // 2. 게임 중 엔터나 버튼 클릭 시 화면이 아래로 튀는 현상 방지 (포커스 이벤트 방어)
    const handleFocus = (e: FocusEvent) => {
      if (pathname !== '/') { // 홈 화면이 아닐 때(게임 중일 때)만 작동
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener('focusin', handleFocus);
    return () => window.removeEventListener('focusin', handleFocus);
  }, [pathname]);

  return null;
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    theme === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout theme={theme} toggleTheme={toggleTheme} />}>
          <Route index element={<Home />} />
          <Route path="aivoca" element={<AivocaPage />} />
          <Route path="virtual-try-on" element={<VirtualTryOnPage />} />
          <Route path="LP-cover-maker" element={<LPCoverMakerPage />} />
          <Route path="drawbridgegame" element={<DrawBridgeGamePage />} />
          <Route path="neon-stack" element={<NeonStackPage />} />
          <Route path="generative-art" element={<GenerativeArtPage />} />
          <Route path="kinetic-typo" element={<TypoStudioPage />} />
          <Route path="slice-game" element={<SliceGamePage />} />
          <Route path="neonbreaker" element={<SpaceShooter />} />
          <Route path="subway-runner" element={<SubwayRunnerGamePage />} />
          <Route path="survivor-game" element={<SurvivorGamePage />} />
          <Route path="app/:appId" element={<AppRunner />} />
          <Route path="glitch-game" element={<GlitchPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;