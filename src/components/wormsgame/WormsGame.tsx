import React, { useState, useEffect } from 'react';
// ✅ 하위 폴더 구조에 맞게 경로를 ./wormsgame/components/ 로 수정했습니다.
import GameEngine from './components/GameEngine';
import { Play, RotateCcw, Trophy, X } from 'lucide-react';

// 만약 상단 네비게이션바 등과 겹치지 않게 하고 싶다면 props를 추가할 수 있습니다.
interface WormsGameProps {
  onClose?: () => void;
}

const WormsGame: React.FC<WormsGameProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'GAMEOVER'>('MENU');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // 로컬 스토리지에서 최고 점수 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('neonSnakeHighScore');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const handleScoreUpdate = (newScore: number) => {
    setScore(newScore);
    if (newScore > highScore) {
      setHighScore(newScore);
      localStorage.setItem('neonSnakeHighScore', newScore.toString());
    }
  };

  const handleGameOver = () => {
    setGameState('GAMEOVER');
  };

  const startGame = () => {
    setScore(0);
    setGameState('PLAYING');
  };

  return (
    // z-index를 높게 설정하여 다른 UI 요소보다 위에 오게 합니다.
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-slate-950 text-white select-none z-[9999]">
      
      {/* 🎮 실제 게임 엔진 (캔버스) */}
      <div className="absolute inset-0">
        <GameEngine 
          onScoreUpdate={handleScoreUpdate} 
          onGameOver={handleGameOver} 
          gameState={gameState}
        />
      </div>

      {/* 닫기 버튼 (onClose가 있을 경우) */}
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-[100] p-2 bg-white/10 hover:bg-red-500 rounded-full transition-colors backdrop-blur-md"
        >
          <X size={24} />
        </button>
      )}

      {/* 📊 HUD (인게임 점수판) */}
      {gameState === 'PLAYING' && (
        <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
           <div className="bg-black/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(57,255,20,0.2)]">
              <div className="text-[10px] text-green-400/70 uppercase tracking-[0.2em] font-bold mb-1">Current Length</div>
              <div className="text-3xl font-black text-green-400 font-mono italic">
                {Math.floor(score).toLocaleString()}
              </div>
           </div>
           
           <div className="bg-black/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(255,215,0,0.2)] text-right">
              <div className="flex items-center justify-end gap-2 mb-1">
                 <Trophy size={14} className="text-yellow-400" />
                 <span className="text-[10px] text-yellow-400/70 uppercase tracking-[0.2em] font-bold">Best Record</span>
              </div>
              <div className="text-3xl font-black text-yellow-400 font-mono italic">
                {Math.floor(highScore).toLocaleString()}
              </div>
           </div>
        </div>
      )}

      {/* 🚀 메인 메뉴 오버레이 */}
      {gameState === 'MENU' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-50">
          <div className="relative mb-8 text-center">
             <h1 className="text-[120px] font-black italic tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-br from-green-400 via-cyan-400 to-purple-600 animate-pulse drop-shadow-[0_0_30px_rgba(0,255,255,0.4)]">
               NEON<br/>SLITHER
             </h1>
             <div className="mt-4 text-cyan-400/60 tracking-[1em] font-thin uppercase">Star-Forge Edition</div>
          </div>
          
          <div className="mb-12 space-y-3 text-center">
            <p className="text-slate-400 text-sm">
              Use <span className="text-white font-bold border-b border-white/30 mx-1">Mouse</span> or <span className="text-white font-bold border-b border-white/30 mx-1">Arrow Keys</span> to navigate.
            </p>
            <p className="text-slate-400 text-sm">
              Hold <span className="text-white font-bold border-b border-white/30 mx-1">Space</span> or <span className="text-white font-bold border-b border-white/30 mx-1">Left Click</span> to boost.
            </p>
          </div>

          <button 
            onClick={startGame}
            className="group relative px-16 py-5 bg-transparent overflow-hidden rounded-full transition-all duration-300 hover:scale-110 active:scale-95 shadow-[0_0_40px_rgba(34,211,238,0.3)]"
          >
             <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-500 to-blue-600 opacity-90 group-hover:opacity-100" />
             <span className="relative z-10 flex items-center gap-4 text-2xl font-black italic tracking-widest text-white">
               <Play fill="white" size={28} /> MISSION START
             </span>
          </button>
        </div>
      )}

      {/* 💀 게임 오버 오버레이 */}
      {gameState === 'GAMEOVER' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/60 backdrop-blur-xl z-50">
          <div className="text-center mb-10">
            <h2 className="text-[100px] font-black text-white italic tracking-tighter leading-none mb-4">CRASHED.</h2>
            <div className="h-1 w-32 bg-red-500 mx-auto rounded-full" />
          </div>
          
          <div className="flex gap-8 mb-12">
            <div className="text-center">
              <div className="text-red-300/60 text-xs tracking-widest uppercase mb-1">Final Score</div>
              <div className="text-5xl font-black text-white font-mono">{Math.floor(score)}</div>
            </div>
          </div>
          
          <button 
            onClick={startGame}
            className="px-12 py-4 bg-white text-slate-950 rounded-full font-black text-xl hover:bg-red-400 hover:text-white transition-all hover:scale-110 active:scale-95 shadow-2xl flex items-center gap-3"
          >
            <RotateCcw size={24} strokeWidth={3} /> RE-IGNITE
          </button>
        </div>
      )}
    </div>
  );
};

export default WormsGame;