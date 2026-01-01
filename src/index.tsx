import React from 'react';
import ReactDOM from 'react-dom/client';
// 📌 import { BrowserRouter }... 줄은 지워버리세요!
import App from './App';
// SoundProvider 경로가 맞는지 확인해줘! (보통 ./contexts/...)
import { SoundProvider } from '../contexts/SoundContext'; 

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <SoundProvider>
      {/* 📌 여기서 BrowserRouter를 삭제했습니다. App.tsx의 HashRouter가 작동할 거예요! */}
      <App />
    </SoundProvider>
  </React.StrictMode>
);