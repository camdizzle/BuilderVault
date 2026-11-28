"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { Toggle, ToolNotes, ToolShell } from "@/components/resources/tool-shell";
import { useSavedState } from "@/components/tools/saved-state";
import { CopyCodeBlock } from "@/components/ui/copy-code-block";
import {
  effectiveAnchor,
  maxMatches,
  powerFxFormula,
  regexWarnings,
  regexFromHash,
  runRegex,
  type RegexAnchor,
  type RegexFunction,
  type RegexMatch
} from "@/lib/tools/regex-tester";

type Preset = { label: string; fn: RegexFunction; pattern: string; text: string; input: string };

const presets: Preset[] = [
  { label: "Request ID", fn: "IsMatch", pattern: "REQ-\\d{5}", text: "REQ-00042", input: "txtRequestId.Text" },
  { label: "UK postcode", fn: "IsMatch", pattern: "[A-Z]{1,2}\\d[A-Z\\d]? ?\\d[A-Z]{2}", text: "SW1A 1AA", input: "txtPostcode.Text" },
  { label: "US phone", fn: "IsMatch", pattern: "\\(?\\d{3}\\)?[ .\\-]?\\d{3}[ .\\-]?\\d{4}", text: "(425) 555-0100", input: "txtPhone.Text" },
  { label: "Simple email", fn: "IsMatch", pattern: "[^@\\s]+@[^@\\s]+\\.[^@\\s]+", text: "joan@contoso.com", input: "txtEmail.Text" },
  { label: "Find all ticket numbers", fn: "MatchAll", pattern: "#(\\d+)", text: "Fixed in #1042, see also #1043 and #998.", input: "txtNotes.Text" },
  { label: "Split a name (named parts)", fn: "Match", pattern: "(?<first>\\S+)\\s+(?<last>.+)", text: "Joan Smith-Jones", input: "txtFullName.Text" }
];

const anchorLabels: Record<RegexAnchor, string> = {
  default: "Default for the function",
  Complete: "Complete (whole text)",
  Contains: "Contains (anywhere)",
  BeginsWith: "BeginsWith",
  EndsWith: "EndsWith"
};

