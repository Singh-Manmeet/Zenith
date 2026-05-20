import { GoogleGenAI, Type } from "@google/genai";
import { WordOfTheDay } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function fetchAdvancedWord(): Promise<WordOfTheDay> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Generate one advanced English vocabulary word suitable for a high-level corporate environment (e.g., C-suite, strategic consulting). Provide the word, its meaning, and a realistic professional context sentence.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            meaning: { type: Type.STRING },
            context: { type: Type.STRING },
            level: { type: Type.STRING, enum: ["Advanced", "Mastery"] },
          },
          required: ["word", "meaning", "context", "level"],
        },
      },
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error fetching word:", error);
    // Fallback word in case of error
    return {
      word: "Acumen",
      meaning: "The ability to make good judgments and quick decisions, typically in a particular domain.",
      context: "Her financial acumen was instrumental in navigating the company through the complex merger.",
      level: "Advanced"
    };
  }
}
