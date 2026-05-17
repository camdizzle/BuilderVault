import patterns from "@/data/patterns.seed.json";
import { expandedPatterns } from "@/lib/patterns/expanded-patterns";
import { expandedPatterns2 } from "@/lib/patterns/expanded-patterns-2";
import { expandedPatterns3 } from "@/lib/patterns/expanded-patterns-3";
import { expandedPatterns4 } from "@/lib/patterns/expanded-patterns-4";
import { expandedPatterns5 } from "@/lib/patterns/expanded-patterns-5";
import type { Pattern, PatternDifficulty, PatternPlatform } from "@/types/pattern";

const allPatterns = [
  ...(patterns as Pattern[]),
  ...expandedPatterns,
  ...expandedPatterns2,
  ...expandedPatterns3,
  ...expandedPatterns4,
  ...expandedPatterns5
].map((pattern) => ({
  ...pattern,
  isPremium: false
}));

const corePatterns = allPatterns.filter((pattern) => pattern.category !== "PMO / Project Management");

export function getAllPatterns(): Pattern[] {
  return corePatterns;
}

export function getInternalPatternArchive(): Pattern[] {
  return allPatterns;
}

export function getPatternBySlug(slug: string): Pattern | undefined {
  return corePatterns.find((pattern) => pattern.slug === slug);
}

export function getRelatedPatterns(pattern: Pattern): Pattern[] {
  return pattern.relatedPatterns
    .map((slug) => getPatternBySlug(slug))
    .filter((related): related is Pattern => Boolean(related))
    .slice(0, 3);
}

export function getPatternsByCategory(category: string): Pattern[] {
  return corePatterns.filter((pattern) => pattern.category === category);
}

export function getPatternsByPlatform(platform: PatternPlatform): Pattern[] {
  return corePatterns.filter((pattern) => pattern.platform.includes(platform));
}

export function getFeaturedPatterns(): Pattern[] {
  const featuredSlugs = [
    "patch-sharepoint-people-picker-power-apps",
    "avoid-delegation-warnings-sharepoint-filters",
    "power-automate-email-html-table",
    "create-a-dataverse-table-naming-standard",
    "build-a-solution-layering-checklist",
    "configure-a-data-loss-prevention-policy-checklist"
  ];

  return featuredSlugs
    .map((slug) => getPatternBySlug(slug))
    .filter((pattern): pattern is Pattern => Boolean(pattern));
}

export function getPatternStats() {
  const platforms = new Set<PatternPlatform>();
  const difficulties = new Set<PatternDifficulty>();
  const categories = new Set<string>();

  for (const pattern of corePatterns) {
    pattern.platform.forEach((platform) => platforms.add(platform));
    difficulties.add(pattern.difficulty);
    categories.add(pattern.category);
  }

  return {
    totalPatterns: corePatterns.length,
    archivedPatterns: allPatterns.length - corePatterns.length,
    freePatterns: corePatterns.filter((pattern) => !pattern.isPremium).length,
    premiumPatterns: corePatterns.filter((pattern) => pattern.isPremium).length,
    platforms: platforms.size,
    difficulties: difficulties.size,
    categories: categories.size
  };
}
