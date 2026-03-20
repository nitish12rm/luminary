import { CategoryDef } from "@/types";

export const CATEGORIES: CategoryDef[] = [
  {
    id: "first_meeting",
    label: "First Meeting",
    icon: "✨",
    emoji: "✨",
    prompt: "How and where did you first meet? What was your first impression?",
  },
  {
    id: "first_conversation",
    label: "First Real Conversation",
    icon: "💬",
    emoji: "💬",
    prompt: "What was your first real conversation like? What did you talk about?",
  },
  {
    id: "first_walk",
    label: "First Walk Together",
    icon: "🌿",
    emoji: "🌿",
    prompt: "Describe your first long walk and talk. Where did you go?",
  },
  {
    id: "knowing_feelings",
    label: "Knowing the Feeling",
    icon: "💕",
    emoji: "💕",
    prompt: "When did you first realize you had feelings for each other?",
  },
  {
    id: "proposal",
    label: "The Proposal",
    icon: "💍",
    emoji: "💍",
    prompt: "How did the question get asked? How did you both feel?",
  },
  {
    id: "first_kiss",
    label: "First Kiss",
    icon: "💋",
    emoji: "💋",
    prompt: "Describe your first kiss. Where were you? How did it feel?",
  },
  {
    id: "first_date",
    label: "First Official Date",
    icon: "🌹",
    emoji: "🌹",
    prompt: "Where did you go on your first date? What made it special?",
  },
  {
    id: "first_fight",
    label: "First Fight",
    icon: "🌧️",
    emoji: "🌧️",
    prompt: "What was your first disagreement about? How did you make up?",
  },
  {
    id: "custom",
    label: "Custom Moment",
    icon: "⭐",
    emoji: "⭐",
    prompt: "Describe this special memory in your own words...",
  },
];

export function getCategoryById(id: string): CategoryDef {
  return (
    CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1]
  );
}
