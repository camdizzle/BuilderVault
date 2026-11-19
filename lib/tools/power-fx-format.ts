// Power Fx formatter engine.
// Pure TypeScript with no imports so it can run in the browser and in Node test scripts.
// Formatting is lossless: only whitespace changes (minify may turn // comments into /* */ comments).

export type PowerFxLocale = "en" | "eu";

export type PowerFxFormatOptions = {
  /** Spaces per indent level. 0 means a tab. */
  indent: number;
  /** Target line width before a call or record is broken over several lines. */
  width: number;
  /** "en": "," separates arguments and ";" chains. "eu": ";" separates arguments and ";;" chains. */
  locale: PowerFxLocale;
};

export const defaultPowerFxFormatOptions: PowerFxFormatOptions = {
  indent: 4,
  width: 80,
  locale: "en"
};

export type PowerFxTokenKind =
  | "string"
  | "quoted"
  | "number"
  | "ident"
  | "op"
  | "open"
  | "close"
  | "sep"
  | "chain"
  | "lineComment"
  | "blockComment"
  | "other";

export type PowerFxToken = {
  kind: PowerFxTokenKind;
  value: string;
  start: number;
};

export type PowerFxIssue = {
  message: string;
  position: number;
};

const OPEN_TO_CLOSE: Record<string, string> = { "(": ")", "{": "}", "[": "]" };
const MULTI_CHAR_OPS = ["<=", ">=", "<>", "&&", "||"];
const SINGLE_CHAR_OPS = new Set(["=", "<", ">", "+", "-", "*", "/", "^", "&", "!", "%", ".", "@", ":"]);
const WORD_OPERATORS = new Set(["and", "or", "not", "in", "exactin", "as"]);

function isIdentStart(char: string) {
  return /[A-Za-z_À-￿]/.test(char);
}

function isIdentPart(char: string) {
  return /[A-Za-z0-9_À-￿]/.test(char);
}

function isDigit(char: string | undefined) {
  return char !== undefined && char >= "0" && char <= "9";
}

