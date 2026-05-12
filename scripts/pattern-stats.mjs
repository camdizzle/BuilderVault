import { readFileSync } from "node:fs";

const seed = JSON.parse(readFileSync(new URL("../data/patterns.seed.json", import.meta.url), "utf8"));
const expansionGroups3 = JSON.parse(readFileSync(new URL("../data/pattern-expansion-3.json", import.meta.url), "utf8"));
const expansionGroups4 = JSON.parse(readFileSync(new URL("../data/pattern-expansion-4.json", import.meta.url), "utf8"));
const expandedSource = readFileSync(new URL("../lib/patterns/expanded-patterns.ts", import.meta.url), "utf8");
const expandedSource2 = readFileSync(new URL("../lib/patterns/expanded-patterns-2.ts", import.meta.url), "utf8");
const expandedTopics = [...expandedSource.matchAll(/topic: "([^"]+)"/g)].map((match) => match[1]);
const expandedCategories = [...expandedSource.matchAll(/category: "([^"]+)"/g)].map((match) => match[1]);
const expandedTopics2 = [...expandedSource2.matchAll(/topics: \[([\s\S]*?)\]\s*\}/g)].flatMap((match) => [...match[1].matchAll(/"([^"]+)"/g)].map((topicMatch) => topicMatch[1]));
const expandedCategories2 = [...expandedSource2.matchAll(/\{\s*category: "([^"]+)"/g)].flatMap((match) => Array(40).fill(match[1]));
const categories = new Map();

for (const pattern of seed) {
  categories.set(pattern.category, (categories.get(pattern.category) ?? 0) + 1);
}

for (const category of expandedCategories) {
  categories.set(category, (categories.get(category) ?? 0) + 1);
}

for (const category of expandedCategories2) {
  categories.set(category, (categories.get(category) ?? 0) + 1);
}

const expandedTopics3 = expansionGroups3.flatMap((group) =>
  group.actions.flatMap((action) => group.objects.map((object) => `${action} ${object}`))
);

for (const group of expansionGroups3) {
  categories.set(group.category, (categories.get(group.category) ?? 0) + group.actions.length * group.objects.length);
}

const expandedTopics4 = expansionGroups4.flatMap((group) =>
  group.actions.flatMap((action) => group.objects.map((object) => `${action} ${object}`))
);

for (const group of expansionGroups4) {
  categories.set(group.category, (categories.get(group.category) ?? 0) + group.actions.length * group.objects.length);
}

console.log(`Total patterns: ${seed.length + expandedTopics.length + expandedTopics2.length + expandedTopics3.length + expandedTopics4.length}`);
for (const [category, count] of [...categories.entries()].sort()) {
  console.log(`${category}: ${count}`);
}
