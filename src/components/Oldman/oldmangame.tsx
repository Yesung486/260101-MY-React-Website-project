import React, { useState, useEffect, useCallback } from 'react';
import { JOKES } from './data/jokes';
import { GameState, Joke } from './types';
import { InputBoxes } from './components/InputBoxes';
import { audioService } from './services/audioService';
import { getChosung } from './utils/stringUtils';

const MAX_LIVES = 5;

export default function App() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [currentJoke, setCurrentJoke] = useState<Joke | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [isError, setIsError] = useState(false);
  const [playedJokes, setPlayedJokes] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  
  // Theme State: Default to Dark
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('dadJokeHighScore');
    if (saved) {
      setHighScore(parseInt(saved, 10));
    }
  }, []);

  const updateHighScore = (currentScore: number) => {
    if (currentScore > highScore) {
      setHighScore(currentScore);
      localStorage.setItem('dadJokeHighScore', currentScore.toString());
    }
  };

  const playSound = (type: 'correct' | 'wrong' | 'click' | 'gameover') => {
    if (type === 'correct') audioService.playCorrect();
    if (type === 'wrong') audioService.playWrong();
    if (type === 'click') audioService.playClick();
    if (type === 'gameover') audioService.playWrong(); 
  };

  const toggleTheme = () => {
    playSound('click');
    setIsDarkMode(!isDarkMode);
  };

  const startGame = () => {
    playSound('click');
    setScore(0);
    setLives(MAX_LIVES);
    setPlayedJokes([]);
    setGameState('PLAYING');
    setIsProcessing(false);
    setFeedback(null);
    nextJoke([]);
  };

  const handleQuit = () => {
    playSound('click');
    // Directly go back to start screen without confirmation
    setGameState('START');
  };

  const nextJoke = useCallback((playedIds: number[]) => {
    const availableJokes = JOKES.filter(j => !playedIds.includes(j.id));
    
    if (availableJokes.length === 0) {
      setGameState('END');
    } else {
      const randomIndex = Math.floor(Math.random() * availableJokes.length);
      const joke = availableJokes[randomIndex];
      setCurrentJoke(joke);
      setPlayedJokes(prev => [...prev, joke.id]);
    }
    setInputValue('');
    setIsError(false);
    setShowHint(false);
    setIsProcessing(false);
    setFeedback(null);
  }, []);

  const checkAnswer = () => {
    if (!currentJoke || isProcessing) return;
    const cleanInput = inputValue.trim().replace(/\s/g, '');
    const cleanAnswer = currentJoke.answer.trim().replace(/\s/g, '');

    if (cleanInput === cleanAnswer) {
      setIsProcessing(true);
      playSound('correct');
      const newScore = score + 1;
      setScore(newScore);
      updateHighScore(newScore);
      setFeedback('CORRECT');
      setTimeout(() => {
        nextJoke(playedJokes);
      }, 1000);
    } else {
      playSound('wrong');
      setIsError(true);
      setFeedback('WRONG');
      const newLives = lives - 1;
      setLives(newLives);

      if (newLives <= 0) {
        setIsProcessing(true);
        setTimeout(() => {
          setGameState('END');
          playSound('gameover');
        }, 1000);
      } else {
        setTimeout(() => {
          setFeedback(null);
          setIsError(false);
        }, 600);
      }
    }
  };

  const handleReveal = () => {
    if (isProcessing || !currentJoke) return;
    playSound('click');
    setIsProcessing(true);
    setInputValue(currentJoke.answer);
    setTimeout(() => {
      nextJoke(playedJokes);
    }, 1500);
  };

  const toggleHint = () => {
    playSound('click');
    setShowHint(true);
  };

  useEffect(() => {
    const unlockAudio = () => {
      audioService.playClick();
      document.removeEventListener('click', unlockAudio);
    };
    document.addEventListener('click', unlockAudio);
    return () => document.removeEventListener('click', unlockAudio);
  }, []);

  // Theme Classes
  const themeClasses = isDarkMode ? 'bg-black text-white' : 'bg-white text-black';
  const buttonBase = isDarkMode 
    ? 'bg-white text-black hover:bg-gray-200' 
    : 'bg-black text-white hover:bg-gray-800';
  const outlineButton = isDarkMode 
    ? 'border-gray-600 text-gray-300 hover:bg-gray-900 hover:text-white' 
    : 'border-gray-400 text-gray-600 hover:bg-gray-100 hover:text-black';
  const subText = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  // --- RENDER ---

  // Common Theme Toggle Button
  const ThemeToggle = () => (
    <button 
      onClick={toggleTheme}
      className={`absolute top-4 left-4 p-2 rounded-full border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}
      aria-label="Toggle Theme"
    >
      {isDarkMode ? '☀️' : '🌙'}
    </button>
  );

  // 1. Start Screen
  if (gameState === 'START') {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-8 select-none transition-colors duration-300 ${themeClasses}`}>
        <ThemeToggle />
        <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tighter">
          아재개그<br/>
          <span className={subText}>퀴즈왕</span>
        </h1>
        <p className={`text-xl md:text-2xl max-w-md break-keep ${subText}`}>
          썰렁하지만 거부할 수 없는 매력.<br/>당신의 아재력을 테스트하세요.
        </p>
        
        <div className={`text-xl font-bold px-6 py-2 rounded-full border ${isDarkMode ? 'border-gray-700 bg-gray-900 text-white' : 'border-gray-300 bg-gray-100 text-black'}`}>
          🏆 최고 기록: {highScore}점
        </div>

        <button 
          onClick={startGame}
          className={`px-12 py-4 text-2xl font-bold rounded-full transition-transform hover:scale-105 ${buttonBase}`}
        >
          게임 시작
        </button>
      </div>
    );
  }

  // 2. Game Over Screen
  if (gameState === 'END') {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-8 select-none animate-shake transition-colors duration-300 ${themeClasses}`}>
        <ThemeToggle />
        <h2 className="text-5xl md:text-7xl font-black mb-2">GAME OVER</h2>
        <div className="text-2xl">
          당신의 점수는 <span className="text-4xl font-bold">{score}</span>점 입니다.
        </div>
        
        <div className={`flex flex-col gap-2 ${subText}`}>
           {score > highScore ? (
             <span className="font-bold underline decoration-2 underline-offset-4">🎉 신기록 달성! 🎉</span>
           ) : (
             <span>최고 기록: {highScore}점</span>
           )}
        </div>

        <div className="flex gap-4 mt-8">
          <button 
            onClick={() => setGameState('START')}
            className={`px-8 py-4 border text-xl font-bold rounded-full transition-colors ${outlineButton}`}
          >
            홈으로
          </button>
          <button 
            onClick={startGame}
            className={`px-8 py-4 text-xl font-bold rounded-full hover:scale-105 transition-transform ${buttonBase}`}
          >
            다시 도전하기
          </button>
        </div>
      </div>
    );
  }

  // 3. Playing Screen
  return (
    <div className={`min-h-screen flex flex-col items-center p-4 transition-colors duration-300 relative select-none ${themeClasses}`}>
      
      {/* Feedback Overlay - Monochrome */}
      {feedback && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none overflow-hidden">
          <div className={`text-[150px] md:text-[250px] font-black opacity-80 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] ${feedback === 'CORRECT' ? 'animate-bounce' : 'animate-pulse'}`}>
             {/* Using currentColor so it adapts to theme (White in Dark, Black in Light) */}
            {feedback === 'CORRECT' ? 'O' : 'X'}
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`w-full max-w-2xl flex justify-between items-center py-6 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="flex items-center gap-4">
           {/* Hearts Display - Monochrome: Uses Unicode Heart */}
           <div className="flex space-x-1">
            {[...Array(MAX_LIVES)].map((_, i) => (
              <span key={i} className={`text-xl md:text-2xl transition-all duration-300 ${i < lives ? 'opacity-100' : 'opacity-20'}`}>
                ♥
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-baseline gap-2 sm:gap-3">
            <div className="text-xl font-bold">SCORE: {score}</div>
            <div className={`hidden sm:block text-sm font-bold ${subText}`}>HI: {highScore}</div>
          </div>
          <div className="flex gap-2">
            <button 
                onClick={toggleTheme}
                className={`w-8 h-8 flex items-center justify-center rounded border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}
              >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button 
              onClick={handleQuit}
              className={`px-3 py-1 border rounded text-xs sm:text-sm transition-colors ${outlineButton}`}
            >
              나가기
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center items-center w-full max-w-2xl space-y-8">
        
        {/* Question Bubble */}
        <div className="w-full text-center space-y-4">
          <span className={`inline-block px-3 py-1 border rounded-full text-sm mb-4 ${isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-400 text-gray-500'}`}>
            문제 {playedJokes.length}
          </span>
          <h2 className="text-3xl md:text-5xl font-black break-keep leading-tight px-4">
            {currentJoke?.question}
          </h2>
        </div>

        {/* Hint Area */}
        <div className="h-8 flex items-center justify-center">
          {showHint && currentJoke ? (
            <span className="text-2xl font-bold tracking-widest animate-pulse border-b-2 border-current">
              초성: {getChosung(currentJoke.answer.replace(/\s/g, ''))}
            </span>
          ) : (
            <button 
              onClick={toggleHint}
              className={`text-sm underline decoration-dotted underline-offset-4 transition-colors ${subText} hover:text-current`}
            >
              힌트 보기 (초성)
            </button>
          )}
        </div>

        {/* Input Area */}
        {currentJoke && (
          <InputBoxes
            length={currentJoke.answer.replace(/\s/g, '').length}
            value={inputValue}
            onChange={setInputValue}
            onSubmit={checkAnswer}
            isError={isError}
            isDarkMode={isDarkMode}
          />
        )}

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-4 w-full">
          <button 
            onClick={handleReveal}
            disabled={isProcessing}
            className={`px-6 py-3 border rounded transition-colors disabled:opacity-50 ${outlineButton}`}
          >
            정답 보기
          </button>
          <button 
            onClick={checkAnswer}
            disabled={!inputValue || isProcessing}
            className={`px-8 py-3 font-bold rounded transition-colors ${buttonBase} ${(!inputValue || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            정답 확인
          </button>
        </div>

      </div>
      
      <div className={`pb-6 text-xs text-center ${subText}`}>
        * 오답 시 하트가 줄어듭니다.<br/>
        * 정답은 띄어쓰기 없이 입력하세요.
      </div>
    </div>
  );
}