import React from 'react';
import { Check, Palette } from 'lucide-react';

// Common Card Container Style
const CardContainer = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`w-full h-full overflow-hidden relative ${className}`}>
    {children}
  </div>
);

export const PreviewSpaceMath = () => (
  <CardContainer className="bg-slate-900 text-white flex flex-col items-center justify-center relative">
    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
    <div className="z-10 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20 text-center">
      <div className="text-xs text-indigo-300 mb-1">Space Math</div>
      <div className="text-2xl font-black font-mono">7 x 8 = ?</div>
      <div className="mt-2 flex gap-1 justify-center">
        <div className="w-8 h-6 bg-white/10 rounded border border-white/10"></div>
        <div className="w-8 h-6 bg-indigo-500 rounded text-xs flex items-center justify-center font-bold">56</div>
      </div>
    </div>
  </CardContainer>
);

export const PreviewTodo = () => (
  <CardContainer className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 p-4 flex items-center justify-center">
    <div className="w-full bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-xl border border-white/40 p-3 shadow-sm">
      <div className="flex items-center gap-2 mb-2 border-b border-gray-200 dark:border-white/10 pb-1">
        <Check size={12} className="text-indigo-500" />
        <div className="h-2 w-16 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2 opacity-50">
           <div className="w-3 h-3 rounded-full border border-gray-400 bg-indigo-500 border-none flex items-center justify-center"><Check size={8} className="text-white"/></div>
           <div className="h-1.5 w-20 bg-gray-300 dark:bg-gray-600 rounded-full decoration-slate-500"></div>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-3 h-3 rounded-full border border-gray-400"></div>
           <div className="h-1.5 w-24 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
        </div>
      </div>
    </div>
  </CardContainer>
);

export const PreviewPixel = () => {
  const grid = [
    0,0,0,0,0,
    0,1,0,1,0,
    0,0,0,0,0,
    1,0,0,0,1,
    0,1,1,1,0
  ];
  return (
    <CardContainer className="bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
      <div className="grid grid-cols-5 gap-1 p-2 bg-white dark:bg-black rounded-lg shadow-sm">
        {grid.map((val, i) => (
          <div key={i} className={`w-4 h-4 rounded-sm ${val ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
        ))}
      </div>
      <div className="absolute bottom-2 right-2 p-1.5 bg-white/80 dark:bg-black/80 rounded-full backdrop-blur-sm shadow-sm">
        <Palette size={12} className="text-indigo-500" />
      </div>
    </CardContainer>
  );
};

export const PreviewJumpKing = () => (
  <CardContainer className="bg-slate-900 relative">
    <div className="absolute bottom-10 left-0 w-full h-2 bg-indigo-600"></div>
    <div className="absolute bottom-24 left-1/4 w-12 h-2 bg-indigo-600"></div>
    <div className="absolute bottom-40 right-1/4 w-12 h-2 bg-indigo-600"></div>
    <div className="absolute bottom-28 left-[30%] w-4 h-4 bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
    <div className="absolute top-2 right-2 text-[10px] text-white font-mono opacity-70">Score: 120</div>
  </CardContainer>
);

export const PreviewTimer = () => (
  <CardContainer className="bg-orange-50 dark:bg-gray-800 flex items-center justify-center">
    <div className="relative w-20 h-20">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-200 dark:text-gray-700" />
        <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-orange-500" strokeDasharray={2 * Math.PI * 36} strokeDashoffset={2 * Math.PI * 36 * 0.25} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-bold font-mono text-gray-700 dark:text-gray-200">
        18:45
      </div>
    </div>
  </CardContainer>
);

export const PreviewQuiz = () => (
  <CardContainer className="bg-[#fdf6e3] dark:bg-[#2b2b2b] p-4 flex flex-col justify-center">
    <div className="flex justify-between items-center mb-2">
       <span className="text-[10px] font-bold text-gray-400 uppercase">Quiz</span>
       <span className="text-xs font-black text-indigo-500">Q.1</span>
    </div>
    <div className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 leading-tight">
      거북선을 만든<br/>장군은?
    </div>
    <div className="space-y-1">
      <div className="h-6 w-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/5 rounded-md flex items-center px-2 text-[10px] text-gray-500">1. 강감찬</div>
      <div className="h-6 w-full bg-indigo-500 text-white rounded-md flex items-center px-2 text-[10px] font-bold shadow-sm">2. 이순신</div>
    </div>
  </CardContainer>
);

export const DefaultPreview = () => (
  <CardContainer className="bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
    <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
  </CardContainer>
);
