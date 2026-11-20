// Splits an App.OnStart formula into the parts that can move to App.Formulas (named formulas)
// and the parts that have to stay in OnStart.

export type ConvertedFormula = {
  name: string;
  expression: string;
  source: "Set" | "ClearCollect";
};

export type KeptStatement = { text: string; reason: string };

export type NamedFormulaResult = {
  converted: ConvertedFormula[];
  kept: KeptStatement[];
  /** What is left for App.OnStart, with Concurrent() kept around statements that were inside one. */
  remaining: string[];
  notes: string[];
};

export type NamedFormulaOptions = {
  /** Also convert ClearCollect(name, expression) into a read-only named formula. */
  convertCollections: boolean;
};

const closers: Record<string, string> = { "(": ")", "{": "}", "[": "]" };

/** Splits on a separator that is outside strings, quoted names, comments, and brackets. */
export function splitTopLevel(text: string, separator: string): string[] {
  const parts: string[] = [];
  const stack: string[] = [];
  let current = "";
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' || char === "'") {
      let end = index + 1;
      while (end < text.length) {
        if (text[end] === char) {
          if (text[end + 1] === char) end += 1;
          else break;
        }
        end += 1;
      }
      current += text.slice(index, end + 1);
      index = end;
    } else if (char === "/" && next === "/") {
      const end = text.indexOf("\n", index);
      const stop = end === -1 ? text.length : end;
      current += text.slice(index, stop);
      index = stop - 1;
    } else if (char === "/" && next === "*") {
      const end = text.indexOf("*/", index + 2);
      const stop = end === -1 ? text.length : end + 2;
      current += text.slice(index, stop);
      index = stop - 1;
    } else if (char in closers) {
      stack.push(closers[char]);
      current += char;
    } else if (stack.length > 0 && char === stack[stack.length - 1]) {
      stack.pop();
      current += char;
    } else if (char === separator && stack.length === 0) {
      parts.push(current);
      current = "";
    } else current += char;
  }
  parts.push(current);
  return parts.map((part) => part.trim()).filter(Boolean);
}

export function stripComments(text: string) {
  let output = "";
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"' || char === "'") {
      let end = index + 1;
      while (end < text.length && (text[end] !== char || text[end + 1] === char)) end += text[end] === char ? 2 : 1;
      output += text.slice(index, end + 1);
      index = end;
    } else if (char === "/" && text[index + 1] === "/") {
      const end = text.indexOf("\n", index);
      index = end === -1 ? text.length : end - 1;
    } else if (char === "/" && text[index + 1] === "*") {
      const end = text.indexOf("*/", index + 2);
      index = end === -1 ? text.length : end + 1;
      output += " ";
    } else output += char;
  }
  return output.trim();
}

/** Reads "Name(arg, arg)" when the call spans the whole statement. */
export function parseCall(statement: string): { name: string; args: string[] } | null {
  const text = stripComments(statement);
  const match = /^([A-Za-z_][A-Za-z0-9_]*)\s*\(/.exec(text);
  if (!match || !text.endsWith(")")) return null;
  const inner = text.slice(match[0].length, -1);
  // Make sure the first bracket closes at the very end, not earlier.
  let depth = 0;
  for (let index = match[0].length - 1; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      index = text.indexOf('"', index + 1);
      if (index === -1) return null;
    } else if (char === "(") depth += 1;
    else if (char === ")") {
      depth -= 1;
      if (depth === 0 && index !== text.length - 1) return null;
    }
  }
  return { name: match[1], args: splitTopLevel(inner, ",") };
}

const behaviorFunctions = [
  "Patch", "Collect", "ClearCollect", "Clear", "Remove", "RemoveIf", "UpdateIf", "Update", "Set", "UpdateContext",
  "Navigate", "Back", "Notify", "Launch", "Refresh", "Reset", "SubmitForm", "NewForm", "EditForm", "ViewForm", "ResetForm",
  "Exit", "SaveData", "LoadData", "ClearData", "Trace", "Select", "SetFocus", "Enable", "Disable", "Download", "Print",
  "Revert", "Relate", "Unrelate", "RequestHide"
];
const behaviorPattern = new RegExp("(^|[^A-Za-z0-9_.])(" + behaviorFunctions.join("|") + ")\\s*\\(");
const volatilePattern = /(^|[^A-Za-z0-9_.])(Now|Today|UTCNow|UTCToday|Rand|RandBetween|GUID)\s*\(/;
const startingValues = new Set(["true", "false", '""', "blank()", "0", "{}", "[]", "table()"]);

function withoutStrings(text: string) {
  return text.replace(/"(?:[^"]|"")*"/g, '""');
}

