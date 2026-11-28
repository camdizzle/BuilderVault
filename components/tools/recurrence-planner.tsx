"use client";

import { useEffect, useState } from "react";
import { useSavedState } from "@/components/tools/saved-state";
import { CopyCodeBlock } from "@/components/ui/copy-code-block";
import { ToolNotes, ToolShell } from "@/components/resources/tool-shell";
import { intervalLimits, planRecurrence, recurrenceTimeZones, weekDays, type RecurrenceFrequency, type WeekDay } from "@/lib/tools/recurrence";

const frequencies: RecurrenceFrequency[] = ["Minute", "Hour", "Day", "Week", "Month"];

/** "9, 17" or "9,12,17" to numbers. */
const numberList = (value: string) =>
  value
    .split(/[,\s]+/)
    .map((part) => part.trim())
    .filter((part) => /^\d+$/.test(part))
    .map(Number);

const chip = (active: boolean) => ({
  background: active ? "var(--accent-soft, #e6f4ef)" : "transparent",
  border: "1px solid var(--line)",
  borderRadius: 999,
  cursor: "pointer",
  fontWeight: active ? 800 : 600,
  padding: "6px 12px"
});

export function RecurrencePlanner() {
  const [frequency, setFrequency] = useSavedState<RecurrenceFrequency>("frequency", "Week");
  const [interval, setIntervalValue] = useSavedState("interval", "1");
  const [timeZone, setTimeZone] = useSavedState("timeZone", "Eastern Standard Time");
  const [startTime, setStartTime] = useSavedState("startTime", "2027-01-04T00:00");
  const [days, setDays] = useSavedState<WeekDay[]>("days", ["Monday", "Wednesday", "Friday"]);
  const [hours, setHours] = useSavedState("hours", "9");
  const [minutes, setMinutes] = useSavedState("minutes", "0");
  // The clock is read in the browser after the first render, so the server and the browser render the same page.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the current time is only known in the browser
    setNow(new Date());
  }, []);

  const scheduleAllowed = frequency === "Day" || frequency === "Week";
  const result = now
    ? planRecurrence(
        {
          frequency,
          interval: Number(interval),
          timeZone,
          startTime,
          weekDays: frequency === "Week" ? days : [],
          hours: scheduleAllowed ? numberList(hours) : [],
          minutes: scheduleAllowed ? numberList(minutes) : []
        },
        now
      )
    : null;

  function toggleDay(day: WeekDay) {
    setDays((current) => (current.includes(day) ? current.filter((item) => item !== day) : weekDays.filter((item) => item === day || current.includes(item))));
  }

  return (
    <ToolShell
      title="Recurrence schedule planner"
      description="Set up a Recurrence trigger the way you would in Power Automate and see the next 10 run times in your time zone and in UTC, including what happens when daylight saving time changes."
    >
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <label className="field">
          <span>Interval</span>
          <input inputMode="numeric" onChange={(event) => setIntervalValue(event.target.value)} value={interval} />
        </label>
        <label className="field">
          <span>Frequency</span>
          <select onChange={(event) => setFrequency(event.target.value as RecurrenceFrequency)} value={frequency}>
            {frequencies.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Time zone</span>
          <select onChange={(event) => setTimeZone(event.target.value)} value={timeZone}>
            {recurrenceTimeZones.map((zone) => (
              <option key={zone.label} value={zone.windows}>{zone.label}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Start time, in that time zone (optional)</span>
          <input onChange={(event) => setStartTime(event.target.value)} type="datetime-local" value={startTime} />
        </label>
      </div>
      <p style={{ color: "var(--muted)", fontSize: "0.92rem", margin: 0 }}>
        {frequency} intervals can be 1 to {intervalLimits[frequency].toLocaleString("en-US")}.
      </p>

      {frequency === "Week" ? (
        <fieldset style={{ border: "1px solid var(--line)", borderRadius: 8, margin: 0, padding: 14 }}>
          <legend style={{ fontWeight: 800, padding: "0 6px" }}>On these days</legend>
          <div className="badge-row">
            {weekDays.map((day) => (
              <button aria-pressed={days.includes(day)} key={day} onClick={() => toggleDay(day)} style={chip(days.includes(day))} type="button">
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}
      {scheduleAllowed ? (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          <label className="field">
            <span>At these hours, 0 to 23, split by commas</span>
            <input onChange={(event) => setHours(event.target.value)} placeholder="9, 17" value={hours} />
          </label>
          <label className="field">
            <span>At these minutes, 0 to 59, split by commas</span>
            <input onChange={(event) => setMinutes(event.target.value)} placeholder="0" value={minutes} />
          </label>
        </div>
      ) : (
        <p style={{ color: "var(--muted)", fontSize: "0.92rem", margin: 0 }}>Days, hours and minutes are only available for the Day and Week frequencies.</p>
      )}

      {!result ? (
        <div className="stat-tile">Working out the next runs…</div>
      ) : result.errors.length > 0 ? (
        <div className="stat-tile" role="alert">
          {result.errors.map((error) => (
            <p key={error} style={{ margin: 0 }}>{error}</p>
          ))}
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <caption style={{ fontWeight: 800, marginBottom: 8, textAlign: "left" }}>Next {result.runs.length} runs</caption>
            <thead>
              <tr>
                <th scope="col" style={{ borderBottom: "1px solid var(--line)", padding: "8px 10px 8px 0", textAlign: "left" }}>#</th>
                <th scope="col" style={{ borderBottom: "1px solid var(--line)", padding: "8px 10px 8px 0", textAlign: "left" }}>{timeZone && startTime ? "Local time" : "Time (UTC)"}</th>
                <th scope="col" style={{ borderBottom: "1px solid var(--line)", padding: "8px 0", textAlign: "left" }}>UTC</th>
              </tr>
            </thead>
            <tbody>
              {result.runs.map((run, index) => (
                <tr key={`${run.local}-${index}`}>
                  <td style={{ borderBottom: "1px solid var(--line)", padding: "8px 10px 8px 0" }}>{index + 1}</td>
                  <td style={{ borderBottom: "1px solid var(--line)", fontFamily: "var(--font-mono, monospace)", padding: "8px 10px 8px 0" }}>{run.local}</td>
                  <td style={{ borderBottom: "1px solid var(--line)", fontFamily: "var(--font-mono, monospace)", padding: "8px 0" }}>{run.note ?? run.utcText}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {result ? <CopyCodeBlock code={result.trigger} copyEvent="Recurrence Copied" label="Trigger definition (as it appears in Peek code)" /> : null}
      {result ? <ToolNotes notes={result.notes} /> : null}
      <p style={{ color: "#415049", lineHeight: 1.6, margin: 0 }}>
        The preview follows Microsoft&apos;s documented rules for the Recurrence trigger. Actual runs can start up to a minute late, and a run with no advanced schedule counts on from the last run, so it can drift over time.
      </p>
    </ToolShell>
  );
}
