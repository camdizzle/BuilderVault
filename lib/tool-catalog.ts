// How the tools are grouped and labelled on the tools index and in tool page breadcrumbs.
// Every tool in lib/resources.ts needs an entry here (scripts/tests/tool-registry.test.mjs checks it).

export type ToolGroupId = "power-apps" | "power-automate" | "sharepoint-dataverse" | "fix-release";

export type ToolGroup = {
  id: ToolGroupId;
  label: string;
  /** Short text shown under the group heading on the tools index. */
  description: string;
  color: string;
  background: string;
};

export const toolGroups: ToolGroup[] = [
  {
    id: "power-apps",
    label: "Power Apps",
    description: "Format, check and generate Power Fx for canvas apps.",
    color: "#742774",
    background: "#f7e7f7"
  },
  {
    id: "power-automate",
    label: "Power Automate",
    description: "Expressions, filters, schemas, triggers and cards for cloud flows.",
    color: "#0f6cbd",
    background: "#e6f1fb"
  },
  {
    id: "sharepoint-dataverse",
    label: "SharePoint and Dataverse",
    description: "Column names, formatting JSON and REST calls for your data.",
    color: "#03787c",
    background: "#e3f5f5"
  },
  {
    id: "fix-release",
    label: "Fix and release",
    description: "Find the fix for an error message and plan a solution release.",
    color: "#107c10",
    background: "#e8f5e8"
  }
];

export type ToolCatalogEntry = {
  group: ToolGroupId;
  /** One or two characters shown in the tool's icon square. */
  glyph: string;
  /** One-line description for tool cards. */
  tagline: string;
  /** Shown in the "Most used" row on the tools index. */
  popular?: boolean;
  /**
   * Set only after the tool's rules were checked against these Microsoft pages. Shown under the tool.
   * Re-check and update the date when Microsoft changes the pages.
   */
  docs?: { what: string; checked: string; sources: Array<{ label: string; href: string }> };
};

const delegationDocs = {
  checked: "2026-11-28",
  sources: [
    { label: "Delegation overview", href: "https://learn.microsoft.com/power-apps/maker/canvas-apps/delegation-overview" },
    { label: "SharePoint delegation", href: "https://learn.microsoft.com/power-apps/maker/canvas-apps/connections/connection-sharepoint-online" }
  ]
};

export const toolCatalog: Record<string, ToolCatalogEntry> = {
  "power-fx-formatter": { group: "power-apps", glyph: "Fx", tagline: "Format, minify and review a formula, with a delegation check.", popular: true, docs: { what: "The delegation check", ...delegationDocs } },
  "power-automate-expression-builder": { group: "power-automate", glyph: "{ }", tagline: "Expressions for dates, empty values, text, arrays and approvals.", popular: true },
  "odata-filter-query-builder": { group: "power-automate", glyph: "?=", tagline: "Filter Query text for Get items and List rows, quoted correctly.", popular: true },
  "power-apps-delegation-checker": { group: "power-apps", glyph: "Dg", tagline: "See which functions delegate for SharePoint, Dataverse, SQL or Excel.", docs: { what: "The delegation rules", ...delegationDocs } },
  "patch-formula-builder": { group: "power-apps", glyph: "Pa", tagline: "Pick columns and controls, get a typed Patch wrapped in IfError." },
  "gallery-search-filter-builder": { group: "power-apps", glyph: "Ga", tagline: "A delegation-friendly gallery Items formula with search and filters." },
  "excel-to-power-fx": { group: "power-apps", glyph: "XL", tagline: "Translate Excel formulas such as VLOOKUP and SUMIF into Power Fx." },
  "onstart-to-named-formulas": { group: "power-apps", glyph: "Nf", tagline: "Move App.OnStart code into named formulas in App.Formulas." },
  "csv-to-power-fx-table": { group: "power-apps", glyph: "Tb", tagline: "Turn CSV, Excel rows or JSON into a Power Fx Table()." },
  "power-apps-naming-linter": { group: "power-apps", glyph: "Ab", tagline: "Check control, screen and variable names against a convention." },
  "power-apps-color-token-generator": { group: "power-apps", glyph: "#", tagline: "Turn brand hex colors into Power Fx color tokens." },
  "power-fx-regex-tester": { group: "power-apps", glyph: "Rx", tagline: "Test IsMatch, Match and MatchAll patterns with Power Apps defaults.",
    docs: {
      what: "The defaults, options and warnings",
      checked: "2026-11-28",
      sources: [
        { label: "Regular expressions in Power Fx", href: "https://learn.microsoft.com/power-platform/power-fx/regular-expressions" },
        { label: "IsMatch, Match and MatchAll", href: "https://learn.microsoft.com/power-platform/power-fx/reference/function-ismatch" }
      ]
    }
  },
  "trigger-condition-builder": { group: "power-automate", glyph: "If", tagline: "Trigger conditions that stop a flow running on every change." },
  "parse-json-schema-generator": { group: "power-automate", glyph: "JS", tagline: "A Parse JSON schema that won't fail on empty fields." },
  "date-format-tester": { group: "power-automate", glyph: "Dt", tagline: "Test formatDateTime and time zone strings on a sample date." },
  "recurrence-schedule-planner": { group: "power-automate", glyph: "Rc", tagline: "Preview the next 10 runs of a Recurrence trigger in your time zone." },
  "adaptive-card-preview-snippets": { group: "power-automate", glyph: "AC", tagline: "Build and preview Adaptive Card JSON for Teams." },
  "sharepoint-internal-name-helper": { group: "sharepoint-dataverse", glyph: "_x", tagline: "See the internal name SharePoint gives a column, and a cleaner one." },
  "sharepoint-column-formatting-builder": { group: "sharepoint-dataverse", glyph: "CF", tagline: "Column formatting JSON for status pills, bars, dates and links." },
  "sharepoint-http-request-builder": { group: "sharepoint-dataverse", glyph: "API", tagline: "Build Send an HTTP request to SharePoint calls for a flow." },
  "dataverse-table-naming-helper": { group: "sharepoint-dataverse", glyph: "Dv", tagline: "Schema and logical names for tables and columns from your prefix." },
  "deployment-settings-generator": {
    group: "fix-release",
    glyph: "DS",
    tagline: "A deploymentSettings.json per environment for pac and DevOps imports.",
    docs: {
      what: "The file format and pac commands",
      checked: "2026-11-28",
      sources: [
        { label: "Pre-populate connection references and environment variables", href: "https://learn.microsoft.com/power-platform/alm/conn-ref-env-variables-build-tools" },
        { label: "pac solution", href: "https://learn.microsoft.com/power-platform/developer/cli/reference/solution" }
      ]
    }
  },
  "error-message-finder": { group: "fix-release", glyph: "!", tagline: "Paste an error message and find the page that explains the fix." },
  "solution-layering-checklist-generator": { group: "fix-release", glyph: "Ck", tagline: "A release checklist that fits what your solution contains." }
};

export function getToolGroup(id: ToolGroupId) {
  return toolGroups.find((group) => group.id === id) ?? toolGroups[0];
}

/** The catalog entry for a tool, with a safe fallback so a missing entry never breaks a page. */
export function getToolCatalogEntry(slug: string): ToolCatalogEntry {
  return toolCatalog[slug] ?? { group: "power-apps", glyph: "BV", tagline: "" };
}
