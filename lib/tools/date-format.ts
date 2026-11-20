// Previews .NET date format strings (used by formatDateTime and convertTimeZone in Power Automate)
// and converts them to the format Power Fx Text() expects.

export type DateParts = {
  year: number;
  /** 1 to 12 */
  month: number;
  day: number;
  /** 0 to 23 */
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
  /** 0 is Sunday */
  weekday: number;
  /** Minutes ahead of UTC. */
  offsetMinutes: number;
};

export type TimeZoneOption = { id: string; iana: string; label: string };

/** Windows time zone IDs, as used by convertTimeZone, with the matching IANA zone for previews. */
export const timeZones: TimeZoneOption[] = [
  { id: "UTC", iana: "UTC", label: "UTC" },
  { id: "Hawaiian Standard Time", iana: "Pacific/Honolulu", label: "Hawaii" },
  { id: "Alaskan Standard Time", iana: "America/Anchorage", label: "Alaska" },
  { id: "Pacific Standard Time", iana: "America/Los_Angeles", label: "Pacific Time (US and Canada)" },
  { id: "US Mountain Standard Time", iana: "America/Phoenix", label: "Arizona" },
  { id: "Mountain Standard Time", iana: "America/Denver", label: "Mountain Time (US and Canada)" },
  { id: "Central Standard Time", iana: "America/Chicago", label: "Central Time (US and Canada)" },
  { id: "Central America Standard Time", iana: "America/Guatemala", label: "Central America" },
  { id: "Eastern Standard Time", iana: "America/New_York", label: "Eastern Time (US and Canada)" },
  { id: "SA Pacific Standard Time", iana: "America/Bogota", label: "Bogota, Lima" },
  { id: "Atlantic Standard Time", iana: "America/Halifax", label: "Atlantic Time (Canada)" },
  { id: "E. South America Standard Time", iana: "America/Sao_Paulo", label: "Brasilia" },
  { id: "Argentina Standard Time", iana: "America/Argentina/Buenos_Aires", label: "Buenos Aires" },
  { id: "GMT Standard Time", iana: "Europe/London", label: "London, Dublin, Lisbon" },
  { id: "W. Europe Standard Time", iana: "Europe/Berlin", label: "Amsterdam, Berlin, Rome, Stockholm" },
  { id: "Romance Standard Time", iana: "Europe/Paris", label: "Brussels, Copenhagen, Madrid, Paris" },
  { id: "Central European Standard Time", iana: "Europe/Warsaw", label: "Warsaw, Zagreb" },
  { id: "FLE Standard Time", iana: "Europe/Helsinki", label: "Helsinki, Kyiv, Riga" },
  { id: "South Africa Standard Time", iana: "Africa/Johannesburg", label: "Johannesburg" },
  { id: "Egypt Standard Time", iana: "Africa/Cairo", label: "Cairo" },
  { id: "Israel Standard Time", iana: "Asia/Jerusalem", label: "Jerusalem" },
  { id: "Turkey Standard Time", iana: "Europe/Istanbul", label: "Istanbul" },
  { id: "Arab Standard Time", iana: "Asia/Riyadh", label: "Riyadh, Kuwait" },
  { id: "Russian Standard Time", iana: "Europe/Moscow", label: "Moscow" },
  { id: "Arabian Standard Time", iana: "Asia/Dubai", label: "Abu Dhabi, Dubai" },
  { id: "Pakistan Standard Time", iana: "Asia/Karachi", label: "Karachi" },
  { id: "India Standard Time", iana: "Asia/Kolkata", label: "India" },
  { id: "SE Asia Standard Time", iana: "Asia/Bangkok", label: "Bangkok, Hanoi, Jakarta" },
  { id: "Singapore Standard Time", iana: "Asia/Singapore", label: "Singapore, Kuala Lumpur" },
  { id: "China Standard Time", iana: "Asia/Shanghai", label: "Beijing, Hong Kong" },
  { id: "W. Australia Standard Time", iana: "Australia/Perth", label: "Perth" },
  { id: "Tokyo Standard Time", iana: "Asia/Tokyo", label: "Tokyo" },
  { id: "Korea Standard Time", iana: "Asia/Seoul", label: "Seoul" },
  { id: "AUS Eastern Standard Time", iana: "Australia/Sydney", label: "Sydney, Melbourne" },
  { id: "New Zealand Standard Time", iana: "Pacific/Auckland", label: "Auckland" }
];

