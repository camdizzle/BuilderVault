export type PatternCategory =
  | "Power Apps"
  | "SharePoint"
  | "Power Automate"
  | "PMO / Project Management";

export type PatternPlatform =
  | "Power Apps"
  | "SharePoint"
  | "Power Automate"
  | "Microsoft 365"
  | "PMO";

export type PatternDifficulty = "Beginner" | "Intermediate" | "Advanced";

export interface Pattern {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: PatternCategory;
  subCategory: string;
  platform: PatternPlatform[];
  difficulty: PatternDifficulty;
  tags: string[];
  isPremium: boolean;
  estimatedTimeSaved: string;
  problemStatement: string;
  whenToUse: string[];
  whenNotToUse: string[];
  formulaOrCode: string;
  stepByStepInstructions: string[];
  commonMistakes: string[];
  troubleshooting: string[];
  relatedPatterns: string[];
  createdAt: string;
  updatedAt: string;
}
