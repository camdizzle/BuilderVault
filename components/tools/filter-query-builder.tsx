"use client";

import { useSavedState } from "@/components/tools/saved-state";
import { CopyCodeBlock } from "@/components/ui/copy-code-block";
import { ToolNotes, ToolShell } from "@/components/resources/tool-shell";
import {
  buildFilterQuery,
  buildQueryOptions,
  columnTypeLabels,
  columnTypesFor,
  operatorNeedsValue,
  operatorLabels,
  operatorsFor,
  type FilterColumnType,
  type FilterCondition,
  type FilterJoin,
  type FilterOperator,
  type FilterTarget,
  type QueryOptions
} from "@/lib/tools/odata-filter";
import { Toggle } from "@/components/resources/tool-shell";

const starterRows: Record<FilterTarget, FilterCondition[]> = {
  sharepoint: [
    { column: "Status", type: "choice", operator: "eq", value: "Approved" },
    { column: "DueDate", type: "date", operator: "lt", value: "@{utcNow()}" }
  ],
  dataverse: [
    { column: "statecode", type: "choice", operator: "eq", value: "0" },
    { column: "createdon", type: "date", operator: "ge", value: "2026-01-01" }
  ]
};

const valuePlaceholders: Record<FilterColumnType, string> = {
  text: "Laptop",
  number: "100",
  date: "2026-01-31 or @{utcNow()}",
  boolean: "Yes or No",
  choice: "Approved",
  multichoice: "100000000, 100000001",
  lookup: "Finance",
  person: "name@contoso.com"
};