export const formatPresets: Array<{ format: string; label: string }> = [
  { format: "yyyy-MM-dd", label: "ISO date" },
  { format: "MMM d, yyyy", label: "Short month" },
  { format: "dddd, MMMM d, yyyy", label: "Long date" },
  { format: "dd/MM/yyyy", label: "Day first" },
  { format: "M/d/yyyy h:mm tt", label: "US date and time" },
  { format: "yyyy-MM-dd HH:mm", label: "24-hour date and time" },
  { format: "h:mm tt", label: "Time only" },
  { format: "yyyy-MM-ddTHH:mm:ssZ", label: "UTC timestamp" },
  { format: "yyyyMMdd_HHmmss", label: "File name stamp" }
];

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** The wall-clock parts of an instant in an IANA time zone. */
export function zonedParts(date: Date, timeZone: string): DateParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric"
  });
  const lookup: Record<string, number> = {};
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== "literal") lookup[part.type] = Number(part.value);
  }
  const wallClock = Date.UTC(lookup.year, lookup.month - 1, lookup.day, lookup.hour, lookup.minute, lookup.second);
  const instant = Math.floor(date.getTime() / 1000) * 1000;
  return {
    year: lookup.year,
    month: lookup.month,
    day: lookup.day,
    hour: lookup.hour,
    minute: lookup.minute,
    second: lookup.second,
    millisecond: date.getUTCMilliseconds(),
    weekday: new Date(wallClock).getUTCDay(),
    offsetMinutes: Math.round((wallClock - instant) / 60000)
  };
}

const standardFormats: Record<string, string> = {
  d: "M/d/yyyy",
  D: "dddd, MMMM d, yyyy",
  t: "h:mm tt",
  T: "h:mm:ss tt",
  g: "M/d/yyyy h:mm tt",
  G: "M/d/yyyy h:mm:ss tt",
  f: "dddd, MMMM d, yyyy h:mm tt",
  F: "dddd, MMMM d, yyyy h:mm:ss tt",
  M: "MMMM d",
  m: "MMMM d",
  Y: "MMMM yyyy",
  y: "MMMM yyyy",
  o: "yyyy-MM-ddTHH:mm:ss.fffffffK",
  O: "yyyy-MM-ddTHH:mm:ss.fffffffK",
  s: "yyyy-MM-ddTHH:mm:ss",
  u: "yyyy-MM-dd HH:mm:ssZ"
};

/** A one-letter format such as "d" or "g" is a standard format. Returns the custom format it stands for. */
export function expandStandardFormat(format: string) {
  return format.length === 1 ? standardFormats[format] ?? format : format;
}

export type FormatToken = { kind: "spec"; letter: string; count: number } | { kind: "literal"; text: string };

const specLetters = "yMdHhmsftzK";

export function tokenizeFormat(format: string): FormatToken[] {
  const tokens: FormatToken[] = [];
  const pushLiteral = (text: string) => {
    const last = tokens[tokens.length - 1];
    if (last && last.kind === "literal") last.text += text;
    else tokens.push({ kind: "literal", text });
  };
  let index = 0;
  while (index < format.length) {
    const char = format[index];
    if (char === "'" || char === '"') {
      const end = format.indexOf(char, index + 1);
      pushLiteral(format.slice(index + 1, end === -1 ? format.length : end));
      index = end === -1 ? format.length : end + 1;
    } else if (char === "\\") {
      pushLiteral(format[index + 1] ?? "");
      index += 2;
    } else if (specLetters.includes(char)) {
      let count = 1;
      while (format[index + count] === char) count += 1;
      tokens.push({ kind: "spec", letter: char, count });
      index += count;
    } else {
      pushLiteral(char);
      index += 1;
    }
  }
  return tokens;
}

const pad = (value: number, length: number) => String(value).padStart(length, "0");

function offsetText(offsetMinutes: number, count: number) {
  const sign = offsetMinutes < 0 ? "-" : "+";
  const absolute = Math.abs(offsetMinutes);
  const hours = Math.floor(absolute / 60);
  if (count === 1) return sign + hours;
  if (count === 2) return sign + pad(hours, 2);
  return `${sign}${pad(hours, 2)}:${pad(absolute % 60, 2)}`;
}

