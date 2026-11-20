import assert from "node:assert/strict";
import test from "node:test";
import { buildPowerFxTable, cleanName, fieldName, inferColumnKind, parseDelimited, uniqueHeaders } from "../../lib/tools/power-fx-table.ts";

const options = { name: "colProducts", mode: "clearCollect", semicolonLocale: false, detectTypes: true };

test("parses quoted CSV", () => {
  const { delimiter, rows } = parseDelimited('Name,Note\n"Smith, Ana","She said ""hi"""\r\nLee,"two\nlines"\n\n');
  assert.equal(delimiter, ",");
  assert.deepEqual(rows, [["Name", "Note"], ["Smith, Ana", 'She said "hi"'], ["Lee", "two\nlines"]]);
});

test("detects semicolon and tab delimiters", () => {
  assert.equal(parseDelimited("a;b;c\n1;2;3").delimiter, ";");
  assert.equal(parseDelimited("a\tb\n1\t2").delimiter, "\t");
});

test("infers column kinds", () => {
  assert.equal(inferColumnKind(["1", "2.5", "", "-3"]), "number");
  assert.equal(inferColumnKind(["007", "12"]), "text");
  assert.equal(inferColumnKind(["true", "FALSE"]), "boolean");
  assert.equal(inferColumnKind(["2026-01-31"]), "date");
  assert.equal(inferColumnKind(["2026-01-31T09:30:00Z"]), "datetime");
  assert.equal(inferColumnKind(["1", "n/a"]), "text");
  assert.equal(inferColumnKind(["", ""]), "text");
});

test("field names and headers", () => {
  assert.equal(fieldName("Price"), "Price");
  assert.equal(fieldName("Due Date"), "'Due Date'");
  assert.deepEqual(uniqueHeaders(["Name", "", "Name"]), ["Name", "Column2", "Name_2"]);
  assert.equal(cleanName("my data!", "clearCollect"), "mydata");
  assert.equal(cleanName("123", "set"), "varData");
});

test("CSV to ClearCollect", () => {
  const result = buildPowerFxTable('Name,Price,In Stock,Added\nLaptop,1299.5,true,2026-01-31\n"Dock ""Pro""",,false,', options);
  assert.equal(
    result.formula,
    `ClearCollect(
    colProducts,
    Table(
        {Name: "Laptop", Price: 1299.5, 'In Stock': true, Added: Date(2026, 1, 31)},
        {Name: "Dock ""Pro""", Price: Blank(), 'In Stock': false, Added: Blank()}
    )
)`
  );
  assert.equal(result.rowCount, 2);
  assert.deepEqual(result.columns.map((column) => column.kind), ["text", "number", "boolean", "date"]);
});

test("semicolon locale", () => {
  const result = buildPowerFxTable("Name;Price\nA;2.5", { ...options, mode: "table", semicolonLocale: true });
  assert.equal(result.formula, 'Table(\n    {Name: "A"; Price: 2,5}\n)');
});

test("other output modes", () => {
  assert.ok(buildPowerFxTable("A\n1", { ...options, mode: "set", name: "varRows" }).formula.startsWith("Set(\n    varRows,"));
  assert.equal(buildPowerFxTable("A\n1", { ...options, mode: "namedFormula", name: "Rows" }).formula, "Rows = Table(\n    {A: 1}\n);");
});

test("detectTypes off keeps text", () => {
  assert.ok(buildPowerFxTable("A\n1", { ...options, detectTypes: false }).formula.includes('{A: "1"}'));
});

test("JSON input with nesting", () => {
  const result = buildPowerFxTable(
    JSON.stringify([{ name: "A", tags: ["x", "y"], owner: { id: 1 }, lines: [{ q: 2 }], gone: null }]),
    { ...options, mode: "table" }
  );
  assert.equal(result.formula, 'Table(\n    {name: "A", tags: ["x", "y"], owner: {id: 1}, lines: Table({q: 2}), gone: Blank()}\n)');
  assert.equal(result.source, "json");
});

test("errors and notes", () => {
  assert.throws(() => buildPowerFxTable("OnlyHeader", options));
  assert.throws(() => buildPowerFxTable("[1, 2]", options));
  const mixed = buildPowerFxTable('[{"a": 1}, {"a": "x"}]', options);
  assert.ok(mixed.notes.some((note) => note.includes("mix value types")));
  const big = buildPowerFxTable("A\n" + Array.from({ length: 501 }, (_, i) => i).join("\n"), options);
  assert.ok(big.notes.some((note) => note.includes("501 rows")));
});
