"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Toggle, ToolShell } from "@/components/resources/tool-shell";
import { CopyCodeBlock } from "@/components/ui/copy-code-block";
import { checkDelegation, dataSourceLabels, type DataSource, type DelegationFinding } from "@/lib/tools/delegation-check";
import { formatPowerFxFormula, minifyPowerFxFormula, toCommaSeparators, type PowerFxLocale } from "@/lib/tools/power-fx-format";
import {
  analyzePowerFx,
  buildPowerFxReviewNotes,
  detectPowerFxPatterns,
  explainPowerFx,
  functionCallNames,
  type DetectedPowerFxPattern,
  type PowerFxExplanation
} from "@/lib/tools/power-fx-review";

/** A function name and the reference page that covers it. Built on the server from the function reference. */
export type FunctionLink = { name: string; href: string };

const sampleFormula = `IfError(
Set(varSavedRequest,Patch(Requests,Defaults(Requests),{Title:txtTitle.Text,RequestStatus:{Value:"Submitted"},DueDate:dpDueDate.SelectedDate}));Notify("Request saved.",NotificationType.Success),Notify("The request could not be saved.",NotificationType.Error))`;

const mutedText = { color: "#415049", lineHeight: 1.6, margin: 0 } as const;

export function PowerFxFormatter({ functionLinks }: { functionLinks: FunctionLink[] }) {
  const [formula, setFormula] = useState(sampleFormula);
  const [mode, setMode] = useState<"format" | "minify">("format");
  const [indent, setIndent] = useState(4);
  const [width, setWidth] = useState(80);
  const [locale, setLocale] = useState<PowerFxLocale>("en");
  const [source, setSource] = useState<DataSource>("sharepoint");
  const result = useMemo(
    () => (mode === "format" ? formatPowerFxFormula(formula, { indent, width, locale }) : minifyPowerFxFormula(formula, { locale })),
    [formula, mode, indent, width, locale]
  );
  const formatted = result.output;
  // The delegation checker and the review checks read comma syntax, so semicolon formulas are converted first.
  const commaFormula = useMemo(() => toCommaSeparators(formula, locale), [formula, locale]);
  const delegation = useMemo(() => checkDelegation(commaFormula, source), [commaFormula, source]);
  const checks = useMemo(
    () => analyzePowerFx(commaFormula, formatted, result.maxDepth, delegation.findings.length),
    [commaFormula, formatted, result.maxDepth, delegation.findings.length]
  );
  const reviewNotes = useMemo(
    () => buildPowerFxReviewNotes(checks, delegation.findings.map((finding) => ({ title: finding.title, detail: finding.fix ? `${finding.detail} Try: ${finding.fix}` : finding.detail }))),
    [checks, delegation.findings]
  );
  const detectedPatterns = useMemo(() => detectPowerFxPatterns(commaFormula), [commaFormula]);
  const explanation = useMemo(() => explainPowerFx(commaFormula), [commaFormula]);
  const usedFunctions = useMemo(() => {
    const calls = functionCallNames(commaFormula);
    return functionLinks.filter((link) => calls.has(link.name.toLowerCase()));
  }, [commaFormula, functionLinks]);

  return (
    <ToolShell title="Power Fx formatter" description="Paste a Power Apps formula to format it into readable lines, check for unbalanced brackets and delegation problems for your data source, and review common maintainability warnings before handoff. Everything runs in your browser.">
      <label className="field">
        <span>Power Fx formula</span>
        <textarea className="tool-textarea" onChange={(event) => setFormula(event.target.value)} spellCheck={false} value={formula} />
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
      <FunctionReferencePanel links={usedFunctions} />
      <DelegationPanel findings={delegation.findings} hasFormula={Boolean(formula.trim())} hasQuery={delegation.hasQuery} onSourceChange={setSource} source={source} />
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

function FunctionReferencePanel({ links }: { links: FunctionLink[] }) {
  if (links.length === 0) return null;
  return (
    <section className="pattern-detector-panel">
      <div>
        <div className="eyebrow">Function reference</div>
        <h3 style={{ fontSize: "1.2rem", margin: "6px 0" }}>Functions in this formula</h3>
        <p style={mutedText}>Open a function to see its syntax, examples and delegation notes.</p>
      </div>
      <div className="badge-row">
        {links.map((link) => (
          <Link className="badge" href={link.href} key={link.name}>
            {link.name}
          </Link>
        ))}
      </div>
    </section>
  );
}

function DelegationPanel({
  findings,
  hasFormula,
  hasQuery,
  onSourceChange,
  source
}: {
  findings: DelegationFinding[];
  hasFormula: boolean;
  hasQuery: boolean;
  onSourceChange: (source: DataSource) => void;
  source: DataSource;
}) {
  const heading = !hasFormula
    ? "Paste a formula to check delegation"
    : !hasQuery
      ? "Nothing in this formula is sent to a data source"
      : findings.length > 0
        ? `${findings.length} possible delegation ${findings.length === 1 ? "issue" : "issues"} for ${dataSourceLabels[source]}`
        : `No delegation problems found for ${dataSourceLabels[source]}`;
  return (
    <section className="pattern-detector-panel">
      <div>
        <div className="eyebrow">Delegation check</div>
        <h3 style={{ fontSize: "1.2rem", margin: "6px 0" }}>{heading}</h3>
        <p style={mutedText}>
          Delegation depends on the data source and column type, so pick the source this formula runs against and confirm against the warnings in Power Apps Studio. For the full support table, use the{" "}
          <Link href="/tools/power-apps-delegation-checker">delegation checker</Link> or read the <Link href="/power-apps/delegation">delegation guide</Link>.
        </p>
      </div>
      <label className="field" style={{ maxWidth: 280 }}>
        <span>Data source</span>
        <select onChange={(event) => onSourceChange(event.target.value as DataSource)} value={source}>
          {(Object.keys(dataSourceLabels) as DataSource[]).map((key) => (
            <option key={key} value={key}>{dataSourceLabels[key]}</option>
          ))}
        </select>
      </label>
      {findings.length > 0 ? (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {findings.map((finding) => (
            <div className="pattern-detection-card" key={finding.title}>
              <div className="eyebrow">{finding.severity === "problem" ? "Not delegated" : "Delegated with limits"}</div>
              <strong>{finding.title}</strong>
              <p>{finding.detail}</p>
              {finding.fix ? <p><strong>Try:</strong> {finding.fix}</p> : null}
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
        <p style={mutedText}>{explanation.summary}</p>
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
        <p style={mutedText}>BuilderVault looks for common formula patterns and links them to deeper examples, cookbooks, and troubleshooting pages.</p>
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
