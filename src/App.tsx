import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom'; // 📌 HashRouter로 변경!
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
import { Theme } from './types';

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
    /* 📌 GitHub Pages에서 가장 안전한 HashRouter를 사용합니다. */
    <HashRouter>
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
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;