// Checks control, screen, and variable names in Power Apps source code (.pa.yaml, or the YAML
// shown by View code in Studio) against a prefix naming convention.

export type NamedItem = {
  kind: "screen" | "control" | "variable";
  name: string;
  /** Control type, or the kind of variable. */
  type: string;
};

export type NamingFinding = NamedItem & {
  issue: "default" | "prefix";
  message: string;
  suggestion: string;
};

export type NamingReport = {
  items: NamedItem[];
  findings: NamingFinding[];
  counts: { screens: number; controls: number; variables: number; passed: number };
};

/** Control type (lowercase, letters only) to the prefix its name should start with. */
export const defaultPrefixes: Record<string, string> = {
  button: "btn",
  label: "lbl",
  text: "lbl",
  textinput: "txt",
  textbox: "txt",
  gallery: "gal",
  form: "frm",
  formviewer: "frm",
  dropdown: "drp",
  combobox: "cmb",
  checkbox: "chk",
  toggle: "tgl",
  datepicker: "dte",
  icon: "ico",
  image: "img",
  container: "con",
  rectangle: "shp",
  circle: "shp",
  timer: "tmr",
  slider: "sld",
  radio: "rad",
  rating: "rtg",
  htmlviewer: "htm",
  richtexteditor: "rte",
  listbox: "lst",
  datatable: "tbl",
  link: "lnk",
  tablist: "tab",
  attachments: "att",
  barcodereader: "bcr",
  pdfviewer: "pdf",
  camera: "cam"
};

export const variablePrefixes: Record<string, string[]> = {
  "global variable": ["var", "gbl"],
  "context variable": ["loc", "ctx"],
  collection: ["col"]
};

/** Names Studio generates inside forms. They are left alone. */
const generatedName = /^(DataCard|DataCardKey|DataCardValue|ErrorMessage|StarVisible)\d|_DataCard\d+$/;

export function normalizeControlType(type: string) {
  return type
    .replace(/^Classic\//i, "")
    .replace(/@.*$/, "")
    .replace(/[^A-Za-z]/g, "")
    .toLowerCase();
}

/** Parses lines such as "Label = lbl" into type and prefix overrides. */
export function parsePrefixOverrides(text: string) {
  const overrides: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const [type, prefix] = line.split("=").map((part) => part.trim());
    if (type && prefix && /^[A-Za-z]+$/.test(prefix)) overrides[normalizeControlType(type)] = prefix;
  }
  return overrides;
}

export function prefixFor(type: string, prefixes: Record<string, string>) {
  const normalized = normalizeControlType(type);
  if (prefixes[normalized]) return prefixes[normalized];
  // Modern and variant controls: "ModernTextInput", "GroupContainer", "VerticalGallery".
  const match = Object.keys(prefixes)
    .sort((a, b) => b.length - a.length)
    .find((key) => normalized.endsWith(key) || normalized.startsWith(key));
  return match ? prefixes[match] : "";
}

function unquote(name: string) {
  const trimmed = name.trim();
  return /^'.*'$/.test(trimmed) ? trimmed.slice(1, -1).replace(/''/g, "'") : trimmed.replace(/^"(.*)"$/, "$1");
}

const indentOf = (line: string) => line.length - line.trimStart().length;

