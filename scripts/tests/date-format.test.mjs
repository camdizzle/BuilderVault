import assert from "node:assert/strict";
import test from "node:test";
import {
  formatDotNet,
  powerAutomateExpression,
  powerFxFormula,
  timeZones,
  toPowerFxFormat,
  tokenizeFormat,
  zonedParts
} from "../../lib/tools/date-format.ts";

// Monday 9 March 2026, 14:05:07.120 UTC
const instant = new Date(Date.UTC(2026, 2, 9, 14, 5, 7, 120));
const utc = zonedParts(instant, "UTC");

test("zoned parts", () => {
  assert.deepEqual(utc, { year: 2026, month: 3, day: 9, hour: 14, minute: 5, second: 7, millisecond: 120, weekday: 1, offsetMinutes: 0 });
  const newYork = zonedParts(instant, "America/New_York");
  assert.equal(newYork.hour, 10);
  assert.equal(newYork.offsetMinutes, -240);
  const kolkata = zonedParts(instant, "Asia/Kolkata");
  assert.equal(kolkata.hour, 19);
  assert.equal(kolkata.minute, 35);
  assert.equal(kolkata.offsetMinutes, 330);
  const auckland = zonedParts(new Date(Date.UTC(2026, 2, 9, 23, 0, 0)), "Pacific/Auckland");
  assert.equal(auckland.day, 10);
  assert.equal(auckland.weekday, 2);
});

test("every listed time zone is valid", () => {
  for (const zone of timeZones) assert.doesNotThrow(() => zonedParts(instant, zone.iana), zone.id);
  assert.equal(new Set(timeZones.map((zone) => zone.id)).size, timeZones.length);
});

test("custom formats", () => {
  assert.equal(formatDotNet(utc, "yyyy-MM-dd"), "2026-03-09");
  assert.equal(formatDotNet(utc, "MMM d, yyyy"), "Mar 9, 2026");
  assert.equal(formatDotNet(utc, "dddd, MMMM d, yyyy"), "Monday, March 9, 2026");
  assert.equal(formatDotNet(utc, "ddd dd/MM/yy"), "Mon 09/03/26");
  assert.equal(formatDotNet(utc, "h:mm tt"), "2:05 PM");
  assert.equal(formatDotNet(utc, "HH:mm:ss.fff"), "14:05:07.120");
  assert.equal(formatDotNet(utc, "yyyy-MM-ddTHH:mm:ssZ"), "2026-03-09T14:05:07Z");
  assert.equal(formatDotNet(utc, "yyyyMMdd_HHmmss"), "20260309_140507");
  assert.equal(formatDotNet(utc, "'Due' d MMM 'at' h tt"), "Due 9 Mar at 2 PM");
  assert.equal(formatDotNet({ ...utc, hour: 0 }, "hh tt"), "12 AM");
});

test("standard formats and offsets", () => {
  assert.equal(formatDotNet(utc, "d"), "3/9/2026");
  assert.equal(formatDotNet(utc, "g"), "3/9/2026 2:05 PM");
  assert.equal(formatDotNet(utc, "s"), "2026-03-09T14:05:07");
  assert.equal(formatDotNet(utc, "o"), "2026-03-09T14:05:07.1200000Z");
  assert.equal(formatDotNet(zonedParts(instant, "Asia/Kolkata"), "HH:mm zzz", false), "19:35 +05:30");
  assert.equal(formatDotNet(zonedParts(instant, "America/New_York"), "HH:mmK", false), "10:05");
});

test("tokenizer merges literals", () => {
  assert.deepEqual(tokenizeFormat("d 'of' MMM"), [
    { kind: "spec", letter: "d", count: 1 },
    { kind: "literal", text: " of " },
    { kind: "spec", letter: "M", count: 3 }
  ]);
});

test("Power Fx conversion", () => {
  assert.equal(toPowerFxFormat("yyyy-MM-dd").format, "yyyy-mm-dd");
  assert.equal(toPowerFxFormat("dddd, MMMM d, yyyy").format, "dddd, mmmm d, yyyy");
  assert.equal(toPowerFxFormat("M/d/yyyy h:mm tt").format, "m/d/yyyy h:mm AM/PM");
  assert.equal(toPowerFxFormat("yyyy-MM-dd HH:mm").format, "yyyy-mm-dd hh:mm");
  assert.equal(toPowerFxFormat("d 'at' h tt").format, "d \\a\\t h AM/PM");
  assert.ok(toPowerFxFormat("HH:mm zzz").notes.some((note) => note.includes("offset")));
  assert.ok(toPowerFxFormat("hh:mm").notes.some((note) => note.includes("12-hour")));
  assert.deepEqual(toPowerFxFormat("yyyy-MM-dd").notes, []);
});

test("expressions", () => {
  assert.equal(powerAutomateExpression("", "yyyy-MM-dd", "UTC"), "formatDateTime(utcNow(), 'yyyy-MM-dd')");
  assert.equal(
    powerAutomateExpression("triggerOutputs()?['body/Created']", "d 'of' MMM", "Eastern Standard Time"),
    "convertTimeZone(triggerOutputs()?['body/Created'], 'UTC', 'Eastern Standard Time', 'd ''of'' MMM')"
  );
  assert.equal(powerFxFormula("", "yyyy-mm-dd"), 'Text(Now(), "yyyy-mm-dd")');
  assert.equal(powerFxFormula("ThisItem.Created", 'd "x"'), 'Text(ThisItem.Created, "d ""x""")');
});
