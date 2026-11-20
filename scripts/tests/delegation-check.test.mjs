import assert from "node:assert/strict";
import test from "node:test";
import { checkDelegation, dataSourceLabels, delegationRules, findCalls, isRowIndependent, maskLiterals } from "../../lib/tools/delegation-check.ts";

const titles = (formula, source) => checkDelegation(formula, source).findings.map((finding) => finding.title);

test("literals and comments are masked without moving positions", () => {
  const formula = 'Filter(A, B = "Lower(x)") // Search(\n';
  const masked = maskLiterals(formula);
  assert.equal(masked.length, formula.length);
  assert.ok(!masked.includes("Lower"));
  assert.ok(!masked.includes("Search"));
});

test("finds nested calls", () => {
  assert.deepEqual(findCalls("Sum(Filter(Orders, Amount > 5), Amount)").map((call) => call.name), ["Sum", "Filter"]);
  assert.deepEqual(findCalls("Filter(Orders, A = 1, B = 2)")[0].args, ["Orders", "A = 1", "B = 2"]);
});

test("row-independent values", () => {
  assert.ok(isRowIndependent("User().Email"));
  assert.ok(isRowIndependent("txtSearch.Text"));
  assert.ok(isRowIndependent("varFilter"));
  assert.ok(!isRowIndependent("Owner.Email"));
  assert.ok(!isRowIndependent("Title"));
});

test("clean filters report no problems", () => {
  const report = checkDelegation('Filter(Requests, Status.Value = "Open" && StartsWith(Title, txtSearch.Text))', "sharepoint");
  assert.deepEqual(report.findings, []);
  assert.deepEqual(report.delegated, ["Filter"]);
  assert.ok(report.hasQuery);
});

test("a function on a column is flagged, but not on a value", () => {
  assert.deepEqual(titles("Filter(Requests, Lower(Owner.Email) = Lower(User().Email))", "sharepoint"), [
    "Lower() inside Filter is not delegated to SharePoint list"
  ]);
  assert.deepEqual(titles("Filter(Requests, Owner.Email = Lower(User().Email))", "sharepoint"), []);
  assert.deepEqual(titles("Filter(Requests, Lower(Owner.Email) = varMe)", "sql"), []);
});

test("results depend on the data source", () => {
  const formula = 'Search(Accounts, txtSearch.Text, "name")';
  assert.equal(titles(formula, "sharepoint").length, 1);
  assert.equal(titles(formula, "dataverse").length, 0);
  assert.equal(titles("Filter(Items, txtSearch.Text in Title)", "sharepoint")[0], 'The "in" operator inside Filter is not delegated to SharePoint list');
  assert.equal(titles("Filter(Items, txtSearch.Text in Title)", "sql").length, 0);
});

test("aggregates and limits", () => {
  const sharepoint = checkDelegation("Sum(Filter(Orders, Region = varRegion), Amount)", "sharepoint");
  assert.equal(sharepoint.findings[0].severity, "problem");
  const dataverse = checkDelegation("Sum(Filter(Orders, Region = varRegion), Amount)", "dataverse");
  assert.equal(dataverse.findings[0].severity, "limit");
  assert.ok(dataverse.findings[0].detail.includes("50,000"));
  assert.deepEqual(checkDelegation("CountRows(Orders)", "sql").findings, []);
});

test("IsBlank on SharePoint is a limit with a fix", () => {
  const finding = checkDelegation("Filter(Tasks, IsBlank(DueDate))", "sharepoint").findings[0];
  assert.equal(finding.severity, "limit");
  assert.ok(finding.fix.includes("Blank()"));
});

test("table shaping and Excel", () => {
  assert.equal(titles("AddColumns(Orders, \"Total\", Qty * Price)", "dataverse")[0], "AddColumns directly on Orders is not delegated to Dataverse");
  assert.deepEqual(titles("AddColumns(Filter(Orders, Open), \"Total\", Qty * Price)", "dataverse"), []);
  assert.equal(titles("Filter(Table1, Region = \"West\")", "excel").length, 1);
  assert.equal(titles("LastN(Orders, 5)", "sql").length, 1);
});

test("no query functions", () => {
  assert.equal(checkDelegation("Set(varA, 1)", "sharepoint").hasQuery, false);
});

test("every rule covers every data source", () => {
  for (const rule of delegationRules) {
    for (const source of Object.keys(dataSourceLabels)) assert.ok(["yes", "partial", "no"].includes(rule.support[source]), rule.key);
    if (["sharepoint", "dataverse", "sql"].some((source) => rule.support[source] !== "yes") && rule.key !== "sort") assert.ok(rule.fix, rule.key + " needs a fix");
  }
});
