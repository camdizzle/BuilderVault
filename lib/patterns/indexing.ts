import overrides from "@/data/pattern-index-overrides.json";
import { expandedPatterns3 } from "@/lib/patterns/expanded-patterns-3";
import { expandedPatterns4 } from "@/lib/patterns/expanded-patterns-4";
import { expandedPatterns5 } from "@/lib/patterns/expanded-patterns-5";
import type { Pattern } from "@/types/pattern";

/**
 * Patterns built by combining an action list with an object list (expansion sets 3, 4 and 5)
 * share most of their text. They stay live and linked, but are marked noindex and left out of
 * the sitemap so search engines judge the site on the written patterns.
 *
 * To undo: set this to false. To keep a single page indexed: add its slug to
 * data/pattern-index-overrides.json.
 */
export const NOINDEX_GENERATED_PATTERNS = true;

const generatedSlugs = new Set([...expandedPatterns3, ...expandedPatterns4, ...expandedPatterns5].map((pattern) => pattern.slug));
const keepIndexed = new Set<string>(overrides.keepIndexed);

export function isGeneratedPattern(pattern: Pattern) {
  return generatedSlugs.has(pattern.slug);
}

export function isPatternIndexable(pattern: Pattern) {
  if (!NOINDEX_GENERATED_PATTERNS) return true;
  if (keepIndexed.has(pattern.slug)) return true;
  return !generatedSlugs.has(pattern.slug);
}
