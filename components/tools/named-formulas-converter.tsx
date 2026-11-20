"use client";

import { useMemo, useState } from "react";
import { CopyCodeBlock } from "@/components/ui/copy-code-block";
import { Toggle, ToolNotes, ToolShell } from "@/components/resources/tool-shell";
import { convertOnStart, formulasText } from "@/lib/tools/named-formulas";
import { formatPowerFxFormula } from "@/lib/tools/power-fx-format";

const sampleOnStart = `Set(varAppName, "Service Requests");
Set(varTheme, {Primary: RGBA(15, 118, 110, 1), Surface: RGBA(255, 255, 255, 1)});
Set(varCurrentUser, LookUp(Employees, Email = Lower(User().Email)));
Set(varIsAdmin, !IsBlank(LookUp(Admins, Email = Lower(User().Email))));
Set(varIsLoading, false);
Set(varSessionStart, Now());
ClearCollect(colStatusOptions, Table({Label: "Draft"}, {Label: "Submitted"}, {Label: "Approved"}));
ClearCollect(colCart, Blank());
Collect(colCart, {Item: "Sample", Quantity: 1});
Navigate(HomeScreen)`;

function format(expression: string) {
  return formatPowerFxFormula(expression).output || expression;
}

export function NamedFormulasConverter() {
  const [input, setInput] = useState(sampleOnStart);
  const [convertCollections, setConvertCollections] = useState(true);
  const result = useMemo(() => convertOnStart(input, { convertCollections }), [convertCollections, input]);

  const formulas = formulasText(result.converted, format);
  const remaining = result.remaining.map((statement) => format(statement)).join(";\n");
  const total = result.converted.length + result.kept.length;

  return (
    <ToolShell
      title="OnStart to named formulas converter"
      description="Paste your App.OnStart formula. The tool moves what it safely can into App.Formulas, leaves the rest in OnStart, and gives a reason for every statement it keeps."
    >
      <label className="field">
        <span>App.OnStart formula</span>
        <textarea className="tool-textarea" onChange={(event) => setInput(event.target.value)} spellCheck={false} style={{ minHeight: 240 }} value={input} />
      </label>
      <div className="badge-row">
        <Toggle checked={convertCollections} label="Also convert ClearCollect of data that never changes" onChange={setConvertCollections} />
      </div>

      {total > 0 ? (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          <div className="stat-tile">
            <div className="eyebrow">Moves to App.Formulas</div>
            <strong style={{ fontSize: "1.5rem" }}>{result.converted.length} of {total}</strong>
          </div>
          <div className="stat-tile">
            <div className="eyebrow">Stays in App.OnStart</div>
            <strong style={{ fontSize: "1.5rem" }}>{result.kept.length} of {total}</strong>
          </div>
        </div>
      ) : null}

      <CopyCodeBlock code={formulas || "Nothing here can move to App.Formulas."} copyEvent="Named Formulas Copied" label="App.Formulas" />
      <CopyCodeBlock code={remaining || "Nothing is left. App.OnStart can be empty."} copyEvent="OnStart Copied" label="App.OnStart (what is left)" />

      {result.kept.length > 0 ? (
        <div className="stat-tile">
          <div className="eyebrow">Why these stay in OnStart</div>
          <ul style={{ color: "#415049", lineHeight: 1.6, margin: 0, paddingLeft: 20 }}>
            {result.kept.map((item, index) => (
              <li key={index} style={{ overflowWrap: "anywhere" }}>
                <code>{item.text.length > 70 ? item.text.slice(0, 67) + "..." : item.text}</code>
                <br />
                {item.reason}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <ToolNotes notes={result.notes} />
    </ToolShell>
  );
}
