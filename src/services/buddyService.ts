import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

let buddyClient: GoogleGenAI | null = null;

function getBuddy() {
  if (!buddyClient) {
    if (!apiKey) {
      throw new Error("VITE_GEMINI_API_KEY is not defined");
    }
    buddyClient = new GoogleGenAI(apiKey);
  }
  return buddyClient;
}

export async function chatWithBuddy(messages: Message[]) {
  try {
    const genAI = getBuddy();
    // Using gemini-1.5-flash with the stable SDK pattern
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const lastMessage = messages[messages.length - 1].content;

    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    return text || "I'm here to support you! Let's work on your health goals together.";
  } catch (error) {
    console.error("Critical Buddy Error:", error);
    // Return a more descriptive error in development, fallback in production
    return "I'm having a bit of trouble connecting to my brain right now, but I'm still cheering for you! Let's stay active!";
  }
}
