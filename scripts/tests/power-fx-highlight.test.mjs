import assert from "node:assert/strict";
import test from "node:test";
import { highlightLines, highlightPowerFx } from "../../lib/tools/power-fx-highlight.ts";

const kinds = (formula) => highlightPowerFx(formula).filter((token) => token.kind !== "plain" && token.kind !== "punctuation").map((token) => [token.kind, token.text]);

test("joining the tokens gives back the formula exactly", () => {
  const formulas = [
    'IfError(Patch(Requests, Defaults(Requests), { Title: "Say ""hi""" }), Notify("Failed", NotificationType.Error))',
    "// comment\nSet(varCount, 1.5e3); /* block\ncomment */ 'Request Status'.Value",
    '$"Hello {User().FullName}" & "unterminated',
    ""
  ];
  for (const formula of formulas) {
    assert.equal(highlightPowerFx(formula).map((token) => token.text).join(""), formula);
    assert.equal(highlightLines(formula).map((line) => line.map((token) => token.text).join("")).join("\n"), formula);
  }
});

test("functions, strings, enums, variables and keywords are told apart", () => {
  assert.deepEqual(kinds('If(varOpen && true, Notify("Saved", NotificationType.Success))'), [
    ["function", "If"],
    ["variable", "varOpen"],
    ["keyword", "true"],
    ["function", "Notify"],
    ["string", '"Saved"'],
    ["enum", "NotificationType"]
  ]);
});

test("doubled quotes stay inside one string", () => {
  assert.deepEqual(kinds('"He said ""hi"""'), [["string", '"He said ""hi"""']]);
});

test("member names after a dot are not coloured as functions or keywords", () => {
  assert.deepEqual(kinds("galItems.Selected.Value + Self.Fill"), [["keyword", "Self"]]);
  assert.deepEqual(kinds("ThisItem.If"), [["keyword", "ThisItem"]]);
});

test("numbers inside names are not coloured as numbers", () => {
  assert.deepEqual(kinds("Label2.Text & 42"), [["number", "42"]]);
});

test("comments and quoted names", () => {
  assert.deepEqual(kinds("// note\n'Due Date'"), [["comment", "// note"], ["name", "'Due Date'"]]);
});