export function parseSource(source: string): NamedItem[] {
  const items: NamedItem[] = [];
  const lines = source.replace(/\t/g, "  ").split(/\r?\n/);
  const seen = new Set<string>();
  const add = (item: NamedItem) => {
    const key = item.kind + ":" + item.name.toLowerCase();
    if (!item.name || seen.has(key)) return;
    seen.add(key);
    items.push(item);
  };

  let screensIndent = -1;
  let screenNameIndent = -1;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const indent = indentOf(line);

    if (/^\s*Screens:\s*$/.test(line)) {
      screensIndent = indent;
      screenNameIndent = -1;
      continue;
    }
    if (screensIndent >= 0) {
      if (indent <= screensIndent) screensIndent = -1;
      else {
        if (screenNameIndent === -1) screenNameIndent = indent;
        const screen = /^\s*([^-\s].*?):\s*$/.exec(line);
        if (indent === screenNameIndent && screen) add({ kind: "screen", name: unquote(screen[1]), type: "Screen" });
      }
    }

    const listItem = /^\s*-\s+(.+?):\s*$/.exec(line);
    if (listItem) {
      let next = index + 1;
      while (next < lines.length && !lines[next].trim()) next += 1;
      const control = /^\s+Control:\s*(.+?)\s*$/.exec(lines[next] ?? "");
      if (control) add({ kind: "control", name: unquote(listItem[1]), type: control[1] });
    }
  }

  const code = source.replace(/"(?:[^"]|"")*"/g, '""');
  for (const match of code.matchAll(/(?:^|[^A-Za-z0-9_.])Set\(\s*([A-Za-z_][A-Za-z0-9_]*)\s*,/g)) add({ kind: "variable", name: match[1], type: "global variable" });
  for (const match of code.matchAll(/(?:^|[^A-Za-z0-9_.])UpdateContext\(\s*\{([^}]*)\}/g)) {
    for (const field of match[1].matchAll(/(?:^|,)\s*([A-Za-z_][A-Za-z0-9_]*)\s*:/g)) add({ kind: "variable", name: field[1], type: "context variable" });
  }
  for (const match of code.matchAll(/(?:^|[^A-Za-z0-9_.])(?:ClearCollect|Collect)\(\s*([A-Za-z_][A-Za-z0-9_]*)\s*,/g)) add({ kind: "variable", name: match[1], type: "collection" });

  return items;
}

const typeWords = /(Button|Label|Text|TextInput|Input|Gallery|Form|DropDown|Dropdown|ComboBox|Combobox|CheckBox|Checkbox|Toggle|DatePicker|Icon|Image|Container|Rectangle|Timer|Slider|Radio|Screen)$/;

function pascal(name: string) {
  const words = name.split(/[^A-Za-z0-9]+/).filter(Boolean);
  return words.map((word) => word[0].toUpperCase() + word.slice(1)).join("");
}

export function suggestName(name: string, prefix: string) {
  let base = pascal(name);
  const stripped = base.replace(typeWords, "");
  if (stripped) base = stripped;
  return prefix + base;
}

const isDefaultName = (name: string) => /^[A-Za-z]+\d+(_\d+)*$/.test(name);
const hasPrefix = (name: string, prefix: string) => name.startsWith(prefix) && /^[A-Z0-9_]/.test(name.slice(prefix.length));

export function lintNames(source: string, overrides: Record<string, string> = {}): NamingReport {
  const prefixes = { ...defaultPrefixes, ...overrides };
  const items = parseSource(source).filter((item) => !(item.kind === "control" && generatedName.test(item.name)));
  const findings: NamingFinding[] = [];

  for (const item of items) {
    if (item.kind === "screen") {
      if (isDefaultName(item.name)) {
        findings.push({ ...item, issue: "default", message: "Default screen name. It says nothing about what the screen is for.", suggestion: "Name it for its purpose, such as HomeScreen or scrHome." });
      } else if (!/Screen$/.test(item.name) && !hasPrefix(item.name, "scr")) {
        findings.push({ ...item, issue: "prefix", message: "Screen names should end in Screen or start with scr.", suggestion: pascal(item.name) + "Screen" });
      }
    } else if (item.kind === "control") {
      const prefix = prefixFor(item.type, prefixes);
      if (isDefaultName(item.name) && !(prefix && hasPrefix(item.name, prefix))) {
        findings.push({
          ...item,
          issue: "default",
          message: "Default control name. Formulas that refer to it are hard to read.",
          suggestion: prefix ? `${prefix} plus what it is for, such as ${prefix}${prefix === "btn" ? "Submit" : prefix === "gal" ? "Requests" : "Title"}` : "Name it for its purpose."
        });
      } else if (prefix && !hasPrefix(item.name, prefix)) {
        findings.push({ ...item, issue: "prefix", message: `Expected the ${prefix} prefix for this control type.`, suggestion: suggestName(item.name, prefix) });
      }
    } else {
      const allowed = variablePrefixes[item.type] ?? [];
      if (!allowed.some((prefix) => hasPrefix(item.name, prefix))) {
        findings.push({
          ...item,
          issue: "prefix",
          message: `A ${item.type} should start with ${allowed.join(" or ")}.`,
          suggestion: suggestName(item.name, allowed[0])
        });
      }
    }
  }

  const count = (kind: NamedItem["kind"]) => items.filter((item) => item.kind === kind).length;
  return {
    items,
    findings,
    counts: { screens: count("screen"), controls: count("control"), variables: count("variable"), passed: items.length - findings.length }
  };
}

/** A tab-separated rename list that pastes cleanly into Excel or a work item. */
export function findingsTable(findings: NamingFinding[]) {
  return ["Name\tType\tIssue\tSuggested name", ...findings.map((finding) => `${finding.name}\t${finding.type}\t${finding.message}\t${finding.suggestion}`)].join("\n");
}
