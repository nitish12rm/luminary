export type ThemeId = "blush" | "golden" | "velvet" | "scrapbook";

export type MomentCategory =
  | "first_meeting"
  | "first_conversation"
  | "first_walk"
  | "knowing_feelings"
  | "proposal"
  | "first_kiss"
  | "first_date"
  | "first_fight"
  | "custom";

export interface ICouple {
  _id: string;
  accessCode: string;
  partner1Name: string;
  partner2Name: string;
  startDate: string;
  theme: ThemeId;
  coverPhotoPath?: string;
  bio?: string;
  createdAt: string;
}

export interface IMoment {
  _id: string;
  coupleId: string;
  category: MomentCategory;
  customLabel?: string;
  date: string;
  rawDescription: string;
  poeticNarrative?: string;
  photoPath?: string;
  photoAlt?: string;
  order: number;
  createdAt: string;
}

export interface MomentDraft {
  id: string;
  category: MomentCategory;
  customLabel?: string;
  date: string;
  rawDescription: string;
  poeticNarrative?: string;
  photoPath?: string;
  photoPreview?: string;
  order: number;
}

export interface CategoryDef {
  id: MomentCategory;
  label: string;
  icon: string;
  prompt: string;
  emoji: string;
}

export interface ThemeDef {
  id: ThemeId;
  name: string;
  tagline: string;
  preview: {
    bg: string;
    card: string;
    accent: string;
    text: string;
    line: string;
  };
}
