// src/components/ai-virtual-try-on/services/geminiService.ts

// 📌 [에러 해결] TypeScript에게 Vite 환경 변수가 있다고 알려주는 설정
interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

type Part = { inlineData?: { mimeType?: string; data?: string }; text?: string };

// ✅ 이제 밑줄 없이 API 키를 가져옵니다.
const API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY;
const hasApi = Boolean(API_KEY);

function dataUrlToGeminiPart(dataUrl: string): Part {
  const parts = dataUrl.split(",");
  const header = parts[0];
  const base64Data = parts[1];
  const mimeType = header.match(/:(.*?);/)?.[1] || "image/jpeg";
  return { inlineData: { mimeType, data: base64Data } };
}

export const generateVirtualTryOn = async (
  userImageDataUrl: string,
  clothingImageDataUrl: string
): Promise<string> => {
  if (!hasApi) {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><rect width='100%' height='100%' fill='#222'/><text x='50%' y='50%' fill='#fff' font-size='20' text-anchor='middle'>API Key Missing</text></svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  try {
    const mod = await import('@google/generative-ai');
    const { GoogleGenerativeAI } = mod as any;
    const ai = new GoogleGenerativeAI(API_KEY);

    // 🚀 요청하신 최신 모델 적용
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    const result = await model.generateContent([
      dataUrlToGeminiPart(userImageDataUrl),
      dataUrlToGeminiPart(clothingImageDataUrl),
      "You are a fashion AI expert. Perform a virtual try-on. Dress the person in the first image with the clothes in the second image. Output ONLY the resulting image data."
    ]);

    const response = await result.response;
    const content = response.candidates?.[0]?.content?.parts?.[0];

    if (content && 'inlineData' in content) {
      const data = content.inlineData as { mimeType: string; data: string };
      return `data:${data.mimeType};base64,${data.data}`;
    }
    
    throw new Error('No image returned');

  } catch (error: any) {
    console.error('Virtual try-on 실패:', error);
    const errorMsg = error.message?.includes('429') ? "Quota Exceeded (Wait 1min)" : "Generation Failed";
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><rect width='100%' height='100%' fill='#222'/><text x='50%' y='50%' fill='#fff' font-size='20' text-anchor='middle'>${errorMsg}</text></svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }
};