import { guideAdditions } from "./resource-additions-guides.ts";
import { standardAdditions } from "./resource-additions-standards.ts";
import { toolAdditions } from "./resource-additions-tools.ts";

/** Extra examples and questions for a resource page, keyed by the resource's slug. */
export type ResourceAddition = {
  examples?: Array<{
    title: string;
    problem: string;
    code: string;
    expectedResult: string;
    commonMistakes: string[];
  }>;
  faqs?: Array<{ question: string; answer: string }>;
};

export const resourceAdditions: Record<string, ResourceAddition> = {
  ...standardAdditions,
  ...guideAdditions,
  ...toolAdditions
};
