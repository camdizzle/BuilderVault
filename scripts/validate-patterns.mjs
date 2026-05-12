import { readFileSync } from "node:fs";

const patterns = JSON.parse(readFileSync(new URL("../data/patterns.seed.json", import.meta.url), "utf8"));
const expansionGroups3 = JSON.parse(readFileSync(new URL("../data/pattern-expansion-3.json", import.meta.url), "utf8"));
const expansionGroups4 = JSON.parse(readFileSync(new URL("../data/pattern-expansion-4.json", import.meta.url), "utf8"));
const expandedSource = readFileSync(new URL("../lib/patterns/expanded-patterns.ts", import.meta.url), "utf8");
const expandedSource2 = readFileSync(new URL("../lib/patterns/expanded-patterns-2.ts", import.meta.url), "utf8");
const collectionsSource = readFileSync(new URL("../lib/patterns/collections.ts", import.meta.url), "utf8");
const expandedSpecs = [...expandedSource.matchAll(/\{\s*topic: "([^"]+)"[\s\S]*?related: \[([^\]]*)\][\s\S]*?\}/g)].map((match, index) => ({
  id: `pat-${String(index + 81).padStart(3, "0")}`,
  slug: slugify(match[1]),
  relatedPatterns: [...match[2].matchAll(/"([^"]+)"/g)].map((relatedMatch) => relatedMatch[1])
}));
const expandedSpecs2 = [...expandedSource2.matchAll(/\{\s*category: "([^"]+)"[\s\S]*?related: \[([^\]]*)\][\s\S]*?topics: \[([\s\S]*?)\]\s*\}/g)].flatMap((match, groupIndex) => {
  const relatedPatterns = [...match[2].matchAll(/"([^"]+)"/g)].map((relatedMatch) => relatedMatch[1]);
  const topics = [...match[3].matchAll(/"([^"]+)"/g)].map((topicMatch) => topicMatch[1]);

  return topics.map((topic, topicIndex) => ({
    id: `pat-${String(161 + groupIndex * 40 + topicIndex).padStart(3, "0")}`,
    relatedPatterns,
    slug: slugify(topic)
  }));
});
const expandedSpecs3 = expansionGroups3.flatMap((group, groupIndex) =>
  group.actions.flatMap((action, actionIndex) =>
    group.objects.map((object, objectIndex) => ({
      id: `pat-${String(321 + groupIndex * 80 + actionIndex * group.objects.length + objectIndex).padStart(3, "0")}`,
      relatedPatterns: group.related,
      slug: slugify(`${action} ${object}`)
    }))
  )
);
const expandedSpecs4 = expansionGroups4.flatMap((group, groupIndex) =>
  group.actions.flatMap((action, actionIndex) =>
    group.objects.map((object, objectIndex) => ({
      id: `pat-${String(641 + groupIndex * 90 + actionIndex * group.objects.length + objectIndex).padStart(3, "0")}`,
      relatedPatterns: group.related,
      slug: slugify(`${action} ${object}`)
    }))
  )
);
const allPatternRecords = [
  ...patterns,
  ...expandedSpecs,
  ...expandedSpecs2,
  ...expandedSpecs3,
  ...expandedSpecs4
];

const requiredFields = [
  "id",
  "slug",
  "title",
  "shortDescription",
  "fullDescription",
  "category",
  "subCategory",
  "platform",
  "difficulty",
  "tags",
  "isPremium",
  "estimatedTimeSaved",
  "problemStatement",
  "whenToUse",
  "whenNotToUse",
  "formulaOrCode",
  "stepByStepInstructions",
  "commonMistakes",
  "troubleshooting",
  "relatedPatterns",
  "createdAt",
  "updatedAt"
];

const allowedCategories = new Set([
  "Power Apps",
  "SharePoint",
  "Power Automate",
  "PMO / Project Management"
]);
const allowedDifficulties = new Set(["Beginner", "Intermediate", "Advanced"]);
const allowedPlatforms = new Set([
  "Power Apps",
  "SharePoint",
  "Power Automate",
  "Microsoft 365",
  "PMO"
]);

const errors = [];
const ids = new Set();
const slugs = new Set();