export function tokenizePowerFx(input: string, locale: PowerFxLocale = "en") {
  const tokens: PowerFxToken[] = [];
  const issues: PowerFxIssue[] = [];
  const argSeparator = locale === "eu" ? ";" : ",";
  const decimalSeparator = locale === "eu" ? "," : ".";
  let index = 0;

  while (index < input.length) {
    const char = input[index];
    const start = index;

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    // Comments
    if (char === "/" && input[index + 1] === "/") {
      const end = input.indexOf("\n", index);
      const stop = end === -1 ? input.length : end;
      tokens.push({ kind: "lineComment", value: input.slice(index, stop).trimEnd(), start });
      index = stop;
      continue;
    }

    if (char === "/" && input[index + 1] === "*") {
      const end = input.indexOf("*/", index + 2);
      if (end === -1) {
        issues.push({ message: "Block comment is never closed with */.", position: start });
        tokens.push({ kind: "blockComment", value: input.slice(index), start });
        index = input.length;
      } else {
        tokens.push({ kind: "blockComment", value: input.slice(index, end + 2), start });
        index = end + 2;
      }
      continue;
    }

    // Strings: "..." with "" as an escaped quote, and $"..." interpolated strings.
    if (char === '"' || (char === "$" && input[index + 1] === '"')) {
      const end = readStringEnd(input, char === "$" ? index + 1 : index, char === "$");
      if (end === -1) {
        issues.push({ message: "Text value is missing its closing double quote.", position: start });
        tokens.push({ kind: "string", value: input.slice(index), start });
        index = input.length;
      } else {
        tokens.push({ kind: "string", value: input.slice(index, end + 1), start });
        index = end + 1;
      }
      continue;
    }

    // Quoted identifiers: 'Request Status' with '' as an escaped quote.
    if (char === "'") {
      let cursor = index + 1;
      let closed = false;
      while (cursor < input.length) {
        if (input[cursor] === "'") {
          if (input[cursor + 1] === "'") {
            cursor += 2;
            continue;
          }
          closed = true;
          break;
        }
        cursor += 1;
      }
      if (!closed) {
        issues.push({ message: "Quoted name is missing its closing single quote.", position: start });
        tokens.push({ kind: "quoted", value: input.slice(index), start });
        index = input.length;
      } else {
        tokens.push({ kind: "quoted", value: input.slice(index, cursor + 1), start });
        index = cursor + 1;
      }
      continue;
    }

    // Numbers
    if (isDigit(char) || (char === decimalSeparator && isDigit(input[index + 1]))) {
      let cursor = index;
      while (isDigit(input[cursor])) cursor += 1;
      if (input[cursor] === decimalSeparator && isDigit(input[cursor + 1])) {
        cursor += 1;
        while (isDigit(input[cursor])) cursor += 1;
      }
      if ((input[cursor] === "e" || input[cursor] === "E") && (isDigit(input[cursor + 1]) || ((input[cursor + 1] === "+" || input[cursor + 1] === "-") && isDigit(input[cursor + 2])))) {
        cursor += 2;
        while (isDigit(input[cursor])) cursor += 1;
      }
      tokens.push({ kind: "number", value: input.slice(index, cursor), start });
      index = cursor;
      continue;
    }

    if (isIdentStart(char)) {
      let cursor = index + 1;
      while (cursor < input.length && isIdentPart(input[cursor])) cursor += 1;
      tokens.push({ kind: "ident", value: input.slice(index, cursor), start });
      index = cursor;
      continue;
    }

    if (char in OPEN_TO_CLOSE) {
      tokens.push({ kind: "open", value: char, start });
      index += 1;
      continue;
    }

    if (char === ")" || char === "}" || char === "]") {
      tokens.push({ kind: "close", value: char, start });
      index += 1;
      continue;
    }

    if (locale === "eu" && char === ";" && input[index + 1] === ";") {
      tokens.push({ kind: "chain", value: ";;", start });
      index += 2;
      continue;
    }

    if (char === argSeparator) {
      tokens.push({ kind: "sep", value: char, start });
      index += 1;
      continue;
    }

    if (locale === "en" && char === ";") {
      tokens.push({ kind: "chain", value: ";", start });
      index += 1;
      continue;
    }

    const pair = input.slice(index, index + 2);
    if (MULTI_CHAR_OPS.includes(pair)) {
      tokens.push({ kind: "op", value: pair, start });
      index += 2;
      continue;
    }

    if (SINGLE_CHAR_OPS.has(char)) {
      tokens.push({ kind: "op", value: char, start });
      index += 1;
      continue;
    }

    tokens.push({ kind: "other", value: char, start });
    index += 1;
  }

  return { tokens, issues };
}

/** Returns the index of the closing quote, or -1. `quoteIndex` points at the opening quote. */
function readStringEnd(input: string, quoteIndex: number, interpolated: boolean): number {
  let cursor = quoteIndex + 1;
  while (cursor < input.length) {
    const char = input[cursor];
    if (char === '"') {
      if (input[cursor + 1] === '"') {
        cursor += 2;
        continue;
      }
      return cursor;
    }
    if (interpolated && char === "{") {
      if (input[cursor + 1] === "{") {
        cursor += 2;
        continue;
      }
      // Skip the embedded expression, including any nested strings.
      let depth = 1;
      cursor += 1;
      while (cursor < input.length && depth > 0) {
        const inner = input[cursor];
        if (inner === '"' || (inner === "$" && input[cursor + 1] === '"')) {
          const isNestedInterpolated = inner === "$";
          const end = readStringEnd(input, isNestedInterpolated ? cursor + 1 : cursor, isNestedInterpolated);
          if (end === -1) return -1;
          cursor = end + 1;
          continue;
        }
        if (inner === "{") depth += 1;
        if (inner === "}") depth -= 1;
        cursor += 1;
      }
      continue;
    }
    cursor += 1;
  }
  return -1;
}

