import { AppItem, AppCategory } from './types';

// ✅ GitHub Pages 배포를 위한 기본 경로 설정
const BASE_URL = '/260101-MY-React-Website-project';

export const APP_DATA: AppItem[] = [
  {
    id: 'neon-breaker',
    title: '네온 브레이커',
    description: '집중력 향상을 위한 벽돌깨기 게임입니다. 레트로한 네온 스타일로 즐겨보세요.',
    category: AppCategory.GAME,
    thumbnailUrl: `${BASE_URL}/images/brick.png`,
    createdAt: '2024.06.01',
    path: '/neonbreaker'
  },
  {
    id: 'virtual-try-on',
    title: 'AI 가상 피팅',
    description: 'AI를 사용하여 옷을 가상으로 입어보는 혁신적인 경험입니다.',
    category: AppCategory.UTILITY,
    thumbnailUrl: `${BASE_URL}/images/fiting.jpg`,
    createdAt: '2024.06.01',
    path: '/virtual-try-on'
  },
  {
    id: 'aivoca',
    title: 'AIVOCA 단어장',
    description: 'AI와 함께 나만의 영어 단어장을 만들고 학습하는 지능형 앱입니다.',
    category: AppCategory.EDUCATION,
    thumbnailUrl: `${BASE_URL}/images/englishword.webp`,
    createdAt: '2024.06.01',
    path: '/aivoca'
  },
  {
    id: 'survivor-game',
    title: '서바이벌 게임',
    description: '서바이벌 게임으로 긴장감 넘치는 경험을 즐겨보세요.',
    category: AppCategory.GAME,
    thumbnailUrl: `${BASE_URL}/images/tangtang.webp`,
    createdAt: '2024.06.01',
    path: '/survivor-game'
  },
  {
    id: 'draw-bridge-drive',
    title: '다리 만드는 게임',
    description: '창의력을 발휘해 다리를 만들고 건너편에 도달해보세요.',
    category: AppCategory.GAME,
    thumbnailUrl: `${BASE_URL}/images/rode.jpeg`,
    createdAt: '2024.06.01',
    path: '/drawbridgegame'
  },
  {
    id: 'subway-runner',
    title: '지하철 러너 게임',
    description: '지하철 배경에서 펼쳐지는 러닝 게임으로 최고 기록에 도전하세요.',
    category: AppCategory.GAME,
    thumbnailUrl: `${BASE_URL}/images/subway.jpg`,
    createdAt: '2024.06.01',
    path: '/subway-runner'
  },
  {
    id: 'slice-game',
    title: '슬라이스 게임',
    description: '과일을 슬라이스하는 재미있고 중독성 있는 게임입니다.',
    category: AppCategory.GAME,
    thumbnailUrl: `${BASE_URL}/images/niga.jpeg`,
    createdAt: '2024.06.01',
    path: '/slice-game'
  },
  {
    id: 'neon-stack',
    title: '네온 스택 게임',
    description: '네온 블록을 쌓아 올리는 중독성 높은 스택 게임입니다.',
    category: AppCategory.GAME,
    thumbnailUrl: `${BASE_URL}/images/stack.gif`,
    createdAt: '2024.06.01',
    path: '/neon-stack'
  },
  {
    id: 'generative-art',
    title: '제너레이티브 아트',
    description: '코드로 그려지는 아름다운 예술 작품을 감상해보세요.',
    category: AppCategory.ART,
    thumbnailUrl: `${BASE_URL}/images/003.gif`,
    createdAt: '2024.06.01',
    path: '/generative-art'
  },
  {
    id: 'kinetic-typo-studio',
    title: '키네틱 타이포 스튜디오',
    description: '텍스트가 입자로 변해 마우스에 반응하는 인터랙티브 아트입니다.',
    category: AppCategory.ART,
    thumbnailUrl: `${BASE_URL}/images/Tipo.webp`,
    createdAt: '2024.06.01',
    path: '/kinetic-typo'
  },
  {
    id: 'lp-cover-maker',
    title: 'LP 커버 메이커',
    description: '나만의 감성적인 LP판 커버를 디자인하고 만들어보세요.',
    category: AppCategory.ART,
    thumbnailUrl: `${BASE_URL}/images/LPcover.gif`,
    createdAt: '2024.06.01',
    path: '/LP-cover-maker'
  }
];

// ✅ 아바타 이미지 설정 (public/images/me.jpg 가 있다면 아래처럼!)
export const AVATAR_URL = `${BASE_URL}/images/me.jpg`;