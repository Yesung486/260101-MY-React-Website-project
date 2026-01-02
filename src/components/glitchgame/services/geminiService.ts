import { Difficulty } from "../types";

// ✅ 1. TypeScript에게 Vite 환경 변수가 있음을 알림
interface ImportMeta {
  readonly env: {
    readonly VITE_GEMINI_API_KEY: string;
  };
}

// ✅ 2. 환경 변수 읽기 (Vite 전용 방식)
const API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY;

/**
 * 오프라인 대응 로직 (기존 유지)
 */
const getOfflineResponse = (input: string, difficulty: Difficulty): string => {
  const lowerInput = input.toLowerCase();
  if (lowerInput.includes("안녕") || lowerInput.includes("hi")) {
     if (difficulty === Difficulty.HARD) return "...";
     if (difficulty === Difficulty.NORMAL) return "글리치: 연결됨. 용건만 간단히.";
     return "글리치: 안녕! 지금은 네트워크가 불안정해서 내가 직접 도와줄게.";
  }
  return "시스템: 오프라인 모드입니다. 주 서버와 연결이 끊겼습니다.";
};

export const generateSystemResponse = async (
  userInput: string,
  gameContext: string,
  difficulty: Difficulty,
  levelInfo: string
): Promise<string> => {
  
  // 📌 API 키가 없으면 바로 오프라인 모드로
  if (!API_KEY) {
    console.warn("VITE_GEMINI_API_KEY가 설정되지 않았습니다.");
    return getOfflineResponse(userInput, difficulty);
  }

  try {
    // ✅ 3. 최신 Google AI 라이브러리 로드
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(API_KEY);

    // ✅ 4. 사용자가 요청한 최신 모델 gemini-2.5-flash-lite 적용
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-lite" 
    });

    let difficultyInstruction = "";
    switch (difficulty) {
      case Difficulty.EASY:
        difficultyInstruction = `[난이도: 쉬움 - 친절한 가이드] 힌트를 직접적으로 알려줘.`;
        break;
      case Difficulty.NORMAL:
        difficultyInstruction = `[난이도: 보통 - 수수께끼] 힌트를 비유적으로 알려줘.`;
        break;
      case Difficulty.HARD:
        difficultyInstruction = `[난이도: 어려움 - 적대적] 아주 불친절하고 철학적으로 말해.`;
        break;
    }

    const systemInstruction = `너는 방탈출 게임 AI '글리치(GLITCH)'야.
    ${difficultyInstruction}
    [레벨 정보]: ${levelInfo}
    [진행 상황]: ${gameContext}
    [규칙]: 1. 정답은 절대 금지. 2. 반말 사용. 3. 3문장 이내. 4. 문장은 반드시 마침표로 끝낼 것.`;

    // ✅ 5. 표준 호출 방식으로 변경 (generateContent)
    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: `시스템 지침: ${systemInstruction}\n\n사용자 메시지: ${userInput}` }] }
      ],
      generationConfig: {
        temperature: difficulty === Difficulty.HARD ? 1.0 : 0.7,
        maxOutputTokens: 200,
      }
    });

    const response = await result.response;
    return response.text() || "글리치: [......]";

  } catch (error: any) {
    console.error("Gemini API 에러:", error);
    // 429(할당량 초과) 등 에러 시 오프라인 응답으로 전환
    return getOfflineResponse(userInput, difficulty);
  }
};