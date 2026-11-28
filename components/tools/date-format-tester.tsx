"use client";

import { useSavedState } from "@/components/tools/saved-state";
import { CopyCodeBlock } from "@/components/ui/copy-code-block";
import { ToolNotes, ToolShell } from "@/components/resources/tool-shell";
import {
  formatDotNet,
  formatPresets,
  powerAutomateExpression,
  powerFxFormula,
  timeZones,
  toPowerFxFormat,
  zonedParts
} from "@/lib/tools/date-format";

function toInputValue(date: Date) {
  return date.toISOString().slice(0, 19);
}

export function DateFormatTester() {
  const [format, setFormat] = useSavedState("format", "MMM d, yyyy h:mm tt");
  const [sample, setSample] = useSavedState("sample", "2026-03-09T14:05:07");
  const [timeZoneId, setTimeZoneId] = useSavedState("timeZoneId", "UTC");
  const [flowSource, setFlowSource] = useSavedState("flowSource", "utcNow()");
  const [appSource, setAppSource] = useSavedState("appSource", "Now()");

  const zone = timeZones.find((candidate) => candidate.id === timeZoneId) ?? timeZones[0];
  const instant = new Date(sample.length === 16 ? sample + ":00Z" : sample + "Z");
  const valid = !Number.isNaN(instant.getTime());
  const isUtc = zone.id === "UTC";
  const preview = valid && format ? formatDotNet(zonedParts(instant, zone.iana), format, isUtc) : "";
  const powerFx = toPowerFxFormat(format);

  const notes = [...powerFx.notes];
  if (!format.trim()) notes.unshift("Enter a format string, or pick one of the presets.");
  if (!valid) notes.unshift("Enter a sample date and time to see the preview.");
  if (!isUtc && /[zK]/.test(format.replace(/'[^']*'|"[^"]*"|\\./g, ""))) {
    notes.push("In Power Automate, a value returned by convertTimeZone doesn't keep the zone's offset, so z and K won't show it reliably. Add the offset as text if you need it.");
  }
  if (!isUtc) notes.push("Power Apps shows dates in each user's own time zone. The Power Fx formula below formats the value but does not move it to " + zone.label + ".");

  return (
    <ToolShell
      title="Date format tester"
      description="Type a format string or pick a preset, and see the result on a sample date. Copy the matching expression for Power Automate or the formula for Power Apps."
    >
      <div className="badge-row">
        {formatPresets.map((preset) => (
          <button className={`chip-button ${format === preset.format ? "active" : ""}`} key={preset.format} onClick={() => setFormat(preset.format)} type="button">
            {preset.label}
          </button>
        ))}
      </div>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <label className="field">
          <span>Format string</span>
          <input onChange={(event) => setFormat(event.target.value)} spellCheck={false} value={format} />
        </label>
        <label className="field" style={{ minWidth: 0 }}>
          <span>Convert from UTC to</span>
          <select onChange={(event) => setTimeZoneId(event.target.value)} value={timeZoneId}>
            {timeZones.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Sample date and time (UTC)</span>
          <input onChange={(event) => setSample(event.target.value)} step={1} type="datetime-local" value={sample} />
        </label>
      </div>
      <div>
        <button className="button secondary" onClick={() => setSample(toInputValue(new Date()))} type="button">
          Use the current time
        </button>
      </div>

      <div className="stat-tile" aria-live="polite">
        <div className="eyebrow">Result{isUtc ? "" : " in " + zone.label}</div>
        <strong style={{ fontSize: "1.5rem", overflowWrap: "anywhere" }}>{preview || "No preview yet"}</strong>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <label className="field">
          <span>Power Automate value to format</span>
          <input onChange={(event) => setFlowSource(event.target.value)} placeholder="utcNow()" spellCheck={false} value={flowSource} />
        </label>
        <label className="field">
          <span>Power Apps value to format</span>
          <input onChange={(event) => setAppSource(event.target.value)} placeholder="Now()" spellCheck={false} value={appSource} />
        </label>
      </div>
      <CopyCodeBlock code={powerAutomateExpression(flowSource, format, zone.id)} copyEvent="Date Expression Copied" label="Power Automate expression" />
      <CopyCodeBlock code={powerFxFormula(appSource, powerFx.format)} copyEvent="Date Formula Copied" label="Power Fx formula (Power Apps)" />
      <ToolNotes notes={notes} />
    </ToolShell>
  );
}
