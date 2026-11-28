"use client";

import Link from "next/link";

import { useSavedState } from "@/components/tools/saved-state";
import { CopyCodeBlock } from "@/components/ui/copy-code-block";
import { Toggle, ToolNotes, ToolShell } from "@/components/resources/tool-shell";
import {
  buildSharePointRequest,
  headersJson,
  spFieldTypeLabels,
  spOperationLabels,
  type SpField,
  type SpFieldType,
  type SpHttpOperation
} from "@/lib/tools/sharepoint-http";

const groups: Array<{ label: string; operations: SpHttpOperation[] }> = [
  { label: "Read", operations: ["get-items", "get-item", "get-columns", "get-type", "get-attachments", "get-files"] },
  { label: "Write", operations: ["create-item", "create-in-folder", "update-item", "delete-item", "create-folder"] },
  { label: "Permissions", operations: ["break-inheritance", "get-group-id", "get-role-id", "add-role", "remove-role"] }
];

const usesList: SpHttpOperation[] = ["get-items", "get-item", "get-columns", "get-type", "create-item", "create-in-folder", "update-item", "delete-item", "get-attachments", "break-inheritance", "add-role", "remove-role"];
const usesItem: SpHttpOperation[] = ["get-item", "update-item", "delete-item", "get-attachments"];
const usesScope: SpHttpOperation[] = ["break-inheritance", "add-role", "remove-role"];
const usesFields: SpHttpOperation[] = ["create-item", "create-in-folder", "update-item"];
const usesFolder: SpHttpOperation[] = ["create-in-folder", "get-files", "create-folder"];

const starterFields: SpField[] = [
  { name: "Title", type: "text", value: "triggerBody()?['text']" },
  { name: "Status", type: "choice", value: "Submitted" }
];

