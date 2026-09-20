import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateAgentResponse = async (
  systemInstruction: string,
  prompt: string,
  model = "gemini-2.5-flash",
) => {
  if (!ai) throw new Error("GEMINI_API_KEY is not configured");
  const result = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { systemInstruction, temperature: 0.2 },
  });
  return result.text;
};
