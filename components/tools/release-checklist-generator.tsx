"use client";

import { useMemo } from "react";
import { Toggle, ToolShell } from "@/components/resources/tool-shell";
import { useSavedState } from "@/components/tools/saved-state";
import { CopyCodeBlock } from "@/components/ui/copy-code-block";
import { buildReleaseChecklist, checklistText, releaseContentLabels, type ReleaseContents, type ReleaseTarget } from "@/lib/tools/release-checklist";

const initialContents: ReleaseContents = {
  canvasApps: true,
  modelDrivenApps: false,
  cloudFlows: true,
  dataverse: true,
  plugins: false,
  powerPages: false,
  environmentVariables: true,
  connectionReferences: true
};

export function ReleaseChecklistGenerator() {
  const [target, setTarget] = useSavedState<ReleaseTarget>("target", "Test");
  const [contents, setContents] = useSavedState<ReleaseContents>("contents", initialContents);
  const text = useMemo(() => checklistText(target, buildReleaseChecklist(target, contents)), [target, contents]);

  return (
    <ToolShell title="Solution checklist generator" description="Choose the target environment and what the release contains, then copy a checklist covering unmanaged layers, managed import, environment variables, connection references, and checks after import.">
      <label className="field" style={{ maxWidth: 280 }}>
        <span>Target environment</span>
        <select onChange={(event) => setTarget(event.target.value as ReleaseTarget)} value={target}>
          <option>Test</option>
          <option>Production</option>
          <option>Training</option>
        </select>
      </label>
      <div className="badge-row" role="group" aria-label="Release contents">
        {(Object.keys(releaseContentLabels) as Array<keyof ReleaseContents>).map((key) => (
          <Toggle checked={contents[key]} key={key} label={releaseContentLabels[key]} onChange={(value) => setContents((current) => ({ ...current, [key]: value }))} />
        ))}
      </div>
      <CopyCodeBlock code={text} copyEvent="Release Checklist Copied" label="Release checklist" />
    </ToolShell>
  );
}
