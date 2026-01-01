import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { SoundProvider } from '../contexts/SoundContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <SoundProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SoundProvider>
  </React.StrictMode>
);