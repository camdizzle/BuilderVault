export type GuideBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "code"; code: string; label?: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "tool"; slug: string; text: string }
  | { type: "note"; text: string };

export type GuideSection = {
  /** Anchor id, used by the "On this page" list. */
  id: string;
  heading: string;
  blocks: GuideBlock[];
};

export type GuideLink = { href: string; label: string };

export type Guide = {
  slug: string;
  title: string;
  /** Shorter title for cards and link lists. */
  shortTitle: string;
  description: string;
  eyebrow: string;
  keywords: string[];
  /** ISO dates. */
  published: string;
  updated: string;
  /** The short answer, shown at the top of the article. Plain text. */
  quickAnswer: string;
  sections: GuideSection[];
  /** Plain text only: these are also published as FAQ structured data. */
  faqs: Array<{ question: string; answer: string }>;
  /** Tool slugs. The guide is also listed on each of these tool pages. */
  relatedTools: string[];
  /** Pattern slugs. */
  relatedPatterns: string[];
  relatedLinks: GuideLink[];
  /** Microsoft documentation the article was checked against. */
  sources: GuideLink[];
};

/*
 * Small builders that keep the article files readable.
 * Text in p, list, table, tool and note blocks supports `code`, **bold** and [label](/path) links.
 */
export const p = (text: string): GuideBlock => ({ type: "p", text });
export const ul = (...items: string[]): GuideBlock => ({ type: "list", items });
export const ol = (...items: string[]): GuideBlock => ({ type: "list", items, ordered: true });
export const code = (source: string, label?: string): GuideBlock => ({ type: "code", code: source, label });
export const table = (headers: string[], ...rows: string[][]): GuideBlock => ({ type: "table", headers, rows });
export const tool = (slug: string, text: string): GuideBlock => ({ type: "tool", slug, text });
export const note = (text: string): GuideBlock => ({ type: "note", text });
export const section = (id: string, heading: string, ...blocks: GuideBlock[]): GuideSection => ({ id, heading, blocks });

const learn = "https://learn.microsoft.com/en-us";
export const canvasDoc = (page: string, label: string): GuideLink => ({ href: `${learn}/power-apps/maker/canvas-apps/${page}`, label });
export const powerFxDoc = (page: string, label: string): GuideLink => ({ href: `${learn}/power-platform/power-fx/${page}`, label });
export const automateDoc = (page: string, label: string): GuideLink => ({ href: `${learn}/power-automate/${page}`, label });
export const learnDoc = (path: string, label: string): GuideLink => ({ href: `${learn}/${path}`, label });
