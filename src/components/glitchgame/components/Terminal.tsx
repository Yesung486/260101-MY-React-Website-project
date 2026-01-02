import React, { useState, useRef, useEffect } from 'react';
import { LogEntry } from '../types';
import { audioService } from '../services/audioService';

interface TerminalProps {
  logs: LogEntry[];
  onCommand: (cmd: string) => void;
  isLocked: boolean;
}

const Terminal: React.FC<TerminalProps> = ({ logs, onCommand, isLocked }) => {
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLocked) return;
    
    audioService.playTypingSound();
    onCommand(input);
    setInput('');
  };

  const getSenderLabel = (sender: string) => {
    switch (sender) {
      case 'SYSTEM': return '시스템';
      case 'USER': return 'GUEST';
      case 'AI': return 'GLITCH';
      default: return sender;
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/90 border border-green-800 rounded p-4 font-mono shadow-inner">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 custom-scrollbar px-2">
        {logs.map((log) => {
          const isUser = log.sender === 'USER';
          const isSystem = log.sender === 'SYSTEM';
          
          return (
            <div 
              key={log.id} 
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} ${isSystem ? 'items-center opacity-60 my-2' : ''}`}
            >
              {!isSystem && (
                <div className={`flex items-baseline gap-2 mb-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  <span className={`text-xs font-bold ${isUser ? 'text-cyan-400' : 'text-green-500'}`}>
                    {getSenderLabel(log.sender)}
                  </span>
                  <span className="text-[10px] text-green-900">[{log.timestamp}]</span>
                </div>
              )}
              
              <div 
                className={`
                  max-w-[90%] md:max-w-[85%] break-words p-2 rounded 
                  ${isUser 
                    ? 'bg-green-900/30 text-cyan-100 border-r-2 border-cyan-600 text-right' 
                    : isSystem 
                      ? 'text-yellow-500 text-xs border-y border-yellow-900/30 w-full text-center py-1'
                      : 'bg-green-900/20 text-green-100 border-l-2 border-green-600 text-left'
                  }
                `}
              >
                {log.sender === 'AI' && <span className="mr-2 text-green-500">▶</span>}
                {log.text}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-green-900/50 pt-3">
        <span className="text-green-500 animate-pulse font-bold">{'>_'}</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-green-300 placeholder-green-900 font-bold"
          placeholder={isLocked ? "ACCESS DENIED" : "대화 또는 코드 입력..."}
          disabled={isLocked}
          autoFocus
        />
      </form>
    </div>
  );
};

export default Terminal;