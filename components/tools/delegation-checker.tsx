"use client";

import { useMemo, useState } from "react";
import { ToolShell } from "@/components/resources/tool-shell";
import { checkDelegation, dataSourceLabels, delegationRules, type DataSource, type Support } from "@/lib/tools/delegation-check";

const sampleFormula = `Filter(
    Requests,
    Lower(Owner.Email) = Lower(User().Email) &&
    txtSearch.Text in Title &&
    Year(Created) = 2026
)`;

const supportLabels: Record<Support, string> = { yes: "Delegated", partial: "With limits", no: "Not delegated" };
const supportColors: Record<Support, { background: string; color: string }> = {
  yes: { background: "#dff6dd", color: "#0b5a08" },
  partial: { background: "#fff4ce", color: "#6d5700" },
  no: { background: "#fde7e9", color: "#a4262c" }
};

function SupportPill({ support }: { support: Support }) {
  return (
    <span style={{ ...supportColors[support], borderRadius: 12, display: "inline-block", fontSize: "0.85rem", fontWeight: 700, padding: "2px 10px", whiteSpace: "nowrap" }}>
      {supportLabels[support]}
    </span>
  );
}

export function DelegationChecker() {
  const [formula, setFormula] = useState(sampleFormula);
  const [source, setSource] = useState<DataSource>("sharepoint");
  const report = useMemo(() => checkDelegation(formula, source), [formula, source]);
  const problems = report.findings.filter((finding) => finding.severity === "problem").length;
  const limits = report.findings.length - problems;

  const verdict = !formula.trim()
    ? "Paste a formula to check it."
    : !report.hasQuery
      ? "No Filter, LookUp, Search, Sort, or aggregate found, so there is nothing to delegate here."
      : report.findings.length === 0
        ? `No delegation problems found for ${dataSourceLabels[source]}.`
        : `${problems} ${problems === 1 ? "problem" : "problems"}${limits > 0 ? ` and ${limits} ${limits === 1 ? "limit" : "limits"}` : ""} for ${dataSourceLabels[source]}.`;

  return (
    <ToolShell
      title="Delegation checker"
      description="Pick the data source your formula runs against and paste the formula. The same formula can be fine on Dataverse and silently wrong on SharePoint, so the check is specific to the source."
    >
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <label className="field">
          <span>Data source</span>
          <select onChange={(event) => setSource(event.target.value as DataSource)} value={source}>
            {(Object.keys(dataSourceLabels) as DataSource[]).map((key) => (
              <option key={key} value={key}>{dataSourceLabels[key]}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="field">
        <span>Power Fx formula</span>
        <textarea className="tool-textarea" onChange={(event) => setFormula(event.target.value)} spellCheck={false} style={{ minHeight: 170 }} value={formula} />
      </label>

      <div className="stat-tile" aria-live="polite" role="status">
        <div className="eyebrow">Result</div>
        <strong style={{ fontSize: "1.2rem" }}>{verdict}</strong>
        {report.delegated.length > 0 && report.findings.length === 0 ? (
          <p style={{ color: "#415049", lineHeight: 1.6, marginBottom: 0 }}>
            {report.delegated.join(", ")} can be sent to the data source as written. Still check for a warning triangle in Studio, because column types matter too.
          </p>
        ) : null}
      </div>

      {report.findings.map((finding) => (
        <div className="stat-tile" key={finding.title}>
          <div className="eyebrow" style={{ color: finding.severity === "problem" ? "var(--danger)" : "var(--warning)" }}>
            {finding.severity === "problem" ? "Not delegated" : "Delegated with limits"}
          </div>
          <strong>{finding.title}</strong>
          <p style={{ color: "#415049", lineHeight: 1.6, margin: "6px 0 0" }}>{finding.detail}</p>
          {finding.fix ? (
            <p style={{ color: "#415049", lineHeight: 1.6, margin: "6px 0 0" }}>
              <strong style={{ color: "var(--foreground)" }}>Try:</strong> {finding.fix}
            </p>
          ) : null}
        </div>
      ))}

      <div style={{ minWidth: 0 }}>
        <h3 style={{ fontSize: "1.2rem", margin: "0 0 10px" }}>What {dataSourceLabels[source]} delegates</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th scope="col" style={{ borderBottom: "1px solid var(--line)", padding: "8px 10px 8px 0", textAlign: "left" }}>Function or operator</th>
                <th scope="col" style={{ borderBottom: "1px solid var(--line)", padding: "8px 0", textAlign: "left" }}>Support</th>
              </tr>
            </thead>
            <tbody>
              {delegationRules.map((rule) => (
                <tr key={rule.key}>
                  <td style={{ borderBottom: "1px solid var(--line)", padding: "8px 10px 8px 0", verticalAlign: "top" }}>
                    <span style={{ fontWeight: 700 }}>{rule.label}</span>
                    {rule.notes?.[source] ? <span style={{ color: "var(--muted)", display: "block", fontSize: "0.9rem", lineHeight: 1.5 }}>{rule.notes[source]}</span> : null}
                  </td>
                  <td style={{ borderBottom: "1px solid var(--line)", padding: "8px 0", verticalAlign: "top" }}>
                    <SupportPill support={rule.support[source]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ToolShell>
  );
}
