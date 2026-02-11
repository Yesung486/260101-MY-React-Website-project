import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Volume2, VolumeX, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSoundState } from '../../contexts/SoundContext';
import { Theme } from '../types';

interface NavbarProps {
  theme: Theme;
  toggleTheme: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const BASE_URL = '/260101-MY-React-Website-project';
const LOCAL_APP_DATA = [
  { id: 'neon-breaker', title: '네온 브레이커', description: '집중력 향상을 위한 벽돌깨기 게임입니다.', thumbnailUrl: `${BASE_URL}/images/brick.png`, path: '/neonbreaker' },
  { id: 'virtual-try-on', title: 'AI 가상 피팅', description: 'AI를 사용하여 옷을 가상으로 입어보는 혁신적인 경험입니다.', thumbnailUrl: `${BASE_URL}/images/fiting.jpg`, path: '/virtual-try-on' },
  { id: 'aivoca', title: 'AIVOCA 단어장', description: 'AI와 함께 나만의 영어 단어장을 만드는 앱입니다.', thumbnailUrl: `${BASE_URL}/images/englishword.webp`, path: '/aivoca' },
  { id: 'survivor-game', title: '서바이벌 게임', description: '서바이벌 게임으로 긴장감 넘치는 경험을 즐겨보세요.', thumbnailUrl: `${BASE_URL}/images/tangtang.webp`, path: '/survivor-game' },
  { id: 'draw-bridge-drive', title: '다리 만드는 게임', description: '창의력을 발휘해 다리를 만들고 건너보세요.', thumbnailUrl: `${BASE_URL}/images/rode.jpeg`, path: '/drawbridgegame' },
  { id: 'subway-runner', title: '지하철 러너 게임', description: '지하철 배경에서 펼쳐지는 러닝 게임입니다.', thumbnailUrl: `${BASE_URL}/images/subway.jpg`, path: '/subway-runner' },
  { id: 'slice-game', title: '슬라이스 게임', description: '과일을 슬라이스하는 재미있는 게임입니다.', thumbnailUrl: `${BASE_URL}/images/niga.jpeg`, path: '/slice-game' },
  { id: 'neon-stack', title: '네온 스택 게임', description: '네온 블록을 쌓아 올리는 스택 게임입니다.', thumbnailUrl: `${BASE_URL}/images/stack.gif`, path: '/neon-stack' },
  { id: 'generative-art', title: '제너레이티브 아트', description: '코드로 그려지는 아름다운 예술 작품입니다.', thumbnailUrl: `${BASE_URL}/images/003.gif`, path: '/generative-art' },
  { id: 'kinetic-typo-studio', title: '키네틱 타이포 스튜디오', description: '텍스트가 입자로 변해 마우스에 반응합니다.', thumbnailUrl: `${BASE_URL}/images/Tipo.webp`, path: '/kinetic-typo' },
  { id: 'lp-cover-maker', title: 'LP 커버 메이커', description: '나만의 감성적인 LP판 커버를 디자인해보세요.', thumbnailUrl: `${BASE_URL}/images/LPcover.gif`, path: '/LP-cover-maker' },
  { id: 'Glitch-game', title: 'Glitch Game', description: 'Glitch를 AI와 대화하며 찾아라!', thumbnailUrl: `${BASE_URL}/images/glitch.gif`, path: '/glitch-game' },
  { id: 'lifecuts', title: '인생네컷 Web', description: '나만의 인생사진을 만들어보세요.', thumbnailUrl: `${BASE_URL}/images/lifecut.webp`, path: '/lifecuts' },
  { id: 'worms', title: '지렁이 게임', description: '고전 지렁이 게임을 웹에서 즐겨보세요!', thumbnailUrl: `${BASE_URL}/images/wormsgameimage.png`, path: '/worms' },
  { id: 'ajae-gag', title: '아재개그 모음', description: '웃긴 아재개그를 모아놓은 웹앱입니다.', thumbnailUrl: `${BASE_URL}/images/oldmanlogo.png`, path: '/ajae-gag' }
];

const Navbar: React.FC<NavbarProps> = ({ theme, toggleTheme, searchTerm, onSearchChange }) => {
  const navigate = useNavigate();
  const { isMuted, toggleMute } = useSoundState();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredApps = LOCAL_APP_DATA.filter(app => 
    app.title.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  // ✅ 검색어 이스터에그 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearchChange(value);
    setShowDropdown(true);

    const lowerValue = value.toLowerCase();
    
    // 1. g or ㅎ 입력시 무중력 신호
    if (lowerValue === 'g' || lowerValue === 'ㅎ') {
      window.dispatchEvent(new CustomEvent('trigger-gravity'));
    } 
    // 2. rocket 입력시 로켓 발사 신호
    else if (lowerValue === 'rocket') {
      window.dispatchEvent(new CustomEvent('trigger-rocket'));
      onSearchChange(''); // 입력창 비우기
    }
    // 3. space 입력시 stargame 이동
    else if (lowerValue === 'space') {
      navigate('/stargame');
      onSearchChange(''); // 입력창 비우기
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full pt-8 px-4 flex justify-center pointer-events-none fixed top-0 left-0 right-0 z-[100]">
      <nav className="w-full max-w-4xl pointer-events-auto rounded-2xl border border-white/20 bg-white/10 dark:bg-black/50 backdrop-blur-xl shadow-2xl transition-all duration-500">
        <div className="px-6 h-14 flex items-center justify-between gap-4">
          
          <div className="flex-none cursor-pointer flex items-center gap-2 group" onClick={() => navigate('/')}>
            <img src="./images/logo.png" alt="Logo" className={`w-6 h-6 object-contain ${theme === 'dark' ? 'invert' : ''}`} />
            <div className="flex flex-col">
               <span className="text-sm font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:from-indigo-400 group-hover:to-purple-400 transition-all">
                MyFolio
               </span>
               <span className="text-[8px] font-bold text-gray-500 hidden sm:block uppercase tracking-widest leading-none">Star-Forge</span>
            </div>
          </div>

          <div className="flex-1 max-w-sm relative" ref={dropdownRef}>
            <div className="relative group">
              <Search className="absolute left-3 top-2.5 text-gray-500" size={14} />
              <input 
                type="text"
                value={searchTerm}
                onFocus={() => setShowDropdown(true)}
                onChange={handleSearchChange} // ✅ 핸들러 교체
                placeholder="Search apps..."
                className="w-full bg-white/10 dark:bg-black/40 border border-white/10 rounded-xl py-1.5 pl-9 pr-4 text-xs font-bold outline-none focus:ring-2 ring-indigo-500/50 transition-all text-white"
              />
            </div>

            {showDropdown && searchTerm && (
              <div className="absolute top-[calc(100%+10px)] left-0 right-0 bg-[#0f0f15]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
                <div className="p-2 border-b border-white/5 uppercase text-[9px] font-black text-gray-500 tracking-widest px-4 py-2">Suggested Apps</div>
                {filteredApps.length > 0 ? (
                  filteredApps.map((app) => (
                    <div 
                      key={app.id}
                      onClick={() => { navigate(app.path); onSearchChange(''); setShowDropdown(false); }}
                      className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-white/10 group transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10">
                        <img src={app.thumbnailUrl} alt={app.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-gray-200 group-hover:text-indigo-400">{app.title}</span>
                        <span className="text-[10px] text-gray-500 line-clamp-1">{app.description}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-xs text-gray-500 italic">No results found.</div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
              {isMuted ? <VolumeX size={15} className="text-red-400" /> : <Volume2 size={15} className="text-white" />}
            </button>
            <button onClick={toggleTheme} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
              {theme === 'dark' ? <Sun size={15} className="text-yellow-400" /> : <Moon size={15} className="text-indigo-400" />}
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;