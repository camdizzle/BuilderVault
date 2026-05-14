import expansionGroups from "@/data/pattern-expansion-5.json";
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

export const expandedPatterns5: Pattern[] = groups.flatMap((group, groupIndex) =>
  group.actions.flatMap((action, actionIndex) =>
    group.objects.map((object, objectIndex) => {
      const ordinal = groupIndex * 100 + actionIndex * group.objects.length + objectIndex;
      const title = `${action} ${object}`;
      const difficulty = difficultyFor(actionIndex, objectIndex);

      return {
        id: `pat-${String(1001 + ordinal).padStart(4, "0")}`,
        slug: slugify(title),
        title,
        shortDescription: `A practical ${group.subCategory.toLowerCase()} pattern for ${group.category}.`,
        fullDescription: `${title} gives Power Platform builders a reusable implementation pattern with ownership, build guidance, guardrails, and support notes.`,
        category: group.category,
        subCategory: group.subCategory,
        platform: group.platform,
        difficulty,
        tags: buildTags(action, object, group),
        isPremium: (actionIndex + objectIndex) % 4 === 0,
        estimatedTimeSaved: difficulty === "Advanced" ? "2 hours" : difficulty === "Intermediate" ? "1 hour" : "35 minutes",
        problemStatement: `Power Platform teams often need to ${title.toLowerCase()} but lose time inventing structure, ownership, validation, and handoff details from scratch.`,
        whenToUse: [
          `Use when a maker or delivery team needs to ${title.toLowerCase()} in a repeatable way.`,
          "Use when the pattern needs to survive handoff from build to support.",
          "Use when app, flow, data, and governance decisions need to stay aligned."
        ],
        whenNotToUse: [
          "Avoid when the work is a throwaway prototype with no production path.",
          "Avoid when an enterprise standard already provides a required implementation method."
        ],
        formulaOrCode: buildImplementationOutline(group, title),
        stepByStepInstructions: [
          "Confirm the app, flow, data, or admin scenario this pattern supports.",
          "Define owners, source records, required fields, and exception paths.",
          "Build the smallest reusable version before adding optional branches.",
          "Test with realistic records, permissions, and support handoff scenarios."
        ],
        commonMistakes: [
          "Skipping ownership details because the builder still remembers how it works.",
          "Treating environment, permission, and connector assumptions as obvious.",
          "Publishing without a clear support path for failed saves, failed flows, or access issues."
        ],
        troubleshooting: [
          "If users cannot complete the pattern, test permissions and required fields first.",
          "If support teams cannot maintain it, reduce hidden logic and document the source of truth.",
          "If performance is weak, review delegation, connector calls, table design, and trigger scope."
        ],
        relatedPatterns: group.related,
        createdAt: "2026-05-13",
        updatedAt: "2026-05-13"
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

  return [...new Set([group.subCategory, action, group.category, ...objectTags])].slice(0, 5);
}

function buildImplementationOutline(group: ExpansionGroup, title: string) {
  if (group.category === "Dataverse") {
    return `Dataverse implementation outline:\n1. Define the table, columns, relationships, and ownership model for ${title}.\n2. Add security roles and solution-aware configuration.\n3. Validate forms, views, business rules, and automation triggers.\n4. Document migration, support, and environment assumptions.`;
  }

  if (group.category === "ALM & Governance") {
    return `ALM implementation outline:\nSolution scope -> Environment variables -> Connection references -> Build validation -> Managed deployment -> Support handoff -> Rollback notes`;
  }

  if (group.category === "Power Platform Admin") {
    return `Admin implementation outline:\nInventory -> Ownership -> Risk review -> Policy decision -> Communication -> Support queue -> Review cadence`;
  }

  if (group.category === "Power Pages") {
    return `Power Pages implementation outline:\nSite goal -> Dataverse tables -> Table permissions -> Web roles -> Forms/pages -> Validation -> Launch review`;
  }

  if (group.category === "Teams & Adaptive Cards") {
    return `Teams workflow outline:\nTrigger -> Build card payload -> Route to channel or user -> Capture response -> Update source record -> Notify outcome -> Log exceptions`;
  }

  return `Power Platform implementation outline:\nPurpose, owner, data source, controls, automation, permissions, testing, and support notes for ${title}.`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
