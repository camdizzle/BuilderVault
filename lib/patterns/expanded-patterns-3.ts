import expansionGroups from "@/data/pattern-expansion-3.json";
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
        formulaOrCode: buildImplementationOutline(group, title),
        stepByStepInstructions: [
          "Define the business owner and success criteria.",
          "Create the required fields, views, controls, workflow steps, or template sections.",
          "Test the normal path, exception path, and ownership handoff.",
          "Document support notes and review cadence before launch."
        ],
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

function buildImplementationOutline(group: ExpansionGroup, title: string) {
  if (group.category === "Power Apps") {
    return `// ${title}\nSet(varWorking, true);\n/* Configure controls, validation, Patch calls, and user feedback */\nSet(varWorking, false);`;
  }

  if (group.category === "Power Automate") {
    return `Flow outline:\nTrigger -> Validate inputs -> Execute ${title.toLowerCase()} -> Update source record -> Notify owner -> Log result`;
  }

  if (group.category === "SharePoint") {
    return `Design outline:\nPurpose, owner, columns, views, permissions, review cadence, support notes`;
  }

  return `PMO template:\nPurpose, owner, decision needed, current status, risks, actions, due date, follow-up cadence`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
