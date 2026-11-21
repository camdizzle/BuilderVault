import assert from "node:assert/strict";
import test from "node:test";
import { formatterLink, formulaFromHash } from "../../lib/tools/formula-link.ts";

test("a formula survives a round trip through the link", () => {
  const formula = `If(x = "a&b #1", Notify("50% done"), Back())`;
  const link = formatterLink(formula);
  assert.ok(link.startsWith("/tools/power-fx-formatter#formula="));
  assert.equal(formulaFromHash(link.slice(link.indexOf("#"))), formula);
});

test("other hashes are ignored", () => {
  assert.equal(formulaFromHash(""), null);
  assert.equal(formulaFromHash("#faq"), null);
  assert.equal(formulaFromHash("#formula=%E0%A4%A"), null);
});
