import assert from "node:assert/strict";
import test from "node:test";
import {
  columnFormattingSchema,
  dueDateFormat,
  expressionString,
  isPowerAppsPlayUrl,
  parseStatusRules,
  personEmailFormat,
  powerAppsButtonFormat,
  progressBarFormat,
  statusPillFormat
} from "../../lib/tools/column-formatting.ts";

test("parses status rules", () => {
  assert.deepEqual(parseStatusRules("Approved|green\nOn hold | AMBER\nOther\n\nBad|pink"), [
    { value: "Approved", color: "green" },
    { value: "On hold", color: "amber" },
    { value: "Other", color: "grey" },
    { value: "Bad", color: "grey" }
  ]);
});

test("expression strings escape quotes", () => {
  assert.equal(expressionString("Won't fix"), "'Won\\'t fix'");
});

test("status pill nests if() in order", () => {
  const format = statusPillFormat(parseStatusRules("Approved|green\nRejected|red"));
  assert.equal(format.$schema, columnFormattingSchema);
  assert.equal(
    format.style["background-color"],
    "=if(@currentField == 'Approved', '#dff6dd', if(@currentField == 'Rejected', '#fde7e9', '#edebe9'))"
  );
  assert.equal(format.txtContent, "@currentField");
});

test("due date uses the warning window", () => {
  const format = dueDateFormat(7);
  assert.ok(format.style["background-color"].includes("@now + 604800000"));
  assert.ok(format.style["background-color"].startsWith("=if(Number(@currentField) == 0, ''"));
  assert.ok(!dueDateFormat(0).style["background-color"].includes("@now +"));
});

test("progress bar scales fractions", () => {
  const percent = progressBarFormat("percent", "#123456");
  assert.equal(percent.children[0].children[0].style["background-color"], "#123456");
  assert.ok(percent.children[1].txtContent.includes("floor(@currentField + 0.5)"));
  const fraction = progressBarFormat("fraction", "not a color");
  assert.ok(fraction.children[1].txtContent.includes("(@currentField * 100)"));
  assert.equal(fraction.children[0].children[0].style["background-color"], "#0f766e");
});

test("person link", () => {
  assert.equal(personEmailFormat("", false).attributes.href, "=if(@currentField.email == '', '', 'mailto:' + @currentField.email)");
  assert.equal(
    personEmailFormat("About", true).attributes.href,
    "=if(@currentField.email == '', '', 'mailto:' + @currentField.email + '?subject=' + encodeURIComponent('About ' + [$Title]))"
  );
});

test("Power Apps button", () => {
  const format = powerAppsButtonFormat("https://apps.powerapps.com/play/e/abc/a/def?tenantId=t", "Open", "ItemID", "#000000");
  assert.equal(format.attributes.href, "='https://apps.powerapps.com/play/e/abc/a/def?tenantId=t&ItemID=' + [$ID]");
  assert.equal(powerAppsButtonFormat("https://x", "", "", "").attributes.href, "='https://x?ID=' + [$ID]");
  assert.ok(isPowerAppsPlayUrl("https://apps.powerapps.com/play/e/abc"));
  assert.ok(!isPowerAppsPlayUrl("https://make.powerapps.com/"));
});

test("output is valid JSON", () => {
  for (const format of [statusPillFormat([]), dueDateFormat(3), progressBarFormat("percent", ""), personEmailFormat("", true), powerAppsButtonFormat("", "", "", "")]) {
    assert.doesNotThrow(() => JSON.parse(JSON.stringify(format)));
  }
});
