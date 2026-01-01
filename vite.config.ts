import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // 📌 [추가] 배포 주소 설정 (저장소 이름과 똑같이 써야 해!)
      base: '/260101-MY-React-Website-project/', 
      
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // 📌 [수정] 외부 의존성 설정 제거 (배포 시 라이브러리가 포함되어야 실행됨!)
        // 외부 의존성(external)으로 두면 배포된 사이트에서 라이브러리를 못 찾을 수 있어.
        rollupOptions: {
          external: [], 
        }
      }
    };
});