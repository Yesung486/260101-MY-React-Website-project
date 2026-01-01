// src/components/AppCard.tsx

import React, { useRef, useState } from 'react';
import { AppItem } from '../types';
import { Play } from 'lucide-react';
import { useSound } from '../../hooks/useSound'; 
import { useNavigate } from 'react-router-dom';

interface AppCardProps {
  app: AppItem;
}

const AppCard: React.FC<AppCardProps> = ({ app }) => {
  const { playClick } = useSound();
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  // 💡 [필살기] 이미지 주소를 완벽하게 계산하는 로직
  const getImageUrl = (path: string | undefined) => {
    if (!path) return "";
    if (path.startsWith('http')) return path;
    
    // public 폴더 주소를 절대 경로로 만들어줌
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return cleanPath;
  };

  const imageUrl = getImageUrl(app.image || (app as any).thumbnailUrl);

  return (
    <div className="perspective-1000 h-full" onClick={() => { playClick(); navigate(app.path || `/app/${app.id}`); }}>
      <div 
        ref={cardRef}
        onMouseMove={(e) => {
          if (!cardRef.current) return;
          const rect = cardRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          setRotate({ x: ((y - rect.height/2) / (rect.height/2)) * -10, y: ((x - rect.width/2) / (rect.width/2)) * 10 });
          setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100, opacity: 1 });
        }}
        onMouseLeave={() => { setRotate({ x: 0, y: 0 }); setGlare(g => ({ ...g, opacity: 0 })); }}
        className="group relative cursor-pointer flex flex-col h-full rounded-2xl border border-white/30 bg-white/20 backdrop-blur-md shadow-lg overflow-hidden transition-all duration-200"
        style={{ transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`, transformStyle: 'preserve-3d' }}
      >
        <div className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay" style={{ background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 50%)`, opacity: glare.opacity }} />

        {/* 🖼️ 이미지 영역 */}
        <div className="relative h-48 overflow-hidden bg-slate-800 flex items-center justify-center">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={app.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                // 💡 여기가 핵심: 실패하면 콘솔창(F12)에 주소를 찍어줌!
                console.error("실패한 이미지 주소:", imageUrl);
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Error:+Check+Console";
              }}
            />
          ) : (
            <div className="text-3xl opacity-30">🎨</div>
          )}
          
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="bg-white/20 p-3 rounded-full flex items-center gap-2 px-5 border border-white/40 shadow-xl">
                <Play fill="white" className="text-white" size={20} />
                <span className="text-white font-bold text-sm">실행하기</span>
            </div>
          </div>
        </div>

        <div className="p-5 flex flex-col flex-grow">
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 w-fit mb-2">{app.category}</span>
          <h3 className="text-lg font-bold mb-1 group-hover:text-indigo-400">{app.title}</h3>
          <p className="text-sm opacity-70 line-clamp-3 leading-relaxed">{app.description}</p>
        </div>
      </div>
    </div>
  );
};

export default AppCard;