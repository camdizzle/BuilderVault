export type RecurrenceFrequency = "Minute" | "Hour" | "Day" | "Week" | "Month";
export type WeekDay = "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";

export const weekDays: WeekDay[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Windows time zone names, as the Recurrence trigger lists them, with the matching IANA zone for the preview. */
export const recurrenceTimeZones: Array<{ windows: string; iana: string; label: string }> = [
  { windows: "", iana: "UTC", label: "None (UTC, the start time ends in Z)" },
  { windows: "UTC", iana: "UTC", label: "(UTC) Coordinated Universal Time" },
  { windows: "GMT Standard Time", iana: "Europe/London", label: "(UTC+00:00) Dublin, Edinburgh, Lisbon, London" },
  { windows: "W. Europe Standard Time", iana: "Europe/Berlin", label: "(UTC+01:00) Amsterdam, Berlin, Rome, Stockholm, Vienna" },
  { windows: "Romance Standard Time", iana: "Europe/Paris", label: "(UTC+01:00) Brussels, Copenhagen, Madrid, Paris" },
  { windows: "Central Europe Standard Time", iana: "Europe/Budapest", label: "(UTC+01:00) Belgrade, Bratislava, Budapest, Prague" },
  { windows: "FLE Standard Time", iana: "Europe/Kiev", label: "(UTC+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius" },
  { windows: "South Africa Standard Time", iana: "Africa/Johannesburg", label: "(UTC+02:00) Harare, Pretoria" },
  { windows: "Arabian Standard Time", iana: "Asia/Dubai", label: "(UTC+04:00) Abu Dhabi, Muscat" },
  { windows: "India Standard Time", iana: "Asia/Kolkata", label: "(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi" },
  { windows: "Singapore Standard Time", iana: "Asia/Singapore", label: "(UTC+08:00) Kuala Lumpur, Singapore" },
  { windows: "China Standard Time", iana: "Asia/Shanghai", label: "(UTC+08:00) Beijing, Chongqing, Hong Kong, Urumqi" },
  { windows: "Tokyo Standard Time", iana: "Asia/Tokyo", label: "(UTC+09:00) Osaka, Sapporo, Tokyo" },
  { windows: "AUS Eastern Standard Time", iana: "Australia/Sydney", label: "(UTC+10:00) Canberra, Melbourne, Sydney" },
  { windows: "New Zealand Standard Time", iana: "Pacific/Auckland", label: "(UTC+12:00) Auckland, Wellington" },
  { windows: "E. South America Standard Time", iana: "America/Sao_Paulo", label: "(UTC-03:00) Brasilia" },
  { windows: "Atlantic Standard Time", iana: "America/Halifax", label: "(UTC-04:00) Atlantic Time (Canada)" },
  { windows: "Eastern Standard Time", iana: "America/New_York", label: "(UTC-05:00) Eastern Time (US & Canada)" },
  { windows: "Central Standard Time", iana: "America/Chicago", label: "(UTC-06:00) Central Time (US & Canada)" },
  { windows: "Mountain Standard Time", iana: "America/Denver", label: "(UTC-07:00) Mountain Time (US & Canada)" },
  { windows: "US Mountain Standard Time", iana: "America/Phoenix", label: "(UTC-07:00) Arizona" },
  { windows: "Pacific Standard Time", iana: "America/Los_Angeles", label: "(UTC-08:00) Pacific Time (US & Canada)" }
];

export type RecurrenceOptions = {
  frequency: RecurrenceFrequency;
  interval: number;
  /** Windows time zone name, or "" for none. */
  timeZone: string;
  /** Local date and time in the time zone, as YYYY-MM-DDThh:mm, or "" for none. */
  startTime: string;
  weekDays: WeekDay[];
  hours: number[];
  minutes: number[];
};

export type RecurrenceRun = { utc: Date; local: string; utcText: string; note?: string };
export type RecurrenceResult = { runs: RecurrenceRun[]; trigger: string; notes: string[]; errors: string[] };

export const intervalLimits: Record<RecurrenceFrequency, number> = { Minute: 72000, Hour: 12000, Day: 500, Week: 71, Month: 16 };

type Parts = { year: number; month: number; day: number; hour: number; minute: number };

const pad = (value: number) => String(value).padStart(2, "0");

/** The wall-clock parts of an instant in a zone. */
export function partsInZone(instant: Date, iana: string): Parts & { weekday: number } {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: iana,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short"
  });
  const values: Record<string, string> = {};
  for (const part of formatter.formatToParts(instant)) values[part.type] = part.value;
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour) % 24,
    minute: Number(values.minute),
    weekday: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(values.weekday)
  };
}

