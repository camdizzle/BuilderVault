"use client";

import Link from "next/link";
import { useState } from "react";
import { CopyCodeBlock } from "@/components/ui/copy-code-block";
import { Toggle, ToolNotes, ToolShell } from "@/components/resources/tool-shell";
import { formatterLink } from "@/lib/tools/formula-link";
import { buildPatch, patchColumnTypeLabels, type PatchColumn, type PatchColumnType, type PatchMode, type PatchSource } from "@/lib/tools/patch-builder";

const starterColumns: PatchColumn[] = [
  { name: "Title", type: "text", value: "txtTitle" },
  { name: "Amount", type: "number", value: "txtAmount" },
  { name: "Status", type: "choice", value: "Submitted" },
  { name: "Assigned To", type: "person", value: "me" },
  { name: "Due Date", type: "date", value: "dpDueDate" }
];

const sourceLabels: Record<PatchSource, string> = { sharepoint: "SharePoint list", dataverse: "Dataverse table" };
const modeLabels: Record<PatchMode, string> = {
  create: "Create a new record",
  selected: "Update the record selected in a gallery",
  lookup: "Update a record found by its ID"
};

const valueHelp: Record<PatchColumnType, string> = {
  text: "A text input such as txtTitle, or a value in quotes",
  number: "A text input such as txtAmount, a slider, or a number",
  date: "A date picker such as dpDueDate, or Today or Now",
  yesno: "A toggle or checkbox such as tglUrgent, or yes or no",
  choice: "A dropdown such as cmbStatus, or one choice such as Submitted",
  multichoice: "A combo box such as cmbTags, or values split by commas",
  person: "A people combo box, an email address, or me for the current user",
  lookup: "A combo box that lists the other list or table"
};

export function PatchFormulaBuilder() {
  const [source, setSource] = useState<PatchSource>("sharepoint");
  const [table, setTable] = useState("Requests");
  const [mode, setMode] = useState<PatchMode>("create");
  const [target, setTarget] = useState("");
  const [columns, setColumns] = useState<PatchColumn[]>(starterColumns);
  const [ifError, setIfError] = useState(true);
  const [keepResult, setKeepResult] = useState(false);
  const [resultVariable, setResultVariable] = useState("varSavedRecord");
  const [resetControls, setResetControls] = useState(true);

  const result = buildPatch({ source, table, mode, target, columns, ifError, resultVariable: keepResult ? resultVariable : "", resetControls });

  function updateColumn(index: number, patch: Partial<PatchColumn>) {
    setColumns((current) => current.map((column, columnIndex) => (columnIndex === index ? { ...column, ...patch } : column)));
  }

  return (
    <ToolShell
      title="Patch formula builder"
      description="Pick the data source, say whether you are creating or updating, and list the columns with the control each value comes from. The tool writes the Patch with the record shape each column type needs, wrapped in error handling."
    >
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <label className="field">
          <span>Data source type</span>
          <select onChange={(event) => setSource(event.target.value as PatchSource)} value={source}>
            {(Object.keys(sourceLabels) as PatchSource[]).map((key) => (
              <option key={key} value={key}>{sourceLabels[key]}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{source === "sharepoint" ? "List name" : "Table name (plural, as in the app)"}</span>
          <input onChange={(event) => setTable(event.target.value)} spellCheck={false} value={table} />
        </label>
        <label className="field">
          <span>What the formula does</span>
          <select onChange={(event) => setMode(event.target.value as PatchMode)} value={mode}>
            {(Object.keys(modeLabels) as PatchMode[]).map((key) => (
              <option key={key} value={key}>{modeLabels[key]}</option>
            ))}
          </select>
        </label>
        {mode !== "create" ? (
          <label className="field">
            <span>{mode === "selected" ? "Gallery name" : source === "sharepoint" ? "ID value or variable" : "GUID value or variable"}</span>
            <input onChange={(event) => setTarget(event.target.value)} placeholder={mode === "selected" ? "galRequests" : "varRecordId"} spellCheck={false} value={target} />
          </label>
        ) : null}
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {columns.map((column, index) => (
          <fieldset key={index} style={{ border: "1px solid var(--line)", borderRadius: 8, display: "grid", gap: 10, margin: 0, padding: 14 }}>
            <legend style={{ fontWeight: 800, padding: "0 6px" }}>Column {index + 1}</legend>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
              <label className="field">
                <span>Column name, as shown in the app</span>
                <input onChange={(event) => updateColumn(index, { name: event.target.value })} spellCheck={false} value={column.name} />
              </label>
              <label className="field">
                <span>Column type</span>
                <select onChange={(event) => updateColumn(index, { type: event.target.value as PatchColumnType })} value={column.type}>
                  {(Object.keys(patchColumnTypeLabels) as PatchColumnType[]).map((type) => (
                    <option key={type} value={type}>{patchColumnTypeLabels[type]}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Value comes from</span>
                <input onChange={(event) => updateColumn(index, { value: event.target.value })} placeholder={valueHelp[column.type]} spellCheck={false} value={column.value} />
              </label>
            </div>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", margin: 0 }}>{valueHelp[column.type]}.</p>
            {columns.length > 1 ? (
              <div>
                <button className="link-button" onClick={() => setColumns((current) => current.filter((_, columnIndex) => columnIndex !== index))} style={{ color: "var(--accent-strong)" }} type="button">
                  Remove column
                </button>
              </div>
            ) : null}
          </fieldset>
        ))}
        <div>
          <button className="button secondary" onClick={() => setColumns((current) => [...current, { name: "", type: "text", value: "" }])} type="button">
            Add column
          </button>
        </div>
      </div>

      <div className="badge-row">
        <Toggle checked={ifError} label="Show the reason if the save fails" onChange={setIfError} />
        <Toggle checked={resetControls} label="Clear the controls after saving" onChange={setResetControls} />
        <Toggle checked={keepResult} label="Keep the saved record in a variable" onChange={setKeepResult} />
      </div>
      {keepResult ? (
        <label className="field">
          <span>Variable name</span>
          <input onChange={(event) => setResultVariable(event.target.value)} spellCheck={false} value={resultVariable} />
        </label>
      ) : null}

      <CopyCodeBlock code={result.formula} copyEvent="Patch Formula Copied" label="Patch formula, for a button's OnSelect" />
      <div>
        <Link className="button secondary" href={formatterLink(result.formula)}>
          Check it in the Power Fx formatter
        </Link>
      </div>
      <ToolNotes notes={result.notes} />
      <p style={{ color: "#415049", lineHeight: 1.6, margin: 0 }}>
        The control names are guessed from common prefixes such as txt, cmb, dp and tgl. If yours are named differently, type the full value instead, such as{" "}
        <code>TextInput1.Text</code>. The{" "}
        <Link href="/cheat-sheets/patch-sharepoint-columns-cheat-sheet" style={{ color: "var(--accent-strong)", fontWeight: 800 }}>Patch SharePoint columns cheat sheet</Link>{" "}
        explains each record shape.
      </p>
    </ToolShell>
  );
}
