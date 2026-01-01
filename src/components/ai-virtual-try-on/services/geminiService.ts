// NOTE: @google/genai is optional. If no API key or library is available,
// we return a placeholder image so the app can run locally without the
// external dependency.

type Part = { inlineData?: { mimeType?: string; data?: string }; text?: string };

const API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

const hasApi = Boolean(API_KEY);

/**
 * Converts a data URL string to a Gemini Part object.
 * @param dataUrl The data URL (e.g., "data:image/jpeg;base64,...").
 * @returns A Gemini Part object.
 */
function dataUrlToGeminiPart(dataUrl: string): Part {
  const [header, base64Data] = dataUrl.split(",");
  const mimeType = header.match(/:(.*?);/)?.[1];

  if (!mimeType || !base64Data) {
    throw new Error("Invalid data URL format");
  }

  return {
    inlineData: {
      mimeType,
      data: base64Data,
    },
  };
}

export const generateVirtualTryOn = async (
  userImageDataUrl: string,
  clothingImageDataUrl: string
): Promise<string> => {
  const userImagePart = dataUrlToGeminiPart(userImageDataUrl);
  const clothingImagePart = dataUrlToGeminiPart(clothingImageDataUrl);

  const textPart: Part = {
    text: `You are a fashion AI expert. Your task is to perform a virtual try-on.
        - The first image contains a person.
        - The second image contains an article of clothing.
        Generate a new, photorealistic image where the person from the first image is wearing the clothing from the second image.
        The clothing must be realistically adjusted to fit the person's body and pose. Preserve the original background, head, and limbs from the first image.
        The output must be only the generated image. Do not output any text.`,
  };

  // If no API key/library is present, return a simple SVG placeholder data URL
  if (!hasApi) {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><rect width='100%' height='100%' fill='%23222'/><text x='50%' y='50%' fill='%23fff' font-size='20' font-family='Arial' dominant-baseline='middle' text-anchor='middle'>Virtual Try-On unavailable (no API)</text></svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  try {
    // Try dynamic import of the client. If it fails, fall back to placeholder.
    const mod = await import('@google/generative-ai');
    const { GoogleGenerativeAI } = mod as any;
    const ai = new GoogleGenerativeAI({ apiKey: API_KEY });

    const response = await ai.getGenerativeModel({
      model: 'gemini-2.5-flash-image-preview',
    }).generateContent({
      contents: [{
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: userImageDataUrl.split(',')[1],
            },
          },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: clothingImageDataUrl.split(',')[1],
            },
          },
          {
            text: `You are a fashion AI expert. Your task is to perform a virtual try-on.
        - The first image contains a person.
        - The second image contains an article of clothing.
        Generate a new, photorealistic image where the person from the first image is wearing the clothing from the second image.
        The clothing must be realistically adjusted to fit the person's body and pose. Preserve the original background, head, and limbs from the first image.
        The output must be only the generated image. Do not output any text.`,
          },
        ],
      }],
    });

    const content = response.response.candidates?.[0]?.content?.parts?.[0];
    if (content && 'inlineData' in content) {
      const data = content.inlineData as { mimeType: string; data: string };
      return `data:${data.mimeType};base64,${data.data}`;
    }
    throw new Error('No image in response');
  } catch (error) {
    console.warn('Virtual try-on generation failed:', error);
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><rect width='100%' height='100%' fill='%23222'/><text x='50%' y='50%' fill='%23fff' font-size='20' font-family='Arial' dominant-baseline='middle' text-anchor='middle'>Virtual Try-On generation failed</text></svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }
};
