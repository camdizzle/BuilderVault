"use client";

import { useMemo, useState } from "react";
import { ToolNotes, ToolShell } from "@/components/resources/tool-shell";
import { useSavedState } from "@/components/tools/saved-state";
import { CopyCodeBlock } from "@/components/ui/copy-code-block";
import {
  buildSettings,
  commonConnectors,
  pacCommands,
  parseSettings,
  settingsFileName,
  settingsWarnings,
  type ConnRefRow,
  type EnvVarRow
} from "@/lib/tools/deployment-settings";

const fieldsetStyle = { border: "1px solid var(--line)", borderRadius: 8, display: "grid", gap: 10, margin: 0, padding: 14 } as const;
const gridStyle = { gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" } as const;

/** Keeps one value per environment, padding with empty text when environments are added. */
function fit(values: string[], count: number) {
  return Array.from({ length: count }, (_, index) => values[index] ?? "");
}

export function DeploymentSettingsGenerator() {
  const [environmentText, setEnvironmentText] = useSavedState("environmentText", "Test, Production");
  const [solutionZip, setSolutionZip] = useSavedState("solutionZip", "Requests_managed.zip");
  const [envVars, setEnvVars] = useSavedState<EnvVarRow[]>("envVars", [
    { schemaName: "contoso_SharePointSiteUrl", values: ["https://contoso.sharepoint.com/sites/requests-test", "https://contoso.sharepoint.com/sites/requests"] }
  ]);
  const [connRefs, setConnRefs] = useSavedState<ConnRefRow[]>("connRefs", [
    { logicalName: "contoso_sharedsharepointonline_1a2b3", connector: "shared_sharepointonline", connectionIds: ["", ""] }
  ]);
  const [selected, setSelected] = useState(0);
  const [pasted, setPasted] = useState("");
  const [pasteMessage, setPasteMessage] = useState("");

  const environments = useMemo(() => {
    const names = environmentText.split(",").map((name) => name.trim()).filter(Boolean);
    return names.length > 0 ? names : ["Test"];
  }, [environmentText]);
  const count = environments.length;
  const current = Math.min(selected, count - 1);
  const input = useMemo(
    () => ({
      environments,
      envVars: envVars.map((row) => ({ ...row, values: fit(row.values ?? [], count) })),
      connRefs: connRefs.map((row) => ({ ...row, connectionIds: fit(row.connectionIds ?? [], count) }))
    }),
    [environments, envVars, connRefs, count]
  );
  const json = buildSettings(input, current);
  const fileName = settingsFileName(environments[current]);
  const warnings = useMemo(() => settingsWarnings(input), [input]);

  function updateEnvVar(index: number, patch: Partial<EnvVarRow>) {
    setEnvVars((rows) => rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
  }
  function updateConnRef(index: number, patch: Partial<ConnRefRow>) {
    setConnRefs((rows) => rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
  }
  function loadPasted() {
    const parsed = parseSettings(pasted, count);
    if (parsed.error) {
      setPasteMessage(parsed.error);
      return;
    }
    setEnvVars(parsed.envVars);
    setConnRefs(parsed.connRefs);
    setPasteMessage(`Loaded ${parsed.envVars.length} environment ${parsed.envVars.length === 1 ? "variable" : "variables"} and ${parsed.connRefs.length} connection ${parsed.connRefs.length === 1 ? "reference" : "references"}. Fill in the values for each environment below.`);
  }
  function download() {
    const url = URL.createObjectURL(new Blob([json + "\n"], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ToolShell
      title="Deployment settings generator"
      description="Build the deployment settings file that sets connection references and environment variables when you import a solution with pac or Azure DevOps, one file per target environment."
    >
      <details className="stat-tile">
        <summary style={{ cursor: "pointer", fontWeight: 800 }}>Start from a file made by pac solution create-settings</summary>
        <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
          <label className="field">
            <span>Paste the settings file</span>
            <textarea className="tool-textarea" onChange={(event) => setPasted(event.target.value)} placeholder='{ "EnvironmentVariables": [ ... ], "ConnectionReferences": [ ... ] }' spellCheck={false} style={{ minHeight: 120 }} value={pasted} />
          </label>
          <div>
            <button className="button secondary" disabled={!pasted.trim()} onClick={loadPasted} type="button">
              Load it
            </button>
          </div>
          {pasteMessage ? <p aria-live="polite" style={{ margin: 0 }}>{pasteMessage}</p> : null}
        </div>
      </details>

      <div className="grid" style={gridStyle}>
        <label className="field">
          <span>Target environments, separated by commas</span>
          <input onChange={(event) => setEnvironmentText(event.target.value)} value={environmentText} />
        </label>
        <label className="field">
          <span>Solution file</span>
          <input onChange={(event) => setSolutionZip(event.target.value)} spellCheck={false} value={solutionZip} />
        </label>
      </div>

      <h3 style={{ fontSize: "1.1rem", margin: "6px 0 0" }}>Environment variables</h3>
      {input.envVars.map((row, index) => (
        <fieldset key={index} style={fieldsetStyle}>
          <legend style={{ fontWeight: 800, padding: "0 6px" }}>Environment variable {index + 1}</legend>
          <label className="field">
            <span>Schema name</span>
            <input onChange={(event) => updateEnvVar(index, { schemaName: event.target.value })} placeholder="contoso_SiteUrl" spellCheck={false} value={row.schemaName} />
          </label>
          <div className="grid" style={gridStyle}>
            {environments.map((environment, envIndex) => (
              <label className="field" key={environment + envIndex}>
                <span>Value in {environment}</span>
                <input
                  onChange={(event) => updateEnvVar(index, { values: row.values.map((value, valueIndex) => (valueIndex === envIndex ? event.target.value : value)) })}
                  spellCheck={false}
                  value={row.values[envIndex]}
                />
              </label>
            ))}
          </div>
          <div>
            <button className="link-button" onClick={() => setEnvVars((rows) => rows.filter((_, rowIndex) => rowIndex !== index))} style={{ color: "var(--accent-strong)" }} type="button">
              Remove
            </button>
          </div>
        </fieldset>
      ))}
      <div>
        <button className="button secondary" onClick={() => setEnvVars((rows) => [...rows, { schemaName: "", values: fit([], count) }])} type="button">
          Add environment variable
        </button>
      </div>

      <h3 style={{ fontSize: "1.1rem", margin: "6px 0 0" }}>Connection references</h3>
      <datalist id="deployment-connectors">
        {commonConnectors.map((connector) => (
          <option key={connector.api} label={connector.label} value={connector.api} />
        ))}
      </datalist>
      {input.connRefs.map((row, index) => (
        <fieldset key={index} style={fieldsetStyle}>
          <legend style={{ fontWeight: 800, padding: "0 6px" }}>Connection reference {index + 1}</legend>
          <div className="grid" style={gridStyle}>
            <label className="field">
              <span>Logical name</span>
              <input onChange={(event) => updateConnRef(index, { logicalName: event.target.value })} placeholder="contoso_sharedsharepointonline_1a2b3" spellCheck={false} value={row.logicalName} />
            </label>
            <label className="field">
              <span>Connector</span>
              <input list="deployment-connectors" onChange={(event) => updateConnRef(index, { connector: event.target.value })} placeholder="shared_sharepointonline" spellCheck={false} value={row.connector} />
            </label>
          </div>
          <div className="grid" style={gridStyle}>
            {environments.map((environment, envIndex) => (
              <label className="field" key={environment + envIndex}>
                <span>Connection ID in {environment}</span>
                <input
                  onChange={(event) => updateConnRef(index, { connectionIds: row.connectionIds.map((value, valueIndex) => (valueIndex === envIndex ? event.target.value : value)) })}
                  placeholder="Paste the ID or the connection's address"
                  spellCheck={false}
                  value={row.connectionIds[envIndex]}
                />
              </label>
            ))}
          </div>
          <div>
            <button className="link-button" onClick={() => setConnRefs((rows) => rows.filter((_, rowIndex) => rowIndex !== index))} style={{ color: "var(--accent-strong)" }} type="button">
              Remove
            </button>
          </div>
        </fieldset>
      ))}
      <div>
        <button className="button secondary" onClick={() => setConnRefs((rows) => [...rows, { logicalName: "", connector: "", connectionIds: fit([], count) }])} type="button">
          Add connection reference
        </button>
      </div>

      {count > 1 ? (
        <div className="badge-row" role="group" aria-label="Environment">
          {environments.map((environment, envIndex) => (
            <button aria-pressed={envIndex === current} className={`chip-button ${envIndex === current ? "active" : ""}`} key={environment + envIndex} onClick={() => setSelected(envIndex)} type="button">
              {environment}
            </button>
          ))}
        </div>
      ) : null}
      <CopyCodeBlock code={json} copyEvent="Deployment Settings Copied" label={fileName} />
      <div>
        <button className="button secondary" onClick={download} type="button">
          Download {fileName}
        </button>
      </div>
      <CopyCodeBlock code={pacCommands(solutionZip, environments[current])} copyEvent="Pac Commands Copied" label="pac commands" />
      <ToolNotes
        notes={[
          ...warnings,
          "To find a connection ID, open Power Apps in the target environment, open the connection under Connections, and copy the ID from the address bar. You can paste the whole address and the tool keeps only the ID.",
          "Import checks that each connection can be used by the owner of the connection reference, so the connection must belong to that owner or be shared with them.",
          "In Azure DevOps, choose Use deployment settings file on the Power Platform Import Solution task and point it at this file."
        ]}
      />
    </ToolShell>
  );
}
