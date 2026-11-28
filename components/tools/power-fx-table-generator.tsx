"use client";

import { useMemo } from "react";
import { useSavedState } from "@/components/tools/saved-state";
import { CopyCodeBlock } from "@/components/ui/copy-code-block";
import { Toggle, ToolNotes, ToolShell } from "@/components/resources/tool-shell";
import { buildPowerFxTable, cleanName, type TableOutputMode, type TableResult } from "@/lib/tools/power-fx-table";

const sampleCsv = `Product,Category,Price,In Stock,Added
Laptop 14,Hardware,1299.50,true,2026-01-15
USB-C Dock,Accessories,189,true,2026-02-01
"Monitor, 27 inch",Hardware,329.99,false,`;

const modeLabels: Record<TableOutputMode, string> = {
  clearCollect: "ClearCollect (collection)",
  set: "Set (global variable)",
  namedFormula: "Named formula (App.Formulas)",
  table: "Table() only"
};

const kindLabels: Record<TableResult["columns"][number]["kind"], string> = {
  text: "text",
  number: "number",
  boolean: "true/false",
  date: "date",
  datetime: "date and time",
  record: "record",
  table: "table",
  mixed: "mixed types"
};

export function PowerFxTableGenerator() {
  const [input, setInput] = useSavedState("input", sampleCsv);
  const [name, setName] = useSavedState("name", "colProducts");
  const [mode, setMode] = useSavedState<TableOutputMode>("mode", "clearCollect");
  const [semicolonLocale, setSemicolonLocale] = useSavedState("semicolonLocale", false);
  const [detectTypes, setDetectTypes] = useSavedState("detectTypes", true);

  const outcome = useMemo((): { result?: TableResult; error?: string } => {
    if (!input.trim()) return { error: "Paste CSV with a header row, or a JSON array of objects." };
    try {
      return { result: buildPowerFxTable(input, { name, mode, semicolonLocale, detectTypes }) };
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      return { error: error instanceof SyntaxError ? "This looks like JSON, but it isn't valid: " + message : message || "The data couldn't be read." };
    }
  }, [detectTypes, input, mode, name, semicolonLocale]);

  const result = outcome.result;

  return (
    <ToolShell
      title="Table and collection generator"
      description="Paste rows copied from Excel, a CSV file, or a JSON array, and get a Power Fx formula you can paste into App.OnStart, a button's OnSelect, or App.Formulas. Everything runs in your browser."
    >
      <label className="field">
        <span>CSV (with a header row) or JSON array</span>
        <textarea className="tool-textarea" onChange={(event) => setInput(event.target.value)} spellCheck={false} style={{ minHeight: 200 }} value={input} />
      </label>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <label className="field">
          <span>Output</span>
          <select onChange={(event) => setMode(event.target.value as TableOutputMode)} value={mode}>
            {(Object.keys(modeLabels) as TableOutputMode[]).map((key) => (
              <option key={key} value={key}>{modeLabels[key]}</option>
            ))}
          </select>
        </label>
        {mode !== "table" ? (
          <label className="field">
            <span>{mode === "set" ? "Variable name" : mode === "namedFormula" ? "Formula name" : "Collection name"}</span>
            <input onChange={(event) => setName(event.target.value)} placeholder={cleanName("", mode)} spellCheck={false} value={name} />
          </label>
        ) : null}
      </div>
      <div className="badge-row">
        <Toggle checked={detectTypes} label="Detect numbers, true/false, and dates in CSV" onChange={setDetectTypes} />
        <Toggle checked={semicolonLocale} label="Semicolon separators (decimal comma regions)" onChange={setSemicolonLocale} />
      </div>

      {outcome.error ? (
        <div className="stat-tile" role="alert">
          <div className="eyebrow">Input</div>
          <strong>{outcome.error}</strong>
        </div>
      ) : null}

      {result ? (
        <>
          <div className="stat-tile">
            <div className="eyebrow">{result.source === "json" ? "JSON" : "CSV"}: {result.rowCount} {result.rowCount === 1 ? "row" : "rows"}, {result.columns.length} {result.columns.length === 1 ? "column" : "columns"}</div>
            <p style={{ color: "#415049", lineHeight: 1.6, margin: 0, overflowWrap: "anywhere" }}>
              {result.columns.map((column) => `${column.name} (${kindLabels[column.kind]})`).join(", ")}
            </p>
          </div>
          <CopyCodeBlock code={result.formula} copyEvent="Power Fx Table Copied" label="Power Fx formula" />
          <ToolNotes notes={result.notes} />
        </>
      ) : null}
    </ToolShell>
  );
}
