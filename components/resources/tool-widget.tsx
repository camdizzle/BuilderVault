"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { CopyCodeBlock } from "@/components/ui/copy-code-block";

export function ToolWidget({ slug }: { slug: string }) {
  if (slug === "power-fx-formatter") return <PowerFxFormatter />;
  if (slug === "sharepoint-internal-name-helper") return <SharePointInternalNameHelper />;
  if (slug === "power-automate-expression-builder") return <ExpressionBuilder />;
  if (slug === "power-apps-color-token-generator") return <ColorTokenGenerator />;
  if (slug === "solution-layering-checklist-generator") return <SolutionChecklistGenerator />;
  return null;
}

function PowerFxFormatter() {
  const sampleFormula = `IfError(
Set(varSavedRequest,Patch(Requests,Defaults(Requests),{Title:txtTitle.Text,RequestStatus:{Value:"Submitted"},DueDate:dpDueDate.SelectedDate}));Notify("Request saved.",NotificationType.Success),Notify("The request could not be saved.",NotificationType.Error))`;
  const [formula, setFormula] = useState(sampleFormula);
  const formatted = useMemo(() => formatPowerFx(formula), [formula]);
  const checks = useMemo(() => analyzePowerFx(formula, formatted), [formula, formatted]);

  return (
    <ToolShell title="Power Fx formatter" description="Paste a Power Apps formula, then format it into readable lines and review common maintainability warnings before handoff.">
      <label className="field">
        <span>Power Fx formula</span>
        <textarea
          className="tool-textarea"
          onChange={(event) => setFormula(event.target.value)}
          spellCheck={false}
          value={formula}
        />
      </label>
      <div className="badge-row">
        <button className="chip-button" onClick={() => setFormula(sampleFormula)} type="button">
          Load sample
        </button>
        <button className="chip-button" onClick={() => setFormula("")} type="button">
          Clear
        </button>
        <span className="badge">{checks.lineCount} lines</span>
        <span className="badge">depth {checks.maxDepth}</span>
      </div>
      <CopyCodeBlock code={formatted || "Paste a formula to format it."} label="Formatted Power Fx" />
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        {checks.items.map((item) => (
          <div className="stat-tile" key={item.title}>
            <div className="eyebrow">{item.level}</div>
            <strong>{item.title}</strong>
            <p style={{ color: "#415049", lineHeight: 1.55, marginBottom: 0 }}>{item.detail}</p>
          </div>
        ))}
      </div>
    </ToolShell>
  );
}
function SharePointInternalNameHelper() {
  const [displayName, setDisplayName] = useState("Request Status");
  const internalName = useMemo(() => toSharePointInternalName(displayName), [displayName]);
  const schemaNote = `Display name: ${displayName || "Column Name"}
Recommended internal name: ${internalName || "ColumnName"}
Build note: Create the column with the final no-space name first, then rename the display label later only if needed.`;

  return (
    <ToolShell title="Internal name preview" description="Type a planned SharePoint column display name and document the internal name risk before apps and flows depend on it.">
      <label className="field">
        <span>Column display name</span>
        <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Request Status" />
      </label>
      <div className="stat-tile">
        <div className="eyebrow">Likely internal name</div>
        <strong style={{ fontSize: "1.5rem" }}>{internalName || "ColumnName"}</strong>
      </div>
      <CopyCodeBlock code={schemaNote} />
    </ToolShell>
  );
}

function ExpressionBuilder() {
  const [template, setTemplate] = useState("date");
  const [field, setField] = useState("DueDate");
  const [fallback, setFallback] = useState("No value provided");
  const [choice, setChoice] = useState("Submitted");
  const expression = useMemo(() => {
    if (template === "date") return `formatDateTime(triggerOutputs()?['body/${field}'], 'MMM d, yyyy')`;
    if (template === "fallback") return `coalesce(triggerOutputs()?['body/${field}'], '${fallback}')`;
    if (template === "choice") return `@equals(triggerOutputs()?['body/${field}/Value'], '${choice}')`;
    return `join(body('Select_-_${field}'), ';')`;
  }, [choice, fallback, field, template]);

  return (
    <ToolShell title="Expression builder" description="Generate common Power Automate expressions for dates, null fallbacks, choice trigger conditions, and joined arrays.">
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <label className="field">
          <span>Template</span>
          <select value={template} onChange={(event) => setTemplate(event.target.value)}>
            <option value="date">Format date</option>
            <option value="fallback">Null fallback</option>
            <option value="choice">Choice trigger condition</option>
            <option value="join">Join array output</option>
          </select>
        </label>
        <label className="field">
          <span>Field or action name</span>
          <input value={field} onChange={(event) => setField(event.target.value)} />
        </label>
        {template === "fallback" ? (
          <label className="field">
            <span>Fallback text</span>
            <input value={fallback} onChange={(event) => setFallback(event.target.value)} />
          </label>
        ) : null}
        {template === "choice" ? (
          <label className="field">
            <span>Choice value</span>
            <input value={choice} onChange={(event) => setChoice(event.target.value)} />
          </label>
        ) : null}
      </div>
      <CopyCodeBlock code={expression} />
    </ToolShell>
  );
}

