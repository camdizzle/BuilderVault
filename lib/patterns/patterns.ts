import patterns from "@/data/patterns.seed.json";
import { expandedPatterns } from "@/lib/patterns/expanded-patterns";
import { expandedPatterns2 } from "@/lib/patterns/expanded-patterns-2";
import { expandedPatterns3 } from "@/lib/patterns/expanded-patterns-3";
import { expandedPatterns4 } from "@/lib/patterns/expanded-patterns-4";
import type { Pattern, PatternDifficulty, PatternPlatform } from "@/types/pattern";

const typedPatterns = [
  ...(patterns as Pattern[]),
  ...expandedPatterns,
  ...expandedPatterns2,
  ...expandedPatterns3,
  ...expandedPatterns4
];

export function getAllPatterns(): Pattern[] {
  return typedPatterns;
}

export function getPatternBySlug(slug: string): Pattern | undefined {
  return typedPatterns.find((pattern) => pattern.slug === slug);
}

export function getRelatedPatterns(pattern: Pattern): Pattern[] {
  return pattern.relatedPatterns
    .map((slug) => getPatternBySlug(slug))
    .filter((related): related is Pattern => Boolean(related))
    .slice(0, 3);
}

export function getFeaturedPatterns(): Pattern[] {
  const featuredSlugs = [
    "patch-sharepoint-people-picker-power-apps",
    "avoid-delegation-warnings-sharepoint-filters",
    "power-automate-email-html-table",
    "build-pmo-gate-approval-lifecycle"
  ];

  return featuredSlugs
    .map((slug) => getPatternBySlug(slug))
    .filter((pattern): pattern is Pattern => Boolean(pattern));
}

export function getPatternStats() {
  const platforms = new Set<PatternPlatform>();
  const difficulties = new Set<PatternDifficulty>();
  const categories = new Set<string>();

  for (const pattern of typedPatterns) {
    pattern.platform.forEach((platform) => platforms.add(platform));
    difficulties.add(pattern.difficulty);
    categories.add(pattern.category);
  }

  return {
    totalPatterns: typedPatterns.length,
    freePatterns: typedPatterns.filter((pattern) => !pattern.isPremium).length,
    premiumPatterns: typedPatterns.filter((pattern) => pattern.isPremium).length,
    platforms: platforms.size,
    difficulties: difficulties.size,
    categories: categories.size
  };
}