export function FilterQueryBuilder() {
  const [target, setTarget] = useSavedState<FilterTarget>("target", "sharepoint");
  const [join, setJoin] = useSavedState<FilterJoin>("join", "and");
  const [groupJoin, setGroupJoin] = useSavedState<FilterJoin>("groupJoin", "and");
  const [useGroups, setUseGroups] = useSavedState("useGroups", false);
  const [rows, setRows] = useSavedState<FilterCondition[]>("rows", starterRows.sharepoint);
  const [options, setOptions] = useSavedState<QueryOptions>("options", { orderBy: "", descending: false, top: "", select: "" });
  const result = buildFilterQuery(target, useGroups ? rows : rows.map((row) => ({ ...row, group: 1 })), join, groupJoin);
  const extras = buildQueryOptions(target, options);
  const groupCount = Math.max(1, ...rows.map((row) => row.group ?? 1));

  function switchTarget(next: FilterTarget) {
    setTarget(next);
    setRows(starterRows[next]);
  }

  function setOption(patch: Partial<QueryOptions>) {
    setOptions((current) => ({ ...current, ...patch }));
  }

  function updateRow(index: number, patch: Partial<FilterCondition>) {
    setRows((current) =>
      current.map((row, rowIndex) => {
        if (rowIndex !== index) return row;
        const next = { ...row, ...patch };
        const allowed = operatorsFor(target, next.type);
        return allowed.includes(next.operator) ? next : { ...next, operator: allowed[0] };
      })
    );
  }

  return (
    <ToolShell
      title="Filter Query builder"
      description="Add one row per condition, then copy the result into Filter Query on SharePoint Get items, or Filter rows on Dataverse List rows. Use internal or logical column names, not display names."
    >
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <label className="field">
          <span>Action</span>
          <select value={target} onChange={(event) => switchTarget(event.target.value as FilterTarget)}>
            <option value="sharepoint">SharePoint: Get items</option>
            <option value="dataverse">Dataverse: List rows</option>
          </select>
        </label>
        <label className="field">
          <span>{useGroups ? "Inside each group, match" : "Match"}</span>
          <select value={join} onChange={(event) => setJoin(event.target.value as FilterJoin)}>
            <option value="and">All conditions (and)</option>
            <option value="or">Any condition (or)</option>
          </select>
        </label>
        {useGroups ? (
          <label className="field">
            <span>Between groups, match</span>
            <select value={groupJoin} onChange={(event) => setGroupJoin(event.target.value as FilterJoin)}>
              <option value="and">All groups (and)</option>
              <option value="or">Any group (or)</option>
            </select>
          </label>
        ) : null}
      </div>
      <div className="badge-row">
        <Toggle checked={useGroups} label="Group conditions in brackets, such as (A or B) and C" onChange={setUseGroups} />
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {rows.map((row, index) => {
          const needsValue = operatorNeedsValue(row.operator);
          return (
            <fieldset key={index} style={{ border: "1px solid var(--line)", borderRadius: 8, display: "grid", gap: 10, margin: 0, padding: 14 }}>
              <legend style={{ fontWeight: 800, padding: "0 6px" }}>Condition {index + 1}</legend>
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
                <label className="field">
                  <span>{target === "sharepoint" ? "Internal name" : "Logical name"}</span>
                  <input spellCheck={false} value={row.column} onChange={(event) => updateRow(index, { column: event.target.value })} />
                </label>
                <label className="field">
                  <span>Column type</span>
                  <select value={row.type} onChange={(event) => updateRow(index, { type: event.target.value as FilterColumnType })}>
                    {columnTypesFor(target).map((type) => (
                      <option key={type} value={type}>{columnTypeLabels[type]}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Operator</span>
                  <select value={row.operator} onChange={(event) => updateRow(index, { operator: event.target.value as FilterOperator })}>
                    {operatorsFor(target, row.type).map((operator) => (
                      <option key={operator} value={operator}>{operatorLabels[operator]}</option>
                    ))}
                  </select>
                </label>
                {useGroups ? (
                  <label className="field">
                    <span>Group</span>
                    <select value={row.group ?? 1} onChange={(event) => updateRow(index, { group: Number(event.target.value) })}>
                      {Array.from({ length: Math.min(groupCount + 1, rows.length) }, (_, group) => (
                        <option key={group + 1} value={group + 1}>Group {group + 1}</option>
                      ))}
                    </select>
                  </label>
                ) : null}
                {needsValue ? (
                  <label className="field">
                    <span>{row.operator === "lastxdays" || row.operator === "nextxdays" ? "Number of days" : "Value"}</span>
                    <input
                      placeholder={target === "dataverse" && row.type === "choice" ? "100000000" : target === "dataverse" && (row.type === "lookup" || row.type === "person") ? "Row GUID" : valuePlaceholders[row.type]}
                      spellCheck={false}
                      value={row.value}
                      onChange={(event) => updateRow(index, { value: event.target.value })}
                    />
                  </label>
                ) : null}
              </div>
              {rows.length > 1 ? (
                <div>
                  <button className="link-button" style={{ color: "var(--accent-strong)" }} onClick={() => setRows((current) => current.filter((_, rowIndex) => rowIndex !== index))} type="button">
                    Remove condition
                  </button>
                </div>
              ) : null}
            </fieldset>
          );
        })}
        <div>
          <button
            className="button secondary"
            onClick={() => setRows((current) => [...current, { column: "", type: "text", operator: "eq", value: "", group: current[current.length - 1]?.group ?? 1 }])}
            type="button"
          >
            Add condition
          </button>
        </div>
      </div>

      <CopyCodeBlock
        code={result.query || "Add a condition to build the query."}
        copyEvent="Filter Query Copied"
        label={target === "sharepoint" ? "Filter Query (SharePoint Get items)" : "Filter rows (Dataverse List rows)"}
      />
      <ToolNotes notes={result.notes} />

      <fieldset style={{ border: "1px solid var(--line)", borderRadius: 8, display: "grid", gap: 10, margin: 0, padding: 14 }}>
        <legend style={{ fontWeight: 800, padding: "0 6px" }}>Other settings on the action (optional)</legend>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
          <label className="field">
            <span>Sort by column</span>
            <input placeholder={target === "sharepoint" ? "Created" : "createdon"} spellCheck={false} value={options.orderBy} onChange={(event) => setOption({ orderBy: event.target.value })} />
          </label>
          <label className="field">
            <span>Direction</span>
            <select value={options.descending ? "desc" : "asc"} onChange={(event) => setOption({ descending: event.target.value === "desc" })}>
              <option value="asc">Ascending (oldest or A first)</option>
              <option value="desc">Descending (newest or Z first)</option>
            </select>
          </label>
          <label className="field">
            <span>Row count</span>
            <input inputMode="numeric" placeholder="500" value={options.top} onChange={(event) => setOption({ top: event.target.value })} />
          </label>
          <label className="field">
            <span>Columns to return, comma separated</span>
            <input placeholder={target === "sharepoint" ? "Title,Status,DueDate" : "name,createdon,statuscode"} spellCheck={false} value={options.select} onChange={(event) => setOption({ select: event.target.value })} />
          </label>
        </div>
        {extras.fields.length > 0 ? (
          <CopyCodeBlock code={extras.fields.map((field) => `${field.label}: ${field.value}`).join("\n")} label="Paste each value into the box with the same name" />
        ) : null}
        <ToolNotes notes={extras.notes} title="About these settings" />
      </fieldset>
    </ToolShell>
  );
}
