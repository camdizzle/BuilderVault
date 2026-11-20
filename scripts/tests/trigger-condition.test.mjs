import assert from "node:assert/strict";
import test from "node:test";
import { buildRule, buildTriggerCondition, fieldReference } from "../../lib/tools/trigger-condition.ts";

const r = (field, type, operator, value = "") => ({ field, type, operator, value });
const noGuard = { enabled: false, value: "" };

test("SharePoint field references", () => {
  assert.equal(fieldReference("sharepoint", { field: "Status", type: "choice" }), "triggerOutputs()?['body/Status/Value']");
  assert.equal(fieldReference("sharepoint", { field: "AssignedTo", type: "person" }), "triggerOutputs()?['body/AssignedTo/Email']");
  assert.equal(fieldReference("dataverse", { field: "parentcustomerid", type: "lookup" }), "triggerOutputs()?['body/_parentcustomerid_value']");
  assert.equal(fieldReference("other", { field: "status", type: "text" }), "triggerBody()?['status']");
});

test("rules", () => {
  assert.equal(buildRule("sharepoint", r("Status", "choice", "equals", "Approved")), "equals(triggerOutputs()?['body/Status/Value'], 'Approved')");
  assert.equal(buildRule("sharepoint", r("Title", "text", "contains", "O'Brien")), "contains(coalesce(triggerOutputs()?['body/Title'], ''), 'O''Brien')");
  assert.equal(buildRule("sharepoint", r("Amount", "number", "greater", "1000")), "greater(triggerOutputs()?['body/Amount'], 1000)");
  assert.equal(buildRule("sharepoint", r("IsUrgent", "boolean", "isTrue")), "equals(triggerOutputs()?['body/IsUrgent'], true)");
  assert.equal(buildRule("sharepoint", r("DueDate", "date", "beforeNow")), "less(ticks(triggerOutputs()?['body/DueDate']), ticks(utcNow()))");
  assert.equal(
    buildRule("sharepoint", r("DueDate", "date", "after", "2026-01-31")),
    "greater(ticks(triggerOutputs()?['body/DueDate']), ticks('2026-01-31T00:00:00Z'))"
  );
  assert.equal(
    buildRule("sharepoint", r("AssignedTo", "person", "equals", "Ana@Contoso.com")),
    "equals(toLower(coalesce(triggerOutputs()?['body/AssignedTo/Email'], '')), 'ana@contoso.com')"
  );
  assert.equal(buildRule("dataverse", r("statuscode", "choice", "equals", "1")), "equals(triggerOutputs()?['body/statuscode'], 1)");
  assert.equal(buildRule("sharepoint", r("Comments", "text", "notEmpty")), "not(empty(triggerOutputs()?['body/Comments']))");
});

test("single rule", () => {
  const result = buildTriggerCondition("sharepoint", [r("Status", "choice", "equals", "Approved")], "and", noGuard);
  assert.equal(result.combined, "@equals(triggerOutputs()?['body/Status/Value'], 'Approved')");
  assert.deepEqual(result.separate, [result.combined]);
});

test("and, or, and the loop guard", () => {
  const rules = [r("Status", "choice", "equals", "Approved"), r("IsUrgent", "boolean", "isTrue")];
  const guard = { enabled: true, value: "Flow@Contoso.com" };
  const andResult = buildTriggerCondition("sharepoint", rules, "and", guard);
  assert.ok(andResult.combined.startsWith("@and(and(equals("));
  assert.ok(andResult.combined.includes("'flow@contoso.com'"));
  assert.equal(andResult.separate.length, 3);

  const orResult = buildTriggerCondition("sharepoint", rules, "or", guard);
  assert.ok(orResult.combined.startsWith("@and(or(equals("));
  assert.deepEqual(orResult.separate, []);
});

test("notes", () => {
  const result = buildTriggerCondition("sharepoint", [r("Request Status", "choice", "equals", "")], "and", { enabled: true, value: "" });
  assert.ok(result.notes.some((note) => note.includes("Request_x0020_Status")));
  assert.ok(result.notes.some((note) => note.includes("enter a value")));
  assert.ok(result.notes.some((note) => note.includes("loop guard")));
});