// ----- Tree -----

export type PowerFxGroup = {
  type: "group";
  open: string;
  close: string;
  /** Arguments separated by the argument separator. Each argument is a list of chained statements. */
  args: PowerFxItem[][][];
  maxDepth: number;
};

export type PowerFxItem = PowerFxToken | PowerFxGroup;

export type PowerFxTree = {
  statements: PowerFxItem[][];
  issues: PowerFxIssue[];
  maxDepth: number;
};

function isGroup(item: PowerFxItem): item is PowerFxGroup {
  return (item as PowerFxGroup).type === "group";
}

export function parsePowerFx(input: string, locale: PowerFxLocale = "en"): PowerFxTree {
  const { tokens, issues } = tokenizePowerFx(input, locale);
  let position = 0;

  function parseArgs(closeChar: string | null): { args: PowerFxItem[][][]; closed: boolean; maxDepth: number } {
    const args: PowerFxItem[][][] = [[[]]];
    let maxDepth = 0;

    while (position < tokens.length) {
      const token = tokens[position];
      const currentArg = args[args.length - 1];
      const currentStatement = currentArg[currentArg.length - 1];

      if (token.kind === "close") {
        if (token.value === closeChar) {
          position += 1;
          return { args, closed: true, maxDepth };
        }
        if (closeChar !== null) {
          // A different closer: let the caller decide. Report it as a mismatch.
          issues.push({ message: `Expected "${closeChar}" but found "${token.value}".`, position: token.start });
          return { args, closed: false, maxDepth };
        }
        issues.push({ message: `Unexpected "${token.value}" with no matching opening bracket.`, position: token.start });
        currentStatement.push({ ...token, kind: "other" });
        position += 1;
        continue;
      }

      if (token.kind === "open") {
        position += 1;
        const close = OPEN_TO_CLOSE[token.value];
        const inner = parseArgs(close);
        if (!inner.closed) {
          issues.push({ message: `"${token.value}" is never closed.`, position: token.start });
        }
        const group: PowerFxGroup = {
          type: "group",
          open: token.value,
          close: inner.closed ? close : "",
          args: inner.args,
          maxDepth: inner.maxDepth + 1
        };
        maxDepth = Math.max(maxDepth, group.maxDepth);
        currentStatement.push(group);
        continue;
      }

      if (token.kind === "sep") {
        args.push([[]]);
        position += 1;
        continue;
      }

      if (token.kind === "chain") {
        currentArg.push([]);
        position += 1;
        continue;
      }

      currentStatement.push(token);
      position += 1;
    }

    return { args, closed: closeChar === null, maxDepth };
  }

  const result = parseArgs(null);
  // A top-level argument separator is unusual; keep it lossless by flattening into statements joined with the separator token.
  const statements: PowerFxItem[][] = [];
  result.args.forEach((arg, argIndex) => {
    arg.forEach((statement, statementIndex) => {
      if (argIndex > 0 && statementIndex === 0) {
        const previous = statements[statements.length - 1];
        previous.push({ kind: "other", value: locale === "eu" ? ";" : ",", start: -1 });
        previous.push(...statement);
      } else {
        statements.push(statement);
      }
    });
  });

  return { statements, issues, maxDepth: result.maxDepth };
}

// ----- Printer -----

type PrintContext = {
  options: PowerFxFormatOptions;
  minify: boolean;
};

function argSeparator(options: PowerFxFormatOptions) {
  return options.locale === "eu" ? ";" : ",";
}

function chainSeparator(options: PowerFxFormatOptions) {
  return options.locale === "eu" ? ";;" : ";";
}

function indentText(level: number, options: PowerFxFormatOptions) {
  return options.indent === 0 ? "\t".repeat(level) : " ".repeat(level * options.indent);
}

type Prev = { kind: PowerFxTokenKind | "group"; value: string; unary?: boolean } | null;

