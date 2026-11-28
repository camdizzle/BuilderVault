"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { FormatterProPanel } from "@/components/pro/formatter-pro-panel";
import { Toggle, ToolShell } from "@/components/resources/tool-shell";
import { CopyCodeBlock } from "@/components/ui/copy-code-block";
import { trackEvent } from "@/lib/analytics";
import { checkDelegation, dataSourceLabels, type DataSource, type DelegationFinding } from "@/lib/tools/delegation-check";
import { formulaFromHash, formatterLink, maxLinkedFormulaLength } from "@/lib/tools/formula-link";
import { highlightLines } from "@/lib/tools/power-fx-highlight";
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

/** The delegation guide for each data source in the Data source option. */
const delegationGuideBySource: Record<DataSource, { href: string; label: string }> = {
  sharepoint: { href: "/guides/power-apps-delegation-sharepoint", label: "Delegation with SharePoint lists" },
  dataverse: { href: "/guides/power-apps-delegation-dataverse", label: "Delegation with Dataverse" },
  sql: { href: "/guides/power-apps-delegation-sql-server", label: "Delegation with SQL Server" },
  excel: { href: "/guides/power-apps-delegation-excel", label: "Delegation with Excel" }
};

const storageKey = "buildervault:power-fx-formatter:formula";

type TabId = "review" | "delegation" | "explain" | "functions" | "patterns";

