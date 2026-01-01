<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🎮 My Portfolio Website - 앱 플레이그라운드

React + TypeScript + Vite로 만든 개인 포트폴리오 웹사이트입니다. 직접 만든 11개의 미니 앱들을 한곳에서 체험할 수 있습니다.

## ✨ 특징

- **중앙화된 메타데이터 관리**: `constants.ts`에서 모든 앱 정보를 한곳에서 관리
- **쉬운 이미지 경로 설정**: `public/images/` 폴더의 썸네일을 쉽게 변경
- **React Router 기반 라우팅**: 각 앱이 전용 경로로 매핑됨
- **다크 모드 지원**: 시스템 선호도 감지 및 토글 기능
- **반응형 디자인**: 모든 기기에서 최적화된 UI

## 🎮 포함된 앱들

| ID | 제목 | 카테고리 | 라우트 |
|---|---|---|---|
| `neon-breaker` | 네온 브레이커 | 게임 | `/neonbreaker` |
| `virtual-try-on` | AI 가상 피팅 | 유틸리티 | `/virtual-try-on` |
| `aivoca` | AIVOCA 단어장 | 교육 | `/aivoca` |
| `survivor-game` | 서바이벌 게임 | 게임 | `/survivor-game` |
| `draw-bridge-drive` | 다리 만드는 게임 | 게임 | `/drawbridgegame` |
| `subway-runner` | 지하철 러너 게임 | 게임 | `/subway-runner` |
| `slice-game` | 슬라이스 게임 | 게임 | `/slice-game` |
| `neon-stack` | 네온 스택 게임 | 게임 | `/neon-stack` |
| `generative-art` | 제너레이티브 아트 | 예술 | `/generative-art` |
| `kinetic-typo-studio` | 키네틱 타이포 스튜디오 | 예술 | `/kinetic-typo` |
| `lp-cover-maker` | LP 커버 메이커 | 예술 | `/LP-cover-maker` |

## 🚀 로컬 실행 방법

### 필수 조건
- Node.js 16.0 이상

### 1단계: 의존성 설치
```bash
npm install
```

### 2단계: 환경 변수 설정 (선택)
`.env.local` 파일을 생성하고 아래를 추가하세요:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

> 💡 **팁**: API 키가 없어도 앱은 실행됩니다. AI 기능은 그레이스풀 폴백을 사용합니다.

### 3단계: 개발 서버 시작
```bash
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속하세요.

## 📁 프로젝트 구조

```
src/
├── components/              # 재사용 가능한 UI 컴포넌트
│   ├── Navbar.tsx          # 네비게이션 바
│   ├── AppCard.tsx         # 앱 카드 컴포넌트 (이미지 지원)
│   ├── CategoryFilter.tsx  # 카테고리 필터링
│   └── [앱 폴더들]/        # 각 앱의 컴포넌트 폴더
├── pages/                  # 페이지별 라우트 컴포넌트
│   ├── Home.tsx           # 홈페이지 (중앙화된 앱 메타데이터)
│   ├── AivocaPage.tsx     # 앱별 페이지
│   └── ...
├── contexts/              # React Context (사운드 등)
├── hooks/                 # 커스텀 React 훅
├── constants.ts           # 📌 앱 메타데이터 + 이미지 경로 (중앙 관리)
├── types.ts              # TypeScript 타입 정의
└── App.tsx               # 라우팅 설정

public/
└── images/               # 📌 앱 썸네일 이미지 (쉽게 수정 가능)
```

## 🎨 커스터마이징 방법

### 앱 정보 수정하기
`constants.ts` 파일을 열고 `APP_DATA` 배열의 앱 정보를 수정하세요:

```typescript
{
  id: 'my-app',
  title: '내 앱의 제목',
  description: '앱 설명',
  category: AppCategory.GAME,
  thumbnailUrl: IMAGES.MY_APP,      // ← 썸네일 URL
  image: IMAGES.MY_APP,              // ← public/images 폴더의 이미지
  createdAt: '2024.06.01',
  path: '/my-app'                    // ← 라우트 경로
}
```

### 앱 썸네일 이미지 변경하기
1. 이미지 파일을 `public/images/` 폴더에 추가
2. `constants.ts`의 `IMAGES` 상수 업데이트:
```typescript
const IMAGES = {
  MY_NEW_APP: 'images/my-new-app.webp',
  // ... 기타 이미지
} as const;
```
3. `APP_DATA`에서 해당 앱의 `image` 필드를 업데이트

### 새로운 앱 라우트 추가하기
1. `App.tsx`에서 페이지 컴포넌트 import 추가
2. Routes에 새로운 route 추가:
```typescript
<Route path="/my-new-app" element={<MyNewAppPage />} />
```
3. `constants.ts`의 `APP_DATA`에 앱 정보 추가 (path 값 일치해야 함)

## 🔧 빌드 및 배포

### 프로덕션 빌드
```bash
npm run build
```

빌드된 파일은 `dist/` 폴더에 생성됩니다.

### 프리뷰
```bash
npm run preview
```

## 🌐 배포

Vercel, Netlify, GitHub Pages 등에 배포할 수 있습니다.

### Vercel에 배포 (권장)
```bash
npm install -g vercel
vercel
```

## 💡 개발 팁

- **콘솔 확인**: DevTools를 열어 에러 메시지 확인
- **이미지 캐싱**: 이미지 수정 후 브라우저 캐시 초기화 (Ctrl+Shift+Delete)
- **타입 체크**: TypeScript 에러 확인하려면 `npm run type-check` 실행

## 📝 라이선스

This project is for personal portfolio use.

## 📧 문의

질문이나 피드백이 있으시면 연락주세요!
