"use client";

import Link from "next/link";
import { FilterQueryBuilder } from "@/components/tools/filter-query-builder";
import { useMemo, useState } from "react";
import { ParseJsonSchemaGenerator } from "@/components/tools/parse-json-schema-generator";
import { CopyCodeBlock } from "@/components/ui/copy-code-block";
import { TriggerConditionBuilder } from "@/components/tools/trigger-condition-builder";
import { Toggle, ToolShell } from "@/components/resources/tool-shell";
import { ColumnFormattingBuilder } from "@/components/tools/column-formatting-builder";
import {
  findDelegationHints,
  formatPowerFxFormula,
  minifyPowerFxFormula,
  type DelegationHint,
  type PowerFxLocale
} from "@/lib/tools/power-fx-format";
import { PowerFxTableGenerator } from "@/components/tools/power-fx-table-generator";

export function ToolWidget({ slug }: { slug: string }) {
  if (slug === "power-fx-formatter") return <PowerFxFormatter />;
  if (slug === "odata-filter-query-builder") return <FilterQueryBuilder />;
  if (slug === "sharepoint-internal-name-helper") return <SharePointInternalNameHelper />;
  if (slug === "parse-json-schema-generator") return <ParseJsonSchemaGenerator />;
  if (slug === "power-automate-expression-builder") return <ExpressionBuilder />;
  if (slug === "trigger-condition-builder") return <TriggerConditionBuilder />;
  if (slug === "power-apps-color-token-generator") return <ColorTokenGenerator />;
  if (slug === "sharepoint-column-formatting-builder") return <ColumnFormattingBuilder />;
  if (slug === "solution-layering-checklist-generator") return <SolutionChecklistGenerator />;
  if (slug === "dataverse-table-naming-helper") return <DataverseNamingHelper />;
  if (slug === "adaptive-card-preview-snippets") return <AdaptiveCardBuilder />;
  if (slug === "csv-to-power-fx-table") return <PowerFxTableGenerator />;
  return null;
}

