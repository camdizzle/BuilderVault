// Builds requests for the "Send an HTTP request to SharePoint" action in Power Automate.
// Every endpoint, header and body shape follows Microsoft's SharePoint REST documentation.

export type SpHttpOperation =
  | "get-items"
  | "get-item"
  | "get-columns"
  | "get-type"
  | "create-item"
  | "create-in-folder"
  | "update-item"
  | "delete-item"
  | "get-attachments"
  | "get-files"
  | "create-folder"
  | "break-inheritance"
  | "get-group-id"
  | "get-role-id"
  | "add-role"
  | "remove-role";

export type SpFieldType = "text" | "number" | "yesno" | "date" | "choice" | "lookup" | "person";

export type SpField = {
  /** The column's internal name, as REST needs it. */
  name: string;
  type: SpFieldType;
  /** A fixed value, or a flow expression such as triggerBody()?['text']. */
  value: string;
};

export type SpHttpOptions = {
  operation: SpHttpOperation;
  /** The list or library title, or its GUID. */
  list: string;
  listBy: "title" | "guid";
  itemId: string;
  select: string;
  filter: string;
  orderBy: string;
  top: string;
  fields: SpField[];
  /** ListItemEntityTypeFullName, such as SP.Data.RequestsListItem. */
  entityType: string;
  /** Server-relative folder URL for files and new folders, such as Shared Documents/Invoices. */
  folder: string;
  /** Site address, such as https://contoso.sharepoint.com/sites/team. Optional except for create-in-folder. */
  site: string;
  /** Where the permission request applies. */
  scope: "item" | "list";
  copyRoleAssignments: boolean;
  groupName: string;
  roleName: string;
  principalId: string;
  roleId: string;
  /** The action's name in the flow, for the expressions that read its result. */
  actionName: string;
};

export type SpHttpRequest = {
  method: "GET" | "POST";
  uri: string;
  headers: Record<string, string>;
  body: string;
  /** Expression that reads the useful part of the response. */
  readExpression: string;
  readLabel: string;
  /** Full address to try a GET request in the browser, when the site is known. */
  browserUrl: string;
  notes: string[];
  errors: string[];
};

export const spOperationLabels: Record<SpHttpOperation, string> = {
  "get-items": "Get items, with select, filter and sort",
  "get-item": "Get one item by ID",
  "get-columns": "List a list's columns and internal names",
  "get-type": "Get the list's item type, for creating and updating",
  "create-item": "Create an item",
  "create-in-folder": "Create an item in a folder",
  "update-item": "Update columns on an item",
  "delete-item": "Delete an item (it goes to the recycle bin)",
  "get-attachments": "List an item's attachments",
  "get-files": "List the files in a folder",
  "create-folder": "Create a folder in a library",
  "break-inheritance": "Stop inheriting permissions",
  "get-group-id": "Get a SharePoint group's ID",
  "get-role-id": "Get a permission level's ID",
  "add-role": "Give a group or user a permission level",
  "remove-role": "Remove a group's or user's permissions"
};

export const spFieldTypeLabels: Record<SpFieldType, string> = {
  text: "Text",
  number: "Number",
  yesno: "Yes/No",
  date: "Date",
  choice: "Choice (one value)",
  lookup: "Lookup (item ID)",
  person: "Person (user ID on the site)"
};

const itemOperations: SpHttpOperation[] = ["get-item", "update-item", "delete-item", "get-attachments"];
const listOperations: SpHttpOperation[] = ["get-items", "get-item", "get-columns", "get-type", "create-item", "create-in-folder", "update-item", "delete-item", "get-attachments"];
const writeOperations: SpHttpOperation[] = ["create-item", "update-item"];

const nometadata = "application/json;odata=nometadata";
const verbose = "application/json;odata=verbose";

/** Single quotes inside an OData string are written twice. */
export const odataString = (value: string) => `'${value.replace(/'/g, "''")}'`;

