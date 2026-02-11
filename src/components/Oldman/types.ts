export interface Joke {
  id: number;
  question: string;
  answer: string;
}

export type GameState = 'START' | 'PLAYING' | 'END';

export interface SoundEffects {
  playCorrect: () => void;
  playWrong: () => void;
  playClick: () => void;
}