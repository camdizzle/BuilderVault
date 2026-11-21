"use client";

import { useState } from "react";
import { CopyCodeBlock } from "@/components/ui/copy-code-block";
import { Toggle, ToolNotes, ToolShell } from "@/components/resources/tool-shell";
import {
  dueDateFormat,
  isPowerAppsPlayUrl,
  multiChoicePillsFormat,
  rowClasses,
  rowHighlightFormat,
  parseStatusRules,
  personEmailFormat,
  pillColors,
  powerAppsButtonFormat,
  progressBarFormat,
  statusPillFormat
} from "@/lib/tools/column-formatting";

type TemplateKey = "status" | "multiChoice" | "row" | "dueDate" | "progress" | "person" | "appButton";

const templates: Record<TemplateKey, { label: string; columnType: string }> = {
  status: { label: "Status pill", columnType: "Choice or single line of text" },
  multiChoice: { label: "Pills for multiple choices", columnType: "Choice that allows multiple selections" },
  row: { label: "Color the whole row", columnType: "A view (Format current view, Advanced mode)" },
  dueDate: { label: "Due date highlight", columnType: "Date and time" },
  progress: { label: "Progress bar", columnType: "Number" },
  person: { label: "Email the person", columnType: "Person (single selection)" },
  appButton: { label: "Open in Power Apps button", columnType: "Any column, such as Title" }
};

const previewRow = { alignItems: "center", display: "flex", gap: 12, minHeight: 34 } as const;

