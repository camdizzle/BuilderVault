import assert from "node:assert/strict";
import test from "node:test";
import { buildGalleryItems } from "../../lib/tools/gallery-filter.ts";
import { checkDelegation } from "../../lib/tools/delegation-check.ts";

const options = {
  table: "Requests",
  searchControl: "txtSearch",
  searchColumns: ["Title", "Request Number"],
  filters: [
    { type: "choice", column: "Status", control: "cmbStatus" },
    { type: "person", column: "Assigned To", control: "tglMine" },
    { type: "lookup", column: "Customer", control: "cmbCustomer" },
    { type: "yesno", column: "Urgent", control: "tglUrgent" },
    { type: "daterange", column: "Created", control: "dpFrom", controlTo: "dpTo" }
  ],
  sortColumn: "Created",
  sortDescending: true
};

test("SharePoint search uses StartsWith and passes the delegation checker", () => {
  const result = buildGalleryItems({ ...options, source: "sharepoint" });
  assert.ok(result.items.includes("(StartsWith(Title, txtSearch.Text) || StartsWith('Request Number', txtSearch.Text))"));
  assert.ok(!result.items.includes("Search("));
  assert.ok(result.items.includes("Status.Value = cmbStatus.Selected.Value"));
  assert.ok(result.items.includes("'Assigned To'.Email = User().Email"));
  assert.ok(result.items.includes("Customer.Id = cmbCustomer.Selected.Id"));
  assert.ok(result.items.startsWith("Sort(\n    Filter("));
  const report = checkDelegation(result.items, "sharepoint");
  assert.deepEqual(report.findings.filter((finding) => finding.severity === "problem"), []);
});

test("Dataverse and SQL Server use Search around the filter", () => {
  const dv = buildGalleryItems({ ...options, source: "dataverse" });
  assert.ok(dv.items.includes("Search(\n        Filter("));
  assert.ok(dv.items.includes("'Assigned To' = CurrentUser"));
  assert.deepEqual(dv.namedFormulas, ["CurrentUser = LookUp(Users, 'Primary Email' = User().Email);"]);
  const sql = buildGalleryItems({ ...options, source: "sql" });
  assert.ok(sql.controls.some((setting) => setting.control === "cmbStatus" && setting.value === "Distinct(Requests, Status)"));
});

test("each filter lets everything through while its control is empty", () => {
  const result = buildGalleryItems({ ...options, source: "sharepoint" });
  assert.ok(result.items.includes("IsBlank(cmbStatus.Selected.Value) ||"));
  assert.ok(result.items.includes("tglMine.Value = false ||"));
  assert.ok(result.items.includes("IsBlank(dpTo.SelectedDate) || Created < DateAdd(dpTo.SelectedDate, 1, TimeUnit.Days)"));
});

test("dropdowns get AllowEmptySelection and the search box gets DelayOutput", () => {
  const result = buildGalleryItems({ ...options, source: "sharepoint", filters: [{ type: "text", column: "Department", control: "drpDepartment" }] });
  assert.ok(result.controls.some((setting) => setting.control === "drpDepartment" && setting.property === "AllowEmptySelection"));
  assert.ok(result.controls.some((setting) => setting.control === "txtSearch" && setting.property === "DelayOutput"));
  assert.ok(result.notes.some((note) => note.startsWith("Distinct isn't delegated")));
});

test("no search and no filters returns the table", () => {
  const result = buildGalleryItems({ ...options, source: "sharepoint", searchControl: "", filters: [], sortColumn: "" });
  assert.equal(result.items, "Requests");
});
