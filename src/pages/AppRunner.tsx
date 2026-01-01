import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppViewer from '../components/AppViewer';
import { APP_DATA } from '../constants';
import { useSound } from '../../hooks/useSound';

const AppRunner: React.FC = () => {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const { playClick } = useSound();

  const app = APP_DATA.find(a => a.id === appId);

  const handleBack = () => {
    // playClick(); // AppViewer calls this too, but we can call it here if needed or let AppViewer handle the click sound before calling this. 
    // Usually AppViewer handles the click sound on the button, then calls onBack.
    navigate('/');
  };

  if (!app) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-4">
        <div>
          <h2 className="text-2xl font-bold mb-4">앱을 찾을 수 없습니다.</h2>
          <button 
            onClick={() => { playClick(); navigate('/'); }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <AppViewer app={app} onBack={handleBack} />
    </div>
  );
};

export default AppRunner;