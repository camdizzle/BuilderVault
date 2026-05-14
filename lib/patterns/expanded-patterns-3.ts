import expansionGroups from "@/data/pattern-expansion-3.json";
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

export const expandedPatterns3: Pattern[] = groups.flatMap((group, groupIndex) =>
  group.actions.flatMap((action, actionIndex) =>
    group.objects.map((object, objectIndex) => {
      const ordinal = groupIndex * 80 + actionIndex * group.objects.length + objectIndex;
      const title = `${action} ${object}`;
      const difficulty = difficultyFor(actionIndex, objectIndex);

      return {
        id: `pat-${String(321 + ordinal).padStart(3, "0")}`,
        slug: slugify(title),
        title,
        shortDescription: `A practical ${group.subCategory.toLowerCase()} pattern for ${group.category}.`,
        fullDescription: `${title} gives teams a repeatable, business-readable pattern with implementation guidance, review notes, and support considerations.`,
        category: group.category,
        subCategory: group.subCategory,
        platform: group.platform,
        difficulty,
        tags: buildTags(action, object, group),
        isPremium: (actionIndex + objectIndex) % 3 === 0,
        estimatedTimeSaved: difficulty === "Advanced" ? "1.5 hours" : difficulty === "Intermediate" ? "55 minutes" : "30 minutes",
        problemStatement: `Teams often need to ${title.toLowerCase()} but lose time recreating the structure, fields, decisions, and support notes from scratch.`,
        whenToUse: [
          `Use when the organization needs to ${title.toLowerCase()} as part of a repeatable process.`,
          "Use when the solution should be understandable by both builders and business owners.",
          "Use when consistency, supportability, and governance matter more than a one-off workaround."
        ],
        whenNotToUse: [
          "Avoid when the workflow is temporary and does not need reusable structure.",
          "Avoid when an existing enterprise system already governs the process end to end."
        ],
        formulaOrCode: buildImplementationSnippet({ category: group.category, platform: group.platform, subCategory: group.subCategory, title }),
        stepByStepInstructions: buildStepInstructions({ category: group.category, platform: group.platform, subCategory: group.subCategory, title }),
        commonMistakes: [
          "Starting with automation before the business rule is agreed.",
          "Using unstructured notes where structured fields are needed for reporting.",
          "Skipping the exception path until users find it in production."
        ],
        troubleshooting: [
          "If reporting is weak, identify which values need to become structured fields.",
          "If adoption is weak, simplify the next action and remove unnecessary choices."
        ],
        relatedPatterns: group.related,
        createdAt: "2026-05-10",
        updatedAt: "2026-05-10"
      };
    })
  )
);

function difficultyFor(actionIndex: number, objectIndex: number): PatternDifficulty {
  if ((actionIndex + objectIndex) % 5 === 0) {
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
    .filter((word) => word.length > 4)
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