function ColorTokenGenerator() {
  const [prefix, setPrefix] = useState("gblColorPrimary");
  const [hex, setHex] = useState("#0f766e");
  const rgba = useMemo(() => hexToRgba(hex), [hex]);
  const code = `Set(${prefix || "gblColorPrimary"}, RGBA(${rgba.r}, ${rgba.g}, ${rgba.b}, 1));`;

  return (
    <ToolShell title="Color token generator" description="Turn a brand hex color into a reusable Power Fx variable for app themes and component properties.">
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <label className="field">
          <span>Variable name</span>
          <input value={prefix} onChange={(event) => setPrefix(event.target.value)} />
        </label>
        <label className="field">
          <span>Hex color</span>
          <input value={hex} onChange={(event) => setHex(event.target.value)} placeholder="#0f766e" />
        </label>
      </div>
      <div className="stat-tile" style={{ alignItems: "center", display: "flex", gap: 14 }}>
        <span aria-hidden="true" style={{ background: `rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`, border: "1px solid var(--line)", borderRadius: 8, display: "inline-block", height: 46, width: 46 }} />
        <strong>RGBA({rgba.r}, {rgba.g}, {rgba.b}, 1)</strong>
      </div>
      <CopyCodeBlock code={code} />
    </ToolShell>
  );
}

function SolutionChecklistGenerator() {
  const [includeFlows, setIncludeFlows] = useState(true);
  const [includeCanvasApps, setIncludeCanvasApps] = useState(true);
  const [includeDataverse, setIncludeDataverse] = useState(true);
  const [environment, setEnvironment] = useState("Test");
  const checklist = useMemo(() => {
    const lines = [
      `${environment} release checklist`,
      "- Export solution from a clean development environment",
      "- Confirm managed import strategy",
      "- Review environment variables",
      "- Rebind connection references",
      "- Capture rollback notes"
    ];
    if (includeFlows) lines.push("- Turn cloud flows on after import", "- Run one successful flow test", "- Confirm service account ownership");
    if (includeCanvasApps) lines.push("- Publish canvas apps", "- Test app launch as a non-admin user", "- Confirm connectors and permissions");
    if (includeDataverse) lines.push("- Validate security roles", "- Confirm table relationships", "- Smoke test with real persona permissions");
    return lines.join("\n");
  }, [environment, includeCanvasApps, includeDataverse, includeFlows]);

  return (
    <ToolShell title="Solution checklist generator" description="Build a quick ALM preflight checklist based on the solution assets included in a release.">
      <label className="field">
        <span>Target environment</span>
        <select value={environment} onChange={(event) => setEnvironment(event.target.value)}>
          <option>Test</option>
          <option>Production</option>
          <option>Training</option>
        </select>
      </label>
      <div className="badge-row">
        <Toggle label="Cloud flows" checked={includeFlows} onChange={setIncludeFlows} />
        <Toggle label="Canvas apps" checked={includeCanvasApps} onChange={setIncludeCanvasApps} />
        <Toggle label="Dataverse" checked={includeDataverse} onChange={setIncludeDataverse} />
      </div>
      <CopyCodeBlock code={checklist} />
    </ToolShell>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className={`chip-button ${checked ? "active" : ""}`}>
      <input checked={checked} onChange={(event) => onChange(event.target.checked)} style={{ marginRight: 8 }} type="checkbox" />
      {label}
    </label>
  );
}

function ToolShell({ children, title, description }: { children: ReactNode; title: string; description: string }) {
  return (
    <section className="tool-panel">
      <div>
        <div className="eyebrow">Interactive tool</div>
        <h2 className="section-title" style={{ fontSize: "1.8rem" }}>{title}</h2>
        <p style={{ color: "#415049", lineHeight: 1.7, marginBottom: 0 }}>{description}</p>
      </div>
      {children}
    </section>
  );
}

