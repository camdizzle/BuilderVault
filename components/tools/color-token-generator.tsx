"use client";

import { useMemo, useState } from "react";
import { Toggle, ToolNotes, ToolShell } from "@/components/resources/tool-shell";
import { CopyCodeBlock } from "@/components/ui/copy-code-block";
import { parseTokens, textAdvice, tokensFormula, type TokenOutputMode } from "@/lib/tools/color-tokens";

const sample = `Primary #0f766e
Primary Dark #115e59
Surface #ffffff
Text #1f2937
Danger #b91c1c
Warning #b45309`;

const modes: Array<{ mode: TokenOutputMode; label: string; prefix: string; where: string }> = [
  { mode: "namedFormulas", label: "Named formulas", prefix: "Color", where: "Paste into App.Formulas. Use the names anywhere, such as Fill = ColorPrimary." },
  { mode: "themeRecord", label: "One theme record", prefix: "Theme", where: "Paste into App.Formulas. Use the fields anywhere, such as Fill = Theme.Primary." },
  { mode: "variables", label: "Set() variables", prefix: "gblColor", where: "Paste into App.OnStart. Use them anywhere, such as Fill = gblColorPrimary." }
];

export function ColorTokenGenerator() {
  const [text, setText] = useState(sample);
  const [mode, setMode] = useState<TokenOutputMode>("namedFormulas");
  const [prefixes, setPrefixes] = useState<Record<TokenOutputMode, string>>({ namedFormulas: "Color", themeRecord: "Theme", variables: "gblColor" });
  const { tokens, issues } = useMemo(() => parseTokens(text), [text]);
  const current = modes.find((entry) => entry.mode === mode) ?? modes[0];
  const formula = tokens.length > 0 ? tokensFormula(tokens, mode, prefixes[mode]) : "Add at least one color, such as Primary #0f766e.";

  return (
    <ToolShell title="Color token generator" description="Enter your brand colors, one per line with a name, and copy them as named formulas, a theme record, or Set() variables. Each color is checked for text contrast.">
      <label className="field">
        <span>Colors, one per line as Name #hex</span>
        <textarea className="tool-textarea" onChange={(event) => setText(event.target.value)} spellCheck={false} style={{ minHeight: 150 }} value={text} />
      </label>
      <div className="badge-row" role="group" aria-label="Output format">
        {modes.map((entry) => (
          <Toggle checked={mode === entry.mode} key={entry.mode} label={entry.label} onChange={() => setMode(entry.mode)} />
        ))}
      </div>
      <label className="field" style={{ maxWidth: 280 }}>
        <span>{mode === "themeRecord" ? "Record name" : "Name prefix"}</span>
        <input onChange={(event) => setPrefixes((value) => ({ ...value, [mode]: event.target.value }))} value={prefixes[mode]} placeholder={current.prefix} />
      </label>
      <ToolNotes notes={issues} title="Check these lines" />
      <CopyCodeBlock code={formula} copyEvent="Color Tokens Copied" label={current.label} />
      <p style={{ color: "#415049", lineHeight: 1.6, margin: 0 }}>{current.where}</p>
      {tokens.length > 0 ? (
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                {["Color", "Token", "Best text color", "Contrast", "WCAG AA"].map((heading) => (
                  <th key={heading} scope="col" style={{ borderBottom: "1px solid var(--line)", padding: "8px 10px 8px 0", textAlign: "left" }}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tokens.map((token) => {
                const advice = textAdvice(token);
                return (
                  <tr key={token.name}>
                    <td style={{ borderBottom: "1px solid var(--line)", padding: "8px 10px 8px 0" }}>
                      <span aria-hidden="true" style={{ background: token.hex, border: "1px solid var(--line)", borderRadius: 6, color: advice.text, display: "inline-block", fontWeight: 700, padding: "4px 10px" }}>Aa</span>
                    </td>
                    <td style={{ borderBottom: "1px solid var(--line)", padding: "8px 10px 8px 0" }}>
                      <strong>{token.name}</strong>
                      <span style={{ color: "var(--muted)", display: "block", fontSize: "0.9rem" }}>{token.hex}</span>
                    </td>
                    <td style={{ borderBottom: "1px solid var(--line)", padding: "8px 10px 8px 0" }}>{advice.text === "white" ? "White" : "Black"}</td>
                    <td style={{ borderBottom: "1px solid var(--line)", padding: "8px 10px 8px 0" }}>{advice.ratio}:1</td>
                    <td style={{ borderBottom: "1px solid var(--line)", padding: "8px 0" }}>
                      {advice.passesNormal ? "Passes for all text" : advice.passesLarge ? "Large or bold text only" : "Fails. Don't put text on it."}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
      <p style={{ color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
        WCAG AA asks for a contrast of at least 4.5:1 for normal text and 3:1 for large text (about 18pt, or 14pt bold). Colors with transparency are checked as if they were solid.
      </p>
    </ToolShell>
  );
}
