import React, { useState, useMemo, useEffect } from 'react';
import AppCard from '../components/AppCard';
import CategoryFilter from '../components/CategoryFilter';
import { APP_DATA } from '../constants';
import { AppItem, AppCategory } from '../types';
import { ChevronDown, Star, Sun } from 'lucide-react';

const Home: React.FC = () => {
  const [apps] = useState<AppItem[]>(APP_DATA);
  const [activeCategory, setActiveCategory] = useState<AppCategory>(AppCategory.ALL);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredApps = useMemo(() => {
    if (activeCategory === AppCategory.ALL) return apps;
    return apps.filter(app => app.category === activeCategory);
  }, [apps, activeCategory]);

  return (
    // 배경색: 라이트 모드(하얀 낮), 다크 모드(깊은 밤 우주)
    <div className="bg-white dark:bg-[#020205] text-gray-900 dark:text-white min-h-screen overflow-x-hidden transition-colors duration-700">
      
      {/* ☀️🌙 1. Hero Section (낮과 밤 컨셉 분리) */}
      <section className="relative h-screen w-screen flex flex-col items-center justify-center overflow-hidden">
        
        {/* 배경 레이어 */}
        <div className="absolute inset-0 z-0">
          {/* [낮 배경] 라이트 모드일 때만 보임 */}
          <div className="absolute inset-0 dark:opacity-0 transition-opacity duration-700">
            <img 
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2000" 
              alt="Sunny Sky" 
              className="w-full h-full object-cover scale-110"
            />
            {/* 햇살 그라데이션 */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-400/20 via-white/40 to-white" />
          </div>

          {/* [밤 배경] 다크 모드일 때만 보임 */}
          <div className="absolute inset-0 opacity-0 dark:opacity-60 transition-opacity duration-700">
            <img 
              src="https://images.unsplash.com/photo-1464802686167-b939a6910659?auto=format&fit=crop&q=80&w=2000" 
              alt="Space" 
              className="w-full h-full object-cover scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#020205]" />
            
            {/* 반짝이는 별 (다크 모드에서만 실행) */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(60)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute bg-white rounded-full animate-twinkle"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    width: `${Math.random() * 2.5}px`,
                    height: `${Math.random() * 2.5}px`,
                    animationDuration: `${2 + Math.random() * 4}s`,
                    animationDelay: `${Math.random() * 4}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 타이틀 영역: 낮에는 선명하게, 밤에는 은은하게 */}
        <div className="relative z-10 text-center px-4">
          <div className="flex justify-center mb-6">
            <div className="dark:hidden animate-spin-slow">
              <Sun size={36} className="text-orange-500 fill-orange-200" />
            </div>
            <div className="hidden dark:block">
              <Star size={32} className="text-yellow-200 animate-pulse fill-yellow-200/20" />
            </div>
          </div>

          <h2 className="text-sm md:text-base uppercase tracking-[0.8em] text-indigo-600 dark:text-indigo-300 mb-6 font-bold">
            {/* 한자 뜻 풀이 교체: 낮-슬기(Wisdom), 밤-별(Stars) */}
            <span className="dark:hidden tracking-[0.4em]">Wisdom of the Sun : 睿</span>
            <span className="hidden dark:inline">Wisdom of the Stars : 星</span>
          </h2>

          <h1 className="text-6xl md:text-[9rem] font-black mb-10 tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-600 dark:from-white dark:to-gray-500">
            YESUNG'S<br/>{/* 낮에는 WORLD, 밤에는 UNIVERSE */}
            <span className="dark:hidden">WORLD</span>
            <span className="hidden dark:inline">UNIVERSE</span>
          </h1>

          <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto text-lg md:text-2xl font-light leading-relaxed">
            슬기로운 별의 마음으로 코딩하는<br/>
            예성의 포트폴리오입니다.
          </p>
        </div>

        <div className={`absolute bottom-12 left-1/2 -translate-x-1/2 transition-opacity duration-700 z-20 ${isScrolled ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex flex-col items-center gap-3">
            <span className="text-[10px] tracking-[0.5em] text-gray-400 dark:text-white/40 uppercase font-bold italic">Scroll to Explore</span>
            <ChevronDown size={32} className="text-gray-300 dark:text-white/30 animate-bounce" />
          </div>
        </div>
      </section>

      {/* 📋 2. Content Section */}
      <div id="projects" className="container mx-auto px-6 py-40 relative z-10">
        <div className="flex flex-col items-center mb-24">
          <div className="h-24 w-[1px] bg-gradient-to-b from-indigo-500/0 via-indigo-500 to-indigo-500/0 mb-8" />
          <h3 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Project Galaxy</h3>
          <p className="text-gray-500 text-lg">지혜의 발자취가 담긴 프로젝트들을 소개합니다.</p>
        </div>

        <div className="mb-24">
          <CategoryFilter 
            currentCategory={activeCategory} 
            onSelectCategory={setActiveCategory} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 pb-40">
          {filteredApps.map((app) => (
            <div key={app.id} className="group relative transition-all duration-500 hover:-translate-y-4">
              {/* 다크모드에서만 보이는 카드 광채 */}
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.6rem] opacity-0 dark:group-hover:opacity-20 blur-2xl transition duration-500" />
              <AppCard app={app} />
            </div>
          ))}
        </div>
      </div>

      <footer className="py-20 border-t border-gray-100 dark:border-white/5 text-center opacity-40">
        <p className="text-[10px] tracking-[0.5em] uppercase">
          © 2026 Yesung. Built with Wisdom & Stars.
        </p>
      </footer>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-twinkle { animation: twinkle linear infinite; }
        .animate-spin-slow { animation: spin-slow 12s linear infinite; }
      `}</style>
    </div>
  );
};

export default Home;