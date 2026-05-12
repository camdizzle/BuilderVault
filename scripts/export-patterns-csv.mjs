import { writeFileSync, readFileSync } from "node:fs";

const patterns = JSON.parse(readFileSync(new URL("../data/patterns.seed.json", import.meta.url), "utf8"));
const expansionGroups3 = JSON.parse(readFileSync(new URL("../data/pattern-expansion-3.json", import.meta.url), "utf8"));
const expansionGroups4 = JSON.parse(readFileSync(new URL("../data/pattern-expansion-4.json", import.meta.url), "utf8"));
const expandedSource = readFileSync(new URL("../lib/patterns/expanded-patterns.ts", import.meta.url), "utf8");
const expandedSource2 = readFileSync(new URL("../lib/patterns/expanded-patterns-2.ts", import.meta.url), "utf8");
const expandedRows = [...expandedSource.matchAll(/\{\s*topic: "([^"]+)"[\s\S]*?category: "([^"]+)"[\s\S]*?subCategory: "([^"]+)"[\s\S]*?difficulty: "([^"]+)"[\s\S]*?tags: \[([^\]]*)\][\s\S]*?\}/g)].map((match, index) => ({
  category: match[2],
  difficulty: match[4],
  id: `pat-${String(index + 81).padStart(3, "0")}`,
  isPremium: match[0].includes("premium: true"),
  slug: slugify(match[1]),
  subCategory: match[3],
  tags: [...match[5].matchAll(/"([^"]+)"/g)].map((tagMatch) => tagMatch[1]),
  title: match[1]
}));
const expandedRows2 = [...expandedSource2.matchAll(/\{\s*category: "([^"]+)"[\s\S]*?subCategory: "([^"]+)"[\s\S]*?topics: \[([\s\S]*?)\]\s*\}/g)].flatMap((match, groupIndex) => {
  const topics = [...match[3].matchAll(/"([^"]+)"/g)].map((topicMatch) => topicMatch[1]);

  return topics.map((topic, topicIndex) => ({
    category: match[1],
    difficulty: topicIndex % 5 === 0 ? "Advanced" : topicIndex % 2 === 0 ? "Intermediate" : "Beginner",
    id: `pat-${String(161 + groupIndex * 40 + topicIndex).padStart(3, "0")}`,
    isPremium: topicIndex % 3 === 0,
    slug: slugify(topic),
    subCategory: match[2],
    tags: [match[2]],
    title: topic
  }));
});
const expandedRows3 = expansionGroups3.flatMap((group, groupIndex) =>
  group.actions.flatMap((action, actionIndex) =>
    group.objects.map((object, objectIndex) => {
      const title = `${action} ${object}`;

      return {
        category: group.category,
        difficulty: (actionIndex + objectIndex) % 5 === 0 ? "Advanced" : (actionIndex + objectIndex) % 2 === 0 ? "Intermediate" : "Beginner",
        id: `pat-${String(321 + groupIndex * 80 + actionIndex * group.objects.length + objectIndex).padStart(3, "0")}`,
        isPremium: (actionIndex + objectIndex) % 3 === 0,
        slug: slugify(title),
        subCategory: group.subCategory,
        tags: [group.subCategory, action],
        title
      };
    })
  )
);
const expandedRows4 = expansionGroups4.flatMap((group, groupIndex) =>
  group.actions.flatMap((action, actionIndex) =>
    group.objects.map((object, objectIndex) => {
      const title = `${action} ${object}`;

      return {
        category: group.category,
        difficulty: (actionIndex + objectIndex) % 6 === 0 ? "Advanced" : (actionIndex + objectIndex) % 2 === 0 ? "Intermediate" : "Beginner",
        id: `pat-${String(641 + groupIndex * 90 + actionIndex * group.objects.length + objectIndex).padStart(3, "0")}`,
        isPremium: (actionIndex + objectIndex) % 4 === 0,
        slug: slugify(title),
        subCategory: group.subCategory,
        tags: [group.subCategory, action],
        title
      };
    })
  )
);
const allPatterns = [...patterns, ...expandedRows, ...expandedRows2, ...expandedRows3, ...expandedRows4];
const rows = [
  ["id", "slug", "title", "category", "subCategory", "difficulty", "isPremium", "tags"].join(","),
  ...allPatterns.map((pattern) =>
    [
      pattern.id,
      pattern.slug,
      quote(pattern.title),
      quote(pattern.category),
      quote(pattern.subCategory),
      pattern.difficulty,
      pattern.isPremium,
      quote(pattern.tags.join("|"))
    ].join(",")
  )
];

writeFileSync(new URL("../data/patterns.export.csv", import.meta.url), `${rows.join("\n")}\n`);
console.log(`Exported ${allPatterns.length} patterns to data/patterns.export.csv`);

function quote(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