export function SharePointHttpBuilder() {
  const [operation, setOperation] = useSavedState<SpHttpOperation>("operation", "get-items");
  const [site, setSite] = useSavedState("site", "");
  const [list, setList] = useSavedState("list", "Requests");
  const [listBy, setListBy] = useSavedState<"title" | "guid">("listBy", "title");
  const [itemId, setItemId] = useSavedState("itemId", "triggerOutputs()?['body/ID']");
  const [select, setSelect] = useSavedState("select", "Id,Title,Status,Author/Title");
  const [filter, setFilter] = useSavedState("filter", "Status eq 'Submitted'");
  const [orderBy, setOrderBy] = useSavedState("orderBy", "Created desc");
  const [top, setTop] = useSavedState("top", "100");
  const [fields, setFields] = useSavedState<SpField[]>("fields", starterFields);
  const [entityType, setEntityType] = useSavedState("entityType", "");
  const [folder, setFolder] = useSavedState("folder", "");
  const [scope, setScope] = useSavedState<"item" | "list">("scope", "item");
  const [copyRoleAssignments, setCopyRoleAssignments] = useSavedState("copyRoleAssignments", false);
  const [groupName, setGroupName] = useSavedState("groupName", "");
  const [roleName, setRoleName] = useSavedState("roleName", "Contribute");
  const [principalId, setPrincipalId] = useSavedState("principalId", "");
  const [roleId, setRoleId] = useSavedState("roleId", "");
  const [actionName, setActionName] = useSavedState("actionName", "Send an HTTP request to SharePoint");

  const result = buildSharePointRequest({
    operation,
    list,
    listBy,
    itemId,
    select,
    filter,
    orderBy,
    top,
    fields,
    entityType,
    folder,
    site,
    scope,
    copyRoleAssignments,
    groupName,
    roleName,
    principalId,
    roleId,
    actionName
  });

  const onItem = usesItem.includes(operation) || (usesScope.includes(operation) && scope === "item");

  function updateField(index: number, patch: Partial<SpField>) {
    setFields((current) => current.map((field, fieldIndex) => (fieldIndex === index ? { ...field, ...patch } : field)));
  }

  return (
    <ToolShell
      title="SharePoint HTTP request builder"
      description="Pick what you want to do, fill in the list and columns, and copy the method, URI, headers and body into the Send an HTTP request to SharePoint action, with the expression that reads the result."
    >
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <label className="field">
          <span>What the request does</span>
          <select onChange={(event) => setOperation(event.target.value as SpHttpOperation)} value={operation}>
            {groups.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.operations.map((key) => (
                  <option key={key} value={key}>{spOperationLabels[key]}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Site address{operation === "create-in-folder" ? "" : " (optional)"}</span>
          <input onChange={(event) => setSite(event.target.value)} placeholder="https://contoso.sharepoint.com/sites/team" spellCheck={false} value={site} />
        </label>
        {usesList.includes(operation) ? (
          <>
            <label className="field">
              <span>Find the list by</span>
              <select onChange={(event) => setListBy(event.target.value as "title" | "guid")} value={listBy}>
                <option value="title">Its title</option>
                <option value="guid">Its GUID</option>
              </select>
            </label>
            <label className="field">
              <span>{listBy === "title" ? "List or library title" : "List GUID"}</span>
              <input onChange={(event) => setList(event.target.value)} spellCheck={false} value={list} />
            </label>
          </>
        ) : null}
        {usesScope.includes(operation) ? (
          <label className="field">
            <span>Apply to</span>
            <select onChange={(event) => setScope(event.target.value as "item" | "list")} value={scope}>
              <option value="item">One item</option>
              <option value="list">The whole list</option>
            </select>
          </label>
        ) : null}
        {onItem ? (
          <label className="field">
            <span>Item ID, a number or an expression</span>
            <input onChange={(event) => setItemId(event.target.value)} spellCheck={false} value={itemId} />
          </label>
        ) : null}
        {usesFolder.includes(operation) ? (
          <label className="field">
            <span>{operation === "create-in-folder" ? "Folder path in the list" : operation === "create-folder" ? "New folder's path" : "Folder path"}</span>
            <input
              onChange={(event) => setFolder(event.target.value)}
              placeholder={operation === "create-in-folder" ? "Lists/Requests/2027" : "Shared Documents/Invoices"}
              spellCheck={false}
              value={folder}
            />
          </label>
        ) : null}
      </div>

      {operation === "get-items" || operation === "get-item" ? (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
          <label className="field">
            <span>$select: internal names, split by commas</span>
            <input onChange={(event) => setSelect(event.target.value)} spellCheck={false} value={select} />
          </label>
          {operation === "get-items" ? (
            <>
              <label className="field">
                <span>$filter</span>
                <input onChange={(event) => setFilter(event.target.value)} spellCheck={false} value={filter} />
              </label>
              <label className="field">
                <span>$orderby</span>
                <input onChange={(event) => setOrderBy(event.target.value)} spellCheck={false} value={orderBy} />
              </label>
              <label className="field">
                <span>$top</span>
                <input inputMode="numeric" onChange={(event) => setTop(event.target.value)} value={top} />
              </label>
            </>
          ) : null}
        </div>
      ) : null}
      {operation === "get-items" ? (
        <p style={{ color: "var(--muted)", fontSize: "0.92rem", margin: 0 }}>
          Write a lookup or person column as Column/Field, such as Author/Title, and the tool adds the $expand. Build the $filter with the{" "}
          <Link href="/tools/odata-filter-query-builder" style={{ color: "var(--accent-strong)", fontWeight: 800 }}>OData filter query builder</Link>.
        </p>
      ) : null}

      {usesFields.includes(operation) ? (
        <div style={{ display: "grid", gap: 14 }}>
          {operation !== "create-in-folder" ? (
            <label className="field">
              <span>Item type (ListItemEntityTypeFullName), or leave empty to guess it</span>
              <input onChange={(event) => setEntityType(event.target.value)} placeholder="SP.Data.RequestsListItem" spellCheck={false} value={entityType} />
            </label>
          ) : null}
          {fields.map((field, index) => (
            <fieldset key={index} style={{ border: "1px solid var(--line)", borderRadius: 8, display: "grid", gap: 10, margin: 0, padding: 14 }}>
              <legend style={{ fontWeight: 800, padding: "0 6px" }}>Column {index + 1}</legend>
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
                <label className="field">
                  <span>Internal name</span>
                  <input onChange={(event) => updateField(index, { name: event.target.value })} spellCheck={false} value={field.name} />
                </label>
                <label className="field">
                  <span>Column type</span>
                  <select onChange={(event) => updateField(index, { type: event.target.value as SpFieldType })} value={field.type}>
                    {(Object.keys(spFieldTypeLabels) as SpFieldType[]).map((type) => (
                      <option key={type} value={type}>{spFieldTypeLabels[type]}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Value or expression</span>
                  <input onChange={(event) => updateField(index, { value: event.target.value })} spellCheck={false} value={field.value} />
                </label>
              </div>
              {fields.length > 1 ? (
                <div>
                  <button className="link-button" onClick={() => setFields((current) => current.filter((_, fieldIndex) => fieldIndex !== index))} style={{ color: "var(--accent-strong)" }} type="button">
                    Remove column
                  </button>
                </div>
              ) : null}
            </fieldset>
          ))}
          <div>
            <button className="button secondary" onClick={() => setFields((current) => [...current, { name: "", type: "text", value: "" }])} type="button">
              Add column
            </button>
          </div>
        </div>
      ) : null}

      {operation === "break-inheritance" ? (
        <div className="badge-row">
          <Toggle checked={copyRoleAssignments} label="Copy the current permissions first" onChange={setCopyRoleAssignments} />
        </div>
      ) : null}
      {operation === "get-group-id" ? (
        <label className="field">
          <span>SharePoint group name</span>
          <input onChange={(event) => setGroupName(event.target.value)} placeholder="Team Site Members" spellCheck={false} value={groupName} />
        </label>
      ) : null}
      {operation === "get-role-id" ? (
        <label className="field">
          <span>Permission level name</span>
          <input onChange={(event) => setRoleName(event.target.value)} placeholder="Contribute" spellCheck={false} value={roleName} />
        </label>
      ) : null}
      {operation === "add-role" || operation === "remove-role" ? (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <label className="field">
            <span>Group or user ID (principalid)</span>
            <input onChange={(event) => setPrincipalId(event.target.value)} placeholder="body('Get_group_ID')?['Id']" spellCheck={false} value={principalId} />
          </label>
          {operation === "add-role" ? (
            <label className="field">
              <span>Permission level ID (roledefid)</span>
              <input onChange={(event) => setRoleId(event.target.value)} placeholder="body('Get_permission_level_ID')?['Id']" spellCheck={false} value={roleId} />
            </label>
          ) : null}
        </div>
      ) : null}

      <label className="field">
        <span>The action&apos;s name in your flow, for the expressions</span>
        <input onChange={(event) => setActionName(event.target.value)} spellCheck={false} value={actionName} />
      </label>

      {result.errors.length > 0 ? (
        <div className="stat-tile" role="alert">
          {result.errors.map((error) => (
            <p key={error} style={{ margin: 0 }}>{error}</p>
          ))}
        </div>
      ) : null}

      <div className="grid" style={{ gridTemplateColumns: "minmax(80px, 140px) 1fr" }}>
        <CopyCodeBlock code={result.method} copyEvent="SharePoint HTTP Copied" label="Method" />
        <CopyCodeBlock code={result.uri} copyEvent="SharePoint HTTP Copied" label="Uri" />
      </div>
      <CopyCodeBlock code={headersJson(result.headers)} copyEvent="SharePoint HTTP Copied" label="Headers (switch the box to text mode to paste them)" />
      {result.body ? <CopyCodeBlock code={result.body} copyEvent="SharePoint HTTP Copied" label="Body" /> : null}
      {result.readExpression ? <CopyCodeBlock code={result.readExpression} copyEvent="SharePoint HTTP Copied" label={`Read the result: ${result.readLabel}`} /> : null}
      {result.browserUrl ? (
        <p style={{ color: "#415049", lineHeight: 1.6, margin: 0, overflowWrap: "anywhere" }}>
          To try this GET request first, sign in to SharePoint and open <code>{result.browserUrl}</code> in your browser.
        </p>
      ) : null}
      <ToolNotes notes={result.notes} />
      <p style={{ color: "#415049", lineHeight: 1.6, margin: 0 }}>
        The action uses the flow&apos;s SharePoint connection, so the request runs with that account&apos;s permissions. Enter the Site Address in the action itself, and paste the Uri without the site in front of it.
      </p>
    </ToolShell>
  );
}
