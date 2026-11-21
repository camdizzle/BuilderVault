// Checks a Power Fx formula for delegation problems against a specific data source.
// The support table follows Microsoft's delegation documentation for each connector. It is a
// guide, not a guarantee: column types and connector updates change what is delegated.

export type DataSource = "sharepoint" | "dataverse" | "sql" | "excel";
export type Support = "yes" | "partial" | "no";

export const dataSourceLabels: Record<DataSource, string> = {
  sharepoint: "SharePoint list",
  dataverse: "Dataverse",
  sql: "SQL Server",
  excel: "Excel table (OneDrive)"
};

export type DelegationRule = {
  key: string;
  label: string;
  group: "Query" | "Aggregate" | "Inside a filter" | "Table shaping";
  support: Record<DataSource, Support>;
  notes?: Partial<Record<DataSource, string>>;
  /** What to do instead when it isn't delegated. */
  fix?: string;
};

const s = (sharepoint: Support, dataverse: Support, sql: Support): Record<DataSource, Support> => ({ sharepoint, dataverse, sql, excel: "no" });

export const delegationRules: DelegationRule[] = [
  { key: "filter", label: "Filter", group: "Query", support: s("yes", "yes", "yes") },
  { key: "lookup", label: "LookUp", group: "Query", support: s("yes", "yes", "yes") },
  { key: "sort", label: "Sort and SortByColumns", group: "Query", support: s("yes", "yes", "yes"), notes: { sharepoint: "Sorting by a person, choice, or lookup column isn't delegated." } },
  { key: "search", label: "Search", group: "Query", support: s("no", "yes", "yes"), fix: "Use Filter with StartsWith on a text column." },
  { key: "sum", label: "Sum, Average, Min, Max", group: "Aggregate", support: s("no", "partial", "yes"), notes: { dataverse: "Delegated for up to 50,000 rows." }, fix: "Keep a running total in a column, or total a filtered set that is known to be small." },
  { key: "countrows", label: "CountRows", group: "Aggregate", support: s("no", "partial", "yes"), notes: { dataverse: "On a whole table it returns a cached count. On a filter it is delegated for up to 50,000 rows." }, fix: "Count a filtered set that is known to be small, or store the count." },
  { key: "countif", label: "CountIf", group: "Aggregate", support: s("no", "partial", "yes"), notes: { dataverse: "Delegated for up to 50,000 rows." }, fix: "Count a filtered set that is known to be small, or store the count." },
  { key: "compare", label: "=, <>, <, >, <=, >=", group: "Inside a filter", support: s("yes", "yes", "yes"), notes: { sharepoint: "The ID column only supports =." } },
  { key: "logic", label: "And, Or, Not (&&, ||, !)", group: "Inside a filter", support: s("yes", "yes", "yes") },
  { key: "startswith", label: "StartsWith", group: "Inside a filter", support: s("yes", "yes", "yes") },
  { key: "endswith", label: "EndsWith", group: "Inside a filter", support: s("no", "yes", "yes"), fix: "Use StartsWith if you can, or store the ending in its own column." },
  { key: "in", label: "in (contains text, or is in a list)", group: "Inside a filter", support: s("no", "yes", "yes"), fix: "Use StartsWith, or compare with = against each value joined with ||." },
  { key: "isblank", label: "IsBlank", group: "Inside a filter", support: s("partial", "yes", "yes"), notes: { sharepoint: "Compare the column with Blank() instead, such as DueDate = Blank()." }, fix: "Write Column = Blank() instead of IsBlank(Column)." },
  { key: "text", label: "Lower, Upper, Len, Trim, Left, Right, Mid, Substitute, Replace", group: "Inside a filter", support: s("no", "no", "yes"), fix: "Do the text work on the value you compare against, not on the column. For example, store With({me: Lower(User().Email)}, ...) first." },
  { key: "date", label: "Year, Month, Day, Hour, Weekday on a column", group: "Inside a filter", support: s("no", "no", "yes"), fix: "Compare the date column with a start and end date instead, such as Created >= dStart && Created < dEnd." },
  { key: "dateadd", label: "DateAdd, DateDiff on a column", group: "Inside a filter", support: s("no", "partial", "yes"), notes: { dataverse: "Delegated for date and time columns in common cases. Check the warning in Studio." }, fix: "Move the date math to the other side: Created >= DateAdd(Today(), -7, TimeUnit.Days)." },
  { key: "convert", label: "Text, Value, DateValue on a column", group: "Inside a filter", support: s("no", "no", "no"), fix: "Compare the column in its own type, and convert the value you compare against instead." },
  { key: "firstn", label: "FirstN, Last, LastN", group: "Table shaping", support: s("no", "no", "no"), fix: "Sort in the other direction and use First, or filter down to a small set first." },
  { key: "shape", label: "AddColumns, GroupBy, Distinct, Concat, ForAll", group: "Table shaping", support: s("no", "no", "no"), notes: { dataverse: "Distinct is delegated in some cases." }, fix: "Filter first so only a small set of rows is shaped in the app." }
];