for (const pattern of patterns) {
  for (const field of requiredFields) {
    if (!(field in pattern)) {
      errors.push(`${pattern.id ?? "unknown"} is missing ${field}`);
    }
  }

  if (ids.has(pattern.id)) {
    errors.push(`Duplicate id: ${pattern.id}`);
  }
  ids.add(pattern.id);

  if (slugs.has(pattern.slug)) {
    errors.push(`Duplicate slug: ${pattern.slug}`);
  }
  slugs.add(pattern.slug);

  if (!allowedCategories.has(pattern.category)) {
    errors.push(`${pattern.slug} has unsupported category: ${pattern.category}`);
  }

  if (!allowedDifficulties.has(pattern.difficulty)) {
    errors.push(`${pattern.slug} has unsupported difficulty: ${pattern.difficulty}`);
  }

  if (!Array.isArray(pattern.platform) || pattern.platform.length === 0) {
    errors.push(`${pattern.slug} must have at least one platform`);
  } else {
    for (const platform of pattern.platform) {
      if (!allowedPlatforms.has(platform)) {
        errors.push(`${pattern.slug} has unsupported platform: ${platform}`);
      }
    }
  }

  for (const field of [
    "tags",
    "whenToUse",
    "whenNotToUse",
    "stepByStepInstructions",
    "commonMistakes",
    "troubleshooting",
    "relatedPatterns"
  ]) {
    if (!Array.isArray(pattern[field])) {
      errors.push(`${pattern.slug} ${field} must be an array`);
    }
  }
}

for (const pattern of [...expandedSpecs, ...expandedSpecs2, ...expandedSpecs3, ...expandedSpecs4]) {
  if (ids.has(pattern.id)) {
    errors.push(`Duplicate id: ${pattern.id}`);
  }
  ids.add(pattern.id);

  if (slugs.has(pattern.slug)) {
    errors.push(`Duplicate slug: ${pattern.slug}`);
  }
  slugs.add(pattern.slug);
}

for (const pattern of allPatternRecords) {
  for (const relatedSlug of pattern.relatedPatterns ?? []) {
    if (!slugs.has(relatedSlug)) {
      errors.push(`${pattern.slug} has missing related pattern: ${relatedSlug}`);
    }
  }
}

const collectionPatternSlugs = [...collectionsSource.matchAll(/patternSlugs:\s*\[([\s\S]*?)\]/g)].flatMap((match) =>
  [...match[1].matchAll(/"([^"]+)"/g)].map((slugMatch) => slugMatch[1])
);

for (const match of collectionsSource.matchAll(/slug:\s*"([^"]+)"[\s\S]*?patternSlugs:\s*\[([\s\S]*?)\]/g)) {
  const collectionSlug = match[1];
  const seenCollectionSlugs = new Set();
  const slugsInCollection = [...match[2].matchAll(/"([^"]+)"/g)].map((slugMatch) => slugMatch[1]);

  for (const patternSlug of slugsInCollection) {
    if (seenCollectionSlugs.has(patternSlug)) {
      errors.push(`${collectionSlug} has duplicate collection pattern: ${patternSlug}`);
    }
    seenCollectionSlugs.add(patternSlug);
  }
}

for (const collectionSlug of collectionPatternSlugs) {
  if (!slugs.has(collectionSlug)) {
    errors.push(`Collection references missing pattern: ${collectionSlug}`);
  }
}

if (errors.length > 0) {
  console.error(`Pattern validation failed with ${errors.length} issue(s):`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

const premium =
  patterns.filter((pattern) => pattern.isPremium).length +
  (expandedSource.match(/premium: true/g) ?? []).length +
  expandedSpecs2.filter((_, index) => index % 40 % 3 === 0).length +
  expandedSpecs3.filter((_, index) => {
    const withinGroup = index % 80;
    const actionIndex = Math.floor(withinGroup / 8);
    const objectIndex = withinGroup % 8;
    return (actionIndex + objectIndex) % 3 === 0;
  }).length +
  expandedSpecs4.filter((_, index) => {
    const withinGroup = index % 90;
    const actionIndex = Math.floor(withinGroup / 10);
    const objectIndex = withinGroup % 10;
    return (actionIndex + objectIndex) % 4 === 0;
  }).length;
console.log(`Pattern validation passed: ${allPatternRecords.length} patterns, ${premium} premium, ${allPatternRecords.length - premium} free.`);

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
