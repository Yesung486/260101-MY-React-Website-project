export interface AppItem {
  id: string;
  title: string;
  description: string;
  category: AppCategory;
  thumbnailUrl: string;
  appUrl?: string; // URL to the actual app (or simulated iframe)
  createdAt: string;
  path?: string; // 라우팅 경로 (e.g., '/aivoca', '/neon-stack')
  image?: string; // 이미지 경로 (public 기준, e.g., 'images/aivoca.webp')
}

export enum AppCategory {
  ALL = '전체',
  GAME = '게임',
  UTILITY = '유틸리티',
  EDUCATION = '교육',
  ART = '예술'
}

export type Theme = 'light' | 'dark';