function PowerFxFormatter() {
  const sampleFormula = `IfError(
Set(varSavedRequest,Patch(Requests,Defaults(Requests),{Title:txtTitle.Text,RequestStatus:{Value:"Submitted"},DueDate:dpDueDate.SelectedDate}));Notify("Request saved.",NotificationType.Success),Notify("The request could not be saved.",NotificationType.Error))`;
  const [formula, setFormula] = useState(sampleFormula);
  const [mode, setMode] = useState<"format" | "minify">("format");
  const [indent, setIndent] = useState(4);
  const [width, setWidth] = useState(80);
  const [locale, setLocale] = useState<PowerFxLocale>("en");
  const result = useMemo(
    () => (mode === "format" ? formatPowerFxFormula(formula, { indent, width, locale }) : minifyPowerFxFormula(formula, { locale })),
    [formula, mode, indent, width, locale]
  );
  const formatted = result.output;
  const delegationHints = useMemo(() => findDelegationHints(formula, locale), [formula, locale]);
  const checks = useMemo(() => analyzePowerFx(formula, formatted, result.maxDepth, delegationHints.length), [formula, formatted, result.maxDepth, delegationHints.length]);
  const reviewNotes = useMemo(() => buildPowerFxReviewNotes(checks, delegationHints), [checks, delegationHints]);
  const detectedPatterns = useMemo(() => detectPowerFxPatterns(formula), [formula]);
  const explanation = useMemo(() => explainPowerFx(formula), [formula]);

  return (
    <ToolShell title="Power Fx formatter" description="Paste a Power Apps formula to format it into readable lines, check for unbalanced brackets and delegation risks, and review common maintainability warnings before handoff. Everything runs in your browser.">
      <label className="field">
        <span>Power Fx formula</span>
        <textarea
          className="tool-textarea"
          onChange={(event) => setFormula(event.target.value)}
          spellCheck={false}
          value={formula}
        />
      </label>
      <div className="badge-row" role="group" aria-label="Formatter options">
        <Toggle label="Format" checked={mode === "format"} onChange={() => setMode("format")} />
        <Toggle label="Minify to one line" checked={mode === "minify"} onChange={() => setMode("minify")} />
        <label className="chip-button">
          Indent{" "}
          <select aria-label="Indent" disabled={mode === "minify"} onChange={(event) => setIndent(Number(event.target.value))} value={indent}>
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={0}>Tab</option>
          </select>
        </label>
        <label className="chip-button">
          Width{" "}
          <select aria-label="Line width" disabled={mode === "minify"} onChange={(event) => setWidth(Number(event.target.value))} value={width}>
            <option value={60}>60</option>
            <option value={80}>80</option>
            <option value={100}>100</option>
            <option value={120}>120</option>
          </select>
        </label>
        <Toggle label="Semicolon separators (; and ;;)" checked={locale === "eu"} onChange={(value) => setLocale(value ? "eu" : "en")} />
      </div>
      <div className="badge-row">
        <button className="chip-button" onClick={() => setFormula(sampleFormula)} type="button">
          Load sample
        </button>
        <button className="chip-button" onClick={() => setFormula("")} type="button">
          Clear
        </button>
        <button className="chip-button" disabled={!formatted} onClick={() => setFormula(formatted)} type="button">
          Replace input with result
        </button>
        <span className="badge">{checks.lineCount} lines</span>
        <span className="badge">depth {checks.maxDepth}</span>
        <span className={`badge ${checks.severityClass}`}>{checks.severity}</span>
      </div>
      {result.issues.length > 0 ? (
        <div className="stat-tile" role="alert">
          <div className="eyebrow">Syntax check</div>
          <strong>The formula looks unbalanced</strong>
          <ul style={{ color: "#415049", lineHeight: 1.55, marginBottom: 0 }}>
            {result.issues.slice(0, 5).map((issue) => (
              <li key={issue.message + issue.position}>
                {issue.message}
                {issue.position >= 0 ? ` (character ${issue.position + 1})` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <CopyCodeBlock code={formatted || "Paste a formula to format it."} copyEvent="Formatter Copied" label={mode === "format" ? "Formatted Power Fx" : "Minified Power Fx"} />
      <DelegationPanel hints={delegationHints} hasFormula={Boolean(formula.trim())} />
      <CopyCodeBlock code={reviewNotes} label="Review notes" />
      <FormulaExplainerPanel explanation={explanation} />
      <PatternDetectorPanel patterns={detectedPatterns} />
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

function DelegationPanel({ hasFormula, hints }: { hasFormula: boolean; hints: DelegationHint[] }) {
  return (
    <section className="pattern-detector-panel">
      <div>
        <div className="eyebrow">Delegation check</div>
        <h3 style={{ fontSize: "1.2rem", margin: "6px 0" }}>
          {!hasFormula ? "Paste a formula to check delegation" : hints.length > 0 ? `${hints.length} possible delegation ${hints.length === 1 ? "issue" : "issues"}` : "No common delegation risks found"}
        </h3>
        <p style={{ color: "#415049", lineHeight: 1.6, margin: 0 }}>
          These are hints, not a guarantee. Delegation depends on the data source and column type, so confirm against the warnings in Power Apps Studio.{" "}
          <Link href="/power-apps/delegation">Read the delegation guide</Link>.
        </p>
      </div>
      {hints.length > 0 ? (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {hints.map((hint) => (
            <div className="pattern-detection-card" key={hint.title}>
              <strong>{hint.title}</strong>
              <p>{hint.detail}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function FormulaExplainerPanel({ explanation }: { explanation: PowerFxExplanation }) {
  return (
    <section className="formula-explainer-panel">
      <div>
        <div className="eyebrow">Formula explainer</div>
        <h3 style={{ fontSize: "1.2rem", margin: "6px 0" }}>{explanation.title}</h3>
        <p style={{ color: "#415049", lineHeight: 1.6, margin: 0 }}>{explanation.summary}</p>
      </div>
      <ol className="formula-steps">
        {explanation.steps.map((step) => <li key={step}>{step}</li>)}
      </ol>
      {explanation.notes.length > 0 ? (
        <div className="badge-row">
          {explanation.notes.map((note) => <span className="badge" key={note}>{note}</span>)}
        </div>
      ) : null}
    </section>
  );
}
function PatternDetectorPanel({ patterns }: { patterns: DetectedPowerFxPattern[] }) {
  return (
    <section className="pattern-detector-panel">
      <div>
        <div className="eyebrow">Pattern detector</div>
        <h3 style={{ fontSize: "1.2rem", margin: "6px 0" }}>Detected Power Fx patterns</h3>
        <p style={{ color: "#415049", lineHeight: 1.6, margin: 0 }}>
          BuilderVault looks for common formula patterns and links them to deeper examples, cookbooks, and troubleshooting pages.
        </p>
      </div>
      {patterns.length > 0 ? (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {patterns.map((pattern) => (
            <div className="pattern-detection-card" key={pattern.id}>
              <div className="eyebrow">{pattern.category}</div>
              <strong>{pattern.title}</strong>
              <p>{pattern.detail}</p>
              <div className="badge-row">
                {pattern.links.map((link) => (
                  <Link className="badge" href={link.href} key={link.href}>{link.label}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="stat-tile">
          <strong>No known pattern detected yet.</strong>
          <p style={{ color: "#415049", lineHeight: 1.55, marginBottom: 0 }}>
            Try a formula with Patch, Filter, LookUp, ForAll, With, Switch, SubmitForm, Collect, or ClearCollect.
          </p>
        </div>
      )}
    </section>
  );
}

function SharePointInternalNameHelper() {
  const [displayName, setDisplayName] = useState("Request Status");
  const encodedName = useMemo(() => toSharePointEncodedInternalName(displayName), [displayName]);
  const cleanName = useMemo(() => toSharePointInternalName(displayName), [displayName]);
  const needsEncoding = encodedName !== displayName.trim();
  const schemaNote = `Display name: ${displayName || "Column Name"}
Internal name if created as typed: ${encodedName || "ColumnName"}${encodedName.length > 32 ? " (SharePoint truncates internal names to 32 characters)" : ""}
Recommended: create the column as ${cleanName || "ColumnName"}, then rename the display name to "${displayName.trim() || "Column Name"}".
Power Automate / REST: use ${needsEncoding ? encodedName.slice(0, 32) : cleanName || "ColumnName"} if the column was created with the display name above.`;

  return (
    <ToolShell title="Internal name preview" description="Type a planned SharePoint column display name to see the internal name SharePoint will create, and the cleaner name to create it with instead.">
      <label className="field">
        <span>Column display name</span>
        <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Request Status" />
      </label>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <div className="stat-tile">
          <div className="eyebrow">If created as typed</div>
          <strong style={{ fontSize: "1.2rem", overflowWrap: "anywhere" }}>{encodedName.slice(0, 32) || "ColumnName"}</strong>
          <p style={{ color: "#415049", lineHeight: 1.55, marginBottom: 0 }}>
            {needsEncoding ? "Spaces and symbols are encoded as _xHHHH_, which is what flows and REST calls must use." : "No encoding needed. This name is safe to use as typed."}
          </p>
        </div>
        <div className="stat-tile">
          <div className="eyebrow">Create it as</div>
          <strong style={{ fontSize: "1.2rem", overflowWrap: "anywhere" }}>{cleanName || "ColumnName"}</strong>
          <p style={{ color: "#415049", lineHeight: 1.55, marginBottom: 0 }}>Then rename the display name. The internal name never changes after creation.</p>
        </div>
      </div>
      <CopyCodeBlock code={schemaNote} />
    </ToolShell>
  );
}

function DataverseNamingHelper() {
  const [prefix, setPrefix] = useState("bv");
  const [displayName, setDisplayName] = useState("Service Request");
  const [pluralName, setPluralName] = useState("");
  const [columns, setColumns] = useState("Request Name\nDue Date\nPriority\nAssigned To");
  const cleanPrefix = prefix.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8);
  const plural = pluralName.trim() || pluralize(displayName.trim());
  const tableSchema = cleanPrefix + "_" + toPascalIdentifier(displayName);
  const prefixIssue = !/^[a-z][a-z0-9]{1,7}$/.test(cleanPrefix)
    ? "Publisher prefixes must be 2 to 8 letters or numbers, start with a letter, and can't start with mscrm."
    : cleanPrefix.startsWith("mscrm")
      ? "Prefixes starting with mscrm are reserved."
      : "";
  const columnRows = columns
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((column) => {
      const schema = cleanPrefix + "_" + toPascalIdentifier(column);
      return { display: column, schema, logical: schema.toLowerCase() };
    });
  const worksheet = [
    `Publisher prefix: ${cleanPrefix}`,
    `Table display name: ${displayName.trim()}`,
    `Plural display name: ${plural}`,
    `Table schema name: ${tableSchema}`,
    `Table logical name: ${tableSchema.toLowerCase()}`,
    `Entity set name (Web API): ${(cleanPrefix + "_" + toPascalIdentifier(plural)).toLowerCase()}  (check after creation; Dataverse may pluralize differently)`,
    "",
    "Columns:",
    ...columnRows.map((row) => `- ${row.display}: schema ${row.schema}, logical ${row.logical}`),
    "",
    "Relationship example:",
    `- ${cleanPrefix}_Account_${toPascalIdentifier(plural)} (one Account to many ${plural})`
  ].join("\n");

  return (
    <ToolShell title="Dataverse naming worksheet" description="Enter your publisher prefix, table name, and planned columns to get consistent schema and logical names before you build. Schema names can't be changed after creation.">
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <label className="field">
          <span>Publisher prefix</span>
          <input value={prefix} onChange={(event) => setPrefix(event.target.value)} placeholder="bv" />
        </label>
        <label className="field">
          <span>Table display name (singular)</span>
          <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Service Request" />
        </label>
        <label className="field">
          <span>Plural display name (optional)</span>
          <input value={pluralName} onChange={(event) => setPluralName(event.target.value)} placeholder={plural} />
        </label>
      </div>
      <label className="field">
        <span>Columns, one per line</span>
        <textarea className="tool-textarea" onChange={(event) => setColumns(event.target.value)} spellCheck={false} value={columns} />
      </label>
      {prefixIssue ? (
        <div className="stat-tile" role="alert">
          <div className="eyebrow">Prefix</div>
          <strong>{prefixIssue}</strong>
        </div>
      ) : null}
      <div className="stat-tile">
        <div className="eyebrow">Table schema name</div>
        <strong style={{ fontSize: "1.3rem", overflowWrap: "anywhere" }}>{tableSchema}</strong>
      </div>
      <CopyCodeBlock code={worksheet} label="Naming worksheet" />
    </ToolShell>
  );
}

type CardFact = { title: string; value: string };

const adaptiveCardTemplates = {
  approval: {
    label: "Approval request",
    title: "Approval needed: @{triggerBody()?['Title']}",
    body: "@{triggerBody()?['Author']?['DisplayName']} submitted a request that needs your decision.",
    facts: "Request|@{triggerBody()?['Title']}\nRequested by|@{triggerBody()?['Author']?['DisplayName']}\nDue|@{formatDateTime(triggerBody()?['DueDate'], 'MMM d, yyyy')}",
    actions: "Approve\nReject",
    withComment: true
  },
  notification: {
    label: "Notification",
    title: "Request updated",
    body: "The status of @{triggerBody()?['Title']} changed to @{triggerBody()?['Status']?['Value']}.",
    facts: "Status|@{triggerBody()?['Status']?['Value']}\nUpdated by|@{triggerBody()?['Editor']?['DisplayName']}",
    actions: "",
    withComment: false
  },
  review: {
    label: "Review with comments",
    title: "Please review: @{triggerBody()?['Title']}",
    body: "Add a comment and choose an outcome.",
    facts: "Request|@{triggerBody()?['Title']}\nOwner|@{triggerBody()?['Author']?['Email']}",
    actions: "Submit review",
    withComment: true
  }
} as const;

type CardTemplateKey = keyof typeof adaptiveCardTemplates;

function AdaptiveCardBuilder() {
  const [templateKey, setTemplateKey] = useState<CardTemplateKey>("approval");
  const template = adaptiveCardTemplates[templateKey];
  const [title, setTitle] = useState<string>(template.title);
  const [body, setBody] = useState<string>(template.body);
  const [factsText, setFactsText] = useState<string>(template.facts);
  const [actionsText, setActionsText] = useState<string>(template.actions);
  const [withComment, setWithComment] = useState<boolean>(template.withComment);
  const [viewUrl, setViewUrl] = useState("");

  function applyTemplate(key: CardTemplateKey) {
    const next = adaptiveCardTemplates[key];
    setTemplateKey(key);
    setTitle(next.title);
    setBody(next.body);
    setFactsText(next.facts);
    setActionsText(next.actions);
    setWithComment(next.withComment);
  }

  const facts: CardFact[] = factsText
    .split("\n")
    .map((line) => line.split("|"))
    .filter((parts) => parts[0]?.trim())
    .map(([factTitle, ...rest]) => ({ title: factTitle.trim(), value: rest.join("|").trim() }));
  const actions = actionsText.split("\n").map((line) => line.trim()).filter(Boolean);

  const card = {
    type: "AdaptiveCard",
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    version: "1.4",
    body: [
      { type: "TextBlock", text: title, weight: "Bolder", size: "Medium", wrap: true },
      ...(body ? [{ type: "TextBlock", text: body, wrap: true }] : []),
      ...(facts.length > 0 ? [{ type: "FactSet", facts }] : []),
      ...(withComment ? [{ type: "Input.Text", id: "comment", placeholder: "Add a comment", isMultiline: true }] : [])
    ],
    actions: [
      ...actions.map((action) => ({ type: "Action.Submit", title: action, data: { decision: action } })),
      ...(viewUrl.trim() ? [{ type: "Action.OpenUrl", title: "View item", url: viewUrl.trim() }] : [])
    ]
  };
  const json = JSON.stringify(card, null, 2);

  return (
    <ToolShell title="Adaptive Card builder" description="Pick a starting layout, edit the text, facts, and buttons, then copy the JSON into the Post adaptive card in a chat or channel action in Power Automate. The preview is a simplified sketch, not the exact Teams rendering.">
      <div className="badge-row">
        {(Object.keys(adaptiveCardTemplates) as CardTemplateKey[]).map((key) => (
          <Toggle checked={templateKey === key} key={key} label={adaptiveCardTemplates[key].label} onChange={() => applyTemplate(key)} />
        ))}
      </div>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <div style={{ display: "grid", gap: 12 }}>
          <label className="field">
            <span>Title</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className="field">
            <span>Body text</span>
            <input value={body} onChange={(event) => setBody(event.target.value)} />
          </label>
          <label className="field">
            <span>Facts, one per line as Label|Value</span>
            <textarea className="tool-textarea" onChange={(event) => setFactsText(event.target.value)} spellCheck={false} value={factsText} />
          </label>
          <label className="field">
            <span>Buttons, one per line (leave empty for none)</span>
            <textarea className="tool-textarea" onChange={(event) => setActionsText(event.target.value)} spellCheck={false} style={{ minHeight: 80 }} value={actionsText} />
          </label>
          <label className="field">
            <span>View item link (optional)</span>
            <input value={viewUrl} onChange={(event) => setViewUrl(event.target.value)} placeholder="@{triggerBody()?['{Link}']}" />
          </label>
          <Toggle checked={withComment} label="Include a comment box" onChange={setWithComment} />
        </div>
        <div className="adaptive-card-preview" aria-label="Card preview">
          <strong style={{ fontSize: "1.05rem" }}>{title}</strong>
          {body ? <p style={{ margin: 0 }}>{body}</p> : null}
          {facts.length > 0 ? (
            <dl style={{ display: "grid", gap: 4, gridTemplateColumns: "auto 1fr", margin: 0 }}>
              {facts.map((fact) => (
                <div key={fact.title} style={{ display: "contents" }}>
                  <dt style={{ fontWeight: 700 }}>{fact.title}</dt>
                  <dd style={{ margin: 0, overflowWrap: "anywhere" }}>{fact.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {withComment ? <div className="adaptive-card-input">Add a comment</div> : null}
          {actions.length > 0 || viewUrl.trim() ? (
            <div className="badge-row">
              {actions.map((action) => <span className="adaptive-card-button" key={action}>{action}</span>)}
              {viewUrl.trim() ? <span className="adaptive-card-button">View item</span> : null}
            </div>
          ) : null}
        </div>
      </div>
      <CopyCodeBlock code={json} copyEvent="Adaptive Card Copied" label="Adaptive Card JSON (version 1.4)" />
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


type PowerFxExplanation = {
  title: string;
  summary: string;
  steps: string[];
  notes: string[];
};

function explainPowerFx(value: string): PowerFxExplanation {
  const lower = value.toLowerCase();
  const steps: string[] = [];
  const notes: string[] = [];

  if (!lower.trim()) {
    return {
      title: "Paste a formula to explain it",
      summary: "The explainer will describe the formula flow in plain language once Power Fx is entered.",
      steps: ["Paste a formula into the editor above."],
      notes: []
    };
  }

  if (lower.includes("iferror(")) {
    steps.push("Runs the main formula inside an error-handling wrapper.");
    notes.push("Error-handled");
  }

  if (lower.includes("set(")) {
    const variables = extractFunctionFirstArguments(value, "Set");
    steps.push(variables.length > 0 ? "Stores values in app variables: " + variables.join(", ") + "." : "Stores one or more values in app variables for later use.");
    notes.push("Uses variables");
  }

  if (lower.includes("updatecontext(")) {
    steps.push("Updates one or more screen-level context variables.");
    notes.push("Screen state");
  }

  if (lower.includes("patch(")) {
    const patchTargets = extractFunctionFirstArguments(value, "Patch");
    steps.push(patchTargets.length > 0 ? "Saves data with Patch against " + uniqueValues(patchTargets).join(", ") + "." : "Saves data with Patch.");
    if (lower.includes("defaults(")) {
      steps.push("Creates a new record because Defaults is used as the base record.");
      notes.push("Creates record");
    } else {
      steps.push("Updates an existing record or selected record.");
      notes.push("Updates record");
    }
  }

  if (lower.includes("submitform(")) {
    steps.push("Submits an edit form and relies on the form control for validation and save behavior.");
    notes.push("Form submit");
  }

  if (lower.includes("filter(")) {
    const targets = extractFunctionFirstArguments(value, "Filter");
    steps.push(targets.length > 0 ? "Filters records from " + uniqueValues(targets).join(", ") + "." : "Filters a table or data source before display or processing.");
    notes.push("Filter");
  }

  if (lower.includes("lookup(")) {
    const targets = extractFunctionFirstArguments(value, "LookUp");
    steps.push(targets.length > 0 ? "Finds a single matching record from " + uniqueValues(targets).join(", ") + "." : "Finds a single matching record.");
    notes.push("Lookup");
  }

  if (lower.includes("forall(")) {
    steps.push("Loops through a table and runs logic once for each row.");
    notes.push("Loop");
  }

  if (lower.includes("clearcollect(")) {
    const targets = extractFunctionFirstArguments(value, "ClearCollect");
    steps.push(targets.length > 0 ? "Clears and rebuilds local collection " + uniqueValues(targets).join(", ") + "." : "Clears and rebuilds a local collection.");
    notes.push("Collection");
  } else if (lower.includes("collect(")) {
    const targets = extractFunctionFirstArguments(value, "Collect");
    steps.push(targets.length > 0 ? "Adds records to local collection " + uniqueValues(targets).join(", ") + "." : "Adds records to a local collection.");
    notes.push("Collection");
  }

  if (lower.includes("with(")) {
    steps.push("Creates a local named record with With so later logic can reference intermediate values more clearly.");
    notes.push("Readable block");
  }

  if (lower.includes("switch(")) {
    steps.push("Branches through multiple outcomes with Switch, usually based on a status, mode, command, or selected value.");
    notes.push("Branching");
  } else if (/(^|[^a-z])if\s*\(/i.test(value)) {
    steps.push("Evaluates conditional logic with If and runs different branches depending on the result.");
    notes.push("Conditional");
  }

  if (lower.includes("notify(")) {
    steps.push("Shows user feedback with Notify after the formula finishes or fails.");
    notes.push("User feedback");
  }

  if (lower.includes("navigate(")) {
    steps.push("Navigates the user to another screen after the earlier logic runs.");
    notes.push("Navigation");
  }

  if (steps.length === 0) {
    steps.push("Uses Power Fx logic that does not match one of the current explainer patterns yet.");
  }

  return {
    title: "Plain-English formula flow",
    summary: "This is a heuristic explanation based on common Power Fx functions and formula shapes. Review the output before using it as documentation.",
    steps: uniqueValues(steps),
    notes: uniqueValues(notes)
  };
}

function extractFunctionFirstArguments(value: string, functionName: string) {
  const regex = new RegExp(functionName + "\\s*\\(", "gi");
  const matches: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(value)) !== null) {
    const start = match.index + match[0].length;
    const argument = readFirstArgument(value, start);
    if (argument) matches.push(argument);
  }

  return matches;
}

function readFirstArgument(value: string, start: number) {
  let depth = 0;
  let inString = false;
  let result = "";

  for (let index = start; index < value.length; index += 1) {
    const char = value[index];
    const previous = value[index - 1];

    if (char === '"' && previous !== "\\") {
      inString = !inString;
      result += char;
      continue;
    }

    if (!inString) {
      if (char === "(" || char === "{" || char === "[") depth += 1;
      if (char === ")" || char === "}" || char === "]") depth = Math.max(depth - 1, 0);
      if ((char === "," || char === ";") && depth === 0) break;
    }

    result += char;
  }

  return cleanArgumentLabel(result);
}

function cleanArgumentLabel(value: string) {
  const cleaned = value.trim().replace(/\s+/g, " ");
  if (!cleaned) return "";
  if (cleaned.length > 36) return cleaned.slice(0, 33).trimEnd() + "...";
  return cleaned;
}

function uniqueValues(values: string[]) {
  return values.filter((value, index, allValues) => value && allValues.indexOf(value) === index);
}
type DetectedPowerFxPattern = {
  id: string;
  title: string;
  category: string;
  detail: string;
  links: Array<{ href: string; label: string }>;
};

const powerFxPatternRules: Array<DetectedPowerFxPattern & { terms: string[] }> = [
  {
    id: "patch-save",
    title: "Patch save formula",
    category: "Save behavior",
    detail: "This formula appears to save data with Patch. Review field shapes, validation, IfError, and the returned saved record.",
    terms: ["patch("],
    links: [
      { href: "/examples/power-apps-patch-examples", label: "Patch examples" },
      { href: "/cookbooks/power-apps-patch-cookbook", label: "Patch cookbook" },
      { href: "/cheat-sheets/patch-sharepoint-columns-cheat-sheet", label: "Column shapes" }
    ]
  },
  {
    id: "filter-gallery",
    title: "Filter or gallery query",
    category: "Gallery filtering",
    detail: "Filter-style formulas often need delegation review, especially with SharePoint and large lists.",
    terms: ["filter(", "search(", "startswith("],
    links: [
      { href: "/examples/power-apps-collections-examples", label: "Gallery examples" },
      { href: "/cheat-sheets/power-apps-gallery-filtering-cheat-sheet", label: "Filtering cheat sheet" },
      { href: "/power-apps/delegation", label: "Delegation patterns" }
    ]
  },
  {
    id: "lookup-reference",
    title: "LookUp reference",
    category: "Data lookup",
    detail: "LookUp formulas should be checked for delegation, unique keys, and repeated calls inside galleries.",
    terms: ["lookup("],
    links: [
      { href: "/power-apps/delegation", label: "Delegation patterns" },
      { href: "/patterns/patch-sharepoint-lookup-field", label: "Lookup patch pattern" },
      { href: "/sharepoint/list-schemas", label: "List schema patterns" }
    ]
  },
  {
    id: "with-block",
    title: "With block",
    category: "Readability",
    detail: "With blocks can make long formulas easier to review by naming intermediate values.",
    terms: ["with("],
    links: [
      { href: "/standards/power-apps-naming-standards", label: "Naming standards" },
      { href: "/tools/power-fx-formatter", label: "Formatter" },
      { href: "/examples/power-apps-patch-examples", label: "Patch examples" }
    ]
  },
  {
    id: "switch-branching",
    title: "Switch branching",
    category: "Branching logic",
    detail: "Switch can be clearer than nested If when routing by status, mode, role, or command.",
    terms: ["switch("],
    links: [
      { href: "/standards/power-apps-naming-standards", label: "App standards" },
      { href: "/power-apps/forms", label: "Form patterns" },
      { href: "/examples/power-apps-patch-examples", label: "Save examples" }
    ]
  },
  {
    id: "forall-bulk",
    title: "ForAll bulk operation",
    category: "Bulk update",
    detail: "ForAll often means row-by-row work. Review duplicates, errors, delegation assumptions, and whether bulk save is really needed.",
    terms: ["forall("],
    links: [
      { href: "/cookbooks/power-apps-collections-cookbook", label: "Collections cookbook" },
      { href: "/examples/power-apps-collections-examples", label: "Collections examples" },
      { href: "/standards/error-handling-standards", label: "Error standards" }
    ]
  },
  {
    id: "collection-work",
    title: "Collection staging",
    category: "Collections",
    detail: "Collect and ClearCollect indicate local staging. Confirm volume, refresh behavior, and whether data can become stale.",
    terms: ["collect(", "clearcollect("],
    links: [
      { href: "/cookbooks/power-apps-collections-cookbook", label: "Collections cookbook" },
      { href: "/examples/power-apps-collections-examples", label: "Collections examples" },
      { href: "/power-apps/delegation", label: "Delegation" }
    ]
  },
  {
    id: "submit-form",
    title: "SubmitForm pattern",
    category: "Forms",
    detail: "SubmitForm is a form-first save pattern. Review OnSuccess, OnFailure, validation, and where Patch may still be needed.",
    terms: ["submitform("],
    links: [
      { href: "/power-apps/forms", label: "Form patterns" },
      { href: "/standards/error-handling-standards", label: "Error handling" },
      { href: "/examples/power-apps-patch-examples", label: "Patch alternative" }
    ]
  },
  {
    id: "error-handling",
    title: "Error handling wrapper",
    category: "Reliability",
    detail: "IfError or Errors indicates production-minded error handling. Confirm users get clear feedback and support owners get enough context.",
    terms: ["iferror(", "errors("],
    links: [
      { href: "/standards/error-handling-standards", label: "Error standards" },
      { href: "/examples/power-apps-patch-examples", label: "Patch examples" },
      { href: "/standards/logging-standards", label: "Logging standards" }
    ]
  }
];

function detectPowerFxPatterns(value: string): DetectedPowerFxPattern[] {
  const lower = value.toLowerCase();
  if (!lower.trim()) return [];

  return powerFxPatternRules
    .filter((rule) => rule.terms.some((term) => lower.includes(term)))
    .map((rule) => ({
      id: rule.id,
      title: rule.title,
      category: rule.category,
      detail: rule.detail,
      links: rule.links
    }));
}

function analyzePowerFx(original: string, formatted: string, maxDepth: number, delegationHintCount = 0) {
  const lower = original.toLowerCase();
  const lineCount = formatted ? formatted.split("\n").length : 0;
  const items: Array<{ level: string; title: string; detail: string }> = [];

  if (!original.trim()) {
    items.push({ level: "Ready", title: "Paste a formula", detail: "Add Power Fx above to format it and see maintainability checks." });
    return { items, lineCount, maxDepth, severity: "Ready", severityClass: "" };
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

  if (maxDepth >= 6) {
    items.push({ level: "Cleanup", title: "Deep nesting", detail: "The formula nests several levels deep. Use With blocks or split logic across named formulas where possible." });
  }

  if (items.length === 0 && delegationHintCount === 0) {
    items.push({ level: "Looks good", title: "No obvious warnings", detail: "Formatting completed and the simple review checks did not find common handoff issues." });
  }

  const reviewCount = items.filter((item) => item.level === "Review" || item.level === "Caution" || item.level === "Cleanup").length + delegationHintCount;
  const severity = reviewCount >= 3 || maxDepth >= 6 ? "Needs refactor" : reviewCount > 0 ? "Review" : "Clean";
  const severityClass = severity === "Clean" ? "free" : severity === "Review" ? "difficulty" : "premium";

  return { items, lineCount, maxDepth, severity, severityClass };
}


function buildPowerFxReviewNotes(checks: ReturnType<typeof analyzePowerFx>, delegationHints: DelegationHint[]) {
  return [
    "Power Fx review notes",
    "Severity: " + checks.severity,
    "Lines: " + checks.lineCount,
    "Nesting depth: " + checks.maxDepth,
    "",
    ...checks.items.map((item) => "- [" + item.level + "] " + item.title + ": " + item.detail),
    ...delegationHints.map((hint) => "- [Delegation] " + hint.title + ": " + hint.detail)
  ].join("\n");
}

function toSharePointEncodedInternalName(value: string) {
  return Array.from(value.trim())
    .map((char) => (/[A-Za-z0-9_]/.test(char) ? char : "_x" + char.codePointAt(0)!.toString(16).padStart(4, "0") + "_"))
    .join("");
}

function toPascalIdentifier(value: string) {
  return value
    .replace(/[^A-Za-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function pluralize(value: string) {
  if (!value) return "";
  if (/[^aeiou]y$/i.test(value)) return value.slice(0, -1) + "ies";
  if (/(s|x|z|ch|sh)$/i.test(value)) return value + "es";
  return value + "s";
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


