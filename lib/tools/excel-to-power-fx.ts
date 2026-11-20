// Translates common Excel formulas into Power Fx. Cell references can't be translated
// automatically, so they are either replaced from a mapping the user supplies or reported.

type Token =
  | { kind: "string" | "number" | "name" | "op" | "ref"; text: string }
  | { kind: "lparen" | "rparen" | "comma"; text: string };

export type ExcelTranslation = {
  /** The translated formula on one line. Run it through the Power Fx formatter for display. */
  formula: string;
  notes: string[];
  /** Cell references that were left in the output because no mapping was given. */
  unmappedReferences: string[];
};

const refPattern = /^(?:(?:'[^']+'|[A-Za-z0-9_]+)!)?(?:\$?[A-Za-z]{1,3}\$?\d+(?::\$?[A-Za-z]{1,3}\$?\d+)?|\$?[A-Za-z]{1,3}:\$?[A-Za-z]{1,3})(?![A-Za-z0-9_(.])/;

const tokenPatterns: Array<[Token["kind"] | "space", RegExp]> = [
  ["space", /^\s+/],
  ["string", /^"(?:[^"]|"")*"?/],
  ["ref", refPattern],
  ["number", /^\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/],
  ["name", /^[A-Za-z_][A-Za-z0-9_.]*/],
  ["op", /^(<>|<=|>=|[=<>+\-*/^&%])/],
  ["lparen", /^\(/],
  ["rparen", /^\)/],
  ["comma", /^[,;]/],
  ["op", /^./]
];

export function tokenizeExcel(input: string): Token[] {
  const tokens: Token[] = [];
  let rest = input.trim().replace(/^=/, "");
  while (rest.length > 0) {
    for (const [kind, pattern] of tokenPatterns) {
      const match = pattern.exec(rest);
      if (!match) continue;
      if (kind !== "space") tokens.push({ kind, text: kind === "comma" ? "," : match[0] } as Token);
      rest = rest.slice(match[0].length);
      break;
    }
  }
  return tokens;
}

/** Functions that only need a new name. */
const renames: Record<string, string> = {
  IF: "If", IFS: "If", AND: "And", OR: "Or", NOT: "Not", SWITCH: "Switch", IFERROR: "IfError",
  ISBLANK: "IsBlank", ISERROR: "IsError", ISNUMBER: "IsNumeric",
  SUM: "Sum", AVERAGE: "Average", MIN: "Min", MAX: "Max",
  ROUND: "Round", ROUNDUP: "RoundUp", ROUNDDOWN: "RoundDown", ABS: "Abs", INT: "Int", TRUNC: "Trunc",
  MOD: "Mod", POWER: "Power", SQRT: "Sqrt", EXP: "Exp", LN: "Ln", PI: "Pi", RAND: "Rand", RANDBETWEEN: "RandBetween",
  LEN: "Len", LEFT: "Left", RIGHT: "Right", MID: "Mid", LOWER: "Lower", UPPER: "Upper", PROPER: "Proper", TRIM: "Trim",
  SUBSTITUTE: "Substitute", REPLACE: "Replace", FIND: "Find", VALUE: "Value", TEXT: "Text", CHAR: "Char",
  CONCAT: "Concatenate", CONCATENATE: "Concatenate",
  TODAY: "Today", NOW: "Now", YEAR: "Year", MONTH: "Month", DAY: "Day", HOUR: "Hour", MINUTE: "Minute", SECOND: "Second",
  WEEKDAY: "Weekday", WEEKNUM: "WeekNum", ISOWEEKNUM: "ISOWeekNum", DATE: "Date", TIME: "Time", EDATE: "EDate", EOMONTH: "EOMonth",
  DATEVALUE: "DateValue", TIMEVALUE: "TimeValue"
};

const aggregateTable: Record<string, string> = { SUM: "Sum", AVERAGE: "Average", MIN: "Min", MAX: "Max" };

const dateDiffUnits: Record<string, string> = { d: "Days", m: "Months", y: "Years" };

type Context = {
  references: Map<string, string>;
  notes: Set<string>;
  unmapped: Set<string>;
};

export function normalizeReference(reference: string) {
  return reference.replace(/\$/g, "").toUpperCase();
}

/** Parses lines such as "A2 = txtPrice.Value" into a lookup of cell reference to Power Fx name. */
export function parseReferenceMap(text: string) {
  const map = new Map<string, string>();
  for (const line of text.split("\n")) {
    const separator = line.indexOf("=");
    if (separator <= 0) continue;
    const key = normalizeReference(line.slice(0, separator).trim());
    const value = line.slice(separator + 1).trim();
    if (key && value) map.set(key, value);
  }
  return map;
}

