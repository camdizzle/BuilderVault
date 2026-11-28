// Tests a Power Fx IsMatch, Match or MatchAll pattern in the browser.
// Power Apps runs these functions on JavaScript's regular expression engine in the browser, so
// JavaScript's RegExp is used here, with Power Apps' defaults for each function. The warnings
// follow Microsoft's "Regular expressions in Power Fx" page.

export type RegexFunction = "IsMatch" | "Match" | "MatchAll";
export type RegexAnchor = "default" | "Complete" | "Contains" | "BeginsWith" | "EndsWith";

export type RegexSettings = {
  fn: RegexFunction;
  pattern: string;
  anchor: RegexAnchor;
  ignoreCase: boolean;
  multiline: boolean;
};

export type RegexMatch = {
  fullMatch: string;
  /** 1-based, like Power Fx StartMatch. */
  startMatch: number;
  /** Numbered submatches, in order. Unmatched groups are blank. */
  subMatches: string[];
  /** Named submatches, in order of appearance. */
  named: Array<{ name: string; value: string }>;
};

export type RegexResult = {
  error?: string;
  isMatch: boolean;
  matches: RegexMatch[];
  /** True when MatchAll stopped at the match limit. */
  truncated: boolean;
};

export const maxMatches = 500;

/** The anchor each function uses when no option is given, in Power Apps. */
export function defaultAnchor(fn: RegexFunction): Exclude<RegexAnchor, "default"> {
  return fn === "IsMatch" ? "Complete" : "Contains";
}

export function effectiveAnchor(settings: Pick<RegexSettings, "fn" | "anchor">) {
  return settings.anchor === "default" ? defaultAnchor(settings.fn) : settings.anchor;
}

/** Strips a (?imnsx) prefix and returns the flags it sets. */
function readInlineOptions(pattern: string) {
  const match = /^\(\?([imnsx]+)\)/.exec(pattern);
  if (!match) return { body: pattern, ignoreCase: false, multiline: false, unsupported: "" };
  const letters = match[1];
  return {
    body: pattern.slice(match[0].length),
    ignoreCase: letters.includes("i"),
    multiline: letters.includes("m"),
    unsupported: letters.replace(/[imn]/g, "")
  };
}