/**
 * The instant for a wall-clock time in a zone. Returns null when the time doesn't exist, which happens
 * in the hour skipped when daylight saving time starts. For a time that happens twice, the first is used.
 */
export function zonedToUtc(parts: Parts, iana: string): Date | null {
  const guess = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
  const candidates = new Set<number>();
  for (const shift of [-14, -12, -10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10, 12, 14]) {
    const probe = new Date(guess + shift * 3600000);
    const local = partsInZone(probe, iana);
    const offset = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute) - probe.getTime();
    candidates.add(guess - offset);
  }
  const matches = [...candidates]
    .filter((time) => {
      const local = partsInZone(new Date(time), iana);
      return local.year === parts.year && local.month === parts.month && local.day === parts.day && local.hour === parts.hour && local.minute === parts.minute;
    })
    .sort((a, b) => a - b);
  return matches.length > 0 ? new Date(matches[0]) : null;
}

function addDays(parts: Parts, days: number): Parts {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return { ...parts, year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

function addMonths(parts: Parts, months: number): Parts {
  const total = parts.year * 12 + (parts.month - 1) + months;
  return { ...parts, year: Math.floor(total / 12), month: (total % 12) + 1 };
}

const daysInMonth = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate();
const dayOfWeek = (parts: Parts) => new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay();

function formatLocal(instant: Date, iana: string) {
  const local = partsInZone(instant, iana);
  const name = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][local.weekday];
  return `${name} ${local.year}-${pad(local.month)}-${pad(local.day)} ${pad(local.hour)}:${pad(local.minute)}`;
}

const formatUtc = (instant: Date) => `${instant.toISOString().slice(0, 16).replace("T", " ")} UTC`;

function parseStart(value: string): Parts | null {
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (!match) return null;
  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month) || hour > 23 || minute > 59) return null;
  return { year, month, day, hour, minute };
}

function triggerJson(options: RecurrenceOptions, start: Parts | null, hasSchedule: boolean) {
  const recurrence: Record<string, unknown> = { frequency: options.frequency, interval: options.interval };
  if (hasSchedule) {
    const schedule: Record<string, unknown> = {};
    if (options.hours.length > 0) schedule.hours = options.hours;
    if (options.minutes.length > 0) schedule.minutes = options.minutes;
    if (options.frequency === "Week" && options.weekDays.length > 0) schedule.weekDays = options.weekDays;
    recurrence.schedule = schedule;
  }
  if (start) {
    const text = `${start.year}-${pad(start.month)}-${pad(start.day)}T${pad(start.hour)}:${pad(start.minute)}:00`;
    recurrence.startTime = options.timeZone ? text : `${text}Z`;
  }
  if (options.timeZone) recurrence.timeZone = options.timeZone;
  return JSON.stringify({ type: "Recurrence", recurrence }, null, 2);
}

