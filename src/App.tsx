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
import GlitchPage from './components/glitchgame/GlitchApp';
import { Theme } from './types';
import EasterEgg from './components/EasterEgg';

const ScrollManager = () => {
  const { pathname } = useLocation();
  const lastScrollY = useRef(0);

  useEffect(() => {
    // 페이지 변경 시에만 상단으로
    window.scrollTo(0, 0);
    lastScrollY.current = 0;

    // 사용자가 직접 스크롤할 때마다 현재 위치를 기억함
    const handleScroll = () => {
      if (!document.activeElement || document.activeElement.tagName !== 'INPUT') {
        lastScrollY.current = window.scrollY;
      }
    };

    // 엔터나 입력창 포커스로 인해 화면이 튀는 것을 방지
    const preventJump = (e: any) => {
      if (pathname !== '/') {
        // 브라우저가 포커스 때문에 화면을 움직이려고 하면 기억해둔 위치로 즉시 복구
        requestAnimationFrame(() => {
          if (window.scrollY !== lastScrollY.current) {
            window.scrollTo(0, lastScrollY.current);
          }
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('focusin', preventJump, true);
    // 엔터키 입력 시 스크롤 튀는 현상 추가 방어
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') preventJump(e);
    }, true);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('focusin', preventJump);
      window.removeEventListener('keydown', preventJump);
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
        <EasterEgg theme={theme} />
  return (
    <HashRouter>
      <ScrollManager />
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