/** Builds the JavaScript RegExp that matches what Power Apps would match. */
export function buildRegex(settings: RegexSettings, global = false): { regex?: RegExp; error?: string } {
  if (!settings.pattern) return { error: "Enter a pattern." };
  const inline = readInlineOptions(settings.pattern);
  if (inline.unsupported) {
    return { error: `The (?${inline.unsupported}) option isn't available in Power Apps. Only i (IgnoreCase) and m (Multiline) work there.` };
  }
  const anchor = effectiveAnchor(settings);
  let body = inline.body;
  if (anchor === "Complete") body = `^(?:${body})$`;
  else if (anchor === "BeginsWith") body = `^(?:${body})`;
  else if (anchor === "EndsWith") body = `(?:${body})$`;
  // \p{...} and \u{...} need JavaScript's Unicode mode.
  const unicode = /\\[pP]\{|\\u\{/.test(body);
  const flags = (settings.ignoreCase || inline.ignoreCase ? "i" : "") + (settings.multiline || inline.multiline ? "m" : "") + (unicode ? "u" : "") + (global ? "g" : "");
  try {
    return { regex: new RegExp(body, flags) };
  } catch (error) {
    const message = error instanceof Error ? error.message.replace(/^Invalid regular expression: (\/.*\/[a-z]*: )?/, "") : "The pattern isn't valid.";
    return { error: `The pattern isn't valid: ${message}` };
  }
}

/** Names of the named groups, in order of appearance. */
export function namedGroups(pattern: string) {
  return Array.from(pattern.matchAll(/\(\?<([A-Za-z_][A-Za-z0-9_]*)>/g), (match) => match[1]);
}

function toMatch(match: RegExpExecArray, names: string[]): RegexMatch {
  return {
    fullMatch: match[0],
    startMatch: match.index + 1,
    subMatches: match.slice(1).map((value) => value ?? ""),
    named: names.map((name) => ({ name, value: match.groups?.[name] ?? "" }))
  };
}

/** Runs the pattern against the text the way the chosen function would. */
export function runRegex(settings: RegexSettings, text: string): RegexResult {
  const built = buildRegex(settings, settings.fn === "MatchAll");
  if (!built.regex) return { error: built.error, isMatch: false, matches: [], truncated: false };
  const regex = built.regex;
  const names = namedGroups(settings.pattern);

  if (settings.fn !== "MatchAll") {
    const match = regex.exec(text);
    return { isMatch: Boolean(match), matches: match ? [toMatch(match, names)] : [], truncated: false };
  }

  const matches: RegexMatch[] = [];
  let truncated = false;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    matches.push(toMatch(match, names));
    // An empty match would repeat forever, so step past it.
    if (match[0] === "") regex.lastIndex += 1;
    if (matches.length >= maxMatches) {
      truncated = true;
      break;
    }
  }
  return { isMatch: matches.length > 0, matches, truncated };
}

/**
 * Things in the pattern that work in a browser but that Power Fx blocks or treats differently,
 * mostly from the stricter rules in Power Fx 1.0, which Power Apps is moving to.
 */
export function regexWarnings(pattern: string): string[] {
  const warnings: string[] = [];
  const hasNamed = /\(\?<[A-Za-z_]/.test(pattern);
  const hasBackref = /\\[1-9]/.test(pattern);
  if (hasNamed && hasBackref) {
    warnings.push("Named submatches and numbered back references (\\1) can't be mixed. Use \\k<name> to refer back to a named submatch.");
  }
  if (/\[-|[^\\]-\]/.test(pattern)) {
    warnings.push("A hyphen at the start or end of a [ ] class must be escaped in Power Fx 1.0. Write [\\-a] instead of [-a].");
  }
  if (/[*+?}]\+/.test(pattern.replace(/\\./g, ""))) {
    warnings.push("Possessive quantifiers such as *+ and ++ aren't supported in Power Fx.");
  }
  if (/\\v/.test(pattern)) {
    warnings.push("\\v isn't supported. Use \\x0b for a vertical tab.");
  }
  if (/\\0\d|\\o\{/.test(pattern)) {
    warnings.push("Octal character codes aren't supported. Use \\x or \\u codes instead.");
  }
  if (/.\(\?[imnsx]+\)/.test(pattern)) {
    warnings.push("Inline options such as (?i) must be at the very start of the pattern.");
  }
  if (/\(\?[a-z]*[sx][a-z]*\)/.test(pattern)) {
    warnings.push("DotAll (?s) and FreeSpacing (?x) aren't available in Power Apps.");
  }
  if (/\(\?<?[=!][^)]*[*+]/.test(pattern)) {
    warnings.push("Lookahead and lookbehind can't contain unlimited quantifiers such as * or + in Power Fx 1.0.");
  }
  return warnings;
}

/** Puts text inside a Power Fx string literal, doubling any double quotes. */
export function powerFxString(text: string) {
  return '"' + text.replace(/"/g, '""') + '"';
}

/** The formula to paste into Power Apps. */
export function powerFxFormula(settings: RegexSettings, input: string) {
  const options: string[] = [];
  if (settings.anchor !== "default") options.push("MatchOptions." + settings.anchor);
  if (settings.ignoreCase) options.push("MatchOptions.IgnoreCase");
  if (settings.multiline) options.push("MatchOptions.Multiline");
  const args = [input.trim() || "txtInput.Text", powerFxString(settings.pattern)];
  if (options.length > 0) args.push(options.join(" & "));
  return `${settings.fn}(${args.join(", ")})`;
}
