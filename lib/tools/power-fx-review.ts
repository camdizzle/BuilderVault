// Plain-English explanation, pattern detection and review checks for the Power Fx formatter.
// Pure TypeScript with no imports so it runs in the browser and in Node test scripts.

/** A delegation finding as shown in the review notes. */
export type ReviewHint = { title: string; detail: string };

/** Text values and comments replaced with blanks, so their contents are never read as code. */
function withoutLiterals(value: string) {
  return value
    .replace(/\/\*[\s\S]*?(\*\/|$)/g, " ")
    .replace(/\/\/[^\n]*/g, " ")
    .replace(/\$?"(?:[^"]|"")*"?/g, '""');
}

/**
 * The lower-case names of the functions a formula calls. A name only counts when it is the whole
 * function name, so StartsWith( is not read as With( and Reset( is not read as Set(.
 */
export function functionCallNames(value: string) {
  const names = new Set<string>();
  for (const match of withoutLiterals(value).matchAll(/(?<![A-Za-z0-9_.'])([A-Za-z_][A-Za-z0-9_]*)\s*\(/g)) names.add(match[1].toLowerCase());
  return names;
}

/** How many times a function is called. */
export function countCalls(value: string, functionName: string) {
  const name = functionName.toLowerCase();
  let count = 0;
  for (const match of withoutLiterals(value).matchAll(/(?<![A-Za-z0-9_.'])([A-Za-z_][A-Za-z0-9_]*)\s*\(/g)) if (match[1].toLowerCase() === name) count += 1;
  return count;
}

export type PowerFxExplanation = {
  title: string;
  summary: string;
  steps: string[];
  notes: string[];
};

export function explainPowerFx(value: string): PowerFxExplanation {
  const lower = value.toLowerCase();
  const calls = functionCallNames(value);
  const steps: string[] = [];
  const notes: string[] = [];

  if (!lower.trim()) {
    return {
      title: "Paste a formula to explain it",
      summary: "The explainer will describe the formula flow in plain language once Power Fx is entered.",
      steps: ["Paste a formula into the editor above."],
      notes: []
    };
  }

  if (calls.has("iferror")) {
    steps.push("Runs the main formula inside an error-handling wrapper.");
    notes.push("Error-handled");
  }

  if (calls.has("set")) {
    const variables = extractFunctionFirstArguments(value, "Set");
    steps.push(variables.length > 0 ? "Stores values in app variables: " + variables.join(", ") + "." : "Stores one or more values in app variables for later use.");
    notes.push("Uses variables");
  }

  if (calls.has("updatecontext")) {
    steps.push("Updates one or more screen-level context variables.");
    notes.push("Screen state");
  }

  if (calls.has("patch")) {
    const patchTargets = extractFunctionFirstArguments(value, "Patch");
    steps.push(patchTargets.length > 0 ? "Saves data with Patch against " + uniqueValues(patchTargets).join(", ") + "." : "Saves data with Patch.");
    if (calls.has("defaults")) {
      steps.push("Creates a new record because Defaults is used as the base record.");
      notes.push("Creates record");
    } else {
      steps.push("Updates an existing record or selected record.");
      notes.push("Updates record");
    }
  }

  if (calls.has("submitform")) {
    steps.push("Submits an edit form and relies on the form control for validation and save behavior.");
    notes.push("Form submit");
  }

  if (calls.has("filter")) {
    const targets = extractFunctionFirstArguments(value, "Filter");
    steps.push(targets.length > 0 ? "Filters records from " + uniqueValues(targets).join(", ") + "." : "Filters a table or data source before display or processing.");
    notes.push("Filter");
  }

  if (calls.has("lookup")) {
    const targets = extractFunctionFirstArguments(value, "LookUp");
    steps.push(targets.length > 0 ? "Finds a single matching record from " + uniqueValues(targets).join(", ") + "." : "Finds a single matching record.");
    notes.push("Lookup");
  }

  if (calls.has("forall")) {
    steps.push("Loops through a table and runs logic once for each row.");
    notes.push("Loop");
  }

  if (calls.has("clearcollect")) {
    const targets = extractFunctionFirstArguments(value, "ClearCollect");
    steps.push(targets.length > 0 ? "Clears and rebuilds local collection " + uniqueValues(targets).join(", ") + "." : "Clears and rebuilds a local collection.");
    notes.push("Collection");
  } else if (calls.has("collect")) {
    const targets = extractFunctionFirstArguments(value, "Collect");
    steps.push(targets.length > 0 ? "Adds records to local collection " + uniqueValues(targets).join(", ") + "." : "Adds records to a local collection.");
    notes.push("Collection");
  }

  if (calls.has("with")) {
    steps.push("Creates a local named record with With so later logic can reference intermediate values more clearly.");
    notes.push("Readable block");
  }

  if (calls.has("switch")) {
    steps.push("Branches through multiple outcomes with Switch, usually based on a status, mode, command, or selected value.");
    notes.push("Branching");
  } else if (calls.has("if")) {
    steps.push("Evaluates conditional logic with If and runs different branches depending on the result.");
    notes.push("Conditional");
  }

  if (calls.has("notify")) {
    steps.push("Shows user feedback with Notify after the formula finishes or fails.");
    notes.push("User feedback");
  }

  if (calls.has("navigate")) {
    steps.push("Navigates the user to another screen after the earlier logic runs.");
    notes.push("Navigation");
  }

  if (steps.length === 0) {
    steps.push("Uses Power Fx logic that does not match one of the current explainer patterns yet.");
  }

  return {
    title: "Plain-English formula flow",
    summary: "This is a heuristic explanation based on common Power Fx functions and formula shapes. Review the output before using it as documentation.",
    steps: uniqueValues(steps),
    notes: uniqueValues(notes)
  };
}

function extractFunctionFirstArguments(value: string, functionName: string) {
  const regex = new RegExp("(?<![A-Za-z0-9_.])" + functionName + "\\s*\\(", "gi");
  const matches: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(value)) !== null) {
    const start = match.index + match[0].length;
    const argument = readFirstArgument(value, start);
    if (argument) matches.push(argument);
  }

  return matches;
}

function readFirstArgument(value: string, start: number) {
  let depth = 0;
  let inString = false;
  let result = "";

  for (let index = start; index < value.length; index += 1) {
    const char = value[index];
    const previous = value[index - 1];

    if (char === '"' && previous !== "\\") {
      inString = !inString;
      result += char;
      continue;
    }

    if (!inString) {
      if (char === "(" || char === "{" || char === "[") depth += 1;
      if (char === ")" || char === "}" || char === "]") depth = Math.max(depth - 1, 0);
      if ((char === "," || char === ";") && depth === 0) break;
    }

    result += char;
  }

  return cleanArgumentLabel(result);
}

function cleanArgumentLabel(value: string) {
  const cleaned = value.trim().replace(/\s+/g, " ");
  if (!cleaned) return "";
  if (cleaned.length > 36) return cleaned.slice(0, 33).trimEnd() + "...";
  return cleaned;
}

function uniqueValues(values: string[]) {
  return values.filter((value, index, allValues) => value && allValues.indexOf(value) === index);
}
export type DetectedPowerFxPattern = {
  id: string;
  title: string;
  category: string;
  detail: string;
  links: Array<{ href: string; label: string }>;
};

const powerFxPatternRules: Array<DetectedPowerFxPattern & { terms: string[] }> = [
  {
    id: "patch-save",
    title: "Patch save formula",
    category: "Save behavior",
    detail: "This formula appears to save data with Patch. Review field shapes, validation, IfError, and the returned saved record.",
    terms: ["patch"],
    links: [
      { href: "/examples/power-apps-patch-examples", label: "Patch examples" },
      { href: "/cookbooks/power-apps-patch-cookbook", label: "Patch cookbook" },
      { href: "/cheat-sheets/patch-sharepoint-columns-cheat-sheet", label: "Column shapes" }
    ]
  },
  {
    id: "filter-gallery",
    title: "Filter or gallery query",
    category: "Gallery filtering",
    detail: "Filter-style formulas often need delegation review, especially with SharePoint and large lists.",
    terms: ["filter", "search", "startswith"],
    links: [
      { href: "/examples/power-apps-collections-examples", label: "Gallery examples" },
      { href: "/cheat-sheets/power-apps-gallery-filtering-cheat-sheet", label: "Filtering cheat sheet" },
      { href: "/power-apps/delegation", label: "Delegation patterns" }
    ]
  },
  {
    id: "lookup-reference",
    title: "LookUp reference",
    category: "Data lookup",
    detail: "LookUp formulas should be checked for delegation, unique keys, and repeated calls inside galleries.",
    terms: ["lookup"],
    links: [
      { href: "/power-apps/delegation", label: "Delegation patterns" },
      { href: "/patterns/patch-sharepoint-lookup-field", label: "Lookup patch pattern" },
      { href: "/sharepoint/list-schemas", label: "List schema patterns" }
    ]
  },
  {
    id: "with-block",
    title: "With block",
    category: "Readability",
    detail: "With blocks can make long formulas easier to review by naming intermediate values.",
    terms: ["with"],
    links: [
      { href: "/standards/power-apps-naming-standards", label: "Naming standards" },
      { href: "/tools/power-fx-formatter", label: "Formatter" },
      { href: "/examples/power-apps-patch-examples", label: "Patch examples" }
    ]
  },
  {
    id: "switch-branching",
    title: "Switch branching",
    category: "Branching logic",
    detail: "Switch can be clearer than nested If when routing by status, mode, role, or command.",
    terms: ["switch"],
    links: [
      { href: "/standards/power-apps-naming-standards", label: "App standards" },
      { href: "/power-apps/forms", label: "Form patterns" },
      { href: "/examples/power-apps-patch-examples", label: "Save examples" }
    ]
  },
  {
    id: "forall-bulk",
    title: "ForAll bulk operation",
    category: "Bulk update",
    detail: "ForAll often means row-by-row work. Review duplicates, errors, delegation assumptions, and whether bulk save is really needed.",
    terms: ["forall"],
    links: [
      { href: "/cookbooks/power-apps-collections-cookbook", label: "Collections cookbook" },
      { href: "/examples/power-apps-collections-examples", label: "Collections examples" },
      { href: "/standards/error-handling-standards", label: "Error standards" }
    ]
  },
  {
    id: "collection-work",
    title: "Collection staging",
    category: "Collections",
    detail: "Collect and ClearCollect indicate local staging. Confirm volume, refresh behavior, and whether data can become stale.",
    terms: ["collect", "clearcollect"],
    links: [
      { href: "/cookbooks/power-apps-collections-cookbook", label: "Collections cookbook" },
      { href: "/examples/power-apps-collections-examples", label: "Collections examples" },
      { href: "/power-apps/delegation", label: "Delegation" }
    ]
  },
  {
    id: "submit-form",
    title: "SubmitForm pattern",
    category: "Forms",
    detail: "SubmitForm is a form-first save pattern. Review OnSuccess, OnFailure, validation, and where Patch may still be needed.",
    terms: ["submitform"],
    links: [
      { href: "/power-apps/forms", label: "Form patterns" },
      { href: "/standards/error-handling-standards", label: "Error handling" },
      { href: "/examples/power-apps-patch-examples", label: "Patch alternative" }
    ]
  },
  {
    id: "error-handling",
    title: "Error handling wrapper",
    category: "Reliability",
    detail: "IfError or Errors indicates production-minded error handling. Confirm users get clear feedback and support owners get enough context.",
    terms: ["iferror", "errors"],
    links: [
      { href: "/standards/error-handling-standards", label: "Error standards" },
      { href: "/examples/power-apps-patch-examples", label: "Patch examples" },
      { href: "/standards/logging-standards", label: "Logging standards" }
    ]
  }
];

export function detectPowerFxPatterns(value: string): DetectedPowerFxPattern[] {
  const lower = value.toLowerCase();
  const calls = functionCallNames(value);
  if (!lower.trim()) return [];

  return powerFxPatternRules
    .filter((rule) => rule.terms.some((term) => calls.has(term)))
    .map((rule) => ({
      id: rule.id,
      title: rule.title,
      category: rule.category,
      detail: rule.detail,
      links: rule.links
    }));
}

export function analyzePowerFx(original: string, formatted: string, maxDepth: number, delegationHintCount = 0) {
  const calls = functionCallNames(original);
  const lineCount = formatted ? formatted.split("\n").length : 0;
  const items: Array<{ level: string; title: string; detail: string }> = [];

  if (!original.trim()) {
    items.push({ level: "Ready", title: "Paste a formula", detail: "Add Power Fx above to format it and see maintainability checks." });
    return { items, lineCount, maxDepth, severity: "Ready", severityClass: "" };
  }

  if (calls.has("patch") && !calls.has("iferror")) {
    items.push({ level: "Review", title: "Patch without IfError", detail: "Important save formulas should usually wrap Patch in IfError so users and support owners know when a save fails." });
  }

  if (countCalls(original, "if") >= 3) {
    items.push({ level: "Review", title: "Nested If logic", detail: "Several If calls can become hard to maintain. Consider With, Switch, or named variables for readability." });
  }

  if (calls.has("forall") && calls.has("patch")) {
    items.push({ level: "Caution", title: "ForAll with Patch", detail: "ForAll plus Patch can be valid, but test data volume, errors, and duplicate writes carefully." });
  }

  if (/\b(button|label|gallery|dropdown|combobox|textinput|form)\d+\b/i.test(original)) {
    items.push({ level: "Cleanup", title: "Default control names", detail: "Default names such as Button1 or Gallery3 make formulas harder to hand off. Rename controls before release." });
  }

  if (formatted.split("\n").some((line) => line.length > 120)) {
    items.push({ level: "Cleanup", title: "Long formatted lines", detail: "Some lines are still long after formatting. Consider breaking logic into With blocks or helper variables." });
  }

  if (maxDepth >= 6) {
    items.push({ level: "Cleanup", title: "Deep nesting", detail: "The formula nests several levels deep. Use With blocks or split logic across named formulas where possible." });
  }

  if (items.length === 0 && delegationHintCount === 0) {
    items.push({ level: "Looks good", title: "No obvious warnings", detail: "Formatting completed and the simple review checks did not find common handoff issues." });
  }

  const reviewCount = items.filter((item) => item.level === "Review" || item.level === "Caution" || item.level === "Cleanup").length + delegationHintCount;
  const severity = reviewCount >= 3 || maxDepth >= 6 ? "Needs refactor" : reviewCount > 0 ? "Review" : "Clean";
  const severityClass = severity === "Clean" ? "free" : severity === "Review" ? "difficulty" : "premium";

  return { items, lineCount, maxDepth, severity, severityClass };
}


export function buildPowerFxReviewNotes(checks: ReturnType<typeof analyzePowerFx>, delegationHints: ReviewHint[]) {
  return [
    "Power Fx review notes",
    "Severity: " + checks.severity,
    "Lines: " + checks.lineCount,
    "Nesting depth: " + checks.maxDepth,
    "",
    ...checks.items.map((item) => "- [" + item.level + "] " + item.title + ": " + item.detail),
    ...delegationHints.map((hint) => "- [Delegation] " + hint.title + ": " + hint.detail)
  ].join("\n");
}

