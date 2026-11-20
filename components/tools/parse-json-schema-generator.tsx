"use client";

import { useMemo, useState } from "react";
import { CopyCodeBlock } from "@/components/ui/copy-code-block";
import { Toggle, ToolNotes, ToolShell } from "@/components/resources/tool-shell";
import { analyzeSample, type SchemaReport } from "@/lib/tools/json-schema";

const sampleJson = `{
  "requestId": 1042,
  "title": "New laptop",
  "amount": 1299,
  "approved": false,
  "manager": null,
  "requester": {
    "name": "Ana Silva",
    "email": "ana@contoso.com"
  },
  "lines": [
    { "sku": "LT-14", "quantity": 1 },
    { "sku": "DOCK-2", "quantity": 1, "note": "USB-C" }
  ]
}`;

export function ParseJsonSchemaGenerator() {
  const [json, setJson] = useState(sampleJson);
  const [actionName, setActionName] = useState("Parse JSON");
  const [allowNulls, setAllowNulls] = useState(true);
  const [numbersAsNumber, setNumbersAsNumber] = useState(true);
  const [includeRequired, setIncludeRequired] = useState(false);

  const result = useMemo((): { report?: SchemaReport; error?: string } => {
    if (!json.trim()) return { error: "Paste a sample JSON payload to generate a schema." };
    try {
      return { report: analyzeSample(json, { allowNulls, numbersAsNumber, includeRequired }, actionName) };
    } catch (error) {
      return { error: "This isn't valid JSON: " + (error instanceof Error ? error.message : "check the brackets, quotes, and commas.") };
    }
  }, [actionName, allowNulls, includeRequired, json, numbersAsNumber]);

  const notes: string[] = [];
  if (result.report && result.report.nullOnlyPaths.length > 0) {
    notes.push(
      `These values were null in the sample, so the schema accepts any type for them: ${result.report.nullOnlyPaths.join(", ")}. Paste a sample where they have a value to get a typed schema.`
    );
  }
  if (!allowNulls) notes.push("Nulls are only allowed where the sample had null. If a field can be empty in a real run, Parse JSON fails with \"Expected String but got Null\".");
  if (includeRequired) notes.push("Required lists make Parse JSON fail when a property is missing from a run. Leave them off unless you want that check.");

  return (
    <ToolShell
      title="Parse JSON schema generator"
      description="Paste a sample payload, choose how strict the schema should be, and paste the result into the Schema box of the Parse JSON action. Everything runs in your browser."
    >
      <label className="field">
        <span>Sample JSON</span>
        <textarea className="tool-textarea" onChange={(event) => setJson(event.target.value)} spellCheck={false} style={{ minHeight: 260 }} value={json} />
      </label>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <label className="field">
          <span>Parse JSON action name</span>
          <input onChange={(event) => setActionName(event.target.value)} value={actionName} />
        </label>
      </div>
      <div className="badge-row">
        <Toggle checked={allowNulls} label="Allow null on every property" onChange={setAllowNulls} />
        <Toggle checked={numbersAsNumber} label="Treat whole numbers as number" onChange={setNumbersAsNumber} />
        <Toggle checked={includeRequired} label="Add required lists" onChange={setIncludeRequired} />
      </div>

      {result.error ? (
        <div className="stat-tile" role="alert">
          <div className="eyebrow">Sample JSON</div>
          <strong>{result.error}</strong>
        </div>
      ) : null}

      {result.report ? (
        <>
          <CopyCodeBlock code={JSON.stringify(result.report.schema, null, 2)} copyEvent="Parse JSON Schema Copied" label="Schema for Parse JSON" />
          <ToolNotes notes={notes} />
          {result.report.expressions.length > 0 ? (
            <CopyCodeBlock
              code={result.report.expressions.map((entry) => `${entry.path}\n  ${entry.expression}`).join("\n")}
              copyEvent="Parse JSON Expressions Copied"
              label="Expressions to read each value"
            />
          ) : null}
        </>
      ) : null}
    </ToolShell>
  );
}
