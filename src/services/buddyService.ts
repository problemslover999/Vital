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
    return response.text();
  } catch (error) {
    console.error("Critical Buddy Error:", error);
    return "I'm having a bit of trouble connecting to my brain right now, but I'm still cheering for you! Let's stay active!";
  }
}

export async function getMotivationalMessage() {
  try {
    const genAI = getBuddy();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Give me a very short, punchy, 1-sentence motivational health quote in a 'vibrant and bold' style.");
    const response = await result.response;
    return response.text();
  } catch (error) {
    return "Your progress is your power. Stay focused today!";
  }
}

export async function getHealthReport(data: any) {
  try {
    const genAI = getBuddy();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`Analyze this health data briefly: ${JSON.stringify(data)}. Give 3 bullet points of advice.`);
    const response = await result.response;
    return response.text();
  } catch (error) {
    return "Keep maintaining your routines to see long-term results!";
  }
}
