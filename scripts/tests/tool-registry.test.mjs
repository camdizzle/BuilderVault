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
