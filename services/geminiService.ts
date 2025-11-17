import { GoogleGenAI } from "@google/genai";

export const analyzeBudgetPlan = async (planContent: string): Promise<string> => {
  try {
    // Initialize the GoogleGenAI client here to ensure the latest API key is used.
    // This must be inside the try block to catch initialization errors.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

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
    if (error instanceof Error && error.message.includes('API Key')) {
      throw new Error("Your API Key is invalid or missing. Please ensure it is configured correctly to use AI features.");
    }
    throw new Error("Sorry, I encountered an error while analyzing your plan. Please try again later.");
  }
};