function isOperatorLike(prev: Prev) {
  if (!prev) return true;
  if (prev.kind === "op" && prev.value !== "%") return true;
  if (prev.kind === "open" || prev.kind === "sep" || prev.kind === "chain") return true;
  if (prev.kind === "ident" && WORD_OPERATORS.has(prev.value.toLowerCase())) return true;
  return false;
}

/** Text placed between the previous token and the next one on the same line. */
function spacing(prev: Prev, next: PowerFxToken | PowerFxGroup): string {
  if (!prev) return "";
  const nextKind = isGroup(next) ? "open" : next.kind;
  const nextValue = isGroup(next) ? next.open : next.value;

  if (prev.kind === "open") return "";
  if (nextKind === "lineComment" || nextKind === "blockComment" || prev.kind === "blockComment") return " ";
  if (nextValue === "." || nextValue === "@" || prev.value === "." || prev.value === "@") return "";
  if (nextValue === "%") return "";
  if (nextValue === ":") return "";
  if (prev.value === ":") return " ";
  if (prev.unary) return "";

  if (nextKind === "open" && nextValue === "(") {
    // Function calls (Patch(, Not(, 'My Flow'.Run() keep the paren attached.
    if (prev.kind === "ident" || prev.kind === "quoted" || prev.kind === "group" || prev.kind === "close") return "";
  }

  return " ";
}

function isUnary(token: PowerFxToken, prev: Prev) {
  if (token.kind !== "op") return false;
  if (token.value === "!") return true;
  if (token.value === "-" || token.value === "+") return isOperatorLike(prev);
  return false;
}

