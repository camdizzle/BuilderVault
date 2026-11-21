import assert from "node:assert/strict";
import test from "node:test";
import { buildPatch, columnValue, controlKind, fxName } from "../../lib/tools/patch-builder.ts";

const base = { source: "sharepoint", table: "Requests", mode: "create", target: "", ifError: false, resultVariable: "", resetControls: false };

test("column names with spaces are quoted", () => {
  assert.equal(fxName("Assigned To"), "'Assigned To'");
  assert.equal(fxName("Title"), "Title");
  assert.equal(fxName("'Due Date'"), "'Due Date'");
});

test("control prefixes pick the property", () => {
  assert.equal(controlKind("txtTitle"), "text");
  assert.equal(controlKind("cmbStatus"), "pick");
  assert.equal(controlKind("dpDue"), "date");
  assert.equal(controlKind("tglUrgent"), "toggle");
  assert.equal(controlKind("Submitted"), "none");
  assert.equal(columnValue({ name: "Amount", type: "number", value: "txtAmount" }, base).value, "Value(txtAmount.Text)");
  assert.equal(columnValue({ name: "Due", type: "date", value: "dpDue" }, base).value, "dpDue.SelectedDate");
});

test("SharePoint and Dataverse get different record shapes", () => {
  const dv = { source: "dataverse", table: "Requests" };
  assert.equal(columnValue({ name: "Status", type: "choice", value: "Submitted" }, base).value, '{ Value: "Submitted" }');
  assert.equal(columnValue({ name: "Status", type: "choice", value: "Submitted" }, dv).value, "'Status (Requests)'.Submitted");
  assert.equal(columnValue({ name: "Customer", type: "lookup", value: "cmbCustomer" }, base).value, "{ Id: cmbCustomer.Selected.ID, Value: cmbCustomer.Selected.Title }");
  assert.equal(columnValue({ name: "Customer", type: "lookup", value: "cmbCustomer" }, dv).value, "cmbCustomer.Selected");
  assert.equal(columnValue({ name: "Tags", type: "multichoice", value: "cmbTags" }, base).value, "ForAll(cmbTags.SelectedItems, { Value: ThisRecord.Value })");
  assert.equal(columnValue({ name: "Tags", type: "multichoice", value: "Red, Blue" }, base).value, 'Table({ Value: "Red" }, { Value: "Blue" })');
  assert.ok(columnValue({ name: "Owner", type: "person", value: "me" }, base).value.includes('Claims: "i:0#.f|membership|" & Lower(User().Email)'));
  assert.equal(columnValue({ name: "Owner", type: "person", value: "me" }, dv).value, "LookUp(Users, 'Primary Email' = User().Email)");
});

test("create, selected and lookup modes pick the record", () => {
  const columns = [{ name: "Title", type: "text", value: "txtTitle" }];
  assert.ok(buildPatch({ ...base, columns }).formula.includes("Defaults(Requests)"));
  assert.ok(buildPatch({ ...base, columns, mode: "selected", target: "galItems" }).formula.includes("galItems.Selected"));
  assert.ok(buildPatch({ ...base, columns, mode: "lookup", target: "varId" }).formula.includes("LookUp(Requests, ID = varId)"));
  assert.ok(buildPatch({ ...base, columns, mode: "lookup", target: "varId", source: "dataverse" }).formula.includes("LookUp(Requests, Request = varId)"));
});

test("IfError, the result variable and resets are added", () => {
  const columns = [{ name: "Title", type: "text", value: "txtTitle" }];
  const wrapped = buildPatch({ ...base, columns, ifError: true, resetControls: true }).formula;
  assert.ok(wrapped.startsWith("IfError(\n    Patch("));
  assert.ok(wrapped.includes("FirstError.Message"));
  assert.ok(wrapped.includes("Reset(txtTitle)"));
  const kept = buildPatch({ ...base, columns, ifError: true, resultVariable: "varSaved" }).formula;
  assert.ok(kept.startsWith("Set(\n    varSaved,\n    IfError("));
  assert.ok(kept.includes("!IsBlank(varSaved)"));
});

test("read-only columns and a missing Title are flagged", () => {
  const result = buildPatch({ ...base, columns: [{ name: "Created", type: "date", value: "dpDue" }] });
  assert.ok(result.notes.some((note) => note.startsWith("Created is set by the data source")));
  assert.ok(result.notes.some((note) => note.includes("require Title")));
});