/** Formats date parts with a .NET custom or standard format string, using English names. */
export function formatDotNet(parts: DateParts, format: string, isUtc = true) {
  const hour12 = parts.hour % 12 === 0 ? 12 : parts.hour % 12;
  return tokenizeFormat(expandStandardFormat(format))
    .map((token) => {
      if (token.kind === "literal") return token.text;
      const { letter, count } = token;
      switch (letter) {
        case "y":
          return count === 1 ? String(parts.year % 100) : count === 2 ? pad(parts.year % 100, 2) : pad(parts.year, count);
        case "M":
          return count >= 4 ? monthNames[parts.month - 1] : count === 3 ? monthNames[parts.month - 1].slice(0, 3) : pad(parts.month, count);
        case "d":
          return count >= 4 ? dayNames[parts.weekday] : count === 3 ? dayNames[parts.weekday].slice(0, 3) : pad(parts.day, count);
        case "H":
          return pad(parts.hour, Math.min(count, 2));
        case "h":
          return pad(hour12, Math.min(count, 2));
        case "m":
          return pad(parts.minute, Math.min(count, 2));
        case "s":
          return pad(parts.second, Math.min(count, 2));
        case "f":
          return pad(parts.millisecond, 3).padEnd(7, "0").slice(0, Math.min(count, 7));
        case "t":
          return count === 1 ? (parts.hour < 12 ? "A" : "P") : parts.hour < 12 ? "AM" : "PM";
        case "z":
          return offsetText(isUtc ? 0 : parts.offsetMinutes, count);
        default:
          // K: "Z" for a UTC value. A value returned by convertTimeZone carries no offset.
          return isUtc ? "Z".repeat(count) : "";
      }
    })
    .join("");
}

function powerFxLiteral(text: string) {
  return [...text].map((char) => (/[A-Za-z]/.test(char) ? "\\" + char : char)).join("");
}

/** Converts a .NET format string to the equivalent Power Fx Text() format. */
export function toPowerFxFormat(format: string): { format: string; notes: string[] } {
  const tokens = tokenizeFormat(expandStandardFormat(format));
  const notes = new Set<string>();
  const hasMeridiem = tokens.some((token) => token.kind === "spec" && token.letter === "t");
  const converted = tokens
    .map((token) => {
      if (token.kind === "literal") return powerFxLiteral(token.text);
      const { letter, count } = token;
      switch (letter) {
        case "y":
          return count <= 2 ? "yy" : "yyyy";
        case "M":
          return "m".repeat(Math.min(count, 4));
        case "d":
          return "d".repeat(Math.min(count, 4));
        case "H":
          if (hasMeridiem) notes.add("HH is 24-hour time, but Power Fx switches to 12-hour time whenever AM/PM is in the format.");
          return "h".repeat(Math.min(count, 2));
        case "h":
          if (!hasMeridiem) notes.add("hh without tt is 12-hour time with no AM/PM. Power Fx shows 24-hour time unless AM/PM is in the format.");
          return "h".repeat(Math.min(count, 2));
        case "m":
          return "m".repeat(Math.min(count, 2));
        case "s":
          return "s".repeat(Math.min(count, 2));
        case "f":
          if (count > 3) notes.add("Power Fx shows at most three decimal places of a second.");
          return "f".repeat(Math.min(count, 3));
        case "t":
          return count === 1 ? "A/P" : "AM/PM";
        default:
          notes.add("Power Fx has no placeholder for the time zone offset (z or K), so it is left out.");
          return "";
      }
    })
    .join("");
  return { format: converted, notes: [...notes] };
}

const quotePa = (value: string) => "'" + value.replace(/'/g, "''") + "'";

export function powerAutomateExpression(source: string, format: string, timeZoneId: string) {
  const value = source.trim() || "utcNow()";
  if (!timeZoneId || timeZoneId === "UTC") return `formatDateTime(${value}, ${quotePa(format)})`;
  return `convertTimeZone(${value}, 'UTC', ${quotePa(timeZoneId)}, ${quotePa(format)})`;
}

export function powerFxFormula(source: string, powerFxFormat: string) {
  return `Text(${source.trim() || "Now()"}, "${powerFxFormat.replace(/"/g, '""')}")`;
}
