const input = process.argv.slice(2).join(" ");

if (!input) {
  console.error("Usage: node scripts/slugify.mjs \"Pattern title\"");
  process.exit(1);
}

console.log(
  input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
);