/** Flat rendering of a list of items. Returns null when the items can't sit on one line. */
function flatItems(items: PowerFxItem[], ctx: PrintContext, allowStatements = false): string | null {
  let text = "";
  let prev: Prev = null;

  for (const item of items) {
    if (isGroup(item)) {
      const inner = flatGroup(item, ctx);
      if (inner === null) return null;
      text += spacing(prev, item) + inner;
      prev = { kind: "group", value: item.close || item.open };
      continue;
    }

    if (item.kind === "lineComment") {
      if (!ctx.minify) return null;
      text += spacing(prev, item) + "/*" + item.value.slice(2).replace(/\*\//g, "* /") + " */";
      prev = { kind: "blockComment", value: item.value };
      continue;
    }

    const unary = isUnary(item, prev);
    text += spacing(prev, item) + item.value;
    prev = { kind: item.kind, value: item.value, unary };
  }

  void allowStatements;
  return text;
}

function flatGroup(group: PowerFxGroup, ctx: PrintContext): string | null {
  const parts: string[] = [];
  for (const arg of group.args) {
    if (arg.length > 1 && !ctx.minify) return null; // chained statements always break
    const statements: string[] = [];
    for (const statement of arg) {
      const flat = flatItems(statement, ctx);
      if (flat === null) return null;
      statements.push(flat);
    }
    parts.push(statements.join(ctx.minify ? chainSeparator(ctx.options) : chainSeparator(ctx.options) + " "));
  }
  const isEmpty = parts.length === 1 && parts[0] === "";
  const sep = ctx.minify ? argSeparator(ctx.options) : argSeparator(ctx.options) + " ";
  return group.open + (isEmpty ? "" : parts.join(sep)) + group.close;
}

class LineWriter {
  lines: string[] = [];
  current = "";
  ctx: PrintContext;

  constructor(ctx: PrintContext) {
    this.ctx = ctx;
  }

  start(level: number) {
    if (this.current.trim()) this.lines.push(this.current.trimEnd());
    this.current = indentText(level, this.ctx.options);
  }

  write(text: string) {
    this.current += text;
  }

  get column() {
    return this.current.replace(/\t/g, "    ").length;
  }

  finish() {
    if (this.current.trim()) this.lines.push(this.current.trimEnd());
    return this.lines.join("\n");
  }
}

function printItems(items: PowerFxItem[], level: number, writer: LineWriter, ctx: PrintContext) {
  let prev: Prev = null;

  items.forEach((item, index) => {
    if (isGroup(item)) {
      const flat = flatGroup(item, ctx);
      const space = spacing(prev, item);
      // Room needed for this group plus a trailing separator or closer.
      if (flat !== null && writer.column + space.length + flat.length + 1 <= ctx.options.width) {
        writer.write(space + flat);
      } else {
        writer.write(space);
        printBrokenGroup(item, level, writer, ctx);
      }
      prev = { kind: "group", value: item.close || item.open };
      return;
    }

    const unary = isUnary(item, prev);
    writer.write(spacing(prev, item) + item.value);
    prev = { kind: item.kind, value: item.value, unary };

    if (item.kind === "lineComment" && index < items.length - 1) {
      writer.start(level);
      prev = null;
    }
  });
}

function printBrokenGroup(group: PowerFxGroup, level: number, writer: LineWriter, ctx: PrintContext) {
  writer.write(group.open);
  const isEmpty = group.args.length === 1 && group.args[0].length === 1 && group.args[0][0].length === 0;

  if (!isEmpty) {
    group.args.forEach((arg, argIndex) => {
      arg.forEach((statement, statementIndex) => {
        writer.start(level + 1);
        printItems(statement, level + 1, writer, ctx);
        const lastItem = statement[statement.length - 1];
        const endsWithLineComment = lastItem && !isGroup(lastItem) && lastItem.kind === "lineComment";
        let suffix = "";
        if (statementIndex < arg.length - 1) suffix = chainSeparator(ctx.options);
        else if (argIndex < group.args.length - 1) suffix = argSeparator(ctx.options);
        if (suffix) {
          if (endsWithLineComment) {
            writer.start(level + 1);
          }
          writer.write(suffix);
        }
      });
    });
  }

  if (group.close) {
    writer.start(level);
    writer.write(group.close);
  } else {
    writer.start(level);
  }
}

export function formatPowerFxFormula(input: string, options: Partial<PowerFxFormatOptions> = {}) {
  const resolved = { ...defaultPowerFxFormatOptions, ...options };
  const tree = parsePowerFx(input, resolved.locale);
  const ctx: PrintContext = { options: resolved, minify: false };
  const writer = new LineWriter(ctx);

  tree.statements.forEach((statement, index) => {
    if (statement.length === 0) return;
    writer.start(0);
    printItems(statement, 0, writer, ctx);
    if (index < tree.statements.length - 1) {
      const last = statement[statement.length - 1];
      if (!isGroup(last) && last.kind === "lineComment") writer.start(0);
      writer.write(chainSeparator(resolved));
    }
  });

  return { output: input.trim() ? writer.finish() : "", issues: tree.issues, maxDepth: tree.maxDepth };
}

export function minifyPowerFxFormula(input: string, options: Partial<PowerFxFormatOptions> = {}) {
  const resolved = { ...defaultPowerFxFormatOptions, ...options };
  const tree = parsePowerFx(input, resolved.locale);
  const ctx: PrintContext = { options: resolved, minify: true };
  const statements = tree.statements
    .filter((statement) => statement.length > 0)
    .map((statement) => flatItems(statement, ctx) ?? "");
  return { output: statements.join(chainSeparator(resolved)), issues: tree.issues, maxDepth: tree.maxDepth };
}

/** Significant token values, used to prove formatting only changed whitespace. */
export function significantTokens(input: string, locale: PowerFxLocale = "en") {
  return tokenizePowerFx(input, locale).tokens.map((token) =>
    token.kind === "lineComment" ? "/*" + token.value.slice(2).replace(/\*\//g, "* /").trim() + "*/" : token.kind === "blockComment" ? token.value.replace(/\s+\*\/$/, "*/").replace(/^\/\*\s*/, "/*").trim() : token.value
  );
}

// ----- Delegation hints -----

export type DelegationHint = {
  title: string;
  detail: string;
};

const NON_DELEGABLE_IN_PREDICATE = [
  "Len",
  "Left",
  "Right",
  "Mid",
  "Lower",
  "Upper",
  "Trim",
  "TrimEnds",
  "Text",
  "Value",
  "Concatenate",
  "Substitute",
  "Year",
  "Month",
  "Day",
  "DateValue",
  "DateDiff",
  "CountRows",
  "LookUp",
  "Filter"
];

const TABLE_SHAPING = ["AddColumns", "DropColumns", "ShowColumns", "RenameColumns", "GroupBy", "Distinct", "ForAll"];

function findCalls(items: PowerFxItem[], visit: (name: string, group: PowerFxGroup) => void) {
  items.forEach((item, index) => {
    if (isGroup(item)) {
      const previous = items[index - 1];
      if (previous && !isGroup(previous) && previous.kind === "ident" && item.open === "(") {
        visit(previous.value, item);
      }
      item.args.forEach((arg) => arg.forEach((statement) => findCalls(statement, visit)));
    }
  });
}

function itemsText(items: PowerFxItem[], ctx: PrintContext) {
  return flatItems(items, { ...ctx, minify: true }) ?? "";
}

/**
 * Heuristic delegation hints. These are prompts to check Studio's delegation warnings,
 * not a guarantee: delegation support depends on the data source and column type.
 */
export function findDelegationHints(input: string, locale: PowerFxLocale = "en"): DelegationHint[] {
  const tree = parsePowerFx(input, locale);
  const ctx: PrintContext = { options: { ...defaultPowerFxFormatOptions, locale }, minify: true };
  const hints = new Map<string, DelegationHint>();

  tree.statements.forEach((statement) =>
    findCalls(statement, (name, group) => {
      const lower = name.toLowerCase();

      if (lower === "filter" || lower === "lookup") {
        const predicates = group.args.slice(1).flat();
        predicates.forEach((predicate) => {
          const text = itemsText(predicate, ctx);
          NON_DELEGABLE_IN_PREDICATE.forEach((fn) => {
            if (new RegExp("(^|[^A-Za-z0-9_.])" + fn + "\\(", "i").test(text)) {
              hints.set(`${name}-${fn}`, {
                title: `${fn}() inside ${name}`,
                detail: `${fn}() applied to a column inside ${name} usually can't be delegated, so only the first 500 to 2,000 rows are checked. Compare against a stored column, or move the calculation outside the predicate if it doesn't depend on the row.`
              });
            }
          });
          if (/\bin\b|\bexactin\b/i.test(text)) {
            hints.set(`${name}-in`, {
              title: `"in" operator inside ${name}`,
              detail: `"in" is not delegable to SharePoint. Dataverse and SQL delegate some uses of it. If this runs against a SharePoint list, prefer StartsWith or an equality test on an indexed column.`
            });
          }
        });
      }

      if (lower === "search") {
        hints.set("search", {
          title: "Search()",
          detail: "Search is delegable to Dataverse and SQL but not to SharePoint lists. For SharePoint, use Filter with StartsWith on an indexed text column."
        });
      }

      if (["countrows", "sum", "average", "min", "max", "countif"].includes(lower)) {
        const first = group.args[0]?.[0];
        const firstIsCall = first?.some((item) => isGroup(item));
        if (first && !firstIsCall) {
          hints.set(`agg-${lower}`, {
            title: `${name}() over a data source`,
            detail: `${name} isn't delegated to SharePoint, so the result can be wrong on large lists. Dataverse delegates some aggregates. Consider a stored running total or a view-based count.`
          });
        }
      }

      if (TABLE_SHAPING.some((fn) => fn.toLowerCase() === lower)) {
        const first = group.args[0]?.[0];
        if (first && first.length === 1 && !isGroup(first[0])) {
          hints.set(`shape-${lower}`, {
            title: `${name}() directly on ${first[0].value}`,
            detail: `${name} isn't delegable. Run Filter first to narrow the rows, then shape the smaller result.`
          });
        }
      }
    })
  );

  return [...hints.values()];
}
