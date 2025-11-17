import { GoogleGenAI } from "@google/genai";

export const analyzeBudgetPlan = async (planContent: string): Promise<string> => {
  // Proactively check for the API key to provide a clearer and more direct error message.
  if (!process.env.API_KEY) {
    throw new Error("API Key Not Found. This application requires the `API_KEY` environment variable to be set in its execution environment. Please refer to the setup instructions.");
  }

  try {
    // Initialize the GoogleGenAI client.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    // Handle cases where the key is present but invalid.
    if (error instanceof Error && /API key not valid/i.test(error.message)) {
      throw new Error("Invalid API Key. The provided API Key is not valid. Please check it and reconfigure the environment variable.");
    }
    // Generic error for other issues.
    throw new Error("Sorry, I encountered an error while analyzing your plan. Please try again later.");
  }
};