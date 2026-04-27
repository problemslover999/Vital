import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

let buddyClient: GoogleGenAI | null = null;

function getBuddy() {
  if (!buddyClient) {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined");
    }
    buddyClient = new GoogleGenAI({ apiKey });
  }
  return buddyClient;
}

export async function getMotivationalMessage(userName: string = "friend") {
  const messages = [
    `Every step forward is a victory, ${userName}. Keep going!`,
    `Your progress is your power, ${userName}. Stay focused today!`,
    `Discipline is the bridge between goals and accomplishment.`,
    `Small daily improvements are the key to long-term results.`,
    `Hydrate, recover, and dominate your missions today!`,
    `The only bad workout is the one that didn't happen.`,
    `Success isn't always about greatness. It's about consistency.`,
    `You are stronger than you think. Build that momentum!`,
    `Wake up with determination. Go to bed with satisfaction.`,
    `Your future self will thank you for the work you do today.`
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

export async function chatWithBuddy(messages: { role: 'user' | 'model', content: string }[]) {
  try {
    const buddy = getBuddy();
    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
    
    const lastMessage = messages[messages.length - 1].content;

    const response = await buddy.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        ...history,
        { role: 'user', parts: [{ text: lastMessage }] }
      ],
      config: {
        systemInstruction: "You are 'Vital Buddy', a supportive, knowledgeable, and slightly playful health assistant. Your goal is to help users track their routines, motivate them, and provide simple, actionable health advice. Be encouraging and never judgmental. Keep responses concise and friendly. Refuse to discuss non-health topics.",
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
  // completionStats is like "Mon: 80%, Tue: 100%..."
  // We can do some basic parsing or just provide a generic smart-sounding message based on recent average
  const rates = completionStats.match(/\d+/g);
  if (!rates || rates.length === 0) return "Start your routines to generate your first health report!";
  
  const avg = rates.reduce((sum, val) => sum + parseInt(val), 0) / rates.length;
  
  if (avg >= 90) {
    return `Phenomenal consistency! You're averaging ${Math.round(avg)}% completion. Your discipline is building iron-clad habits. Recommendation: Increase the difficulty of one routine to keep challenging your baseline.`;
  } else if (avg >= 70) {
    return `Solid effort! At ${Math.round(avg)}% completion, you're maintaining a healthy momentum. You're successfully balancing life and health. Recommendation: Try to clear your schedule for a 'perfect day' mid-week to boost your average.`;
  } else if (avg >= 50) {
    return `You're in the game! ${Math.round(avg)}% completion shows you're making an effort despite challenges. Consistency is key now. Recommendation: Prioritize your 'Mental' missions to stay motivated during this building phase.`;
  } else {
    return `Building habits takes time. You're currently at ${Math.round(avg)}%. Every small win counts. Recommendation: Focus on completing just TWO missions perfectly tomorrow to reset your momentum.`;
  }
}
