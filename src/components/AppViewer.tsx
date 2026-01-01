import React, { useRef, useState, useEffect, Suspense } from 'react';
import { AppItem } from '../types';
import { ArrowLeft, Maximize, Minimize, Info } from 'lucide-react';
import { useSound } from '../../hooks/useSound';

// Lazy-load real app components
const AivocaApp = React.lazy(() => import('./aivoca/AivocaApp'));
const VirtualTryOnApp = React.lazy(() => import('./ai-virtual-try-on/VirtualTryOnApp'));
const LPCoverMaker = React.lazy(() => import('./LP-cover-maker/LPCoverMaker'));
const DrawBridgeGame = React.lazy(() => import('./draw-bridge-drive/DrawBridgeGame'));
const NeonBreakerGame = React.lazy(() => import('./game-neon-breaker/NeonBreakerGame'));
const GenerativeArt = React.lazy(() => import('./generative-art/Art'));
const TypoStudio = React.lazy(() => import('./kinetic-typo-studio/TypoStudio'));
const NeonStackGame = React.lazy(() => import('./neon-stack/NeonStackGame'));
const SliceGame = React.lazy(() => import('./slice-game/SliceGame'));
const SubwayRunnerGame = React.lazy(() => import('./subway-runner/SubwayRunnerGame'));
const SurvivorGameApp = React.lazy(() => import('./survivor-game/SurvivorGameApp'));

interface AppViewerProps {
  app: AppItem;
  onBack: () => void;
}

const AppViewer: React.FC<AppViewerProps> = ({ app, onBack }) => {
  const { playClick } = useSound();
  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cognitive Load Management: 
  // We provide a dedicated "Focus Mode" (Fullscreen) to reduce distractions 
  // when interacting with the app itself.

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    // Simulate loading for better UX
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [app.id]);

  const toggleFullscreen = () => {
    playClick();
    if (!iframeContainerRef.current) return;

    if (!document.fullscreenElement) {
      iframeContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleBack = () => {
    playClick();
    onBack();
  };

  // Render the correct mini-app based on ID
  const renderAppContent = () => {
    switch (app.id) {
      case 'aivoca': return <AivocaApp />;
      case 'virtual-try-on': return <VirtualTryOnApp />;
      case 'lp-cover-maker': return <LPCoverMaker />;
      case 'draw-bridge-drive': return <DrawBridgeGame />;
      case 'game-neon-breaker': return <NeonBreakerGame />;
      case 'generative-art': return <GenerativeArt />;
      case 'kinetic-typo-studio': return <TypoStudio />;
      case 'neon-stack': return <NeonStackGame />;
      case 'slice-game': return <SliceGame />;
      case 'subway-runner': return <SubwayRunnerGame />;
      case 'survivor-game': return <SurvivorGameApp />;
      default:
        // Fallback: show a simple message for older demo items
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center opacity-80">
              <div className="text-lg font-bold">{app.title}</div>
              <div className="text-sm mt-2">이 앱은 아직 별도 구현이 없습니다.</div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="pt-24 pb-12 container mx-auto px-4 min-h-screen flex flex-col">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all text-gray-800 dark:text-white shadow-sm"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">뒤로가기</span>
        </button>
        
        <h2 className="text-2xl font-bold hidden md:block text-gray-800 dark:text-white">{app.title}</h2>
        
        <div className="w-24"></div> {/* Spacer for centering */}
      </div>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col lg:flex-row gap-6">
        
        {/* App Frame Container */}
        <div 
          ref={iframeContainerRef}
          className={`
            relative bg-gray-100 dark:bg-gray-800/50 border border-white/20 rounded-3xl shadow-2xl overflow-hidden transition-all duration-500
            ${isFullscreen ? 'w-full h-full flex items-center justify-center fixed inset-0 z-50 rounded-none' : 'w-full lg:w-3/4 aspect-[4/3] lg:aspect-video'}
          `}
        >
          {/* Fullscreen Toggle Button (Overlay) */}
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-md transition-all border border-white/10 text-gray-700 dark:text-white"
            title="전체화면"
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>

          {/* Simulated App Content */}
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm z-30">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                <span className="text-sm font-medium opacity-60">앱 로딩 중...</span>
              </div>
            </div>
          ) : (
            <div className="w-full h-full overflow-hidden">
               {renderAppContent()}
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="w-full lg:w-1/4 flex flex-col gap-6">
          <div className="p-6 rounded-3xl border border-white/20 bg-white/40 dark:bg-black/20 backdrop-blur-xl shadow-lg text-gray-800 dark:text-gray-100">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Info size={18} className="text-indigo-500" />
              앱 정보
            </h3>
            <div className="space-y-4 text-sm opacity-90">
              <div>
                <span className="block opacity-60 text-xs mb-1 font-semibold uppercase tracking-wider">카테고리</span>
                <span className="inline-block px-3 py-1 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-300 font-medium border border-indigo-500/10">
                  {app.category}
                </span>
              </div>
              <div>
                <span className="block opacity-60 text-xs mb-1 font-semibold uppercase tracking-wider">제작일</span>
                <span>{app.createdAt}</span>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-white/10">
                <span className="block opacity-60 text-xs mb-1 font-semibold uppercase tracking-wider">설명</span>
                <p className="leading-relaxed opacity-80">{app.description}</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-white/20 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 backdrop-blur-xl shadow-lg text-gray-800 dark:text-gray-100">
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppViewer;