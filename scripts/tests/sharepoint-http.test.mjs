import assert from "node:assert/strict";
import test from "node:test";
import { buildSharePointRequest, expandFromSelect, fieldEntry, guessEntityType, inline, isExpression, listSegment } from "../../lib/tools/sharepoint-http.ts";

const base = {
  operation: "get-items",
  list: "Requests",
  listBy: "title",
  itemId: "",
  select: "",
  filter: "",
  orderBy: "",
  top: "",
  fields: [],
  entityType: "",
  folder: "",
  site: "",
  scope: "item",
  copyRoleAssignments: false,
  groupName: "",
  roleName: "",
  principalId: "",
  roleId: "",
  actionName: "Send an HTTP request to SharePoint"
};

test("list titles are quoted and GUIDs use the guid form", () => {
  assert.equal(listSegment({ list: "Bob's List", listBy: "title" }), "_api/web/lists/getbytitle('Bob''s List')");
  assert.equal(listSegment({ list: "{3f2504e0-4f89-11d3-9a0c-0305e82c3301}", listBy: "guid" }), "_api/web/lists(guid'3f2504e0-4f89-11d3-9a0c-0305e82c3301')");
});

test("expressions are recognised and wrapped", () => {
  assert.ok(isExpression("triggerOutputs()?['body/ID']"));
  assert.ok(isExpression("@{variables('id')}"));
  assert.ok(!isExpression("Approved"));
  assert.equal(inline("triggerOutputs()?['body/ID']"), "@{triggerOutputs()?['body/ID']}");
  assert.equal(inline("@variables('id')"), "@{variables('id')}");
});

test("get items builds the query and expands lookups in $select", () => {
  const result = buildSharePointRequest({ ...base, select: "Title,Status,Customer/Title", filter: "Status eq 'Open'", orderBy: "Created desc", top: "100" });
  assert.equal(result.method, "GET");
  assert.equal(result.uri, "_api/web/lists/getbytitle('Requests')/items?$select=Title,Status,Customer/Title&$filter=Status eq 'Open'&$orderby=Created desc&$top=100&$expand=Customer");
  assert.equal(result.headers.Accept, "application/json;odata=nometadata");
  assert.equal(result.readExpression, "body('Send_an_HTTP_request_to_SharePoint')?['value']");
  assert.deepEqual(expandFromSelect("Title, Author/EMail, Author/Title"), ["Author"]);
  assert.deepEqual(result.errors, []);
});

test("unsupported filter functions are flagged", () => {
  const result = buildSharePointRequest({ ...base, filter: "endswith(Title,'x')" });
  assert.ok(result.notes.some((note) => note.includes("endswith")));
});

test("update uses MERGE, IF-MATCH and the item type", () => {
  const result = buildSharePointRequest({
    ...base,
    operation: "update-item",
    itemId: "triggerOutputs()?['body/ID']",
    fields: [
      { name: "Status", type: "choice", value: "Approved" },
      { name: "Amount", type: "number", value: "250" },
      { name: "Customer", type: "lookup", value: "7" },
      { name: "Urgent", type: "yesno", value: "yes" }
    ]
  });
  assert.equal(result.method, "POST");
  assert.equal(result.uri, "_api/web/lists/getbytitle('Requests')/items(@{triggerOutputs()?['body/ID']})");
  assert.equal(result.headers["X-HTTP-Method"], "MERGE");
  assert.equal(result.headers["IF-MATCH"], "*");
  const body = JSON.parse(result.body);
  assert.deepEqual(body, { __metadata: { type: "SP.Data.RequestsListItem" }, Status: "Approved", Amount: 250, CustomerId: 7, Urgent: true });
  assert.ok(result.notes.some((note) => note.includes("is a guess")));
});

test("field values handle expressions, dates and bad input", () => {
  assert.deepEqual(fieldEntry({ name: "Title", type: "text", value: "triggerBody()?['text']" }), { key: "Title", value: "\"@{triggerBody()?['text']}\"" });
  assert.equal(fieldEntry({ name: "Due", type: "date", value: "2027-01-04" }).value, '"2027-01-04T00:00:00Z"');
  assert.equal(fieldEntry({ name: "Amount", type: "number", value: "abc" }).value, "null");
  assert.ok(fieldEntry({ name: "Owner", type: "person", value: "jo@contoso.com" }).note.includes("user ID"));
  assert.equal(guessEntityType("Project Tasks"), "SP.Data.Project_x0020_TasksListItem");
});

