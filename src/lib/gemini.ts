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
  const model = ai.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.85,
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

  const prompt = `You are a romantic storyteller writing intimate, literary vignettes for a couple's personal journal.
Transform this raw memory into a beautifully written, poetic narrative (3–4 sentences).

Rules:
- Write in second-person plural: "you both", "the two of you", "together you"
- Use sensory, evocative language — what was seen, felt, heard
- Stay true to the original memory — do not invent facts
- Tone: warm, intimate, literary — timeless and tender
- Avoid clichés like "butterflies in stomach", "love at first sight", "heart skipped a beat"
- Length: exactly 3–4 sentences, no more, no less
- Do NOT use the word "timeless" or "journey"

Partners: ${params.partner1} & ${params.partner2}
Occasion: ${categoryLabels[params.category] || "A special moment"}
Date: ${params.date}
Raw memory: ${params.description}

Write only the narrative, nothing else:`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  return text;
}
