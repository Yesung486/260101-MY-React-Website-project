import React from 'react';
import GlitchApp from '../components/glitchgame/GlitchApp';

const GlitchPage: React.FC = () => {
  return (
    /** * ✅ fixed를 사용하여 상단바나 부모의 padding-top(pt-20) 영향을 완전히 차단!
     * 어떤 브라우저 크기에서도 화면 전체를 덮고 중앙에 배치합니다.
     */
    <div className="fixed inset-0 z-0 bg-black flex items-center justify-center overflow-hidden">
      
      {/* 🚀 상단바 높이만큼 살짝 내려주고 싶다면 
      */}
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-full h-full max-w-[1600px] max-h-[900px]">
          <GlitchApp />
        </div>
      </div>

    </div>
  );
};

export default GlitchPage;