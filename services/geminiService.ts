import { GoogleGenAI } from "@google/genai";
import { StickerStyle } from "../types";

// Helper to get random styles
export const getRandomStyles = (count: number): StickerStyle[] => {
  const styles = Object.values(StickerStyle);
  const shuffled = styles.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const getPromptForStyle = (style: StickerStyle): string => {
  const baseInstruction = "Generate a high-quality, die-cut sticker based on this image. The sticker should have a thick white border and be isolated on a plain background. Make it funny and expressive.";
  
  switch (style) {
    case StickerStyle.CARICATURE:
      return `${baseInstruction} Style: Exaggerated caricature, funny facial features, big head small body, vibrant colors.`;
    case StickerStyle.CHIBI:
      return `${baseInstruction} Style: Cute chibi anime style, big sparkling eyes, tiny body, very round and soft shapes.`;
    case StickerStyle.MEME:
      return `${baseInstruction} Style: Dramatic internet meme style, high contrast, maybe adding funny text bubbles or laser eyes if appropriate.`;
    case StickerStyle.RETRO:
      return `${baseInstruction} Style: 1990s Saturday morning cartoon style, bold outlines, flat colors, wacky expression.`;
    case StickerStyle.PIXEL:
      return `${baseInstruction} Style: 8-bit pixel art, retro video game asset style.`;
    case StickerStyle.CLAY:
      return `${baseInstruction} Style: Claymation, plasticine texture, 3D look, funny Aardman animation vibe.`;
    case StickerStyle.GRAFFITI:
      return `${baseInstruction} Style: Street art graffiti character, spray paint texture, urban vibe.`;
    case StickerStyle.VINTAGE:
      return `${baseInstruction} Style: Vintage badge or patch, distressed texture, muted retro colors.`;
    default:
      return `${baseInstruction} Style: Funny cartoon.`;
  }
};

export const generateSticker = async (
  imagePart: { inlineData: { data: string; mimeType: string } },
  style: StickerStyle
): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // We use gemini-2.5-flash-image for image-to-image/generation tasks as per guidelines
    const model = 'gemini-2.5-flash-image';
    
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          imagePart,
          { text: getPromptForStyle(style) }
        ]
      }
    });

    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    console.warn(`No image found in response for style: ${style}`);
    return null;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};
