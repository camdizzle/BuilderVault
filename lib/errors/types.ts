import type { GuideBlock, GuideLink } from "../guides/types";

export type ErrorProduct = "Power Automate" | "Power Apps" | "Solution import" | "Connections and sign-in" | "Desktop flows" | "Power Pages";

export type ErrorPage = {
  slug: string;
  product: ErrorProduct;
  /** The error text as it appears on screen. Shown in a copyable block. */
  message: string;
  /** Page heading. */
  title: string;
  /** Shorter title for cards and link lists. */
  shortTitle: string;
  description: string;
  keywords: string[];
  /** ISO dates. */
  published: string;
  updated: string;
  /** The short answer, shown at the top of the page. Plain text. */
  quickAnswer: string;
  /** Other wordings of the same error. Plain text. */
  variants: string[];
  meaning: GuideBlock[];
  causes: GuideBlock[];
  fixes: GuideBlock[];
  prevention: GuideBlock[];
  /** Plain text only: these are also published as FAQ structured data. */
  faqs: Array<{ question: string; answer: string }>;
  /** Tool slugs. The error is also listed on each of these tool pages. */
  relatedTools: string[];
  /** Pattern slugs. */
  relatedPatterns: string[];
  relatedLinks: GuideLink[];
  /** Slugs of other error pages. */
  relatedErrors: string[];
  /** Microsoft documentation the page was checked against. */
  sources: GuideLink[];
};

export const errorSections = [
  { id: "meaning", heading: "What it means", key: "meaning" },
  { id: "causes", heading: "Causes, most likely first", key: "causes" },
  { id: "fix", heading: "How to fix it", key: "fixes" },
  { id: "prevent", heading: "How to stop it coming back", key: "prevention" }
] as const;
