
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development. In a real environment, the key should be set.
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const analyzeBowlingForm = async (base64Image: string): Promise<string> => {
  if (!API_KEY) {
    return "AI analysis is disabled because the API key is not configured.";
  }

  try {
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image,
      },
    };

    const textPart = {
      text: `You are a world-class professional bowling coach. Analyze the bowling form in this image.
Focus on these key areas:
1.  **Stance and Approach:** Is the posture balanced? Are the knees bent correctly?
2.  **Arm Swing:** Describe the arc of the swing. Is it fluid? Is the arm straight?
3.  **Release:** Analyze the hand position at the point of release. Is it effective for generating spin?
4.  **Follow-through:** Is the follow-through complete and balanced?

Based on your analysis, provide a summary and three specific, actionable tips for improvement.
Format your response using markdown with headings for each section. Be encouraging and constructive.`
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
    });

    return response.text;
  } catch (error) {
    console.error("Error analyzing form with Gemini:", error);
    return "An error occurred during AI analysis. Please try again.";
  }
};
