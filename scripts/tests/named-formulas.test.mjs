import assert from "node:assert/strict";
import test from "node:test";
import { convertOnStart, formulasText, parseCall, splitTopLevel, stripComments } from "../../lib/tools/named-formulas.ts";

const on = { convertCollections: true };

test("splits on top-level separators only", () => {
  assert.deepEqual(splitTopLevel('Set(a, "x;y"); Notify("hi", NotificationType.Success); // done; really\nSet(b, {c: 1; d: 2})', ";"), [
    'Set(a, "x;y")',
    'Notify("hi", NotificationType.Success)',
    "// done; really\nSet(b, {c: 1; d: 2})"
  ]);
  assert.deepEqual(splitTopLevel("a, f(b, c), [d, e]", ","), ["a", "f(b, c)", "[d, e]"]);
});

test("comments are stripped for analysis", () => {
  assert.equal(stripComments('Set(a, "http://x") // note\n/* block */'), 'Set(a, "http://x")');
});

test("parseCall needs the call to span the statement", () => {
  assert.deepEqual(parseCall("Set(varA, Sum(1, 2))"), { name: "Set", args: ["varA", "Sum(1, 2)"] });
  assert.equal(parseCall("Set(varA, 1) + Foo(2)"), null);
  assert.equal(parseCall("varA"), null);
});

test("converts constants and lookups, keeps actions and state", () => {
  const result = convertOnStart(
    `Set(varAppName, "Requests");
Set(varUser, LookUp(Employees, Email = User().Email));
Set(varIsLoading, false);
Set(varStarted, Now());
Set(varCount, 0); Set(varCount, varCount + 1);
ClearCollect(colStatuses, Table({Label: "Open"}, {Label: "Closed"}));
ClearCollect(colMine, Filter(Requests, Owner.Email = User().Email));
Collect(colLog, {At: 1});
Navigate(HomeScreen)`,
    on
  );
  assert.deepEqual(result.converted.map((formula) => formula.name), ["varAppName", "varUser", "colStatuses", "colMine"]);
  assert.equal(result.kept.length, 6);
  const reasons = Object.fromEntries(result.kept.map((item) => [item.text.split("\n")[0], item.reason]));
  assert.ok(reasons["Set(varIsLoading, false)"].includes("starting value"));
  assert.ok(reasons["Set(varStarted, Now())"].includes("Now()"));
  assert.ok(reasons["Set(varCount, 0)"].includes("more than once"));
  assert.ok(reasons["Collect(colLog, {At: 1})"].includes("Collect adds rows"));
  assert.ok(reasons["Navigate(HomeScreen)"].includes("action"));
  assert.equal(result.remaining.length, 6);
  assert.equal(
    formulasText(result.converted.slice(0, 2)),
    'varAppName = "Requests";\nvarUser = LookUp(Employees, Email = User().Email);'
  );
  assert.ok(result.notes.some((note) => note.includes("Set(varAppName")));
  assert.ok(result.notes.some((note) => note.includes("read-only")));
});

test("behavior functions and flows inside a value keep it in OnStart", () => {
  const result = convertOnStart('Set(varSaved, Patch(Requests, Defaults(Requests), {Title: "x"})); Set(varConfig, GetConfig.Run())', on);
  assert.equal(result.converted.length, 0);
  assert.ok(result.kept[0].reason.includes("Patch()"));
  assert.ok(result.kept[1].reason.includes("flow"));
});

test("a function name inside text doesn't count as an action", () => {
  assert.equal(convertOnStart('Set(varHelp, "Use Patch(...) to save")', on).converted.length, 1);
});

test("Concurrent is unwrapped and rebuilt around what stays", () => {
  const result = convertOnStart(
    'Concurrent(Set(varTheme, {Primary: "#0f766e"}), ClearCollect(colA, Sort(Items, Title)), Collect(colB, 1), Refresh(Items))',
    on
  );
  assert.deepEqual(result.converted.map((formula) => formula.name), ["varTheme", "colA"]);
  assert.deepEqual(result.remaining, ["Concurrent(Collect(colB, 1), Refresh(Items))"]);
  const single = convertOnStart("Concurrent(Set(varA, 5), Refresh(Items))", on);
  assert.deepEqual(single.remaining, ["Refresh(Items)"]);
});

test("collections can be left alone", () => {
  const result = convertOnStart("ClearCollect(colA, Items)", { convertCollections: false });
  assert.equal(result.converted.length, 0);
  assert.deepEqual(result.remaining, ["ClearCollect(colA, Items)"]);
});

test("semicolon-locale formulas get a warning", () => {
  assert.ok(convertOnStart("Set(a; 1);; Set(b; 2)", on).notes[0].includes(";;"));
});
