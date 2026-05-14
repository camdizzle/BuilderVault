export type PatternCategory =
  | "Power Apps"
  | "SharePoint"
  | "Power Automate"
  | "Dataverse"
  | "ALM & Governance"
  | "Power Platform Admin"
  | "Power Pages"
  | "Teams & Adaptive Cards"
  | "PMO / Project Management";

export type PatternPlatform =
  | "Power Apps"
  | "SharePoint"
  | "Power Automate"
  | "Dataverse"
  | "Power Platform"
  | "Power Pages"
  | "Teams"
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
  seoTitle?: string;
  seoDescription?: string;
  searchIntent?: string;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  faqs?: PatternFaq[];
}

export type PatternFaq = {
  question: string;
  answer: string;
};