const ruleByKey = new Map(delegationRules.map((rule) => [rule.key, rule]));

export type DelegationFinding = {
  severity: "problem" | "limit";
  title: string;
  detail: string;
  fix?: string;
};

export type DelegationReport = {
  findings: DelegationFinding[];
  /** Delegable query functions that were recognized, to show what is fine. */
  delegated: string[];
  hasQuery: boolean;
};

type Call = { name: string; args: string[] };

/** Replaces the contents of text values and comments with spaces so they can't be mistaken for code. */
export function maskLiterals(formula: string) {
  let output = "";
  for (let index = 0; index < formula.length; index += 1) {
    const char = formula[index];
    if (char === '"') {
      let end = index + 1;
      while (end < formula.length && (formula[end] !== '"' || formula[end + 1] === '"')) end += formula[end] === '"' ? 2 : 1;
      output += '"' + " ".repeat(Math.max(0, Math.min(end, formula.length) - index - 1)) + (end < formula.length ? '"' : "");
      index = end;
    } else if (char === "/" && formula[index + 1] === "/") {
      const end = formula.indexOf("\n", index);
      const stop = end === -1 ? formula.length : end;
      output += " ".repeat(stop - index);
      index = stop - 1;
    } else if (char === "/" && formula[index + 1] === "*") {
      const end = formula.indexOf("*/", index + 2);
      const stop = end === -1 ? formula.length : end + 2;
      output += " ".repeat(stop - index);
      index = stop - 1;
    } else output += char;
  }
  return output;
}

function splitArgs(text: string) {
  const args: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of text) {
    if ("({[".includes(char)) depth += 1;
    else if (")}]".includes(char)) depth -= 1;
    if (char === "," && depth === 0) {
      args.push(current.trim());
      current = "";
    } else current += char;
  }
  if (current.trim() || args.length > 0) args.push(current.trim());
  return args;
}

/** Every function call in the formula, outermost first. */
export function findCalls(masked: string): Call[] {
  const calls: Call[] = [];
  const pattern = /([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(masked))) {
    const before = masked[match.index - 1];
    if (before === ".") continue;
    let depth = 0;
    let end = pattern.lastIndex - 1;
    for (; end < masked.length; end += 1) {
      if (masked[end] === "(") depth += 1;
      else if (masked[end] === ")") {
        depth -= 1;
        if (depth === 0) break;
      }
    }
    calls.push({ name: match[1], args: splitArgs(masked.slice(pattern.lastIndex, end)) });
  }
  return calls;
}

/** A value that is worked out once, not per row: a literal, User(), or a control or variable named with a prefix. */
export function isRowIndependent(expression: string) {
  const text = expression.trim();
  if (text === "" || /^-?\d+(\.\d+)?$/.test(text) || /^"\s*"$/.test(text)) return true;
  if (/^(User|Now|Today|Param)\(\s*[^()]*\)(\.[A-Za-z_][A-Za-z0-9_]*)*$/.test(text)) return true;
  return /^(var|gbl|loc|col|txt|drp|cmb|dte|dp|chk|tgl|sld|rad|gal|frm|lbl|inp|num)[A-Z_0-9][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)*$/.test(text);
}

