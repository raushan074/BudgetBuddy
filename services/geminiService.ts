import { GoogleGenAI } from "@google/genai";

const MOCK_RESPONSE = `
### BudgetBuddy AI Mock Feedback

This is a sample analysis because an API key has not been provided. Please set up your \`API_KEY\` environment variable to get live feedback from Gemini.

---

### Strengths
*   **Comprehensive Categories:** You've done a great job of breaking down your expenses into clear categories. This is the first step to understanding where your money goes!
*   **Setting Limits:** Actively setting limits for categories like Groceries and Entertainment shows you're being proactive about your spending.

### Areas for Improvement
*   **Savings Goal:** While you're tracking expenses, there doesn't appear to be a dedicated savings category. It's crucial to "pay yourself first."
*   **Miscellaneous Spending:** A large "Other" category can sometimes hide impulse buys. Try to break this down further if possible.

### Actionable Tips
1.  **Automate Savings:** Set up an automatic transfer to a savings account right after you get paid. Even a small amount helps build the habit.
2.  **The 50/30/20 Rule:** As a guideline, consider allocating 50% of your income to needs, 30% to wants, and 20% to savings and debt repayment. How does your current plan compare?
3.  **Review and Adjust:** A budget isn't set in stone. Review it monthly to see what's working and where you can adjust.
`;


export const analyzeBudgetPlan = async (planContent: string): Promise<string> => {
  // If no API key is found, return a mock response for demonstration purposes.
  if (!process.env.API_KEY) {
    console.warn("API key not found. Returning mock data.");
    return new Promise(resolve => setTimeout(() => resolve(MOCK_RESPONSE), 1000));
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