const isRange = (text: string) => text.includes(":");

/** Turns an Excel criteria argument such as ">10" or "Open" into a Power Fx comparison. */
export function criteriaToComparison(column: string, criteria: string) {
  const text = /^"(?:[^"]|"")*"$/.test(criteria) ? criteria.slice(1, -1).replace(/""/g, '"') : null;
  if (text === null) return `${column} = ${criteria}`;
  const match = /^(<>|<=|>=|=|<|>)(.*)$/.exec(text);
  const operator = match ? match[1] : "=";
  const operand = (match ? match[2] : text).trim();
  const value = operand !== "" && !Number.isNaN(Number(operand)) ? operand : '"' + operand.replace(/"/g, '""') + '"';
  return `${column} ${operator} ${value}`;
}

function translateCall(name: string, rawArgs: Token[][], ctx: Context): string {
  const upper = name.toUpperCase();
  const args = rawArgs.map((arg) => translateTokens(arg, ctx));
  const singleRange = rawArgs.length === 1 && rawArgs[0].length === 1 && rawArgs[0][0].kind === "ref" && isRange(rawArgs[0][0].text);
  const tableNote = "Excel ranges become a table and a column in Power Fx. Replace YourTable and the column names with your data source or collection and its columns.";

  if (upper in aggregateTable && singleRange) {
    ctx.notes.add(tableNote);
    ctx.unmapped.delete(normalizeReference(rawArgs[0][0].text));
    return `${aggregateTable[upper]}(YourTable, ColumnName)`;
  }
  if ((upper === "COUNT" || upper === "COUNTA") && singleRange) {
    ctx.notes.add(tableNote);
    ctx.unmapped.delete(normalizeReference(rawArgs[0][0].text));
    return upper === "COUNT" ? "Count(YourTable.ColumnName)" : "CountA(YourTable.ColumnName)";
  }

  const forgetRanges = () => {
    for (const arg of rawArgs) for (const token of arg) if (token.kind === "ref" && isRange(token.text)) ctx.unmapped.delete(normalizeReference(token.text));
  };

  switch (upper) {
    case "TRUE":
      return "true";
    case "FALSE":
      return "false";
    case "DAYS":
      if (args.length === 2) return `DateDiff(${args[1]}, ${args[0]}, TimeUnit.Days)`;
      break;
    case "DATEDIF": {
      const unit = dateDiffUnits[(args[2] ?? "").replace(/"/g, "").toLowerCase()];
      if (args.length === 3 && unit) return `DateDiff(${args[0]}, ${args[1]}, TimeUnit.${unit})`;
      ctx.notes.add('DATEDIF is only translated for the "d", "m", and "y" units. Rewrite other units with DateDiff and date math.');
      break;
    }
    case "SEARCH":
      ctx.notes.add("SEARCH ignores capital letters and Find does not, so both sides are wrapped in Lower().");
      return `Find(Lower(${args[0]}), Lower(${args[1]})${args[2] ? ", " + args[2] : ""})`;
    case "IFNA":
      ctx.notes.add("IFNA becomes Coalesce, which returns the second value when the first is blank.");
      return `Coalesce(${args.join(", ")})`;
    case "ISNUMBER":
      ctx.notes.add("IsNumeric also returns true for text that looks like a number, such as \"12\".");
      break;
    case "CEILING":
    case "FLOOR":
      if (args.length === 1) return `${upper === "CEILING" ? "RoundUp" : "RoundDown"}(${args[0]}, 0)`;
      ctx.notes.add(`${upper} with a significance has no direct Power Fx function. Divide by the significance, round, and multiply back.`);
      break;
    case "VLOOKUP":
    case "HLOOKUP":
      ctx.notes.add(`${upper} becomes LookUp. Replace YourTable, KeyColumn, and ResultColumn with your table and its columns. LookUp always matches exactly.`);
      forgetRanges();
      return `LookUp(YourTable, KeyColumn = ${args[0] ?? "Value"}, ResultColumn)`;
    case "XLOOKUP": {
      ctx.notes.add("XLOOKUP becomes LookUp. Replace YourTable, KeyColumn, and ResultColumn with your table and its columns.");
      forgetRanges();
      const lookup = `LookUp(YourTable, KeyColumn = ${args[0] ?? "Value"}, ResultColumn)`;
      return args[3] ? `Coalesce(${lookup}, ${args[3]})` : lookup;
    }
    case "COUNTIF":
      if (args.length === 2) {
        ctx.notes.add(tableNote);
        forgetRanges();
        return `CountIf(YourTable, ${criteriaToComparison("CriteriaColumn", args[1])})`;
      }
      break;
    case "SUMIF":
    case "AVERAGEIF":
      if (args.length >= 2) {
        ctx.notes.add(tableNote);
        forgetRanges();
        return `${upper === "SUMIF" ? "Sum" : "Average"}(Filter(YourTable, ${criteriaToComparison("CriteriaColumn", args[1])}), ValueColumn)`;
      }
      break;
    case "SUMIFS":
    case "AVERAGEIFS":
    case "COUNTIFS": {
      const offset = upper === "COUNTIFS" ? 0 : 1;
      const conditions: string[] = [];
      for (let index = offset; index + 1 < args.length; index += 2) {
        conditions.push(criteriaToComparison(`CriteriaColumn${conditions.length + 1}`, args[index + 1]));
      }
      if (conditions.length > 0) {
        ctx.notes.add(tableNote);
        forgetRanges();
        if (upper === "COUNTIFS") return `CountIf(YourTable, ${conditions.join(" && ")})`;
        return `${upper === "SUMIFS" ? "Sum" : "Average"}(Filter(YourTable, ${conditions.join(", ")}), ValueColumn)`;
      }
      break;
    }
    case "TEXTJOIN":
      ctx.notes.add("TEXTJOIN over a range becomes Concat over a table. Replace YourTable and ColumnName. Concat adds the separator after every item, so trim the last one if you need to.");
      forgetRanges();
      return `Concat(YourTable, ColumnName, ${args[0] ?? '", "'})`;
    case "TEXT":
      ctx.notes.add("Text() uses mostly the same format codes as Excel, such as \"0.00\" and \"yyyy-mm-dd\". Check the result for less common codes.");
      break;
    default:
  }

  const renamed = renames[upper];
  if (!renamed) {
    ctx.notes.add(`${upper} has no translation in this tool, so it is left as written. Look for a Power Fx function with the same purpose.`);
    return `${name}(${args.join(", ")})`;
  }
  return `${renamed}(${args.join(", ")})`;
}

function splitArguments(tokens: Token[], start: number): { args: Token[][]; end: number } {
  const args: Token[][] = [];
  let current: Token[] = [];
  let depth = 0;
  let index = start;
  for (; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token.kind === "lparen") depth += 1;
    else if (token.kind === "rparen") {
      if (depth === 0) break;
      depth -= 1;
    } else if (token.kind === "comma" && depth === 0) {
      args.push(current);
      current = [];
      continue;
    }
    current.push(token);
  }
  if (current.length > 0 || args.length > 0) args.push(current);
  return { args, end: index };
}

function translateTokens(tokens: Token[], ctx: Context): string {
  let output = "";
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    const next = tokens[index + 1];
    if (token.kind === "name" && next?.kind === "lparen") {
      const { args, end } = splitArguments(tokens, index + 2);
      output += translateCall(token.text, args, ctx);
      index = end;
    } else if (token.kind === "name") {
      const upper = token.text.toUpperCase();
      output += upper === "TRUE" ? "true" : upper === "FALSE" ? "false" : token.text;
    } else if (token.kind === "ref") {
      const key = normalizeReference(token.text);
      const mapped = ctx.references.get(key);
      if (mapped) output += mapped;
      else {
        ctx.unmapped.add(key);
        output += token.text;
      }
    } else if (token.kind === "op") {
      const previous = tokens[index - 1];
      const unary = (token.text === "-" || token.text === "+") && (!previous || previous.kind === "op" || previous.kind === "lparen" || previous.kind === "comma");
      output += unary || token.text === "%" ? token.text : ` ${token.text} `;
    } else if (token.kind === "comma") output += ", ";
    else output += token.text;
  }
  return output;
}

export function translateExcelFormula(input: string, referenceMap = ""): ExcelTranslation {
  const ctx: Context = { references: parseReferenceMap(referenceMap), notes: new Set(), unmapped: new Set() };
  const tokens = tokenizeExcel(input);
  if (tokens.length === 0) return { formula: "", notes: [], unmappedReferences: [] };

  let depth = 0;
  for (const token of tokens) {
    if (token.kind === "lparen") depth += 1;
    if (token.kind === "rparen") depth -= 1;
    if (depth < 0) break;
  }
  if (depth !== 0) ctx.notes.add("The brackets in the Excel formula don't balance, so the result may be incomplete.");

  const formula = translateTokens(tokens, ctx);
  const unmappedReferences = [...ctx.unmapped];
  const notes = [...ctx.notes];
  if (unmappedReferences.length > 0) {
    notes.unshift(
      `Power Fx has no cell references. Replace ${unmappedReferences.join(", ")} with a control, variable, or column, or list them under "Cell references" to do it automatically.`
    );
  }
  return { formula, notes, unmappedReferences };
}
