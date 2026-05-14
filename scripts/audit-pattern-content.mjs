import { readFileSync } from "node:fs";

const seed = JSON.parse(readFileSync(new URL("../data/patterns.seed.json", import.meta.url), "utf8"));
const generatedSources = [
  "expanded-patterns.ts",
  "expanded-patterns-2.ts",
  "expanded-patterns-3.ts",
  "expanded-patterns-4.ts",
  "expanded-patterns-5.ts"
].map((file) => ({
  file,
  source: readFileSync(new URL(`../lib/patterns/${file}`, import.meta.url), "utf8")
}));

const forbidden = [
  /TODO/i,
  /TBD/i,
  /placeholder/i,
  /add .* here/i,
  /implementation here/i,
  /configure controls/i,
  /\/\*.*implementation.*\*\//i
];
const errors = [];

for (const pattern of seed) {
  const formula = String(pattern.formulaOrCode ?? "").trim();
  const steps = pattern.stepByStepInstructions ?? [];

  if (formula.length < 80) {
    errors.push(`${pattern.slug} has a weak formula/code block`);
  }

  if (steps.length < 3 || steps.some((step) => String(step).trim().length < 18)) {
    errors.push(`${pattern.slug} has weak step-by-step instructions`);
  }

  for (const rule of forbidden) {
    if (rule.test(formula)) {
      errors.push(`${pattern.slug} contains placeholder formula text: ${rule}`);
    }
  }
}

for (const { file, source } of generatedSources) {
  if (!source.includes("buildImplementationSnippet")) {
    errors.push(`${file} does not use buildImplementationSnippet`);
  }

  if (!source.includes("buildStepInstructions")) {
    errors.push(`${file} does not use buildStepInstructions`);
  }

  for (const rule of forbidden) {
    if (rule.test(source)) {
      errors.push(`${file} contains placeholder text: ${rule}`);
    }
  }
}

if (errors.length > 0) {
  console.error(`Pattern content audit failed with ${errors.length} issue(s):`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Pattern content audit passed: ${seed.length} seed patterns and ${generatedSources.length} generated packs have concrete implementation snippets and instructions.`);
