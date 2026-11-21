import assert from "node:assert/strict";
import test from "node:test";
import { buildReleaseChecklist, checklistText } from "../../lib/tools/release-checklist.ts";

const none = { canvasApps: false, modelDrivenApps: false, cloudFlows: false, dataverse: false, plugins: false, powerPages: false, environmentVariables: false, connectionReferences: false };

test("every checklist covers unmanaged layers", () => {
  const text = checklistText("Test", buildReleaseChecklist("Test", none));
  assert.ok(text.includes("unmanaged layers"));
  assert.ok(text.includes("new unmanaged layer"));
});

test("items follow the release contents", () => {
  const flows = checklistText("Test", buildReleaseChecklist("Test", { ...none, cloudFlows: true, connectionReferences: true }));
  assert.ok(flows.includes("Turn on cloud flows"));
  assert.ok(flows.includes("Bind each connection reference"));
  assert.ok(!flows.includes("plug-in"));
});

test("production adds a rollback plan", () => {
  assert.ok(checklistText("Production", buildReleaseChecklist("Production", none)).includes("roll back"));
  assert.ok(!checklistText("Test", buildReleaseChecklist("Test", none)).includes("roll back"));
});
