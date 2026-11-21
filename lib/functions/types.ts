import type { GuideLink, GuideSection } from "../guides/types";

export type FunctionCategory =
  | "Find and sort records"
  | "Shape and summarise tables"
  | "Save and remove data"
  | "Logic, blanks and errors"
  | "Text and dates"
  | "Variables, screens and messages";

export type FunctionPage = {
  /** URL segment under /functions. */
  slug: string;
  /** The function or functions the page covers, as written in a formula. */
  name: string;
  category: FunctionCategory;
  /** Page heading. */
  title: string;
  description: string;
  keywords: string[];
  /** ISO dates. */
  published: string;
  updated: string;
  /** The short answer, shown at the top of the page. Plain text. */
  quickAnswer: string;
  /** Syntax lines, shown in a copyable block. */
  syntax: string;
  /** Rows of [argument, required or optional, what it is]. Supports `code` and **bold**. */
  arguments: string[][];
  /** What the function gives back. Supports `code` and **bold**. */
  returns: string;
  /** Where the function can be used. */
  usableIn: "Any formula" | "Behaviour formulas only";
  /** One line on delegation. Supports `code`, **bold** and links. */
  delegation: string;
  sections: GuideSection[];
  /** Plain text only: these are also published as FAQ structured data. */
  faqs: Array<{ question: string; answer: string }>;
  /** Slugs of other function pages. */
  relatedFunctions: string[];
  /** Guide slugs. */
  relatedGuides: string[];
  /** Error page slugs. */
  relatedErrors: string[];
  /** Pattern slugs. */
  relatedPatterns: string[];
  /** Tool slugs. The function is also listed on each of these tool pages. */
  relatedTools: string[];
  /** Microsoft documentation the page was checked against. */
  sources: GuideLink[];
};

export const categoryIntro: Record<FunctionCategory, string> = {
  "Find and sort records": "Pick out the records you need from a table or data source, put them in order, and take the first or last.",
  "Shape and summarise tables": "Add, keep and group columns, count and total records, and turn tables into text and text into tables.",
  "Save and remove data": "Create, change and delete records in a data source or a collection, with a form or without one.",
  "Logic, blanks and errors": "Choose between results, deal with empty values and errors, and run a formula once or for every record.",
  "Text and dates": "Format numbers and dates as text, and add to or measure the gap between dates and times.",
  "Variables, screens and messages": "Hold values in variables, move between screens, and show the user a message."
};

export const functionCategories = Object.keys(categoryIntro) as FunctionCategory[];

const reference = "https://learn.microsoft.com/en-us/power-platform/power-fx/reference";
/** A page of Microsoft's Power Fx function reference, by its file name without .md. */
export const fxRef = (page: string, label: string): GuideLink => ({ href: `${reference}/${page}`, label });