function readSavedFormula() {
  try {
    return window.localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

function writeSavedFormula(formula: string | null) {
  try {
    if (formula === null) window.localStorage.removeItem(storageKey);
    else window.localStorage.setItem(storageKey, formula);
  } catch {
    // Storage can be blocked (private windows, strict settings). The tool still works without it.
  }
}

export function PowerFxFormatter({ functionLinks }: { functionLinks: FunctionLink[] }) {
  const [formula, setFormula] = useState(sampleFormula);
  const [mode, setMode] = useState<"format" | "minify">("format");
  const [indent, setIndent] = useState(4);
  const [width, setWidth] = useState(80);
  const [locale, setLocale] = useState<PowerFxLocale>("en");
  const [source, setSource] = useState<DataSource>("sharepoint");
  const [linkStatus, setLinkStatus] = useState("");
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<TabId>("review");
  const [restored, setRestored] = useState(false);
  // The first render still shows the sample, so it must not overwrite a saved formula.
  const skipFirstSave = useRef(true);

  // A link from another tool, or a shared link, carries the formula after #formula=.
  // Otherwise the last formula typed in this browser comes back.
  useEffect(() => {
    const linked = formulaFromHash(window.location.hash);
    const saved = linked === null ? readSavedFormula() : null;
    /* eslint-disable react-hooks/set-state-in-effect -- the hash and storage are only readable in the browser, after the first render */
    if (linked !== null) setFormula(linked);
    else if (saved) {
      setFormula(saved);
      setRestored(true);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    writeSavedFormula(formula.trim() && formula !== sampleFormula ? formula : null);
  }, [formula]);

  function forgetSavedFormula() {
    writeSavedFormula(null);
    setRestored(false);
    setFormula(sampleFormula);
  }

  async function copyShareLink() {
    if (formula.length > maxLinkedFormulaLength) {
      setLinkStatus("This formula is too long for a link. Copy the formula instead.");
      return;
    }
    await navigator.clipboard.writeText(window.location.origin + formatterLink(formula));
    setLinkStatus("Link copied. Anyone with the link sees this formula, so check it holds nothing private.");
  }

  const result = useMemo(
    () => (mode === "format" ? formatPowerFxFormula(formula, { indent, width, locale }) : minifyPowerFxFormula(formula, { locale })),
    [formula, mode, indent, width, locale]
  );
  const formatted = result.output;

  async function copyFormatted() {
    if (!formatted) return;
    await navigator.clipboard.writeText(formatted);
    trackEvent("Formatter Copied", { label: mode === "format" ? "Formatted Power Fx" : "Minified Power Fx", path: window.location.pathname });
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

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
  const lines = useMemo(() => highlightLines(formatted), [formatted]);

  const hasFormula = Boolean(formula.trim());
  const reviewCount = checks.items.filter((item) => item.level === "Review" || item.level === "Caution" || item.level === "Cleanup").length;
  const tabs: Array<{ id: TabId; label: string; count?: number }> = [
    { id: "review", label: "Review", count: reviewCount },
    { id: "delegation", label: "Delegation", count: delegation.findings.length },
    { id: "explain", label: "Explain" },
    { id: "functions", label: "Functions used", count: usedFunctions.length },
    { id: "patterns", label: "Patterns", count: detectedPatterns.length }
  ];

  return (
    <ToolShell title="Power Fx formatter" description="Paste a Power Apps formula and the formatted version updates as you type. The review, delegation check and plain-English explanation are in the tabs underneath. Everything runs in your browser.">
      <div className="fx-status" role="status" aria-label="Formula checks">
        {!hasFormula ? (
          <span className="badge">Paste a formula to check it</span>
        ) : result.issues.length > 0 ? (
          <span className="badge fx-bad">Brackets look unbalanced</span>
        ) : (
          <span className="badge free">Brackets balanced</span>
        )}
        {hasFormula ? (
          delegation.hasQuery ? (
            <span className={`badge ${delegation.findings.length > 0 ? "premium" : "free"}`}>
              {delegation.findings.length > 0
                ? `${delegation.findings.length} delegation ${delegation.findings.length === 1 ? "note" : "notes"} for ${dataSourceLabels[source]}`
                : `No delegation problems for ${dataSourceLabels[source]}`}
            </span>
          ) : (
            <span className="badge">No data source query</span>
          )
        ) : null}
        <span className={`badge ${checks.severityClass}`}>{checks.severity}</span>
        <span className="badge">{checks.lineCount} lines</span>
        <span className="badge">depth {checks.maxDepth}</span>
      </div>

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
        <label className="chip-button">
          Data source{" "}
          <select aria-label="Data source" onChange={(event) => setSource(event.target.value as DataSource)} value={source}>
            {(Object.keys(dataSourceLabels) as DataSource[]).map((key) => (
              <option key={key} value={key}>{dataSourceLabels[key]}</option>
            ))}
          </select>
        </label>
        <Toggle label="Semicolon separators (; and ;;)" checked={locale === "eu"} onChange={(value) => setLocale(value ? "eu" : "en")} />
      </div>

      <FormatterProPanel
        formula={formula}
        onApplySettings={(saved) => {
          setIndent(saved.indent);
          setWidth(saved.width);
          setLocale(saved.locale);
          setSource(saved.source as DataSource);
        }}
        onLoadFormula={setFormula}
        settings={{ indent, width, locale, source }}
      />

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

      <div className="fx-editor">
        <div className="fx-pane fx-input">
          <div className="fx-pane-head">
            <label htmlFor="fx-formula-input">Your formula</label>
            <span className="fx-pane-actions">
              <button onClick={() => setFormula(sampleFormula)} type="button">Load sample</button>
              <button onClick={() => setFormula("")} type="button">Clear</button>
            </span>
          </div>
          <textarea
            id="fx-formula-input"
            onChange={(event) => setFormula(event.target.value)}
            placeholder="Paste a Power Fx formula"
            spellCheck={false}
            value={formula}
          />
          <div className="fx-pane-foot">
            <span>{restored ? "Your last formula was restored. " : ""}Saved in this browser only.</span>
            <button onClick={forgetSavedFormula} type="button">Forget saved formula</button>
          </div>
        </div>
        <div className="fx-pane fx-output">
          <div className="fx-pane-head">
            <span>{mode === "format" ? "Formatted" : "Minified"}{formatted ? ` · ${checks.lineCount} ${checks.lineCount === 1 ? "line" : "lines"}` : ""}</span>
            <span className="fx-pane-actions">
              <button className="fx-primary" disabled={!formatted} onClick={copyFormatted} type="button">{copied ? "Copied" : "Copy"}</button>
              <button disabled={!hasFormula} onClick={copyShareLink} type="button">Share link</button>
            </span>
          </div>
          <pre aria-label={mode === "format" ? "Formatted Power Fx" : "Minified Power Fx"} className="fx-code" tabIndex={0}>
            {formatted ? (
              lines.map((line, lineIndex) => (
                <span className="fx-line" key={lineIndex}>
                  {line.map((token, tokenIndex) => (
                    token.kind === "plain" ? token.text : <span className={"fx-" + token.kind} key={tokenIndex}>{token.text}</span>
                  ))}
                  {"\n"}
                </span>
              ))
            ) : (
              <span className="fx-empty">Paste a formula to format it.</span>
            )}
          </pre>
        </div>
      </div>

      <div className="badge-row">
        <button className="chip-button" disabled={!formatted} onClick={() => setFormula(formatted)} type="button">
          Replace input with result
        </button>
        {linkStatus ? <p role="status" style={{ ...mutedText, alignSelf: "center" }}>{linkStatus}</p> : null}
      </div>

      <div className="fx-tabs" role="tablist" aria-label="Formula review">
        {tabs.map((item) => (
          <button
            aria-controls={"fx-panel-" + item.id}
            aria-selected={tab === item.id}
            className={tab === item.id ? "active" : ""}
            id={"fx-tab-" + item.id}
            key={item.id}
            onClick={() => setTab(item.id)}
            role="tab"
            type="button"
          >
            {item.label}
            {item.count ? <span className="fx-count">{item.count}</span> : null}
          </button>
        ))}
      </div>

      <div aria-labelledby="fx-tab-review" hidden={tab !== "review"} id="fx-panel-review" role="tabpanel">
        <div style={{ display: "grid", gap: 18 }}>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            {checks.items.map((item) => (
              <div className="stat-tile" key={item.title}>
                <div className="eyebrow">{item.level}</div>
                <strong>{item.title}</strong>
                <p style={{ color: "#415049", lineHeight: 1.55, marginBottom: 0 }}>{item.detail}</p>
              </div>
            ))}
          </div>
          <CopyCodeBlock code={reviewNotes} label="Review notes" />
        </div>
      </div>
      <div aria-labelledby="fx-tab-delegation" hidden={tab !== "delegation"} id="fx-panel-delegation" role="tabpanel">
        <DelegationPanel findings={delegation.findings} hasFormula={hasFormula} hasQuery={delegation.hasQuery} source={source} />
      </div>
      <div aria-labelledby="fx-tab-explain" hidden={tab !== "explain"} id="fx-panel-explain" role="tabpanel">
        <FormulaExplainerPanel explanation={explanation} />
      </div>
      <div aria-labelledby="fx-tab-functions" hidden={tab !== "functions"} id="fx-panel-functions" role="tabpanel">
        <FunctionReferencePanel links={usedFunctions} />
      </div>
      <div aria-labelledby="fx-tab-patterns" hidden={tab !== "patterns"} id="fx-panel-patterns" role="tabpanel">
        <PatternDetectorPanel patterns={detectedPatterns} />
      </div>
    </ToolShell>
  );
}

function FunctionReferencePanel({ links }: { links: FunctionLink[] }) {
  if (links.length === 0) {
    return (
      <section className="pattern-detector-panel">
        <div>
          <div className="eyebrow">Function reference</div>
          <h3 style={{ fontSize: "1.2rem", margin: "6px 0" }}>No functions from the reference found yet</h3>
          <p style={mutedText}>
            When the formula uses a function covered by the <Link href="/functions">Power Fx function reference</Link>, it is listed here with a link to its syntax and examples.
          </p>
        </div>
      </section>
    );
  }
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
  source
}: {
  findings: DelegationFinding[];
  hasFormula: boolean;
  hasQuery: boolean;
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
          Delegation depends on the data source and column type, so pick the source this formula runs against in the Data source option above and confirm against the warnings in Power Apps Studio. For the full support table, use the{" "}
          <Link href="/tools/power-apps-delegation-checker">delegation checker</Link>.
        </p>
        <p style={mutedText}>
          <Link href={delegationGuideBySource[source].href} style={{ fontWeight: 800 }}>{delegationGuideBySource[source].label}</Link>: what {dataSourceLabels[source]} can run, and a delegable replacement for each common warning.
        </p>
      </div>
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