/** The next run times for a Recurrence trigger, as Microsoft documents its behavior. */
export function planRecurrence(options: RecurrenceOptions, nowInput: Date, count = 10): RecurrenceResult {
  const now = new Date(Math.floor(nowInput.getTime() / 60000) * 60000);
  const notes: string[] = [];
  const errors: string[] = [];
  const zone = recurrenceTimeZones.find((item) => item.windows === options.timeZone) ?? recurrenceTimeZones[0];
  const iana = zone.iana;
  const interval = Math.floor(options.interval);
  const scheduleAllowed = options.frequency === "Day" || options.frequency === "Week";
  const hours = scheduleAllowed ? [...new Set(options.hours)].filter((hour) => hour >= 0 && hour <= 23).sort((a, b) => a - b) : [];
  const minutes = scheduleAllowed ? [...new Set(options.minutes)].filter((minute) => minute >= 0 && minute <= 59).sort((a, b) => a - b) : [];
  const days = options.frequency === "Week" ? options.weekDays : [];
  const hasSchedule = hours.length > 0 || minutes.length > 0 || days.length > 0;

  if (!(interval >= 1) || interval > intervalLimits[options.frequency]) {
    errors.push(`The interval for ${options.frequency} must be between 1 and ${intervalLimits[options.frequency].toLocaleString("en-US")}.`);
  }
  let start = options.startTime.trim() ? parseStart(options.startTime) : null;
  if (options.startTime.trim() && !start) errors.push("The start time must be a date and time, such as 2026-12-01T08:00.");
  if (options.timeZone && !start) {
    notes.push("A time zone only applies when you also set a start time. Without one, the schedule runs in UTC.");
  }

  const cleanOptions = { ...options, interval, hours, minutes, weekDays: days };
  const trigger = triggerJson(cleanOptions, start, hasSchedule);
  if (errors.length > 0) return { runs: [], trigger, notes, errors };

  const runs: RecurrenceRun[] = [];
  const effectiveZone = start ? iana : "UTC";

  if (!start) {
    notes.push("With no start time, the first run happens as soon as you save the flow, and later runs count on from there. Set a start time to control when it runs.");
    const nowParts = partsInZone(now, "UTC");
    start = { ...nowParts };
  }

  const startInstant = zonedToUtc(start, effectiveZone);
  if (!startInstant) {
    errors.push("That start time doesn't exist in this time zone, because the clocks go forward then. Pick a time outside the hour that is skipped.");
    return { runs: [], trigger, notes, errors };
  }

  const push = (instant: Date | null, parts: Parts) => {
    if (!instant) {
      runs.push({
        utc: new Date(NaN),
        local: `${parts.year}-${pad(parts.month)}-${pad(parts.day)} ${pad(parts.hour)}:${pad(parts.minute)}`,
        utcText: "",
        note: "The clocks go forward through this time on this date, so this run may move or be skipped."
      });
      return;
    }
    runs.push({ utc: instant, local: formatLocal(instant, effectiveZone), utcText: formatUtc(instant) });
  };

  if (!hasSchedule) {
    // Simple schedule: the start time is the first run, and past run times are discarded.
    if (options.frequency === "Minute" || options.frequency === "Hour") {
      const step = interval * (options.frequency === "Minute" ? 60000 : 3600000);
      let time = startInstant.getTime();
      if (time < now.getTime()) time += Math.ceil((now.getTime() - time) / step) * step;
      for (let index = 0; index < count; index += 1) push(new Date(time + index * step), start);
    } else {
      let index = 0;
      let guard = 0;
      while (runs.length < count && guard < 5000) {
        guard += 1;
        const parts = options.frequency === "Day" ? addDays(start, index * interval) : options.frequency === "Week" ? addDays(start, index * interval * 7) : addMonths(start, index * interval);
        index += 1;
        const nowLocal = partsInZone(now, effectiveZone);
        if (parts.year * 12 + parts.month < nowLocal.year * 12 + nowLocal.month) continue;
        if (options.frequency === "Month" && start.day > daysInMonth(parts.year, parts.month)) {
          runs.push({ utc: new Date(NaN), local: `${parts.year}-${pad(parts.month)}`, utcText: "", note: `This month has no day ${start.day}. Check the trigger's behavior for this month, or start on day 28 or earlier.` });
          continue;
        }
        const instant = zonedToUtc(parts, effectiveZone);
        if (instant && instant.getTime() < now.getTime()) continue;
        push(instant, parts);
      }
    }
  } else {
    // Advanced schedule: runs on the chosen days, hours and minutes, never before the start time.
    // Hours and minutes that aren't set come from the start time.
    const runHours = hours.length > 0 ? hours : [start.hour];
    const runMinutes = minutes.length > 0 ? minutes : [start.minute];
    const runDays = days.length > 0 ? days.map((day) => weekDays.indexOf(day)) : [dayOfWeek(start)];
    const earliest = Math.max(startInstant.getTime(), now.getTime());
    const firstWeekStart = addDays(start, -dayOfWeek(start));
    let offset = 0;
    while (runs.length < count && offset < 3660) {
      const day = addDays(start, offset);
      offset += 1;
      if (options.frequency === "Day") {
        if ((offset - 1) % interval !== 0) continue;
      } else {
        const weeksSince = Math.floor((Date.UTC(day.year, day.month - 1, day.day) - Date.UTC(firstWeekStart.year, firstWeekStart.month - 1, firstWeekStart.day)) / (7 * 86400000));
        if (weeksSince % interval !== 0 || !runDays.includes(dayOfWeek(day))) continue;
      }
      for (const hour of runHours) {
        for (const minute of runMinutes) {
          if (runs.length >= count) break;
          const parts = { ...day, hour, minute };
          const instant = zonedToUtc(parts, effectiveZone);
          if (instant && instant.getTime() < earliest) continue;
          push(instant, parts);
        }
      }
    }
    if (hours.length === 0) notes.push(`No hours are set, so the runs use the start time's hour, ${pad(start.hour)}.`);
    if (minutes.length === 0) notes.push(`No minutes are set, so the runs use the start time's minute, :${pad(start.minute)}. Set At these minutes to 0 to run on the hour.`);
    if (options.frequency === "Week" && interval > 1) notes.push("For a schedule every few weeks, this preview counts weeks from the week of the start time. Compare it with the preview the trigger shows when you save it.");
  }

  if (!options.timeZone && start && options.startTime.trim()) {
    notes.push("No time zone is selected, so the times are UTC and don't move with daylight saving time. For people in a zone with daylight saving, the local run time moves by an hour twice a year.");
  }
  if (options.timeZone && options.timeZone !== "UTC") {
    const offsets = new Set(runs.filter((run) => !Number.isNaN(run.utc.getTime())).map((run) => {
      const local = partsInZone(run.utc, iana);
      return Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute) - run.utc.getTime();
    }));
    if (offsets.size > 1) notes.push("Daylight saving time changes during these runs. The local time stays the same and the UTC time moves, because a time zone is selected.");
  }
  if (options.timeZone && options.timeZone !== "UTC" && runs.some((run) => /\s02:\d\d$/.test(run.local) || (run.note ?? "").includes("clocks"))) {
    notes.push("Microsoft advises avoiding start times between 2:00 AM and 3:00 AM, because daylight saving changes happen then and the time can be skipped or happen twice.");
  }
  if (options.frequency === "Minute" && interval === 1) notes.push("One minute is the shortest recurrence Power Automate allows, and a flow that runs every minute uses up to 1,440 runs a day.");
  if (start && options.startTime.trim() && (options.frequency === "Day" || options.frequency === "Week" || options.frequency === "Month")) {
    const ahead = { Day: 1, Week: 7, Month: 28 }[options.frequency];
    if (startInstant.getTime() > now.getTime() && startInstant.getTime() - now.getTime() < ahead * 86400000) {
      notes.push(`Microsoft advises setting up a ${options.frequency.toLowerCase()}ly schedule at least ${options.frequency === "Day" ? "24 hours" : options.frequency === "Week" ? "7 days" : "one month"} before a future start time, or the first run might be skipped.`);
    }
  }
  return { runs, trigger, notes, errors };
}