/** True when the value is a flow expression rather than a fixed value. */
export function isExpression(value: string) {
  const v = value.trim();
  return v.startsWith("@") || /^[A-Za-z]+\(.*\)/.test(v);
}

/** Wraps an expression so it can sit inside the body or URI: @{...}. */
export function inline(value: string) {
  const v = value.trim();
  if (v.startsWith("@{")) return v;
  if (v.startsWith("@")) return `@{${v.slice(1)}}`;
  return `@{${v}}`;
}

/** The action name as expressions refer to it, with spaces as underscores. */
export const actionReference = (name: string) => (name.trim() || "Send an HTTP request to SharePoint").replace(/ /g, "_").replace(/'/g, "");

export function listSegment(options: Pick<SpHttpOptions, "list" | "listBy">) {
  const list = options.list.trim();
  if (options.listBy === "guid") return `_api/web/lists(guid'${list.replace(/[{}]/g, "")}')`;
  return `_api/web/lists/getbytitle(${odataString(list)})`;
}

function itemIdValue(itemId: string) {
  const v = itemId.trim();
  return isExpression(v) ? inline(v) : v;
}

/** Columns used in $select as Column/Field need the same column in $expand. */
export function expandFromSelect(select: string) {
  const expand = new Set<string>();
  for (const part of select.split(",")) {
    const name = part.trim();
    if (name.includes("/")) expand.add(name.split("/")[0]);
  }
  return [...expand];
}

/** One column in the JSON body of a create or update request. */
export function fieldEntry(field: SpField): { key: string; value: string; note?: string } {
  const name = field.name.trim();
  const raw = field.value.trim();
  const expression = isExpression(raw);
  if (field.type === "lookup" || field.type === "person") {
    const key = `${name}Id`;
    if (expression) return { key, value: inline(raw) };
    if (/^\d+$/.test(raw)) return { key, value: raw };
    return {
      key,
      value: raw ? JSON.stringify(raw) : "null",
      note:
        field.type === "person"
          ? `${name}: a person column takes the person's numeric user ID on this site, not their email or name.`
          : `${name}: a lookup column takes the ID number of the item it points to, not its title.`
    };
  }
  if (field.type === "number") {
    if (expression) return { key: name, value: inline(raw) };
    if (raw !== "" && !Number.isNaN(Number(raw))) return { key: name, value: String(Number(raw)) };
    return { key: name, value: "null", note: `${name}: "${raw}" isn't a number, so the body sends null. Type a number or an expression.` };
  }
  if (field.type === "yesno") {
    if (expression) return { key: name, value: inline(raw) };
    const yes = /^(true|yes|1)$/i.test(raw);
    const no = /^(false|no|0|)$/i.test(raw);
    return { key: name, value: yes ? "true" : "false", note: yes || no ? undefined : `${name}: "${raw}" isn't yes or no, so the body sends false.` };
  }
  if (field.type === "date") {
    if (expression) return { key: name, value: `"${inline(raw)}"` };
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return { key: name, value: `"${raw}T00:00:00Z"` };
    return { key: name, value: JSON.stringify(raw), note: /^\d{4}-\d{2}-\d{2}T/.test(raw) ? undefined : `${name}: write dates as ISO 8601, such as 2027-01-04T09:00:00Z.` };
  }
  return { key: name, value: expression ? `"${inline(raw)}"` : JSON.stringify(raw) };
}

/** The list's item type, guessed from the title the way SharePoint names new lists. Always confirm it. */
export function guessEntityType(list: string) {
  const clean = list.trim().replace(/[^A-Za-z0-9 ]/g, "").replace(/ /g, "_x0020_");
  return clean ? `SP.Data.${clean}ListItem` : "";
}

function bodyFromEntries(entries: Array<{ key: string; value: string }>, metadataType?: string) {
  const lines: string[] = [];
  if (metadataType) lines.push(`  "__metadata": {\n    "type": ${JSON.stringify(metadataType)}\n  }`);
  for (const entry of entries) lines.push(`  ${JSON.stringify(entry.key)}: ${entry.value}`);
  return `{\n${lines.join(",\n")}\n}`;
}

function query(params: Array<[string, string]>) {
  const parts = params.filter(([, value]) => value.trim() !== "").map(([key, value]) => `${key}=${value.trim()}`);
  return parts.length ? `?${parts.join("&")}` : "";
}

export function buildSharePointRequest(options: SpHttpOptions): SpHttpRequest {
  const op = options.operation;
  const errors: string[] = [];
  const notes: string[] = [];
  const action = actionReference(options.actionName);
  const body = (path = "") => `body('${action}')${path}`;
  let method: SpHttpRequest["method"] = "GET";
  let uri = "";
  let headers: Record<string, string> = { Accept: nometadata };
  let requestBody = "";
  let readExpression = "";
  let readLabel = "";

  const needsList = listOperations.includes(op) || (op === "break-inheritance" || op === "add-role" || op === "remove-role");
  if (needsList && !options.list.trim()) errors.push(options.listBy === "guid" ? "Enter the list's GUID." : "Enter the list or library title.");
  if (options.listBy === "guid" && options.list.trim() && !/^\{?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}\}?$/.test(options.list.trim())) {
    errors.push("A list GUID looks like 3f2504e0-4f89-11d3-9a0c-0305e82c3301.");
  }
  const onItem = itemOperations.includes(op) || ((op === "break-inheritance" || op === "add-role" || op === "remove-role") && options.scope === "item");
  if (onItem && !options.itemId.trim()) errors.push("Enter the item ID, or an expression such as triggerOutputs()?['body/ID'].");
  if (onItem && options.itemId.trim() && !isExpression(options.itemId) && !/^\d+$/.test(options.itemId.trim())) errors.push("The item ID is a number, such as 12, or an expression.");

  const list = listSegment(options);
  const item = `${list}/items(${itemIdValue(options.itemId)})`;
  const securable = options.scope === "item" ? item : list;

  switch (op) {
    case "get-items": {
      const expand = expandFromSelect(options.select);
      const top = options.top.trim();
      if (top && !/^\d+$/.test(top)) errors.push("Top is a number of items, such as 100.");
      uri = `${list}/items${query([
        ["$select", options.select],
        ["$filter", options.filter],
        ["$orderby", options.orderBy],
        ["$top", top],
        ["$expand", expand.join(",")]
      ])}`;
      readExpression = body("?['value']");
      readLabel = "The items, as an array for Apply to each";
      if (expand.length) notes.push(`$expand=${expand.join(",")} was added because a lookup or person column is in $select. SharePoint needs the column in both.`);
      if (!options.select.trim()) notes.push("Without $select, SharePoint returns every column. Name only the columns you use, to keep the response small.");
      notes.push("SharePoint REST supports $top and $skiptoken for paging, but not $skip.");
      if (/\b(endswith|tolower|toupper|substring|trim|concat)\(/i.test(options.filter)) {
        notes.push("SharePoint REST doesn't support endswith, substring, tolower, toupper, trim or concat in $filter. It supports startswith and substringof.");
      }
      break;
    }
    case "get-item":
      uri = `${item}${query([["$select", options.select], ["$expand", expandFromSelect(options.select).join(",")]])}`;
      readExpression = body(`?['${options.select.split(",")[0]?.trim().split("/")[0] || "Title"}']`);
      readLabel = "One column of the item";
      break;
    case "get-columns":
      uri = `${list}/fields?$filter=Hidden eq false&$select=Title,InternalName,TypeAsString`;
      readExpression = body("?['value']");
      readLabel = "The columns, each with Title, InternalName and TypeAsString";
      notes.push("Use InternalName in $select, $filter and the body of create and update requests. The display name doesn't work there.");
      break;
    case "get-type":
      uri = `${list}?$select=ListItemEntityTypeFullName`;
      readExpression = body("?['ListItemEntityTypeFullName']");
      readLabel = "The item type, such as SP.Data.RequestsListItem";
      notes.push("Run this once and copy the value into the item type box for create and update requests.");
      break;
    case "create-item":
    case "update-item": {
      method = "POST";
      uri = op === "create-item" ? `${list}/items` : item;
      headers = { Accept: verbose, "Content-Type": verbose };
      if (op === "update-item") headers = { ...headers, "IF-MATCH": "*", "X-HTTP-Method": "MERGE" };
      const type = options.entityType.trim() || guessEntityType(options.list);
      if (!options.entityType.trim()) {
        notes.push(`The item type ${type || "SP.Data.<List>ListItem"} is a guess from the title. Lists that were renamed, and libraries, have a different type. Check it with the "Get the list's item type" request.`);
      }
      const fields = options.fields.filter((field) => field.name.trim());
      if (fields.length === 0) errors.push("Add at least one column to set.");
      const entries = fields.map(fieldEntry);
      for (const entry of entries) if (entry.note) notes.push(entry.note);
      if (fields.some((field) => /\s/.test(field.name.trim()))) notes.push("A column name has a space. REST needs the internal name, which has no spaces. List the columns to find it.");
      requestBody = bodyFromEntries(entries, type);
      readExpression = op === "create-item" ? body("?['d']?['Id']") : "";
      readLabel = op === "create-item" ? "The new item's ID" : "";
      if (op === "update-item") notes.push("IF-MATCH: * overwrites the item whatever its version. Use the item's ETag instead to fail with a 412 error when someone else changed it first.", "MERGE changes only the columns in the body and keeps the rest.");
      break;
    }
    case "create-in-folder": {
      method = "POST";
      uri = `${list}/AddValidateUpdateItemUsingPath`;
      headers = { Accept: nometadata, "Content-Type": nometadata };
      const site = options.site.trim().replace(/\/+$/, "");
      const folder = options.folder.trim().replace(/^\/+|\/+$/g, "");
      if (!site) errors.push("Enter the site address. This request needs the folder's full URL.");
      if (!folder) errors.push("Enter the folder's path in the list, such as Lists/Requests/2027.");
      const fields = options.fields.filter((field) => field.name.trim());
      if (fields.length === 0) errors.push("Add at least one column to set.");
      const supported = fields.filter((field) => field.type === "text" || field.type === "number" || field.type === "choice");
      const skipped = fields.filter((field) => !supported.includes(field));
      if (skipped.length) {
        notes.push(`${skipped.map((field) => field.name.trim()).join(", ")} ${skipped.length === 1 ? "was" : "were"} left out. This request takes every value as text, so set dates, yes/no, lookup and person columns with an "Update columns on an item" request afterwards.`);
      }
      const formValues = supported.map((field) => {
        const raw = field.value.trim();
        const value = isExpression(raw) ? `"${inline(raw)}"` : JSON.stringify(raw);
        return `    {\n      "FieldName": ${JSON.stringify(field.name.trim())},\n      "FieldValue": ${value}\n    }`;
      });
      requestBody = `{
  "listItemCreateInfo": {
    "FolderPath": {
      "DecodedUrl": ${JSON.stringify(`${site || "https://contoso.sharepoint.com/sites/team"}/${folder}`)}
    },
    "UnderlyingObjectType": 0
  },
  "formValues": [
${formValues.join(",\n")}
  ],
  "bNewDocumentUpdate": false
}`;
      readExpression = body("?['value']");
      readLabel = "One entry per column set. The entry with FieldName Id holds the new item's ID";
      notes.push("SharePoint answers 200 even when a column fails. Check HasException and ErrorMessage in each entry of the response.");
      break;
    }
    case "delete-item":
      method = "POST";
      uri = item;
      headers = { Accept: nometadata, "IF-MATCH": "*", "X-HTTP-Method": "DELETE" };
      notes.push("SharePoint moves a deleted item to the recycle bin, so it can be restored.");
      break;
    case "get-attachments":
      uri = `${item}/AttachmentFiles`;
      readExpression = body("?['value']");
      readLabel = "The attachments, each with FileName and ServerRelativeUrl";
      break;
    case "get-files": {
      const folder = options.folder.trim().replace(/^\/+|\/+$/g, "");
      if (!folder) errors.push("Enter the folder's path, such as Shared Documents/Invoices.");
      uri = `_api/web/GetFolderByServerRelativeUrl(${odataString(folder)})/Files`;
      readExpression = body("?['value']");
      readLabel = "The files, each with Name and ServerRelativeUrl";
      notes.push("The path is relative to the server. On a site at /sites/team, a library folder can be written as /sites/team/Shared Documents/Invoices.");
      break;
    }
    case "create-folder": {
      const folder = options.folder.trim().replace(/\/+$/g, "");
      if (!folder) errors.push("Enter the new folder's path, such as Shared Documents/Invoices/2027.");
      method = "POST";
      uri = "_api/web/folders";
      headers = { Accept: verbose, "Content-Type": verbose };
      requestBody = bodyFromEntries([{ key: "ServerRelativeUrl", value: JSON.stringify(folder) }], "SP.Folder");
      readExpression = body("?['d']?['ServerRelativeUrl']");
      readLabel = "The new folder's path";
      break;
    }
    case "break-inheritance":
      method = "POST";
      uri = `${securable}/breakroleinheritance(${options.copyRoleAssignments ? "true" : "false"})`;
      notes.push(
        options.copyRoleAssignments
          ? "The current permissions are copied, so nobody loses access yet. Remove the ones you don't want next."
          : "Nobody's permissions are copied. Add the permissions you want straight after this, including any the flow's own account needs for later steps."
      );
      notes.push("The flow's connection needs permission to manage permissions, such as a site owner's.");
      break;
    case "get-group-id": {
      if (!options.groupName.trim()) errors.push("Enter the SharePoint group's name, such as Team Site Members.");
      uri = `_api/web/sitegroups/getbyname(${odataString(options.groupName.trim())})?$select=Id`;
      readExpression = body("?['Id']");
      readLabel = "The group's ID, for principalid";
      break;
    }
    case "get-role-id": {
      if (!options.roleName.trim()) errors.push("Enter the permission level's name, such as Contribute or Read.");
      uri = `_api/web/roledefinitions/getbyname(${odataString(options.roleName.trim())})?$select=Id`;
      readExpression = body("?['Id']");
      readLabel = "The permission level's ID, for roledefid";
      break;
    }
    case "add-role":
    case "remove-role": {
      const principal = options.principalId.trim();
      if (!principal) errors.push("Enter the group's or user's ID, or the expression that reads it from an earlier request.");
      const principalValue = isExpression(principal) ? inline(principal) : principal;
      method = "POST";
      if (op === "add-role") {
        const role = options.roleId.trim();
        if (!role) errors.push("Enter the permission level's ID, or the expression that reads it from an earlier request.");
        uri = `${securable}/roleassignments/addroleassignment(principalid=${principalValue},roledefid=${isExpression(role) ? inline(role) : role})`;
        notes.push("The list or item must stop inheriting permissions first, or SharePoint rejects the change.");
      } else {
        uri = `${securable}/roleassignments/getbyprincipalid(${principalValue})`;
        headers = { Accept: nometadata, "X-HTTP-Method": "DELETE" };
        notes.push("This removes every permission level the group or user has here, not just one.");
      }
      break;
    }
  }

  if (writeOperations.includes(op)) notes.push("If SharePoint rejects the request, the action fails and the reason is in its outputs. Put it in a Scope and add a step that runs after the Scope has failed.");
  const site = options.site.trim().replace(/\/+$/, "");
  const browserUrl = method === "GET" && site && errors.length === 0 && !uri.includes("@{") ? `${site}/${uri}` : "";

  return { method, uri, headers, body: requestBody, readExpression, readLabel, browserUrl, notes, errors };
}

/** The headers as JSON, for the action's headers box in text mode. */
export const headersJson = (headers: Record<string, string>) => JSON.stringify(headers, null, 2);