function formatPowerFx(value: string) {
  const input = value.trim();
  if (!input) return "";

  const lines: string[] = [];
  let current = "";
  let depth = 0;
  let inString = false;

  function pushLine(nextDepth = depth) {
    const trimmed = current.trim();
    if (trimmed) {
      lines.push("    ".repeat(Math.max(nextDepth, 0)) + trimmed);
    }
    current = "";
  }

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const previous = input[index - 1];

    if (char === '"' && previous !== "\\") {
      inString = !inString;
      current += char;
      continue;
    }

    if (inString) {
      current += char;
      continue;
    }

    if (/\s/.test(char)) {
      if (current && !current.endsWith(" ")) current += " ";
      continue;
    }

    if (char === "(" || char === "{" || char === "[") {
      current = trimTrailingSpaces(current) + char;
      pushLine(depth);
      depth += 1;
      continue;
    }

    if (char === ")" || char === "}" || char === "]") {
      pushLine(depth);
      depth = Math.max(depth - 1, 0);
      current = char;
      continue;
    }

    if (char === "," || char === ";") {
      current = trimTrailingSpaces(current) + char;
      pushLine(depth);
      continue;
    }

    if (["=", ">", "<", "+", "-", "*", "/", "&"].includes(char)) {
      current = trimTrailingSpaces(current) + " " + char + " ";
      continue;
    }

    current += char;
  }

  pushLine(depth);
  return lines
    .map((line) => line.replace(/\s+([,;)}\]])/g, "$1").replace(/\s{2,}/g, " ").trimEnd())
    .join("\n");
}

function analyzePowerFx(original: string, formatted: string) {
  const lower = original.toLowerCase();
  const lineCount = formatted ? formatted.split("\n").length : 0;
  const maxDepth = Math.max(0, ...formatted.split("\n").map((line) => Math.floor(line.search(/\S|$/) / 4)));
  const items: Array<{ level: string; title: string; detail: string }> = [];

  if (!original.trim()) {
    items.push({ level: "Ready", title: "Paste a formula", detail: "Add Power Fx above to format it and see maintainability checks." });
    return { items, lineCount, maxDepth };
  }

  if (lower.includes("patch(") && !lower.includes("iferror(")) {
    items.push({ level: "Review", title: "Patch without IfError", detail: "Important save formulas should usually wrap Patch in IfError so users and support owners know when a save fails." });
  }

  if ((lower.match(/if\s*\(/g) ?? []).length >= 3) {
    items.push({ level: "Review", title: "Nested If logic", detail: "Several If calls can become hard to maintain. Consider With, Switch, or named variables for readability." });
  }

  if (lower.includes("forall(") && lower.includes("patch(")) {
    items.push({ level: "Caution", title: "ForAll with Patch", detail: "ForAll plus Patch can be valid, but test data volume, errors, and duplicate writes carefully." });
  }

  if (/\b(button|label|gallery|dropdown|combobox|textinput|form)\d+\b/i.test(original)) {
    items.push({ level: "Cleanup", title: "Default control names", detail: "Default names such as Button1 or Gallery3 make formulas harder to hand off. Rename controls before release." });
  }

  if (formatted.split("\n").some((line) => line.length > 120)) {
    items.push({ level: "Cleanup", title: "Long formatted lines", detail: "Some lines are still long after formatting. Consider breaking logic into With blocks or helper variables." });
  }

  if (maxDepth >= 5) {
    items.push({ level: "Cleanup", title: "Deep nesting", detail: "The formula nests several levels deep. Use With blocks or split logic across named formulas where possible." });
  }

  if (items.length === 0) {
    items.push({ level: "Looks good", title: "No obvious warnings", detail: "Formatting completed and the simple review checks did not find common handoff issues." });
  }

  return { items, lineCount, maxDepth };
}

function trimTrailingSpaces(value: string) {
  return value.replace(/\s+$/g, "");
}
function toSharePointInternalName(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(/\s+/)
    .map((part, index) => index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function hexToRgba(value: string) {
  const cleaned = value.replace("#", "").trim();
  const normalized = cleaned.length === 3 ? cleaned.split("").map((char) => char + char).join("") : cleaned.padEnd(6, "0").slice(0, 6);
  const number = Number.parseInt(normalized, 16);
  if (Number.isNaN(number)) return { r: 15, g: 118, b: 110 };
  return { r: (number >> 16) & 255, g: (number >> 8) & 255, b: number & 255 };
}

