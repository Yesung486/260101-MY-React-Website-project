
export enum GameState {
  LOCKED = 'LOCKED',
  UNLOCKED = 'UNLOCKED',
  LEVEL_TRANSITION = 'LEVEL_TRANSITION',
  ESCAPED = 'ESCAPED',
}

export enum Difficulty {
  EASY = 'EASY',     // Training Mode: Visual cues, direct AI hints
  NORMAL = 'NORMAL', // Hacker Mode: No visual cues, riddle hints
  HARD = 'HARD',     // Nightmare Mode: No visual cues, cryptic/hostile AI
}

export interface LogEntry {
  id: string;
  sender: 'SYSTEM' | 'USER' | 'AI';
  text: string;
  timestamp: string;
}

export interface QuizConfig {
  question: string;
  answers: string[]; // List of acceptable answers
  correctMessage: string;
  placeholder?: string; // Hint text for the input field
}

export interface LevelConfig {
  id: number;
  name: string;
  code: string;
  description: string; // For AI Context
  introMessage: string;
  itemInteractions: Record<string, {
    message: string;
    sound: 'glitch' | 'beep' | 'error' | 'alarm';
    reveal?: string; // What clue does this reveal?
    isTrap?: boolean;
    quiz?: QuizConfig; // If present, user must answer this to get 'reveal'
  }>;
}
