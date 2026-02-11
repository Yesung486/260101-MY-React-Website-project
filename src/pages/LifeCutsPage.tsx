import React from 'react';
// 1. 가져온 컴포넌트 이름을 LifeCutsApp으로 확인
import LifeCutsApp from '../components/lifecuts/LifeCutsApp'; 

const LifeCutsPage: React.FC = () => {
  return (
    <div className="pt-20 min-h-screen bg-black">
      <div className="container mx-auto px-4">
        <div className="bg-white/5 rounded-3xl p-6 backdrop-blur-xl border border-white/10">
          {/* 2. PhotoBooth 대신 LifeCutsApp을 사용해야 에러가 안 나! */}
          <LifeCutsApp />
        </div>
      </div>
    </div>
  );
};

export default LifeCutsPage;