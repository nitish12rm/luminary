import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export async function enhanceMoment(params: {
  description: string;
  category: string;
  partner1: string;
  partner2: string;
  date: string;
}): Promise<string> {
  const ai = getGenAI();
  const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const model = ai.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.6,
      topP: 0.9,
      maxOutputTokens: 300,
    },
  });

  const categoryLabels: Record<string, string> = {
    first_meeting: "The day they first met",
    first_conversation: "Their first real conversation",
    first_walk: "Their first walk together",
    knowing_feelings: "When they knew they had feelings for each other",
    proposal: "The proposal to become boyfriend and girlfriend",
    first_kiss: "Their first kiss",
    first_date: "Their first official date",
    first_fight: "Their first fight/disagreement",
    custom: "A special memory",
  };

  const prompt = `You are helping a couple capture a memory in their personal journal. Your job is to gently polish what they wrote — keeping their voice, their words, and their feeling intact. Just make it a little sweeter and cleaner.

Rules:
- Keep the same tone and energy as the original message — if it's playful, keep it playful; if it's soft and tender, keep it that way
- Do NOT make it poetic, dramatic, or Shakespearean — write the way real people talk to each other
- Use second-person plural naturally: "you both", "the two of you" — only where it feels right
- Stay 100% true to the original memory — do not add or invent anything
- Fix grammar and flow only if needed, otherwise leave the phrasing as close to the original as possible
- Length: match the original length, give or take a sentence
- No fancy vocabulary, no metaphors, no literary flair — just warm and real

Partners: ${params.partner1} & ${params.partner2}
Occasion: ${categoryLabels[params.category] || "A special moment"}
Date: ${params.date}
Raw memory: ${params.description}

Write only the polished memory, nothing else:`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  return text;
}