export function RegexTester() {
  const [fn, setFn] = useSavedState<RegexFunction>("fn", "IsMatch");
  const [pattern, setPattern] = useSavedState("pattern", presets[0].pattern);
  const [text, setText] = useSavedState("text", "REQ-00042\nREQ-42\nreq-00042");
  const [anchor, setAnchor] = useSavedState<RegexAnchor>("anchor", "default");
  const [ignoreCase, setIgnoreCase] = useSavedState("ignoreCase", false);
  const [multiline, setMultiline] = useSavedState("multiline", false);
  const [lineByLine, setLineByLine] = useSavedState("lineByLine", true);
  const [input, setInput] = useSavedState("input", "txtRequestId.Text");

  // The formatter links here with the function and pattern after #, so they replace what was saved.
  useEffect(() => {
    const linked = regexFromHash(window.location.hash);
    if (!linked) return;
    setFn(linked.fn);
    setPattern(linked.pattern);
    setAnchor("default");
    // Only on the first load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const settings = useMemo(() => ({ fn, pattern, anchor, ignoreCase, multiline }), [fn, pattern, anchor, ignoreCase, multiline]);
  const warnings = useMemo(() => regexWarnings(pattern), [pattern]);
  const formula = powerFxFormula(settings, input);
  const used = effectiveAnchor(settings);
  // IsMatch is usually checking one value at a time, so each line can be tested on its own.
  const testLines = fn === "IsMatch" && lineByLine;
  const lineResults = useMemo(
    () => (testLines ? text.split("\n").map((line) => ({ line, result: runRegex(settings, line) })) : []),
    [testLines, text, settings]
  );
  const result = useMemo(() => (testLines ? null : runRegex(settings, text)), [testLines, settings, text]);
  const error = testLines ? lineResults[0]?.result.error : result?.error;

  function applyPreset(preset: Preset) {
    setFn(preset.fn);
    setPattern(preset.pattern);
    setText(preset.text);
    setInput(preset.input);
    setAnchor("default");
    setIgnoreCase(false);
    setMultiline(false);
  }

  return (
    <ToolShell
      title="Power Fx regex tester"
      description="Type a pattern and some sample text to see what IsMatch, Match and MatchAll return in Power Apps, then copy the formula. Patterns run in your browser with the same defaults Power Apps uses."
    >
      <div className="badge-row" role="group" aria-label="Examples">
        {presets.map((preset) => (
          <button className="chip-button" key={preset.label} onClick={() => applyPreset(preset)} type="button">
            {preset.label}
          </button>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <label className="field">
          <span>Function</span>
          <select onChange={(event) => setFn(event.target.value as RegexFunction)} value={fn}>
            <option value="IsMatch">IsMatch: true or false</option>
            <option value="Match">Match: the first match</option>
            <option value="MatchAll">MatchAll: every match</option>
          </select>
        </label>
        <label className="field">
          <span>Where the pattern must match</span>
          <select onChange={(event) => setAnchor(event.target.value as RegexAnchor)} value={anchor}>
            {(Object.keys(anchorLabels) as RegexAnchor[]).map((key) => (
              <option key={key} value={key}>{key === "default" ? `${anchorLabels[key]} (${used})` : anchorLabels[key]}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Text to test, in your app</span>
          <input onChange={(event) => setInput(event.target.value)} placeholder="txtInput.Text" value={input} />
        </label>
      </div>

      <label className="field">
        <span>Pattern (as you would type it between the quotes)</span>
        <input
          onChange={(event) => setPattern(event.target.value)}
          spellCheck={false}
          style={{ fontFamily: "Consolas, 'Courier New', monospace" }}
          value={pattern}
        />
      </label>

      <div className="badge-row">
        <Toggle label="IgnoreCase" checked={ignoreCase} onChange={setIgnoreCase} />
        <Toggle label="Multiline (^ and $ per line)" checked={multiline} onChange={setMultiline} />
        {fn === "IsMatch" ? <Toggle label="Test each line separately" checked={lineByLine} onChange={setLineByLine} /> : null}
      </div>

      <label className="field">
        <span>{testLines ? "Sample values, one per line" : "Sample text"}</span>
        <textarea className="tool-textarea" onChange={(event) => setText(event.target.value)} spellCheck={false} style={{ minHeight: 140 }} value={text} />
      </label>

      {error ? (
        <div className="stat-tile" role="alert">
          <div className="eyebrow" style={{ color: "var(--danger)" }}>Pattern problem</div>
          <strong>{error}</strong>
        </div>
      ) : testLines ? (
        <div className="stat-tile" aria-live="polite" role="status">
          <div className="eyebrow">IsMatch result for each line</div>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <tbody>
              {lineResults.map(({ line, result: lineResult }, index) => (
                <tr key={index}>
                  <td style={{ borderBottom: "1px solid var(--line)", fontFamily: "Consolas, monospace", padding: "6px 10px 6px 0", wordBreak: "break-all" }}>
                    {line === "" ? <em style={{ color: "var(--muted)" }}>(empty)</em> : line}
                  </td>
                  <td style={{ borderBottom: "1px solid var(--line)", padding: "6px 0", textAlign: "right", whiteSpace: "nowrap" }}>
                    <span className={`badge ${lineResult.isMatch ? "free" : "fx-bad"}`}>{lineResult.isMatch ? "true" : "false"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : result ? (
        <MatchResult fn={fn} matches={result.matches} truncated={result.truncated} isMatch={result.isMatch} />
      ) : null}

      <CopyCodeBlock code={formula} label="Power Fx formula" />
      <ToolNotes
        notes={[
          ...warnings,
          fn === "Match" || fn === "MatchAll"
            ? "In Power Apps today, each ( ) group appears in the SubMatches table and named groups (?<name>...) become their own columns. Under the stricter Power Fx 1.0 rules, plain ( ) groups don't capture, so prefer named groups."
            : "",
          "Power Apps needs the pattern to be a fixed text value. It can't come from a variable or a control."
        ].filter(Boolean)}
        title="Check before you use it"
      />
      <p className="tool-instructions">
        New to patterns? The <Link href="/cheat-sheets/power-fx-regex-cheat-sheet" style={{ fontWeight: 700, textDecoration: "underline" }}>Power Fx regex cheat sheet</Link> lists the pieces that work in Power Apps, with ready-made patterns for common checks.
      </p>
    </ToolShell>
  );
}

function MatchResult({ fn, matches, truncated, isMatch }: { fn: RegexFunction; matches: RegexMatch[]; truncated: boolean; isMatch: boolean }) {
  if (fn === "IsMatch") {
    return (
      <div className="stat-tile" aria-live="polite" role="status">
        <div className="eyebrow">IsMatch returns</div>
        <strong style={{ fontSize: "1.3rem" }}>{isMatch ? "true" : "false"}</strong>
      </div>
    );
  }
  if (matches.length === 0) {
    return (
      <div className="stat-tile" aria-live="polite" role="status">
        <div className="eyebrow">{fn} returns</div>
        <strong>{fn === "Match" ? "Blank (no match). Test it with IsBlank." : "An empty table (no matches). Test it with IsEmpty."}</strong>
      </div>
    );
  }
  const names = matches[0].named.map((entry) => entry.name);
  const subCount = matches[0].subMatches.length;
  return (
    <div className="stat-tile" aria-live="polite" role="status" style={{ minWidth: 0 }}>
      <div className="eyebrow">
        {fn === "Match" ? "Match returns this record" : `MatchAll returns ${matches.length} ${matches.length === 1 ? "record" : "records"}`}
        {truncated ? ` (only the first ${maxMatches} are shown)` : ""}
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontSize: "0.92rem", width: "100%" }}>
          <thead>
            <tr>
              <th style={cellHead}>FullMatch</th>
              <th style={cellHead}>StartMatch</th>
              {names.map((name) => <th key={name} style={cellHead}>{name}</th>)}
              {subCount > 0 ? <th style={cellHead}>SubMatches</th> : null}
            </tr>
          </thead>
          <tbody>
            {matches.map((match, index) => (
              <tr key={index}>
                <td style={cellCode}>{match.fullMatch}</td>
                <td style={cell}>{match.startMatch}</td>
                {match.named.map((entry) => <td key={entry.name} style={cellCode}>{entry.value}</td>)}
                {subCount > 0 ? <td style={cellCode}>{match.subMatches.map((value) => `"${value}"`).join(", ")}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const cellHead = { borderBottom: "1px solid var(--line)", padding: "6px 12px 6px 0", textAlign: "left" as const };
const cell = { borderBottom: "1px solid var(--line)", padding: "6px 12px 6px 0", verticalAlign: "top" as const };
const cellCode = { ...cell, fontFamily: "Consolas, monospace", wordBreak: "break-all" as const };
