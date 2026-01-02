import { Word } from "../types";

// ✅ Vite 환경 변수 확인
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// ✅ 스크린샷에서 확인된 가장 안정적인 최신 모델 'gemini-2.5-flash' 사용
// ✅ 경로를 v1beta 대신 안정적인 v1으로 변경하여 에러 방지
const BASE_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

export const generateExample = async (term: string, definition: string) => {
  if (!API_KEY) {
    return { sentence: "API 키가 설정되지 않았습니다.", translation: "" };
  }

  try {
    const response = await fetch(`${BASE_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `단어 "${term}"(뜻: ${definition})를 사용한 짧은 영어 예문 1개와 그에 대한 한글 해석을 JSON 형식으로 알려줘. 
                  반드시 다음 형식을 지켜줘: {"sentence": "영어 예문", "translation": "한글 해석"}`
          }]
        }]
      })
    });

    const data = await response.json();
    
    // 상세 에러 로깅
    if (data.error) {
      console.error("Gemini API 에러 상세:", data.error);
      return { sentence: "AI 서비스 응답 에러", translation: data.error.message };
    }

    const responseText = data.candidates[0].content.parts[0].text;
    // JSON 응답에서 마크다운 코드 블록 제거
    const jsonString = responseText.replace(/```json|```/g, "").trim();
    const result = JSON.parse(jsonString);

    return {
      sentence: result.sentence || "예문을 생성할 수 없습니다.",
      translation: result.translation || "해석을 생성할 수 없습니다."
    };

  } catch (error) {
    console.error("AI 생성 실패:", error);
    return { sentence: "네트워크 연결 확인 필요", translation: "다시 시도해주세요." };
  }
};

/**
 * 단어 데이터 생성 로직
 */
export const generateWordData = async (rawText: string): Promise<Word[]> => {
  const lines = rawText.split(/[\n\r]+/);
  const words: Word[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    let term = '', definition = '';
    const koreanMatchIndex = line.search(/[가-힣]/);
    
    if (koreanMatchIndex > 0) {
      term = line.substring(0, koreanMatchIndex).trim();
      definition = line.substring(koreanMatchIndex).trim();
    } else {
      const parts = line.split(/[:=-]|\t|\s{2,}/);
      term = parts[0]?.trim();
      definition = parts.slice(1).join(' ').trim() || '뜻 없음';
    }

    if (term && definition) {
      const aiData = await generateExample(term, definition);
      words.push({
        id: `word-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        term, 
        definition,
        exampleSentence: aiData.sentence,
        exampleTranslation: aiData.translation,
        tags: ['AI 생성'],
        masteryLevel: 0,
        incorrectCount: 0,
        userNote: '',
        isFavorite: false
      });
    }
  }
  return words;
};

export const validateAnswerWithAI = async () => ({ isCorrect: true, explanation: "" });
export const generatePronunciation = async () => null;
export const getFeedbackAnalysis = async () => "학습 데이터를 분석 중입니다.";