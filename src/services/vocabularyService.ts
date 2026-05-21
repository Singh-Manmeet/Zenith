import { GoogleGenAI, Type } from "@google/genai";
import { WordOfTheDay } from "../types";

const fallbackWords: WordOfTheDay[] = [
  {
    word: "Acumen",
    meaning: "The ability to make good judgments and quick decisions, typically in a particular domain.",
    context: "Her financial acumen was instrumental in navigating the company through the complex merger.",
    level: "Advanced"
  },
  {
    word: "Synergy",
    meaning: "The interaction or cooperation of two or more organizations, substances, or other agents to produce a combined effect greater than the sum of their separate effects.",
    context: "The cross-departmental integration achieved remarkable synergy, accelerating product development cycles.",
    level: "Advanced"
  },
  {
    word: "Paradigm",
    meaning: "A typical example or pattern of something; a model or standard archetype.",
    context: "The sudden shift toward distributed edge infrastructure represented a completely new paradigm in enterprise systems architecture.",
    level: "Mastery"
  },
  {
    word: "Leverage",
    meaning: "The strategic use of resources, relationships, or capital to maximum advantage.",
    context: "By leveraging existing client partnerships, the sales team successfully secured multiple expansion accounts.",
    level: "Advanced"
  },
  {
    word: "Salient",
    meaning: "Most noticeable, prominent, or of conspicuous importance.",
    context: "The consulting team carefully structured the presentation slide to outline only the most salient findings.",
    level: "Advanced"
  },
  {
    word: "Efficacy",
    meaning: "The power or ability to produce an intended, desired, or highly effective result.",
    context: "Early adoption phase metrics clearly demonstrated the platform's exceptional operational efficacy.",
    level: "Advanced"
  }
];

function getRandomWord(): WordOfTheDay {
  const index = Math.floor(Math.random() * fallbackWords.length);
  return fallbackWords[index];
}

let ai: GoogleGenAI | null = null;
let initializationTried = false;

function getAI(): GoogleGenAI | null {
  if (initializationTried) return ai;
  initializationTried = true;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY environment variable is not defined. Using template-based offline words.");
    return null;
  }

  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
    return ai;
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI:", error);
    return null;
  }
}

export async function fetchAdvancedWord(): Promise<WordOfTheDay> {
  const aiInstance = getAI();
  if (!aiInstance) {
    return getRandomWord();
  }

  try {
    const response = await aiInstance.models.generateContent({
      model: "gemini-3.5-flash",
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
    console.error("Error fetching word from Gemini API, falling back to local list:", error);
    return getRandomWord();
  }
}
