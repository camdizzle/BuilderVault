import expansionGroups from "@/data/pattern-expansion-4.json";
import { buildImplementationSnippet, buildStepInstructions } from "@/lib/patterns/implementation";
import type { Pattern, PatternCategory, PatternDifficulty, PatternPlatform } from "@/types/pattern";

type ExpansionGroup = {
  actions: string[];
  category: PatternCategory;
  objects: string[];
  platform: PatternPlatform[];
  related: string[];
  subCategory: string;
};

const groups = expansionGroups as ExpansionGroup[];

export const expandedPatterns4: Pattern[] = groups.flatMap((group, groupIndex) =>
  group.actions.flatMap((action, actionIndex) =>
    group.objects.map((object, objectIndex) => {
      const ordinal = groupIndex * 90 + actionIndex * group.objects.length + objectIndex;
      const title = `${action} ${object}`;
      const difficulty = difficultyFor(actionIndex, objectIndex);

      return {
        id: `pat-${String(641 + ordinal).padStart(3, "0")}`,
        slug: slugify(title),
        title,
        shortDescription: `A practical ${group.subCategory.toLowerCase()} pattern for ${group.category}.`,
        fullDescription: `${title} helps teams move from ad hoc execution to a repeatable BuilderVault-ready pattern with clear ownership, implementation steps, and support notes.`,
        category: group.category,
        subCategory: group.subCategory,
        platform: group.platform,
        difficulty,
        tags: buildTags(action, object, group),
        isPremium: (actionIndex + objectIndex) % 4 === 0,
        estimatedTimeSaved: difficulty === "Advanced" ? "2 hours" : difficulty === "Intermediate" ? "1 hour" : "35 minutes",
        problemStatement: `Teams often need to ${title.toLowerCase()} but do not have a clean starting structure, which leads to inconsistent delivery and avoidable rework.`,
        whenToUse: [
          `Use when the organization needs to ${title.toLowerCase()} in a repeatable way.`,
          "Use when business owners, makers, and support teams need the same shared operating picture.",
          "Use when the pattern should support search, reporting, ownership, and future handoff."
        ],
        whenNotToUse: [
          "Avoid when the need is a one-time task with no reuse value.",
          "Avoid when a regulated or enterprise-controlled process already defines the approved method."
        ],
        formulaOrCode: buildImplementationSnippet({ category: group.category, platform: group.platform, subCategory: group.subCategory, title }),
        stepByStepInstructions: buildStepInstructions({ category: group.category, platform: group.platform, subCategory: group.subCategory, title }),
        commonMistakes: [
          "Publishing the pattern before the owner and support path are known.",
          "Using broad free-text notes when structured values are needed for reporting.",
          "Forgetting to include what happens when the normal path fails."
        ],
        troubleshooting: [
          "If the pattern is hard to maintain, reduce optional paths and document the source of truth.",
          "If search traffic is the goal, ensure the page title, H1, summary, and visible content all use the same practical problem wording."
        ],
        relatedPatterns: group.related,
        createdAt: "2026-05-11",
        updatedAt: "2026-05-11"
      };
    })
  )
);

function difficultyFor(actionIndex: number, objectIndex: number): PatternDifficulty {
  if ((actionIndex + objectIndex) % 6 === 0) {
    return "Advanced";
  }

  if ((actionIndex + objectIndex) % 2 === 0) {
    return "Intermediate";
  }

  return "Beginner";
}

function buildTags(action: string, object: string, group: ExpansionGroup) {
  const objectTags = object
    .split(" ")
    .filter((word) => word.length > 5)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase() + word.slice(1));

  return [...new Set([group.subCategory, action, ...objectTags])].slice(0, 4);
}


function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
