
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const analyzeBudgetPlan = async (planContent: string): Promise<string> => {
  if (!API_KEY) {
    return "Error: Gemini API key is not configured. Please contact support.";
  }

  try {
    const prompt = `
      You are a friendly and encouraging financial coach named BudgetBuddy AI.
      Analyze the following personal budget plan. Provide constructive feedback, identify potential areas for improvement,
      and offer actionable tips. Be positive and supportive in your tone.
      Structure your response in Markdown format. Include headings for different sections like "Strengths", "Areas for Improvement", and "Actionable Tips".

      Here is the user's budget plan:
      ---
      ${planContent}
      ---
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error analyzing budget plan with Gemini:", error);
    return "Sorry, I encountered an error while analyzing your plan. Please try again later.";
  }
};
