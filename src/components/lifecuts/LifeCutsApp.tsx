import React, { useState } from 'react';
import { PhotoBooth } from './components/PhotoBooth';
import { ResultView } from './components/ResultView';
import { AppState } from './types';
import { audioService } from './services/audioService';

export default function LifeCutsApp() {
  const [appState, setAppState] = useState<AppState>('START');
  const [photos, setPhotos] = useState<string[]>([]);
  const [timerDuration, setTimerDuration] = useState<number>(3);
  const [photoCount, setPhotoCount] = useState<number>(4);

  const startShooting = () => {
    // Requires user interaction to unlock AudioContext in some browsers
    audioService.playBeep(); 
    setAppState('COUNTDOWN');
  };

  const handlePhotosTaken = (capturedImages: string[]) => {
    setPhotos(capturedImages);
    setAppState('RESULT');
  };

  const handleRetake = () => {
    setPhotos([]);
    setAppState('START');
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value);
    if (isNaN(val)) val = 0;
    if (val > 20) val = 20;
    setTimerDuration(val);
  };

  const handleDurationBlur = () => {
    if (timerDuration < 1) setTimerDuration(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-['Noto Sans KR']">
      
      {appState === 'START' && (
        <div className="text-center p-8 max-w-lg w-full bg-white rounded-3xl shadow-xl mx-4 my-8">
          <div className="mb-6">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-2 handwriting">
              인생네컷 Web
            </h1>
            <p className="text-gray-500 text-lg">나만의 추억을 특별하게 기록하세요</p>
          </div>
          
          <div className="space-y-5">
            <div className="bg-blue-50 p-5 rounded-2xl text-left border border-blue-100">
                <h3 className="font-bold text-blue-800 mb-2 text-lg">📸 촬영 가이드</h3>
                <ul className="text-blue-700 space-y-1 text-sm">
                    <li>1. 총 {photoCount}장의 사진을 연속으로 촬영합니다.</li>
                    <li>2. 설정한 시간마다 셔터가 자동으로 눌립니다.</li>
                    <li>3. 촬영 후 어울리는 감성 문구를 추천해드려요!</li>
                </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 p-5 rounded-2xl text-left border border-purple-100">
                    <h3 className="font-bold text-purple-800 mb-3 text-lg">⏰ 타이머 (초)</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {[3, 5, 10].map((sec) => (
                            <button
                                key={sec}
                                onClick={() => setTimerDuration(sec)}
                                className={`flex-1 min-w-[40px] py-2 rounded-lg font-bold transition-all text-sm ${timerDuration === sec ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-purple-600 border border-purple-200 hover:bg-purple-50'}`}
                            >
                                {sec}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-purple-200">
                        <input
                            type="number"
                            min="1"
                            max="20"
                            value={timerDuration || ''}
                            onChange={handleDurationChange}
                            onBlur={handleDurationBlur}
                            className="w-full bg-transparent border-b border-purple-300 text-center font-bold text-purple-800 focus:outline-none"
                            placeholder="초"
                        />
                        <span className="text-xs text-gray-500 whitespace-nowrap">초</span>
                    </div>
                </div>

                <div className="bg-pink-50 p-5 rounded-2xl text-left border border-pink-100">
                    <h3 className="font-bold text-pink-800 mb-3 text-lg">🎞️ 몇 컷 찍을까요?</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {[1, 2, 4, 6, 8].map((count) => (
                            <button
                                key={count}
                                onClick={() => setPhotoCount(count)}
                                className={`py-2 rounded-lg font-bold transition-all text-sm ${photoCount === count ? 'bg-pink-500 text-white shadow-md' : 'bg-white text-pink-600 border border-pink-200 hover:bg-pink-50'}`}
                            >
                                {count}컷
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <button
              onClick={startShooting}
              disabled={timerDuration < 1}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-2xl font-bold py-5 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              촬영 시작하기
            </button>
          </div>
        </div>
      )}

      {appState === 'COUNTDOWN' && (
        <PhotoBooth 
          timerDuration={timerDuration}
          totalPhotos={photoCount}
          onPhotosTaken={handlePhotosTaken} 
          onCancel={handleRetake} 
        />
      )}

      {appState === 'RESULT' && (
        <ResultView 
          photos={photos} 
          onRetake={handleRetake} 
        />
      )}
    </div>
  );
}