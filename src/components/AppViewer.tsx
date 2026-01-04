import React, { useState, useEffect, Suspense } from 'react';
import { AppItem } from '../types';
import { useSound } from '../../hooks/useSound';

// Lazy-load 컴포넌트들
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

const AppViewer: React.FC<AppViewerProps> = ({ app }) => {
  const [loading, setLoading] = useState(true);

  // 앱이 바뀔 때마다 로딩 효과
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [app.id]);

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
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center opacity-80 text-gray-800 dark:text-white">
              <div className="text-lg font-bold">{app.title}</div>
              <div className="text-sm mt-2">이 앱은 아직 별도 구현이 없습니다.</div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full flex flex-col min-h-[700px]">
      {/* ✅ 수정 포인트: 
        1. 기존의 'Header Actions' (목록으로, 전체화면 버튼) 구역을 완전히 삭제함.
        2. 오른쪽 'Sidebar Info' (앱 상세 정보) 구역을 완전히 삭제함.
        3. 레이아웃의 버튼들과 겹치지 않게 앱 본체만 꽉 차게 렌더링함.
      */}
      
      <div className="flex-grow relative overflow-hidden bg-white dark:bg-[#161620]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-[#0f0f15]/90 z-30">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
              <span className="text-sm font-medium opacity-60 dark:text-white">앱을 불러오는 중...</span>
            </div>
          </div>
        ) : (
          <Suspense fallback={null}>
            <div className="w-full h-full animate-fade-in">
               {renderAppContent()}
            </div>
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default AppViewer;