const predicateFunctions: Array<{ rule: string; names: string[] }> = [
  { rule: "endswith", names: ["EndsWith"] },
  { rule: "isblank", names: ["IsBlank"] },
  { rule: "text", names: ["Lower", "Upper", "Len", "Trim", "TrimEnds", "Left", "Right", "Mid", "Substitute", "Replace", "Concatenate"] },
  { rule: "date", names: ["Year", "Month", "Day", "Hour", "Minute", "Second", "Weekday"] },
  { rule: "dateadd", names: ["DateAdd", "DateDiff"] },
  { rule: "convert", names: ["Text", "Value", "DateValue", "DateTimeValue"] }
];

const shapeFunctions = ["AddColumns", "GroupBy", "Distinct", "Concat", "ForAll"];
const firstNFunctions = ["FirstN", "Last", "LastN"];
const aggregateRules: Record<string, string> = { sum: "sum", average: "sum", min: "sum", max: "sum", countrows: "countrows", countif: "countif" };

function isPlainName(expression: string) {
  return /^('[^']+'|\[@[^\]]+\]|[A-Za-z_][A-Za-z0-9_]*)$/.test(expression.trim());
}

export function checkDelegation(formula: string, source: DataSource): DelegationReport {
  const masked = maskLiterals(formula);
  const calls = findCalls(masked);
  const findings = new Map<string, DelegationFinding>();
  const delegated = new Set<string>();
  const sourceName = dataSourceLabels[source];
  let hasQuery = false;

  const report = (ruleKey: string, what: string, where: string) => {
    const rule = ruleByKey.get(ruleKey);
    if (!rule) return;
    const support = rule.support[source];
    const note = rule.notes?.[source];
    if (support === "yes") {
      if (rule.group === "Query") delegated.add(what);
      return;
    }
    const key = `${ruleKey}:${what}:${where}`;
    if (support === "partial") {
      findings.set(key, {
        severity: "limit",
        title: `${what}${where} is delegated to ${sourceName} with limits`,
        detail: note ?? "It is delegated in common cases. Check for a warning in Studio.",
        fix: source === "sharepoint" ? rule.fix : undefined
      });
    } else {
      findings.set(key, {
        severity: "problem",
        title: `${what}${where} is not delegated to ${sourceName}`,
        detail:
          source === "excel"
            ? "The Excel connector doesn't delegate anything, so the app only works with the first 500 to 10,000 rows of the table."
            : `Power Apps loads only the first 500 to 10,000 rows and works on those, so rows past that limit are silently ignored.${note ? " " + note : ""}`,
        fix: rule.fix
      });
    }
  };

  for (const call of calls) {
    const lower = call.name.toLowerCase();

    if (lower === "filter" || lower === "lookup" || lower === "countif") {
      hasQuery = true;
      if (lower !== "countif") report(lower, call.name, "");
      const predicate = call.args.slice(1).join(" , ");
      const inner = findCalls(predicate);
      for (const group of predicateFunctions) {
        for (const innerCall of inner) {
          const name = group.names.find((candidate) => candidate.toLowerCase() === innerCall.name.toLowerCase());
          if (!name) continue;
          // A function applied to a value that doesn't depend on the row runs once and is fine.
          if (innerCall.args.length > 0 && isRowIndependent(innerCall.args[0])) continue;
          report(group.rule, `${name}()`, ` inside ${call.name}`);
        }
      }
      if (/(^|[^A-Za-z0-9_.])(in|exactin)(?![A-Za-z0-9_])/.test(predicate)) report("in", 'The "in" operator', ` inside ${call.name}`);
    }

    if (lower === "search") {
      hasQuery = true;
      report("search", "Search", "");
    }
    if (lower === "sort" || lower === "sortbycolumns") {
      hasQuery = true;
      report("sort", call.name, "");
    }
    if (lower in aggregateRules) {
      hasQuery = true;
      report(aggregateRules[lower], call.name, "");
    }
    if (firstNFunctions.some((name) => name.toLowerCase() === lower)) {
      hasQuery = true;
      report("firstn", call.name, "");
    }
    if (shapeFunctions.some((name) => name.toLowerCase() === lower) && call.args[0] && isPlainName(call.args[0])) {
      hasQuery = true;
      report("shape", call.name, ` directly on ${call.args[0]}`);
    }
  }

  const ordered = [...findings.values()].sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "problem" ? -1 : 1));
  return { findings: ordered, delegated: [...delegated], hasQuery };
}
