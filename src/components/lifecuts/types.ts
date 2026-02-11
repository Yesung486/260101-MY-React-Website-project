export type AppState = 'START' | 'COUNTDOWN' | 'PREVIEW' | 'RESULT';

export interface PhotoFrameConfig {
  color: string;
  textColor: string;
  name: string;
}

export interface Sticker {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

export type FilterType = 'none' | 'grayscale(100%)' | 'sepia(60%)' | 'brightness(110%) saturate(120%)';

export const FRAME_COLORS: PhotoFrameConfig[] = [
  { color: '#000000', textColor: '#FFFFFF', name: '시크 블랙' },
  { color: '#FFFFFF', textColor: '#000000', name: '심플 화이트' },
  { color: '#FFB6C1', textColor: '#FFFFFF', name: '러블리 핑크' },
  { color: '#87CEEB', textColor: '#FFFFFF', name: '스카이 블루' },
  { color: '#98FB98', textColor: '#006400', name: '프레시 그린' },
  { color: '#E6E6FA', textColor: '#4B0082', name: '라벤더 퍼플' },
];

export const STICKER_LIST = [
  "❤️", "✨", "🥰", "👑", "🎀", 
  "😎", "🌸", "⭐", "🔥", "🐱",
  "🐶", "🐰", "🎂", "🎉", "🌈"
];