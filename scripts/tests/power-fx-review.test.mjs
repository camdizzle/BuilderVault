import assert from "node:assert/strict";
import test from "node:test";
import { analyzePowerFx, countCalls, detectPowerFxPatterns, explainPowerFx, functionCallNames } from "../../lib/tools/power-fx-review.ts";

test("function names only match whole names", () => {
  const calls = functionCallNames(`Filter(Accounts, StartsWith(Name, txtSearch.Text)); Reset(txtTitle); ClearCollect(colA, [1])`);
  assert.ok(calls.has("startswith"));
  assert.ok(!calls.has("with"));
  assert.ok(!calls.has("set"));
  assert.ok(!calls.has("collect"));
  assert.ok(calls.has("clearcollect"));
});

test("text values and comments are not read as calls", () => {
  const calls = functionCallNames(`Notify("Use Patch( to save"); // With( is a comment\nSet(x, 1)`);
  assert.ok(!calls.has("patch"));
  assert.ok(!calls.has("with"));
  assert.ok(calls.has("set"));
});

test("StartsWith is not reported as a With block", () => {
  const formula = `Filter(Accounts, StartsWith(Name, txtSearch.Text))`;
  assert.ok(!detectPowerFxPatterns(formula).some((pattern) => pattern.id === "with-block"));
  assert.ok(!explainPowerFx(formula).steps.some((step) => step.includes("With")));
});

test("Reset is not reported as setting a variable", () => {
  const explanation = explainPowerFx(`Reset(txtTitle)`);
  assert.ok(!explanation.steps.some((step) => step.includes("variables")));
});

test("Set names the variables it stores", () => {
  const explanation = explainPowerFx(`Set(varUser, User()); Reset(txtTitle)`);
  assert.ok(explanation.steps.some((step) => step.includes("varUser") && !step.includes("txtTitle")));
});

test("nested If is counted by call, not by text", () => {
  assert.equal(countCalls(`If(a, If(b, 1, IfError(x, 2)), If(c, 3))`, "if"), 3);
  const checks = analyzePowerFx(`If(a, If(b, 1, 2), If(c, 3))`, "", 1);
  assert.ok(checks.items.some((item) => item.title === "Nested If logic"));
});

test("Patch without IfError is flagged", () => {
  const checks = analyzePowerFx(`Patch(Requests, Defaults(Requests), {Title: "x"})`, "", 1);
  assert.ok(checks.items.some((item) => item.title === "Patch without IfError"));
});
