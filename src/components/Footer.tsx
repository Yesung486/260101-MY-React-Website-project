import React from 'react';
import { Github, Mail, User } from 'lucide-react';
import { useSound } from '../../hooks/useSound';

const Footer: React.FC = () => {
  // Sound hook still imported but only playClick would be used if there were click interactions
  // Removed playHover as per request

  return (
    <footer className="mt-20 pb-8 px-4">
      <div className="container mx-auto rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-8 shadow-lg dark:bg-black/20 dark:border-white/10 text-center">
        <h3 className="text-xl font-bold mb-4">Creator Info</h3>
        <p className="mb-6 text-sm opacity-80">
          꿈을 코딩하는 중3 개발자입니다.<br/>
          사용자의 경험을 최우선으로 생각하며 웹 앱을 만듭니다.
        </p>
        
        <div className="flex justify-center gap-6 mb-6">
          <a href="#" className="hover:text-indigo-500 transition-colors flex flex-col items-center gap-1">
            <Github size={24} />
            <span className="text-xs">GitHub</span>
          </a>
          <a href="#" className="hover:text-indigo-500 transition-colors flex flex-col items-center gap-1">
            <Mail size={24} />
            <span className="text-xs">Email</span>
          </a>
          <a href="#" className="hover:text-indigo-500 transition-colors flex flex-col items-center gap-1">
            <User size={24} />
            <span className="text-xs">Profile</span>
          </a>
        </div>
        
        <div className="text-xs opacity-50">
          © {new Date().getFullYear()} MyFolio. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;