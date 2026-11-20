import assert from "node:assert/strict";
import test from "node:test";
import { analyzeSample, generateSchema, toActionReference } from "../../lib/tools/json-schema.ts";

const strict = { allowNulls: false, numbersAsNumber: false, includeRequired: false };
const safe = { allowNulls: true, numbersAsNumber: true, includeRequired: false };

test("basic types", () => {
  assert.deepEqual(generateSchema({ name: "A", count: 2, price: 2.5, ok: true }, strict), {
    type: "object",
    properties: {
      name: { type: "string" },
      count: { type: "integer" },
      price: { type: "number" },
      ok: { type: "boolean" }
    }
  });
});

test("allowNulls adds null to every property but not the root", () => {
  const schema = generateSchema({ name: "A", tags: ["x"] }, safe);
  assert.equal(schema.type, "object");
  assert.deepEqual(schema.properties.name, { type: ["string", "null"] });
  assert.deepEqual(schema.properties.tags, { type: ["array", "null"], items: { type: ["string", "null"] } });
});

test("a null sample value accepts any type", () => {
  assert.deepEqual(generateSchema({ manager: null }, strict).properties.manager, {});
});

test("array items are merged across elements", () => {
  const schema = generateSchema([{ id: 1, note: "x" }, { id: 2.5, note: null, extra: true }], { ...strict, includeRequired: true });
  assert.deepEqual(schema.items.properties.id, { type: "number" });
  assert.deepEqual(schema.items.properties.note, { type: ["string", "null"] });
  assert.deepEqual(schema.items.required, ["id", "note"]);
});

test("numbersAsNumber replaces integer", () => {
  assert.deepEqual(generateSchema({ n: 3 }, { ...strict, numbersAsNumber: true }).properties.n, { type: "number" });
});

test("empty arrays get open items", () => {
  assert.deepEqual(generateSchema({ list: [] }, strict).properties.list, { type: "array", items: {} });
});

test("expressions and null paths", () => {
  const report = analyzeSample(
    JSON.stringify({ customer: { name: "A", manager: null }, lines: [{ sku: "1" }] }),
    safe,
    "Parse JSON order"
  );
  const byPath = Object.fromEntries(report.expressions.map((entry) => [entry.path, entry.expression]));
  assert.equal(byPath["customer.name"], "body('Parse_JSON_order')?['customer']?['name']");
  assert.equal(byPath["lines"], "body('Parse_JSON_order')?['lines']");
  assert.equal(byPath["lines[].sku"], "items('Apply_to_each')?['sku']");
  assert.deepEqual(report.nullOnlyPaths, ["customer.manager"]);
});

test("invalid JSON throws", () => {
  assert.throws(() => analyzeSample("{ bad", safe));
});

test("action names", () => {
  assert.equal(toActionReference("Parse JSON 2"), "Parse_JSON_2");
  assert.equal(toActionReference(""), "Parse_JSON");
});
