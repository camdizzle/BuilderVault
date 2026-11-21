"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CopyCodeBlock } from "@/components/ui/copy-code-block";
import { ToolNotes, ToolShell } from "@/components/resources/tool-shell";
import { translateExcelFormula } from "@/lib/tools/excel-to-power-fx";
import { formatterLink } from "@/lib/tools/formula-link";
import { formatPowerFxFormula } from "@/lib/tools/power-fx-format";

const sampleFormula = `=IF(AND(B2>=1000,C2="Approved"),ROUND(B2*0.1,2),IFERROR(VLOOKUP(A2,Rates!A:B,2,FALSE),0))`;
const sampleReferences = `A2 = cmbRegion.Selected.Value
B2 = Value(txtAmount.Text)
C2 = drpStatus.Selected.Value`;

export function ExcelToPowerFx() {
  const [formula, setFormula] = useState(sampleFormula);
  const [references, setReferences] = useState(sampleReferences);

  const result = useMemo(() => {
    const translated = translateExcelFormula(formula, references);
    return { ...translated, formatted: formatPowerFxFormula(translated.formula).output || translated.formula };
  }, [formula, references]);

  return (
    <ToolShell
      title="Excel to Power Fx translator"
      description="Paste an Excel formula and say what each cell stands for in your app. The tool renames the functions, rewrites the ones that work differently, and lists anything you need to finish by hand."
    >
      <label className="field">
        <span>Excel formula</span>
        <textarea className="tool-textarea" onChange={(event) => setFormula(event.target.value)} spellCheck={false} style={{ minHeight: 90 }} value={formula} />
      </label>
      <label className="field">
        <span>Cell references, one per line as Cell = control, variable, or column (optional)</span>
        <textarea className="tool-textarea" onChange={(event) => setReferences(event.target.value)} spellCheck={false} style={{ minHeight: 100 }} value={references} />
      </label>

      <CopyCodeBlock code={result.formatted || "Paste an Excel formula to translate it."} copyEvent="Excel Translation Copied" label="Power Fx formula" />
      {result.formatted ? (
        <div>
          <Link className="button secondary" href={formatterLink(result.formatted)}>
            Check it in the Power Fx formatter
          </Link>
        </div>
      ) : null}
      <ToolNotes notes={result.notes} title="Finish by hand" />
      <p style={{ color: "#415049", lineHeight: 1.6, margin: 0 }}>
        This is a starting point, not a guarantee. Test the result in your app, and use the{" "}
        <Link href="/tools/power-fx-formatter" style={{ color: "var(--accent-strong)", fontWeight: 800 }}>Power Fx Formatter</Link>{" "}
        to check it for syntax and delegation problems.
      </p>
    </ToolShell>
  );
}
