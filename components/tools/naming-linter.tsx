"use client";

import { useMemo, useState } from "react";
import { CopyCodeBlock } from "@/components/ui/copy-code-block";
import { ToolShell } from "@/components/resources/tool-shell";
import { findingsTable, lintNames, parsePrefixOverrides } from "@/lib/tools/naming-lint";

const sampleSource = `Screens:
  Screen1:
    Properties:
      OnVisible: =Set(isLoading, true); UpdateContext({showPanel: false}); ClearCollect(OpenRequests, Filter(Requests, Status.Value = "Open"))
    Children:
      - lblTitle:
          Control: Label
          Properties:
            Text: ="Open requests"
      - Button1:
          Control: Classic/Button
          Properties:
            OnSelect: =Set(varSelected, Blank())
      - RequestsGallery:
          Control: Gallery
          Variant: Vertical
          Children:
            - Label2_1:
                Control: Label
      - txtSearch:
          Control: Classic/TextInput`;

const cell = { borderBottom: "1px solid var(--line)", padding: "8px 10px 8px 0", textAlign: "left", verticalAlign: "top" } as const;

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

export function NamingLinter() {
  const [source, setSource] = useState(sampleSource);
  const [overridesText, setOverridesText] = useState("");
  const report = useMemo(() => lintNames(source, parsePrefixOverrides(overridesText)), [overridesText, source]);
  const total = report.items.length;

  return (
    <ToolShell
      title="Naming linter"
      description="Paste Power Apps source code: a .pa.yaml file, or the YAML from View code on a screen or control in Studio. The tool lists default names and names that don't follow the prefix convention, with a suggested name for each."
    >
      <label className="field">
        <span>Power Apps source (YAML)</span>
        <textarea className="tool-textarea" onChange={(event) => setSource(event.target.value)} spellCheck={false} style={{ minHeight: 260 }} value={source} />
      </label>
      <label className="field">
        <span>Your own prefixes, one per line as Control type = prefix (optional)</span>
        <textarea className="tool-textarea" onChange={(event) => setOverridesText(event.target.value)} placeholder={"Label = lbl\nGallery = gal"} spellCheck={false} style={{ minHeight: 70 }} value={overridesText} />
      </label>

      {total === 0 ? (
        <div className="stat-tile" role="status">
          <div className="eyebrow">Nothing to check yet</div>
          <strong>No screens, controls, or variables were found.</strong>
          <p style={{ color: "#415049", lineHeight: 1.6, marginBottom: 0 }}>
            In Power Apps Studio, right-click a screen or control in the tree view, choose View code, and paste the result here.
          </p>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
          <div className="stat-tile">
            <div className="eyebrow">Checked</div>
            <strong style={{ fontSize: "1.4rem" }}>{total}</strong>
            <p style={{ color: "#415049", margin: 0 }}>
              {plural(report.counts.screens, "screen")}, {plural(report.counts.controls, "control")}, {plural(report.counts.variables, "variable")}
            </p>
          </div>
          <div className="stat-tile">
            <div className="eyebrow">Follow the convention</div>
            <strong style={{ fontSize: "1.4rem" }}>{report.counts.passed}</strong>
          </div>
          <div className="stat-tile">
            <div className="eyebrow">To rename</div>
            <strong style={{ fontSize: "1.4rem" }}>{report.findings.length}</strong>
          </div>
        </div>
      )}

      {report.findings.length > 0 ? (
        <>
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", minWidth: 520, width: "100%" }}>
              <thead>
                <tr>
                  <th scope="col" style={cell}>Name</th>
                  <th scope="col" style={cell}>Type</th>
                  <th scope="col" style={cell}>Issue</th>
                  <th scope="col" style={cell}>Suggested name</th>
                </tr>
              </thead>
              <tbody>
                {report.findings.map((finding) => (
                  <tr key={finding.kind + finding.name}>
                    <td style={{ ...cell, fontWeight: 700, overflowWrap: "anywhere" }}>{finding.name}</td>
                    <td style={cell}>{finding.type}</td>
                    <td style={cell}>{finding.message}</td>
                    <td style={{ ...cell, overflowWrap: "anywhere" }}>{finding.suggestion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <CopyCodeBlock code={findingsTable(report.findings)} copyEvent="Naming Report Copied" label="Rename list (paste into Excel)" />
        </>
      ) : total > 0 ? (
        <div className="stat-tile" role="status">
          <div className="eyebrow">Result</div>
          <strong>Every name follows the convention.</strong>
        </div>
      ) : null}
    </ToolShell>
  );
}
