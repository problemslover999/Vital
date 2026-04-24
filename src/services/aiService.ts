import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

let aiClient: GoogleGenAI | null = null;

function getAI() {
  if (!aiClient) {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export async function getMotivationalMessage(userName: string = "friend") {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a short, powerful, and unique motivational message for someone starting their health and wellness journey today. Address them as ${userName}. Keep it under 20 words.`,
      config: {
        temperature: 0.8,
      },
    });
    return response.text || "Every step forward is a victory. Keep going!";
  } catch (error) {
    console.error("Error fetching motivational message:", error);
    return "Your progress is your power. Stay focused today!";
  }
}

export async function chatWithBuddy(messages: { role: 'user' | 'model', content: string }[]) {
  try {
    const ai = getAI();
    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));
    
    const lastMessage = messages[messages.length - 1].content;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: 'user', parts: [{ text: lastMessage }] }
      ],
      config: {
        systemInstruction: "You are 'Vital Buddy', a supportive, knowledgeable, and slightly playful AI health assistant. Your goal is to help users track their routines, motivate them, and provide simple, actionable health advice. Be encouraging and never judgmental. Keep responses concise and friendly.",
        temperature: 0.7,
      }
    });

    return response.text || "I'm here to support you! Let's work on your health goals together.";
  } catch (error) {
    console.error("Error chatting with buddy:", error);
    return "I'm having a bit of trouble connecting, but I'm still cheering for you! Let's stay active!";
  }
}

export async function getHealthReport(completionStats: string) {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on these routine completion statistics for the week: ${completionStats}. Provide a brief (2-3 sentences) insight report and one specific suggestion for improvement. Be positive.`,
      config: {
        temperature: 0.7,
      }
    });
    return response.text || "You're doing great! Keep up the consistency.";
  } catch (error) {
    console.error("Error generating report:", error);
    return "Continue your journey with consistency. You're building great habits!";
  }
}
