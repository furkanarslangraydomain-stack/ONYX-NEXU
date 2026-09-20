import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export const getGeminiModel = (model: string = "gemini-3.8-flash") => {
  return ai.models.getGenerativeModel({ model });
};

export const generateAgentResponse = async (systemInstruction: string, prompt: string, model: string = "gemini-3.8-flash") => {
  const result = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
      temperature: 0.2,
    }
  });
  return result.text;
};
