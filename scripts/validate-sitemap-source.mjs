import fs from "node:fs";
import path from "node:path";

const sitemap = fs.readFileSync(path.join(process.cwd(), "app/sitemap.ts"), "utf8");
const site = fs.readFileSync(path.join(process.cwd(), "lib/site.ts"), "utf8");
const requiredSitemapSnippets = ["exampleGuides", "allResources", "resourceGroups", "absoluteUrl", "/examples", "/resources"];
const missing = requiredSitemapSnippets.filter((snippet) => !sitemap.includes(snippet));

if (!site.includes("https://buildervault.camwow.tv")) {
  missing.push("canonical buildervault.camwow.tv siteUrl");
}

if (missing.length > 0) {
  console.error("Sitemap/source configuration is missing expected BuilderVault references:");
  for (const item of missing) console.error("- " + item);
  process.exit(1);
}

const robots = fs.readFileSync(path.join(process.cwd(), "app/robots.ts"), "utf8");
if (!robots.includes("absoluteUrl(\"/sitemap.xml\")")) {
  console.error("robots.ts should advertise the generated sitemap URL.");
  process.exit(1);
}

console.log("BuilderVault sitemap source check passed.");
