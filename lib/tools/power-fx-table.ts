// Converts CSV or JSON rows into a Power Fx Table() formula.

export type TableOutputMode = "clearCollect" | "set" | "namedFormula" | "table";

export type TableOptions = {
  name: string;
  mode: TableOutputMode;
  /** Semicolon locales use ; between arguments and fields, and a decimal comma. */
  semicolonLocale: boolean;
  /** Detect numbers, true/false, and dates in CSV text. When off, every CSV value stays text. */
  detectTypes: boolean;
};

export type ColumnKind = "text" | "number" | "boolean" | "date" | "datetime";

export type TableResult = {
  formula: string;
  rowCount: number;
  columns: Array<{ name: string; kind: ColumnKind | "record" | "table" | "mixed" }>;
  source: "csv" | "json";
  notes: string[];
};

/** Parses delimited text (comma, semicolon, or tab) with RFC 4180 style quotes. */
export function parseDelimited(text: string): { delimiter: string; rows: string[][] } {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const counts = [",", ";", "\t"].map((candidate) => {
    let count = 0;
    let quoted = false;
    for (const char of firstLine) {
      if (char === '"') quoted = !quoted;
      else if (char === candidate && !quoted) count += 1;
    }
    return { candidate, count };
  });
  const delimiter = counts.reduce((best, current) => (current.count > best.count ? current : best)).candidate;

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"' && cell === "") quoted = true;
    else if (char === delimiter) {
      row.push(cell);
      cell = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += char;
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return { delimiter, rows: rows.filter((cells) => cells.some((value) => value.trim() !== "")) };
}

const numberPattern = /^-?(0|[1-9]\d*)(\.\d+)?$/;
const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
const dateTimePattern = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?$/;

function kindOf(value: string): ColumnKind {
  const trimmed = value.trim();
  if (numberPattern.test(trimmed)) return "number";
  if (/^(true|false)$/i.test(trimmed)) return "boolean";
  if (datePattern.test(trimmed)) return "date";
  if (dateTimePattern.test(trimmed)) return "datetime";
  return "text";
}

/** A column gets a type only when every non-empty value has it. */
export function inferColumnKind(values: string[]): ColumnKind {
  const filled = values.filter((value) => value.trim() !== "");
  if (filled.length === 0) return "text";
  const first = kindOf(filled[0]);
  return filled.every((value) => kindOf(value) === first) ? first : "text";
}

export function fieldName(name: string) {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name) ? name : "'" + name.replace(/'/g, "''") + "'";
}

export function uniqueHeaders(headers: string[]) {
  const seen = new Map<string, number>();
  return headers.map((header, index) => {
    const base = header.trim() || `Column${index + 1}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}_${count + 1}`;
  });
}

function textLiteral(value: string) {
  return '"' + value.replace(/"/g, '""') + '"';
}

type Separators = { list: string; decimal: string };

function numberLiteral(value: string | number, separators: Separators) {
  return String(value).replace(".", separators.decimal);
}

function csvLiteral(value: string, kind: ColumnKind, separators: Separators) {
  const trimmed = value.trim();
  if (trimmed === "") return "Blank()";
  switch (kind) {
    case "number":
      return numberLiteral(trimmed, separators);
    case "boolean":
      return trimmed.toLowerCase();
    case "date": {
      const [, year, month, day] = datePattern.exec(trimmed) as RegExpExecArray;
      return `Date(${Number(year)}${separators.list} ${Number(month)}${separators.list} ${Number(day)})`;
    }
    case "datetime":
      return `DateTimeValue(${textLiteral(trimmed)})`;
    default:
      return textLiteral(value);
  }
}

function record(fields: Array<[string, string]>, separators: Separators) {
  return "{" + fields.map(([name, value]) => `${fieldName(name)}: ${value}`).join(separators.list + " ") + "}";
}

function jsonLiteral(value: unknown, separators: Separators): string {
  if (value === null || value === undefined) return "Blank()";
  if (typeof value === "number") return numberLiteral(value, separators);
  if (typeof value === "boolean") return String(value);
  if (typeof value === "string") return textLiteral(value);
  if (Array.isArray(value)) {
    if (value.every((element) => element !== null && typeof element === "object" && !Array.isArray(element))) {
      return "Table(" + value.map((element) => jsonLiteral(element, separators)).join(separators.list + " ") + ")";
    }
    return "[" + value.map((element) => jsonLiteral(element, separators)).join(separators.list + " ") + "]";
  }
  return record(
    Object.entries(value as Record<string, unknown>).map(([key, child]) => [key, jsonLiteral(child, separators)]),
    separators
  );
}

function jsonKind(values: unknown[]): TableResult["columns"][number]["kind"] {
  const kinds = new Set(
    values
      .filter((value) => value !== null && value !== undefined)
      .map((value) => (Array.isArray(value) ? "table" : typeof value === "object" ? "record" : typeof value === "string" ? "text" : (typeof value as "number" | "boolean")))
  );
  if (kinds.size === 0) return "text";
  return kinds.size === 1 ? ([...kinds][0] as TableResult["columns"][number]["kind"]) : "mixed";
}

export function cleanName(name: string, mode: TableOutputMode) {
  const fallback = mode === "set" ? "varData" : mode === "namedFormula" ? "SampleData" : "colData";
  const cleaned = name.trim().replace(/[^A-Za-z0-9_]/g, "");
  return /^[A-Za-z_]/.test(cleaned) ? cleaned : fallback;
}

function wrap(records: string[], options: TableOptions, separators: Separators) {
  const name = cleanName(options.name, options.mode);
  const inner = (indent: string) => records.map((line) => indent + line).join(separators.list + "\n");
  if (options.mode === "table") return `Table(\n${inner("    ")}\n)`;
  if (options.mode === "namedFormula") return `${name} = Table(\n${inner("    ")}\n);`;
  const fn = options.mode === "set" ? "Set" : "ClearCollect";
  return `${fn}(\n    ${name}${separators.list}\n    Table(\n${inner("        ")}\n    )\n)`;
}

export function buildPowerFxTable(input: string, options: TableOptions): TableResult {
  const separators: Separators = options.semicolonLocale ? { list: ";", decimal: "," } : { list: ",", decimal: "." };
  const trimmed = input.trim();
  const notes: string[] = [];

  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    const parsed = JSON.parse(trimmed) as unknown;
    const rows = Array.isArray(parsed) ? parsed : [parsed];
    if (rows.some((row) => row === null || typeof row !== "object" || Array.isArray(row))) {
      throw new Error("The JSON must be an array of objects, such as [{\"Name\": \"A\"}, {\"Name\": \"B\"}].");
    }
    if (rows.length === 0) throw new Error("The JSON array is empty. Add at least one object.");
    const names = [...new Set(rows.flatMap((row) => Object.keys(row as object)))];
    const columns = names.map((name) => ({ name, kind: jsonKind(rows.map((row) => (row as Record<string, unknown>)[name])) }));
    if (columns.some((column) => column.kind === "mixed")) {
      notes.push("Some columns mix value types between rows. Power Fx needs one type per column, so make those values consistent before using the formula.");
    }
    const records = rows.map((row) => jsonLiteral(row, separators));
    return { formula: wrap(records, options, separators), rowCount: rows.length, columns, source: "json", notes: sizeNotes(rows.length, notes) };
  }

  const { rows } = parseDelimited(input);
  if (rows.length < 2) throw new Error("Paste a header row and at least one data row.");
  const headers = uniqueHeaders(rows[0]);
  const data = rows.slice(1);
  const kinds = headers.map((_, column) => (options.detectTypes ? inferColumnKind(data.map((row) => row[column] ?? "")) : "text"));
  const records = data.map((row) =>
    record(
      headers.map((header, column) => [header, csvLiteral(row[column] ?? "", kinds[column], separators)]),
      separators
    )
  );
  if (data.some((row) => row.length !== headers.length)) notes.push("Some rows have more or fewer values than the header row. Missing values become Blank(), and extra values are ignored.");
  return {
    formula: wrap(records, options, separators),
    rowCount: data.length,
    columns: headers.map((name, column) => ({ name, kind: kinds[column] })),
    source: "csv",
    notes: sizeNotes(data.length, notes)
  };
}

function sizeNotes(rowCount: number, notes: string[]) {
  if (rowCount > 500) {
    notes.push(`${rowCount} rows is a lot to keep inside a formula. It makes the app slower to load and harder to edit. Consider a SharePoint list, a Dataverse table, or an imported Excel file instead.`);
  }
  return notes;
}
