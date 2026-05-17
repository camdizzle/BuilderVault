import fs from "node:fs";
import path from "node:path";

const requiredRoutes = [
  "app/page.tsx",
  "app/patterns/page.tsx",
  "app/resources/page.tsx",
  "app/examples/page.tsx",
  "app/tools/page.tsx",
  "app/tools/[slug]/page.tsx",
  "app/sitemap.ts",
  "app/robots.ts",
  "app/manifest.ts",
  "public/icon.svg",
  "public/og-image.svg"
];

const requiredDynamicContent = [
  ["tools", "power-fx-formatter"],
  ["tools", "sharepoint-internal-name-helper"],
  ["tools", "power-automate-expression-builder"],
  ["examples", "power-apps-patch-examples"],
  ["examples", "power-automate-trigger-conditions-examples"]
];

const missing = requiredRoutes.filter((route) => !fs.existsSync(path.join(process.cwd(), route)));

if (missing.length > 0) {
  console.error("Missing required BuilderVault routes/assets:");
  for (const item of missing) console.error("- " + item);
  process.exit(1);
}

const resources = fs.readFileSync(path.join(process.cwd(), "lib/resources.ts"), "utf8");
const examples = fs.readFileSync(path.join(process.cwd(), "lib/example-guides.ts"), "utf8");
const haystack = resources + "\n" + examples;
const missingContent = requiredDynamicContent.filter(([, slug]) => !haystack.includes(slug));

if (missingContent.length > 0) {
  console.error("Missing expected dynamic content slugs:");
  for (const [, slug] of missingContent) console.error("- " + slug);
  process.exit(1);
}

console.log("BuilderVault route smoke check passed.");
