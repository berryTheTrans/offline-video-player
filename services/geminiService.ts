
import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const describeScene = async (base64Image: string): Promise<string> => {
  try {
    const ai = getAI();
    const model = 'gemini-3-flash-preview';
    
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image,
      },
    };
    
    const textPart = {
      text: "Analyze this video frame. Provide a concise, high-level summary of what is happening in the scene, the lighting, the mood, and any key objects or subjects visible. Keep it professional and insightful."
    };

    const response = await ai.models.generateContent({
      model,
      contents: { parts: [imagePart, textPart] },
    });

    return response.text || "No description available.";
  } catch (error) {
    console.error("AI Scene Analysis failed:", error);
    return "Failed to analyze the scene. Please check your connection or API key.";
  }
};

export interface SubtitleResult {
  title: string;
  url: string;
  source: string;
  isDirectLink?: boolean;
}

export const findSubtitles = async (videoTitle: string): Promise<{ text: string; sources: SubtitleResult[] }> => {
  try {
    const ai = getAI();
    const model = 'gemini-3-flash-preview';
    
    const prompt = `Find subtitle download links for the movie or video titled: "${videoTitle}". 
    Specifically look for .srt or .vtt file links from repositories like OpenSubtitles, Subscene, or GitHub. 
    If you find a direct link to the file itself (ending in .srt or .vtt), flag it. 
    Provide a brief summary and list the URLs clearly.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const sources: SubtitleResult[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    chunks.forEach((chunk: any) => {
      if (chunk.web) {
        const url = chunk.web.uri;
        const isDirect = url.toLowerCase().endsWith('.srt') || url.toLowerCase().endsWith('.vtt');
        sources.push({
          title: chunk.web.title || "Subtitle Source",
          url: url,
          source: new URL(url).hostname.replace('www.', ''),
          isDirectLink: isDirect
        });
      }
    });

    return {
      text: response.text || "I found some potential subtitle sources for you.",
      sources: sources
    };
  } catch (error) {
    console.error("Failed to find subtitles:", error);
    return { text: "Failed to search for subtitles online.", sources: [] };
  }
};
