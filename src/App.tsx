import React, { useState, useEffect, useRef } from 'react';
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
import GlitchPage from './pages/GlitchPage';
import LifeCutsPage from './pages/LifeCutsPage';
// ✅ 지렁이 게임 페이지 임포트 추가
import WormsGamePage from './pages/WormsGamePage'; 
import { Theme } from './types';
import EasterEgg from './components/EasterEgg';

const ScrollManager = () => {
  const { pathname } = useLocation();
  const lastScrollY = useRef(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    lastScrollY.current = 0;

    const handleScroll = () => {
      if (!document.activeElement || document.activeElement.tagName !== 'INPUT') {
        lastScrollY.current = window.scrollY;
      }
    };

    const preventJump = (e: any) => {
      if (pathname !== '/') {
        requestAnimationFrame(() => {
          if (window.scrollY !== lastScrollY.current) {
            window.scrollTo(0, lastScrollY.current);
          }
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('focusin', preventJump, true);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') preventJump(e);
    }, true);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('focusin', preventJump);
    };
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
      <ScrollManager />
      {/* 이스터에그 (Play 입력 시 실행) */}
      <EasterEgg theme={theme} />
      
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
          
          {/* ✅ 지렁이 게임 정식 라우트 추가 */}
          <Route path="worms" element={<WormsGamePage />} />

          <Route path="app/:appId" element={<AppRunner />} />
          <Route path="glitch-game" element={<GlitchPage />} />
          <Route path="lifecuts" element={<LifeCutsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;