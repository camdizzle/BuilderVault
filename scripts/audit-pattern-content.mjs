import { readFileSync } from "node:fs";

const seed = JSON.parse(readFileSync(new URL("../data/patterns.seed.json", import.meta.url), "utf8"));
const weak = seed.filter((pattern) =>
  pattern.shortDescription.length < 35 ||
  pattern.problemStatement.length < 60 ||
  pattern.stepByStepInstructions.length < 3 ||
  pattern.commonMistakes.length < 2
);

if (weak.length === 0) {
  console.log("Seed content audit passed: no weak seed records found.");
} else {
  console.log(`Seed content audit found ${weak.length} records to review:`);
  for (const pattern of weak) {
    console.log(`- ${pattern.id} ${pattern.slug}`);
  }
}
