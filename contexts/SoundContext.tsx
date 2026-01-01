import React, { createContext, useContext, useState, useEffect } from 'react';

interface SoundContextType {
  volume: number;
  isMuted: boolean;
  setVolume: (v: number) => void;
  toggleMute: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with 50% volume
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = () => setIsMuted(prev => !prev);

  return (
    <SoundContext.Provider value={{ volume, isMuted, setVolume, toggleMute }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSoundState = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSoundState must be used within a SoundProvider');
  }
  return context;
};