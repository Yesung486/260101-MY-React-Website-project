import React, { useState, useMemo } from 'react';
import AppCard from '../AppCard';
import CategoryFilter from '../CategoryFilter';
import { APP_DATA, AVATAR_URL } from '../../constants';
import { AppItem, AppCategory } from '../types';

const Home: React.FC = () => {
  // 📌 중앙화된 앱 메타데이터 관리
  const [apps, setApps] = useState<AppItem[]>(APP_DATA);
  const [activeCategory, setActiveCategory] = useState<AppCategory>(AppCategory.ALL);
  
  // 📌 카테고리별 필터링 (성능 최적화)
  const filteredApps = useMemo(() => {
    if (activeCategory === AppCategory.ALL) {
      return apps;
    }
    return apps.filter(app => app.category === activeCategory);
  }, [apps, activeCategory]);

  return (
    <div className="pt-32 pb-12 px-4 container mx-auto min-h-screen">
      {/* Hero Section */}
      <div className="text-center mb-16 animate-fade-in-up">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 rounded-full"></div>
          <img 
            src={AVATAR_URL} 
            alt="Profile" 
            className="relative w-24 h-24 rounded-full border-4 border-white/20 shadow-xl mx-auto"
          />
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
          Welcome to My Playground
        </h1>
        <p className="text-lg md:text-xl opacity-70 max-w-2xl mx-auto leading-relaxed">
          안녕하세요! 사용자 경험을 연구하는 중3 개발자입니다.<br/>
          제가 만든 앱들을 이곳에서 직접 체험해보세요.
        </p>
      </div>

      {/* Filter */}
      <CategoryFilter 
        currentCategory={activeCategory} 
        onSelectCategory={setActiveCategory} 
      />

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {filteredApps.map((app) => (
          <AppCard 
            key={app.id} 
            app={app} 
          />
        ))}
      </div>

      {filteredApps.length === 0 && (
        <div className="text-center py-20 opacity-50">
          <p>해당 카테고리에 앱이 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default Home;