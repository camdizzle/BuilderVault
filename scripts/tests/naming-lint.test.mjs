import assert from "node:assert/strict";
import test from "node:test";
import { findingsTable, lintNames, normalizeControlType, parsePrefixOverrides, parseSource, prefixFor, suggestName, defaultPrefixes } from "../../lib/tools/naming-lint.ts";

const sample = `Screens:
  Screen1:
    Properties:
      OnVisible: =Set(isLoading, true); UpdateContext({showPanel: false, locMode: "edit"}); ClearCollect(Requests_Local, Filter(Requests, Status.Value = "Open"))
    Children:
      - lblTitle:
          Control: Label
          Properties:
            Text: ="Set(notAVariable, 1)"
      - Button1:
          Control: Classic/Button
          Properties:
            OnSelect: =Set(varSelected, Blank())
      - RequestsGallery:
          Control: Gallery
          Variant: Vertical
          Children:
            - Label2_1:
                Control: Label
      - 'Search box':
          Control: Classic/TextInput
      - DataCardValue3:
          Control: Classic/TextInput
  Details Screen:
    Children:
      - conHeader:
          Control: GroupContainer@1.3.0
`;

test("type normalization and prefixes", () => {
  assert.equal(normalizeControlType("Classic/TextInput"), "textinput");
  assert.equal(normalizeControlType("GroupContainer@1.3.0"), "groupcontainer");
  assert.equal(prefixFor("GroupContainer@1.3.0", defaultPrefixes), "con");
  assert.equal(prefixFor("Classic/Button", defaultPrefixes), "btn");
  assert.equal(prefixFor("ModernTextInput", defaultPrefixes), "txt");
  assert.equal(prefixFor("SomethingUnknown", defaultPrefixes), "");
});

test("parses screens, controls, and variables", () => {
  const items = parseSource(sample);
  assert.deepEqual(items.filter((item) => item.kind === "screen").map((item) => item.name), ["Screen1", "Details Screen"]);
  assert.deepEqual(
    items.filter((item) => item.kind === "control").map((item) => item.name),
    ["lblTitle", "Button1", "RequestsGallery", "Label2_1", "Search box", "DataCardValue3", "conHeader"]
  );
  assert.deepEqual(
    items.filter((item) => item.kind === "variable").map((item) => `${item.name}:${item.type}`),
    ["isLoading:global variable", "varSelected:global variable", "showPanel:context variable", "locMode:context variable", "Requests_Local:collection"]
  );
});

test("lint findings", () => {
  const report = lintNames(sample);
  const byName = Object.fromEntries(report.findings.map((finding) => [finding.name, finding]));
  assert.equal(byName.Screen1.issue, "default");
  assert.equal(byName.Button1.issue, "default");
  assert.equal(byName.Label2_1.issue, "default");
  assert.equal(byName.RequestsGallery.suggestion, "galRequests");
  assert.equal(byName["Search box"].suggestion, "txtSearchBox");
  assert.equal(byName.isLoading.suggestion, "varIsLoading");
  assert.equal(byName.showPanel.suggestion, "locShowPanel");
  assert.equal(byName.Requests_Local.suggestion, "colRequestsLocal");
  for (const fine of ["lblTitle", "conHeader", "varSelected", "locMode", "Details Screen", "DataCardValue3"]) assert.equal(byName[fine], undefined, fine);
  assert.deepEqual(report.counts, { screens: 2, controls: 6, variables: 5, passed: 5 });
});

test("a single control copied from View code", () => {
  const report = lintNames("- Button3:\n    Control: Classic/Button\n    Properties:\n      Text: =\"Save\"\n");
  assert.equal(report.counts.controls, 1);
  assert.equal(report.findings[0].issue, "default");
});

test("prefix overrides", () => {
  const overrides = parsePrefixOverrides("Label = txt\nGallery=gly\nbad line");
  assert.deepEqual(overrides, { label: "txt", gallery: "gly" });
  const report = lintNames("- lblTitle:\n    Control: Label\n- glyItems:\n    Control: Gallery\n", overrides);
  assert.deepEqual(report.findings.map((finding) => finding.name), ["lblTitle"]);
});

test("suggestions and export", () => {
  assert.equal(suggestName("SubmitButton", "btn"), "btnSubmit");
  assert.equal(suggestName("Button", "btn"), "btnButton");
  const table = findingsTable(lintNames(sample).findings);
  assert.ok(table.startsWith("Name\tType\tIssue\tSuggested name\n"));
  assert.ok(table.includes("RequestsGallery\tGallery\t"));
});

test("empty input", () => {
  assert.deepEqual(lintNames("").counts, { screens: 0, controls: 0, variables: 0, passed: 0 });
});
