// Checks that tool pages link to each other correctly.
import assert from "node:assert/strict";
import test from "node:test";
import { getRelatedTools, tools } from "../../lib/resources.ts";

const slugs = new Set(tools.map((tool) => tool.slug));

test("tool slugs are unique", () => {
  assert.equal(slugs.size, tools.length);
});

test("relatedTools only names tools that exist", () => {
  for (const tool of tools) {
    for (const related of tool.relatedTools ?? []) {
      assert.ok(slugs.has(related), `${tool.slug} links to missing tool ${related}`);
      assert.notEqual(related, tool.slug, `${tool.slug} links to itself`);
    }
  }
});

test("related tool links are shown in both directions", () => {
  for (const tool of tools) {
    for (const related of tool.relatedTools ?? []) {
      const target = tools.find((candidate) => candidate.slug === related);
      const back = getRelatedTools(target).map((candidate) => candidate.slug);
      assert.ok(back.includes(tool.slug), `${related} should link back to ${tool.slug}`);
    }
  }
});

test("every tool has a catalog entry with a group, glyph and tagline", async () => {
  const { toolCatalog, toolGroups } = await import("../../lib/tool-catalog.ts");
  const groupIds = new Set(toolGroups.map((group) => group.id));
  for (const tool of tools) {
    const entry = toolCatalog[tool.slug];
    assert.ok(entry, `${tool.slug} has no entry in lib/tool-catalog.ts`);
    assert.ok(groupIds.has(entry.group), `${tool.slug} has an unknown group ${entry.group}`);
    assert.ok(entry.glyph.length > 0 && entry.glyph.length <= 3, `${tool.slug} glyph should be 1 to 3 characters`);
    assert.ok(entry.tagline.length > 20 && entry.tagline.length <= 80, `${tool.slug} tagline should be 21 to 80 characters`);
  }
  for (const slug of Object.keys(toolCatalog)) {
    assert.ok(slugs.has(slug), `lib/tool-catalog.ts lists ${slug}, which is not a tool`);
  }
});
