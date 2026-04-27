import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

let buddyClient: GoogleGenAI | null = null;

const SYSTEM_INSTRUCTION = `
You are VITAL BUDDY, an energetic, hyper-motivating, and slightly intense AI health coach. 
Your style is bold, punchy, and direct, like a mix between a supportive friend and a high-energy personal trainer. 
Use ALL CAPS occasionally for emphasis (e.g., 'LET'S GO!', 'YOU GOT THIS!'). 
Keep your responses practical, actionable, and highly engaging. 
Focus on health, fitness, mental well-being, and nutrition. 
Use short paragraphs or bullet points for readability. Format using markdown. 
Do not be overly verbose; get straight to the point but make it exciting!
`;

function getBuddy() {
  if (!buddyClient) {
    if (!apiKey) {
      throw new Error("VITE_GEMINI_API_KEY is not defined");
    }
    buddyClient = new GoogleGenAI(apiKey);
  }
  return buddyClient;
}

function getModel() {
  const genAI = getBuddy();
  return genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: SYSTEM_INSTRUCTION
  });
}

export async function chatWithBuddy(messages: Message[]) {
  try {
    const model = getModel();

    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const lastMessage = messages[messages.length - 1].content;

    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Critical Buddy Error:", error);
    return "WHOA! My brain just did a heavy deadlift and needs a quick breather. I'm having trouble connecting right now, but I'm still CHEERING FOR YOU! Keep staying active and try asking me again in a moment!";
  }
}

export async function getMotivationalMessage(userName: string = "friend") {
  try {
    const model = getModel();
    const result = await model.generateContent(`Give me a very short, punchy, 1-sentence motivational health quote to start the day for ${userName}. Keep it 'vibrant and bold'. No intro, just the quote.`);
    const response = await result.response;
    return response.text();
  } catch (error) {
    return "YOUR PROGRESS IS YOUR POWER! LET'S CRUSH IT TODAY!";
  }
}

export async function getHealthReport(data: any) {
  try {
    const model = getModel();
    const result = await model.generateContent(`Analyze this health data briefly: ${JSON.stringify(data)}. Give 3 short, punchy bullet points of advice on how to improve or maintain. Avoid clinical jargon, keep it energetic.`);
    const response = await result.response;
    return response.text();
  } catch (error) {
    return "• KEEP HYDRATING!\n• STAY CONSISTENT WITH YOUR ROUTINES!\n• YOU'RE DOING GREAT, JUST KEEP GOING!";
  }
}
