import React from 'react';
import WormsGame from '../components/wormsgame/WormsGame';

const WormsGamePage: React.FC = () => {
  return (
    // pt-20 (또는 상단 바 높이만큼)을 주어 경계선을 만듭니다.
    <div className="w-full h-screen bg-slate-950 pt-[80px] overflow-hidden">
      <WormsGame />
    </div>
  );
};

export default WormsGamePage;