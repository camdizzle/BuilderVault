"use client";

import { useState } from "react";
import { CopyCodeBlock } from "@/components/ui/copy-code-block";
import { ToolNotes, ToolShell } from "@/components/resources/tool-shell";
import {
  buildFilterQuery,
  columnTypeLabels,
  operatorLabels,
  operatorsFor,
  type FilterColumnType,
  type FilterCondition,
  type FilterJoin,
  type FilterOperator,
  type FilterTarget
} from "@/lib/tools/odata-filter";

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
  lookup: "Finance",
  person: "name@contoso.com"
};

export function FilterQueryBuilder() {
  const [target, setTarget] = useState<FilterTarget>("sharepoint");
  const [join, setJoin] = useState<FilterJoin>("and");
  const [rows, setRows] = useState<FilterCondition[]>(starterRows.sharepoint);
  const result = buildFilterQuery(target, rows, join);

  function switchTarget(next: FilterTarget) {
    setTarget(next);
    setRows(starterRows[next]);
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
          <span>Match</span>
          <select value={join} onChange={(event) => setJoin(event.target.value as FilterJoin)}>
            <option value="and">All conditions (and)</option>
            <option value="or">Any condition (or)</option>
          </select>
        </label>
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {rows.map((row, index) => {
          const needsValue = row.operator !== "null" && row.operator !== "notnull";
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
                    {(Object.keys(columnTypeLabels) as FilterColumnType[]).map((type) => (
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
                {needsValue ? (
                  <label className="field">
                    <span>Value</span>
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
            onClick={() => setRows((current) => [...current, { column: "", type: "text", operator: "eq", value: "" }])}
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
    </ToolShell>
  );
}
