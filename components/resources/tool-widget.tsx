"use client";

import { FilterQueryBuilder } from "@/components/tools/filter-query-builder";
import { DateFormatTester } from "@/components/tools/date-format-tester";
import { useMemo, useState } from "react";
import { ParseJsonSchemaGenerator } from "@/components/tools/parse-json-schema-generator";
import { ExcelToPowerFx } from "@/components/tools/excel-to-power-fx";
import { CopyCodeBlock } from "@/components/ui/copy-code-block";
import { TriggerConditionBuilder } from "@/components/tools/trigger-condition-builder";
import { NamedFormulasConverter } from "@/components/tools/named-formulas-converter";
import { Toggle, ToolShell } from "@/components/resources/tool-shell";
import { ColumnFormattingBuilder } from "@/components/tools/column-formatting-builder";
import { DelegationChecker } from "@/components/tools/delegation-checker";
import { PowerFxFormatter, type FunctionLink } from "@/components/tools/power-fx-formatter";
import { ExpressionBuilder } from "@/components/tools/expression-builder";
import { ColorTokenGenerator } from "@/components/tools/color-token-generator";
import { ReleaseChecklistGenerator } from "@/components/tools/release-checklist-generator";
import { PowerFxTableGenerator } from "@/components/tools/power-fx-table-generator";
import { NamingLinter } from "@/components/tools/naming-linter";

export function ToolWidget({ slug, functionLinks = [] }: { slug: string; functionLinks?: FunctionLink[] }) {
  if (slug === "power-fx-formatter") return <PowerFxFormatter functionLinks={functionLinks} />;
  if (slug === "odata-filter-query-builder") return <FilterQueryBuilder />;
  if (slug === "date-format-tester") return <DateFormatTester />;
  if (slug === "sharepoint-internal-name-helper") return <SharePointInternalNameHelper />;
  if (slug === "parse-json-schema-generator") return <ParseJsonSchemaGenerator />;
  if (slug === "excel-to-power-fx") return <ExcelToPowerFx />;
  if (slug === "power-automate-expression-builder") return <ExpressionBuilder />;
  if (slug === "trigger-condition-builder") return <TriggerConditionBuilder />;
  if (slug === "onstart-to-named-formulas") return <NamedFormulasConverter />;
  if (slug === "power-apps-color-token-generator") return <ColorTokenGenerator />;
  if (slug === "sharepoint-column-formatting-builder") return <ColumnFormattingBuilder />;
  if (slug === "power-apps-delegation-checker") return <DelegationChecker />;
  if (slug === "solution-layering-checklist-generator") return <ReleaseChecklistGenerator />;
  if (slug === "dataverse-table-naming-helper") return <DataverseNamingHelper />;
  if (slug === "adaptive-card-preview-snippets") return <AdaptiveCardBuilder />;
  if (slug === "csv-to-power-fx-table") return <PowerFxTableGenerator />;
  if (slug === "power-apps-naming-linter") return <NamingLinter />;
  return null;
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
