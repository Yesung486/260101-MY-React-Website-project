import React from 'react';
import { Github, Mail, User } from 'lucide-react';
import { useSound } from '../../hooks/useSound';
import { useNavigate, useLocation } from 'react-router-dom'; // 추가

const Footer: React.FC = () => {
  const { playClick } = useSound();
  const navigate = useNavigate(); // 페이지 이동을 위한 훅
  const location = useLocation(); // 현재 위치 확인을 위한 훅

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    playClick();

    if (location.pathname === '/') {
      // 1. 이미 메인 페이지라면 그냥 위로 스크롤
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      // 2. 다른 앱/페이지에 있다면 메인으로 이동 후 스크롤
      navigate('/');
      // 이동 직후 스크롤이 바로 안 될 수 있으니 살짝 시간을 줌
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }, 100);
    }
  };

  return (
    <footer className="mt-20 pb-8 px-4">
      <div className="container mx-auto rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-8 shadow-lg dark:bg-black/20 dark:border-white/10 text-center">
        <h3 className="text-xl font-bold mb-4">Creator Info</h3>
        <p className="mb-6 text-sm opacity-80">
          꿈을 코딩하는 중3 개발자입니다.<br/>
          사용자의 경험을 최우선으로 생각하며 웹 앱을 만듭니다.
        </p>
        
        <div className="flex justify-center gap-6 mb-6">
          <a 
            href="https://github.com/Yesung486" 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={() => playClick()}
            className="hover:text-indigo-500 transition-colors flex flex-col items-center gap-1 group"
          >
            <Github size={24} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs">GitHub</span>
          </a>

          <a 
            href="mailto:iamyou101027@gmail.com" 
            onClick={() => playClick()}
            className="hover:text-indigo-500 transition-colors flex flex-col items-center gap-1 group"
          >
            <Mail size={24} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs">Email</span>
          </a>

          {/* Profile 버튼: 클릭 시 위 로직 실행 */}
          <button 
            onClick={handleProfileClick}
            className="hover:text-indigo-500 transition-colors flex flex-col items-center gap-1 group"
          >
            <User size={24} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
        
        <div className="text-xs opacity-50">
          © {new Date().getFullYear()} MyFolio. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;