export function ColumnFormattingBuilder() {
  const [template, setTemplate] = useState<TemplateKey>("status");
  const [statusText, setStatusText] = useState("Approved|green\nIn review|amber\nRejected|red\nDraft|grey");
  const [warningDays, setWarningDays] = useState("7");
  const [scale, setScale] = useState<"percent" | "fraction">("percent");
  const [barColor, setBarColor] = useState("#0f766e");
  const [subject, setSubject] = useState("About:");
  const [includeTitle, setIncludeTitle] = useState(true);
  const [appUrl, setAppUrl] = useState("");
  const [buttonLabel, setButtonLabel] = useState("Open in app");
  const [parameterName, setParameterName] = useState("ID");
  const [rowColumn, setRowColumn] = useState("Status");

  const rules = parseStatusRules(statusText);
  const days = Number.isFinite(Number(warningDays)) ? Math.max(0, Math.floor(Number(warningDays))) : 0;
  const safeBarColor = /^#[0-9a-f]{6}$/i.test(barColor.trim()) ? barColor.trim() : "#0f766e";
  const param = parameterName.trim().replace(/[^A-Za-z0-9_]/g, "") || "ID";

  const format =
    template === "status"
      ? statusPillFormat(rules)
      : template === "multiChoice"
        ? multiChoicePillsFormat(rules)
        : template === "row"
          ? rowHighlightFormat(rowColumn, rules)
          : template === "dueDate"
        ? dueDateFormat(days)
        : template === "progress"
          ? progressBarFormat(scale, barColor)
          : template === "person"
            ? personEmailFormat(subject, includeTitle)
            : powerAppsButtonFormat(appUrl, buttonLabel, parameterName, barColor);

  const notes: string[] = [];
  if (template === "row") {
    if (rules.some((rule) => !rowClasses[rule.color])) notes.push("Rows can only use SharePoint's built-in highlight colors: green, blue, amber and red. Rows for grey or purple values stay as they are.");
    notes.push("Use the column's internal name. Values must match the column's values exactly, including capital letters.");
  }
  if (template === "status" || template === "multiChoice") {
    if (rules.length === 0) notes.push("Add at least one value, such as Approved|green.");
    if (rules.some((rule) => rule.value.includes("'"))) notes.push("A value contains an apostrophe. It is escaped in the JSON, but test the format on one view before rolling it out.");
    notes.push("Values must match the choices exactly, including capital letters. Any other value gets a grey pill.");
  }
  if (template === "dueDate") notes.push("Overdue means the date and time are before now. For a date-only column, that is from midnight at the start of the due date.");
  if (template === "progress") {
    notes.push(
      scale === "fraction"
        ? "Use this setting when the column is shown as a percentage. SharePoint stores 35% as 0.35."
        : "Use this setting when the column holds whole numbers from 0 to 100."
    );
    if (safeBarColor !== barColor.trim()) notes.push("The bar color isn't a 6-digit hex color such as #0f766e, so the default is used.");
  }
  if (template === "person") notes.push("This works for person columns that allow one person. Columns that allow multiple people need a different format.");
  if (template === "appButton") {
    if (!appUrl.trim()) notes.push("Paste the app's web link. In Power Apps, open the app's Details page and copy the Web link.");
    else if (!isPowerAppsPlayUrl(appUrl)) notes.push("This doesn't look like a Power Apps web link. It normally starts with https://apps.powerapps.com/play/.");
    notes.push(`In the app, read the item with LookUp(YourList, ID = Value(Param("${param}"))), for example in a screen's OnVisible or a form's Item property.`);
  }

  return (
    <ToolShell
      title="Column formatting builder"
      description="Pick a layout, set the options, and copy the JSON. For a column, select the column header, then Column settings, Format this column, Advanced mode. For the whole row, open the view menu, then Format current view, Advanced mode."
    >
      <div className="badge-row">
        {(Object.keys(templates) as TemplateKey[]).map((key) => (
          <Toggle checked={template === key} key={key} label={templates[key].label} onChange={() => setTemplate(key)} />
        ))}
      </div>
      <p style={{ color: "#415049", lineHeight: 1.6, margin: 0 }}>
        <strong style={{ color: "var(--foreground)" }}>Apply it to:</strong> {templates[template].columnType}
      </p>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
          {template === "row" ? (
            <label className="field">
              <span>Column to check (internal name)</span>
              <input onChange={(event) => setRowColumn(event.target.value)} spellCheck={false} value={rowColumn} />
            </label>
          ) : null}
          {template === "status" || template === "multiChoice" || template === "row" ? (
            <label className="field">
              <span>Values, one per line as Value|color ({Object.keys(pillColors).join(", ")})</span>
              <textarea className="tool-textarea" onChange={(event) => setStatusText(event.target.value)} spellCheck={false} style={{ minHeight: 140 }} value={statusText} />
            </label>
          ) : null}
          {template === "dueDate" ? (
            <label className="field">
              <span>Show amber this many days before the date (0 for red only)</span>
              <input inputMode="numeric" onChange={(event) => setWarningDays(event.target.value)} value={warningDays} />
            </label>
          ) : null}
          {template === "progress" ? (
            <>
              <label className="field">
                <span>The column stores</span>
                <select onChange={(event) => setScale(event.target.value as "percent" | "fraction")} value={scale}>
                  <option value="percent">A number from 0 to 100</option>
                  <option value="fraction">A percentage column (0 to 1)</option>
                </select>
              </label>
              <label className="field">
                <span>Bar color (hex)</span>
                <input onChange={(event) => setBarColor(event.target.value)} spellCheck={false} value={barColor} />
              </label>
            </>
          ) : null}
          {template === "person" ? (
            <>
              <label className="field">
                <span>Email subject (optional)</span>
                <input onChange={(event) => setSubject(event.target.value)} value={subject} />
              </label>
              <Toggle checked={includeTitle} label="Add the item's Title to the subject" onChange={setIncludeTitle} />
            </>
          ) : null}
          {template === "appButton" ? (
            <>
              <label className="field">
                <span>Power Apps web link</span>
                <input onChange={(event) => setAppUrl(event.target.value)} placeholder="https://apps.powerapps.com/play/e/..." spellCheck={false} value={appUrl} />
              </label>
              <label className="field">
                <span>Button text</span>
                <input onChange={(event) => setButtonLabel(event.target.value)} value={buttonLabel} />
              </label>
              <label className="field">
                <span>Parameter name for the item ID</span>
                <input onChange={(event) => setParameterName(event.target.value)} spellCheck={false} value={parameterName} />
              </label>
              <label className="field">
                <span>Button color (hex)</span>
                <input onChange={(event) => setBarColor(event.target.value)} spellCheck={false} value={barColor} />
              </label>
            </>
          ) : null}
        </div>

        <div aria-label="Approximate preview" style={{ alignContent: "start", background: "#ffffff", border: "1px solid var(--line)", borderRadius: 8, color: "#201f1e", display: "grid", gap: 6, padding: 16 }}>
          <div className="eyebrow">Approximate preview</div>
          {template === "multiChoice" ? (
            <div style={{ ...previewRow, flexWrap: "wrap", gap: 4 }}>
              {rules.slice(0, 3).map((rule) => (
                <span key={rule.value} style={{ background: pillColors[rule.color].background, borderRadius: 12, color: pillColors[rule.color].text, fontWeight: 600, padding: "2px 10px" }}>{rule.value}</span>
              ))}
            </div>
          ) : null}
          {template === "row"
            ? rules.map((rule, index) => (
                <div key={index} style={{ ...previewRow, background: rowClasses[rule.color] ? pillColors[rule.color].background : "transparent", padding: "0 8px" }}>
                  <span>Item with {rowColumn || "Status"} = {rule.value}</span>
                </div>
              ))
            : null}
          {template === "status"
            ? [...rules, { value: "Any other value", color: "grey" as const }].map((rule, index) => (
                <div key={index} style={previewRow}>
                  <span style={{ background: pillColors[rule.color].background, borderRadius: 12, color: pillColors[rule.color].text, fontWeight: 600, padding: "2px 10px" }}>
                    {rule.value}
                  </span>
                </div>
              ))
            : null}
          {template === "dueDate"
            ? [
                { label: "Yesterday", background: pillColors.red.background, color: pillColors.red.text, weight: 600 },
                ...(days > 0 ? [{ label: `In ${days === 1 ? "1 day" : Math.max(1, days - 1) + " days"}`, background: pillColors.amber.background, color: pillColors.amber.text, weight: 400 }] : []),
                { label: `In ${days + 30} days`, background: "transparent", color: "inherit", weight: 400 }
              ].map((row) => (
                <div key={row.label} style={previewRow}>
                  <span style={{ background: row.background, borderRadius: 4, color: row.color, fontWeight: row.weight, padding: "2px 8px" }}>{row.label}</span>
                </div>
              ))
            : null}
          {template === "progress"
            ? [10, 55, 100].map((value) => (
                <div key={value} style={previewRow}>
                  <div style={{ background: "#edebe9", borderRadius: 6, flexGrow: 1, height: 12, overflow: "hidden" }}>
                    <div style={{ background: safeBarColor, height: "100%", width: value + "%" }} />
                  </div>
                  <span style={{ minWidth: 40, textAlign: "right" }}>{value}%</span>
                </div>
              ))
            : null}
          {template === "person" ? (
            <div style={previewRow}>
              <span style={{ color: "#0f6cbd" }}>Ana Silva</span>
              <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>opens a new email to the person</span>
            </div>
          ) : null}
          {template === "appButton" ? (
            <div style={previewRow}>
              <span style={{ background: safeBarColor, borderRadius: 4, color: "#ffffff", fontWeight: 600, padding: "4px 12px" }}>{buttonLabel.trim() || "Open in app"}</span>
            </div>
          ) : null}
        </div>
      </div>

      <CopyCodeBlock code={JSON.stringify(format, null, 2)} copyEvent="Column Formatting Copied" label={template === "row" ? "View formatting JSON" : "Column formatting JSON"} />
      <ToolNotes notes={notes} />
    </ToolShell>
  );
}