test("create returns the new ID and needs a column", () => {
  const empty = buildSharePointRequest({ ...base, operation: "create-item" });
  assert.ok(empty.errors.length > 0);
  const result = buildSharePointRequest({ ...base, operation: "create-item", entityType: "SP.Data.RequestsListItem", fields: [{ name: "Title", type: "text", value: "New" }] });
  assert.equal(result.uri, "_api/web/lists/getbytitle('Requests')/items");
  assert.equal(result.readExpression, "body('Send_an_HTTP_request_to_SharePoint')?['d']?['Id']");
  assert.ok(!result.notes.some((note) => note.includes("is a guess")));
});

test("create in a folder sends form values and leaves out other types", () => {
  const result = buildSharePointRequest({
    ...base,
    operation: "create-in-folder",
    site: "https://contoso.sharepoint.com/sites/team/",
    folder: "/Lists/Requests/2027",
    fields: [
      { name: "Title", type: "text", value: "Item" },
      { name: "Due", type: "date", value: "2027-01-04" }
    ]
  });
  const body = JSON.parse(result.body);
  assert.equal(body.listItemCreateInfo.FolderPath.DecodedUrl, "https://contoso.sharepoint.com/sites/team/Lists/Requests/2027");
  assert.deepEqual(body.formValues, [{ FieldName: "Title", FieldValue: "Item" }]);
  assert.equal(body.bNewDocumentUpdate, false);
  assert.ok(result.notes.some((note) => note.startsWith("Due was left out")));
});

test("delete and permission requests use the documented endpoints", () => {
  const del = buildSharePointRequest({ ...base, operation: "delete-item", itemId: "12" });
  assert.equal(del.headers["X-HTTP-Method"], "DELETE");
  assert.equal(del.uri, "_api/web/lists/getbytitle('Requests')/items(12)");
  const brk = buildSharePointRequest({ ...base, operation: "break-inheritance", itemId: "12" });
  assert.equal(brk.uri, "_api/web/lists/getbytitle('Requests')/items(12)/breakroleinheritance(false)");
  const listBreak = buildSharePointRequest({ ...base, operation: "break-inheritance", scope: "list", copyRoleAssignments: true });
  assert.equal(listBreak.uri, "_api/web/lists/getbytitle('Requests')/breakroleinheritance(true)");
  const add = buildSharePointRequest({ ...base, operation: "add-role", itemId: "12", principalId: "body('Get_group')?['Id']", roleId: "1073741827" });
  assert.equal(add.uri, "_api/web/lists/getbytitle('Requests')/items(12)/roleassignments/addroleassignment(principalid=@{body('Get_group')?['Id']},roledefid=1073741827)");
  const remove = buildSharePointRequest({ ...base, operation: "remove-role", itemId: "12", principalId: "5" });
  assert.equal(remove.uri, "_api/web/lists/getbytitle('Requests')/items(12)/roleassignments/getbyprincipalid(5)");
  const group = buildSharePointRequest({ ...base, operation: "get-group-id", groupName: "Team Site Members" });
  assert.equal(group.uri, "_api/web/sitegroups/getbyname('Team Site Members')?$select=Id");
});

test("item operations need an ID and a browser link is given for GET", () => {
  assert.ok(buildSharePointRequest({ ...base, operation: "get-item" }).errors.length > 0);
  assert.ok(buildSharePointRequest({ ...base, operation: "get-item", itemId: "abc" }).errors.length > 0);
  const result = buildSharePointRequest({ ...base, operation: "get-type", site: "https://contoso.sharepoint.com/sites/team" });
  assert.equal(result.browserUrl, "https://contoso.sharepoint.com/sites/team/_api/web/lists/getbytitle('Requests')?$select=ListItemEntityTypeFullName");
});

test("files and folders", () => {
  const files = buildSharePointRequest({ ...base, operation: "get-files", folder: "Shared Documents/Invoices" });
  assert.equal(files.uri, "_api/web/GetFolderByServerRelativeUrl('Shared Documents/Invoices')/Files");
  const folder = buildSharePointRequest({ ...base, operation: "create-folder", folder: "Shared Documents/Invoices/2027" });
  assert.deepEqual(JSON.parse(folder.body), { __metadata: { type: "SP.Folder" }, ServerRelativeUrl: "Shared Documents/Invoices/2027" });
});
