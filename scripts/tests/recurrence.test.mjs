import assert from "node:assert/strict";
import test from "node:test";
import { planRecurrence, zonedToUtc } from "../../lib/tools/recurrence.ts";

const now = new Date("2026-03-01T12:00:00Z");
const base = { interval: 1, weekDays: [], hours: [], minutes: [] };

test("zone conversion handles daylight saving time", () => {
  assert.equal(zonedToUtc({ year: 2026, month: 3, day: 9, hour: 9, minute: 0 }, "America/New_York").toISOString(), "2026-03-09T13:00:00.000Z");
  assert.equal(zonedToUtc({ year: 2026, month: 3, day: 6, hour: 9, minute: 0 }, "America/New_York").toISOString(), "2026-03-06T14:00:00.000Z");
  assert.equal(zonedToUtc({ year: 2026, month: 3, day: 8, hour: 2, minute: 30 }, "America/New_York"), null);
});

test("a time zone keeps the local time and moves UTC across daylight saving", () => {
  const result = planRecurrence({ ...base, frequency: "Day", timeZone: "Eastern Standard Time", startTime: "2026-03-06T09:00" }, now, 4);
  assert.deepEqual(result.runs.map((run) => run.utcText), ["2026-03-06 14:00 UTC", "2026-03-07 14:00 UTC", "2026-03-08 13:00 UTC", "2026-03-09 13:00 UTC"]);
  assert.ok(result.notes.some((note) => note.startsWith("Daylight saving time changes")));
  assert.ok(result.trigger.includes('"startTime": "2026-03-06T09:00:00"'));
});

test("no time zone means UTC and a start time ending in Z", () => {
  const result = planRecurrence({ ...base, frequency: "Day", timeZone: "", startTime: "2026-03-06T09:00" }, now, 2);
  assert.ok(result.trigger.includes('"startTime": "2026-03-06T09:00:00Z"'));
  assert.equal(result.runs[0].utcText, "2026-03-06 09:00 UTC");
});

test("a weekly schedule runs on the chosen days, hours and minutes", () => {
  const result = planRecurrence({ ...base, frequency: "Week", timeZone: "UTC", startTime: "2026-03-02T00:00", weekDays: ["Monday", "Friday"], hours: [9, 17], minutes: [30] }, now, 5);
  assert.deepEqual(result.runs.map((run) => run.local), ["Mon 2026-03-02 09:30", "Mon 2026-03-02 17:30", "Fri 2026-03-06 09:30", "Fri 2026-03-06 17:30", "Mon 2026-03-09 09:30"]);
  assert.ok(result.trigger.includes('"weekDays"'));
});

test("past start times are skipped and the next future run is first", () => {
  const result = planRecurrence({ ...base, frequency: "Hour", interval: 4, timeZone: "", startTime: "2026-02-27T01:00" }, now, 2);
  assert.deepEqual(result.runs.map((run) => run.utcText), ["2026-03-01 13:00 UTC", "2026-03-01 17:00 UTC"]);
});

test("no start time runs straight away", () => {
  const result = planRecurrence({ ...base, frequency: "Hour", timeZone: "", startTime: "" }, now, 1);
  assert.equal(result.runs[0].utcText, "2026-03-01 12:00 UTC");
  assert.ok(result.notes.some((note) => note.startsWith("With no start time")));
});

test("invalid intervals and the 2 AM window are reported", () => {
  assert.ok(planRecurrence({ ...base, frequency: "Month", interval: 17, timeZone: "", startTime: "" }, now).errors.length === 1);
  const early = planRecurrence({ ...base, frequency: "Day", timeZone: "Pacific Standard Time", startTime: "2026-03-05T02:30" }, now, 5);
  assert.ok(early.notes.some((note) => note.includes("between 2:00 AM and 3:00 AM")));
  assert.ok(early.runs.some((run) => run.note?.includes("clocks go forward")));
});

test("months without the start day are flagged", () => {
  const result = planRecurrence({ ...base, frequency: "Month", timeZone: "UTC", startTime: "2026-01-31T08:00" }, now, 3);
  assert.equal(result.runs[0].local, "Tue 2026-03-31 08:00");
  assert.ok(result.runs[1].note?.includes("no day 31"));
});
