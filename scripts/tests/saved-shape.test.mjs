import assert from "node:assert/strict";
import test from "node:test";
import { sameShape } from "../../lib/tools/saved-shape.ts";

test("plain values must keep their type", () => {
  assert.equal(sameShape("a", "b"), true);
  assert.equal(sameShape("a", 1), false);
  assert.equal(sameShape(true, false), true);
  assert.equal(sameShape(true, "true"), false);
});

test("objects need every starting key with the same shape", () => {
  const initial = { orderBy: "", descending: false };
  assert.equal(sameShape(initial, { orderBy: "Created", descending: true, extra: 1 }), true);
  assert.equal(sameShape(initial, { orderBy: "Created" }), false);
  assert.equal(sameShape(initial, { orderBy: "Created", descending: "yes" }), false);
  assert.equal(sameShape(initial, null), false);
  assert.equal(sameShape(initial, []), false);
  assert.equal(sameShape({}, { anything: { a: "b" } }), true);
});

test("arrays are checked against their first starting entry", () => {
  const rows = [{ column: "Status", value: "Approved" }];
  assert.equal(sameShape(rows, []), true);
  assert.equal(sameShape(rows, [{ column: "A", value: "B" }, { column: "C", value: "D" }]), true);
  assert.equal(sameShape(rows, [{ column: "A" }]), true, "a row may leave out a key");
  assert.equal(sameShape(rows, [{ column: 1, value: "B" }]), false);
  assert.equal(sameShape(rows, ["A"]), false);
  assert.equal(sameShape(rows, { column: "A", value: "B" }), false);
  assert.equal(sameShape(["Monday"], ["Friday"]), true);
  assert.equal(sameShape(["Monday"], [1]), false);
});
