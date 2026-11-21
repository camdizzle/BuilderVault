import assert from "node:assert/strict";
import test from "node:test";
import { buildCondition, buildFilterQuery, buildQueryOptions, columnTypesFor, operatorsFor, quoteText } from "../../lib/tools/odata-filter.ts";

const c = (column, type, operator, value = "") => ({ column, type, operator, value });

test("quoteText doubles single quotes", () => {
  assert.equal(quoteText("O'Brien"), "'O''Brien'");
});

test("SharePoint text, number, and choice conditions", () => {
  assert.equal(buildCondition("sharepoint", c("Title", "text", "eq", "Laptop")), "Title eq 'Laptop'");
  assert.equal(buildCondition("sharepoint", c("Amount", "number", "gt", "100")), "Amount gt 100");
  assert.equal(buildCondition("sharepoint", c("Status", "choice", "eq", "Approved")), "Status eq 'Approved'");
  assert.equal(buildCondition("sharepoint", c("Title", "text", "contains", "lap")), "substringof('lap', Title)");
});

test("SharePoint yes/no uses 1 and 0", () => {
  assert.equal(buildCondition("sharepoint", c("IsUrgent", "boolean", "eq", "true")), "IsUrgent eq 1");
  assert.equal(buildCondition("sharepoint", c("IsUrgent", "boolean", "eq", "no")), "IsUrgent eq 0");
});

test("SharePoint dates are quoted ISO strings", () => {
  assert.equal(buildCondition("sharepoint", c("DueDate", "date", "ge", "2026-01-31")), "DueDate ge '2026-01-31T00:00:00Z'");
  assert.equal(
    buildCondition("sharepoint", c("Created", "date", "ge", "@{addDays(utcNow(), -7)}")),
    "Created ge '@{addDays(utcNow(), -7)}'"
  );
});

test("SharePoint person and lookup use sub-fields", () => {
  assert.equal(buildCondition("sharepoint", c("AssignedTo", "person", "eq", "Ana@Contoso.com")), "AssignedTo/EMail eq 'ana@contoso.com'");
  assert.equal(buildCondition("sharepoint", c("Department", "lookup", "eq", "HR")), "Department/Title eq 'HR'");
  assert.equal(buildCondition("sharepoint", c("AssignedTo", "person", "null")), "AssignedToId eq null");
});

test("Dataverse literals", () => {
  assert.equal(buildCondition("dataverse", c("name", "text", "contains", "con")), "contains(name, 'con')");
  assert.equal(buildCondition("dataverse", c("createdon", "date", "ge", "2026-01-31")), "createdon ge 2026-01-31T00:00:00Z");
  assert.equal(buildCondition("dataverse", c("donotemail", "boolean", "eq", "yes")), "donotemail eq true");
  assert.equal(buildCondition("dataverse", c("statuscode", "choice", "eq", "1")), "statuscode eq 1");
  assert.equal(
    buildCondition("dataverse", c("parentcustomerid", "lookup", "eq", "6c9d2e2b-1d3a-4b0e-9a1a-2f6a1c0d9e11")),
    "_parentcustomerid_value eq 6c9d2e2b-1d3a-4b0e-9a1a-2f6a1c0d9e11"
  );
  assert.equal(buildCondition("dataverse", c("_ownerid_value", "lookup", "notnull")), "_ownerid_value ne null");
});

test("joins conditions and reports problems", () => {
  const result = buildFilterQuery(
    "sharepoint",
    [c("Status", "choice", "eq", "Approved"), c("Due Date", "date", "lt", "2026-02-01")],
    "and"
  );
  assert.equal(result.query, "Status eq 'Approved' and Due Date lt '2026-02-01T00:00:00Z'");
  assert.ok(result.notes.some((note) => note.includes("Due_x0020_Date")));

  const dataverse = buildFilterQuery("dataverse", [c("StatusCode", "choice", "eq", "Approved")], "and");
  assert.ok(dataverse.notes.some((note) => note.includes("lowercase")));
  assert.ok(dataverse.notes.some((note) => note.includes("number value")));
});

test("empty rows are ignored", () => {
  assert.equal(buildFilterQuery("sharepoint", [c("", "text", "eq", "")], "and").query, "");
});

test("SharePoint text has no endswith", () => {
  assert.ok(!operatorsFor("sharepoint", "text").includes("endswith"));
  assert.ok(operatorsFor("dataverse", "text").includes("endswith"));
});

const g = (column, type, operator, value, group) => ({ column, type, operator, value, group });

test("groups are wrapped in brackets", () => {
  const result = buildFilterQuery(
    "sharepoint",
    [g("Status", "choice", "eq", "Open", 1), g("Status", "choice", "eq", "In Review", 1), g("Priority", "choice", "eq", "High", 2)],
    "or",
    "and"
  );
  assert.equal(result.query, "(Status eq 'Open' or Status eq 'In Review') and Priority eq 'High'");
});

test("one group behaves like no groups", () => {
  assert.equal(buildFilterQuery("sharepoint", [g("A", "number", "eq", "1", 1), g("B", "number", "eq", "2", 1)], "or", "and").query, "A eq 1 or B eq 2");
});

test("Dataverse date query functions", () => {
  assert.equal(buildCondition("dataverse", c("createdon", "date", "lastxdays", "7")), "Microsoft.Dynamics.CRM.LastXDays(PropertyName='createdon',PropertyValue=7)");
  assert.equal(buildCondition("dataverse", c("createdon", "date", "today")), "Microsoft.Dynamics.CRM.Today(PropertyName='createdon')");
  assert.ok(operatorsFor("dataverse", "date").includes("thismonth"));
  assert.ok(!operatorsFor("sharepoint", "date").includes("thismonth"));
});

test("Dataverse multi-select choices use ContainValues", () => {
  assert.equal(
    buildCondition("dataverse", c("cr123_regions", "multichoice", "containvalues", "100000000, 100000001")),
    "Microsoft.Dynamics.CRM.ContainValues(PropertyName='cr123_regions',PropertyValues=['100000000','100000001'])"
  );
  assert.ok(!columnTypesFor("sharepoint").includes("multichoice"));
  assert.ok(buildFilterQuery("dataverse", [c("cr123_regions", "multichoice", "containvalues", "East")], "and").notes.some((note) => note.includes("number values")));
});

test("query options", () => {
  const sharepoint = buildQueryOptions("sharepoint", { orderBy: "Created", descending: true, top: "", select: "" });
  assert.deepEqual(sharepoint.fields, [{ label: "Order By", value: "Created desc" }]);
  assert.ok(sharepoint.notes.some((note) => note.includes("first 100 items")));
  const dataverse = buildQueryOptions("dataverse", { orderBy: "", descending: false, top: "50", select: "name, createdon" });
  assert.deepEqual(dataverse.fields, [{ label: "Row count", value: "50" }, { label: "Select columns", value: "name,createdon" }]);
});