function keepReason(kind: "Set" | "ClearCollect", name: string, expression: string, assignments: Map<string, number>): string | null {
  const code = withoutStrings(stripComments(expression));
  if ((assignments.get(name.toLowerCase()) ?? 0) > 1) return `${name} is assigned more than once here, so it changes while the app runs. Named formulas can't be reassigned.`;
  if (/\.Run\s*\(/.test(code)) return "It calls a flow, which has to happen at a known moment.";
  const behavior = behaviorPattern.exec(code);
  if (behavior) return `It uses ${behavior[2]}(), which changes data or app state. Named formulas can only calculate values.`;
  if (new RegExp("(^|[^A-Za-z0-9_.])" + name + "($|[^A-Za-z0-9_])").test(code)) return `It refers to ${name} itself, which a named formula can't do.`;
  const volatile = volatilePattern.exec(code);
  if (volatile) return `It captures ${volatile[2]}() once at startup. A named formula could return a different value each time it is read.`;
  const literal = stripComments(expression);
  if (kind === "Set" && startingValues.has(literal.replace(/\s+/g, "").toLowerCase())) {
    return `${literal} looks like a starting value for something that changes later, such as a flag or a counter.`;
  }
  return null;
}

type Entry = { text: string; converted?: ConvertedFormula; reason?: string };

function classify(statement: string, options: NamedFormulaOptions, assignments: Map<string, number>): Entry {
  const call = parseCall(statement);
  if (!call) return { text: statement, reason: "It isn't a single Set or ClearCollect call." };
  const lower = call.name.toLowerCase();
  if ((lower === "set" || lower === "clearcollect") && call.args.length === 2 && /^[A-Za-z_][A-Za-z0-9_]*$/.test(call.args[0])) {
    const kind = lower === "set" ? "Set" : "ClearCollect";
    if (kind === "ClearCollect" && !options.convertCollections) return { text: statement, reason: "Converting collections is turned off." };
    const reason = keepReason(kind, call.args[0], call.args[1], assignments);
    if (reason) return { text: statement, reason };
    return { text: statement, converted: { name: call.args[0], expression: call.args[1], source: kind } };
  }
  if (lower === "collect") return { text: statement, reason: "Collect adds rows to a collection, so the collection has to stay a collection." };
  if (lower === "set" || lower === "clearcollect") return { text: statement, reason: `This ${call.name} call doesn't have the usual name and value arguments.` };
  return { text: statement, reason: `${call.name}() is an action, and actions stay in OnStart.` };
}

function countAssignments(statements: string[]) {
  const counts = new Map<string, number>();
  const code = withoutStrings(statements.map(stripComments).join(";"));
  for (const match of code.matchAll(/(?:^|[^A-Za-z0-9_.])(?:Set|ClearCollect|Collect)\s*\(\s*([A-Za-z_][A-Za-z0-9_]*)/g)) {
    const key = match[1].toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

export function convertOnStart(input: string, options: NamedFormulaOptions): NamedFormulaResult {
  const notes: string[] = [];
  if (/;;/.test(withoutStrings(input))) {
    notes.push("This formula uses ;; between statements, which is the syntax for regions with a decimal comma. This tool reads the comma syntax (; between statements, , between arguments), so the result may be wrong.");
  }
  const statements = splitTopLevel(input, ";");
  const assignments = countAssignments(statements);
  const converted: ConvertedFormula[] = [];
  const kept: KeptStatement[] = [];
  const remaining: string[] = [];

  const handle = (entry: Entry) => {
    if (entry.converted) converted.push(entry.converted);
    else kept.push({ text: entry.text, reason: entry.reason ?? "" });
    return !entry.converted;
  };

  for (const statement of statements) {
    const call = parseCall(statement);
    if (call && call.name.toLowerCase() === "concurrent") {
      const stay = call.args.filter((arg) => splitTopLevel(arg, ";").length > 1
        ? (kept.push({ text: arg, reason: "It is a chain of several statements inside Concurrent, so it is left as written." }), true)
        : handle(classify(arg, options, assignments)));
      if (stay.length === 1) remaining.push(stay[0]);
      else if (stay.length > 1) remaining.push(`Concurrent(${stay.join(", ")})`);
    } else if (handle(classify(statement, options, assignments))) remaining.push(statement);
  }

  if (converted.length > 0) {
    notes.push(
      `Before you switch, search the app for Set(${converted[0].name} and the other converted names. If any of them is set, collected into, or patched anywhere else in the app, leave it in OnStart.`
    );
  }
  if (converted.some((formula) => formula.source === "ClearCollect")) {
    notes.push("Collections that become named formulas are read-only tables. Collect, Patch, Remove, and Clear no longer work on them.");
  }
  return { converted, kept, remaining, notes };
}

export function formulasText(converted: ConvertedFormula[], format: (expression: string) => string = (expression) => expression) {
  return converted.map((formula) => `${formula.name} = ${format(formula.expression)};`).join("\n");
}
