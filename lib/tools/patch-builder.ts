export type PatchSource = "sharepoint" | "dataverse";
export type PatchMode = "create" | "selected" | "lookup";
export type PatchColumnType = "text" | "number" | "date" | "yesno" | "choice" | "multichoice" | "person" | "lookup";

export type PatchColumn = {
  /** The column's display name, as Power Apps shows it. */
  name: string;
  type: PatchColumnType;
  /** A control name, such as txtTitle or cmbStatus, or any Power Fx value. */
  value: string;
};

export type PatchOptions = {
  source: PatchSource;
  /** The data source name, such as Requests. */
  table: string;
  mode: PatchMode;
  /** Gallery name for "selected", or the ID or GUID value for "lookup". */
  target: string;
  columns: PatchColumn[];
  ifError: boolean;
  /** Variable that keeps the saved record, or empty for none. */
  resultVariable: string;
  /** Reset the named controls after a successful save. */
  resetControls: boolean;
};

export const patchColumnTypeLabels: Record<PatchColumnType, string> = {
  text: "Text",
  number: "Number or currency",
  date: "Date",
  yesno: "Yes/No",
  choice: "Choice",
  multichoice: "Choice, multiple values",
  person: "Person",
  lookup: "Lookup"
};

/** Column names that hold spaces or symbols need single quotes in Power Fx. */
export function fxName(name: string) {
  const clean = name.trim().replace(/^'(.*)'$/, "$1");
  if (!clean) return "";
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(clean) ? clean : `'${clean.replace(/'/g, "''")}'`;
}

type ControlKind = "text" | "pick" | "date" | "toggle" | "slider" | "none";

/** Guess the control type from a common prefix such as txt, cmb or dp. */
export function controlKind(value: string): ControlKind {
  const v = value.trim();
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(v)) return "none";
  if (/^(txt|inp|input|ti|tb)[A-Z_0-9]/.test(v)) return "text";
  if (/^(cmb|cbo|combo|drp|dd|ddl|dropdown|lst|rad|lb)[A-Z_0-9]/.test(v)) return "pick";
  if (/^(dp|dte|dtp|date)[A-Z_0-9]/.test(v)) return "date";
  if (/^(tgl|chk|cb|toggle|checkbox)[A-Z_0-9]/.test(v)) return "toggle";
  if (/^(sld|slider|rating|rtg)[A-Z_0-9]/.test(v)) return "slider";
  return "none";
}

const isCurrentUser = (value: string) => /^(me|user\(\)|current user)$/i.test(value.trim());
const isQuoted = (value: string) => /^".*"$/.test(value.trim());

function personRecord(email: string, displayName: string) {
  return `{
    Claims: "i:0#.f|membership|" & Lower(${email}),
    DisplayName: ${displayName},
    Email: Lower(${email}),
    Department: "",
    JobTitle: "",
    Picture: ""
}`;
}

/** The Power Fx value for one column, plus any notes about it. */
export function columnValue(column: PatchColumn, options: Pick<PatchOptions, "source" | "table">): { value: string; notes: string[] } {
  const raw = column.value.trim();
  const kind = controlKind(raw);
  const notes: string[] = [];
  const sp = options.source === "sharepoint";
  const table = options.table.trim() || "Requests";
  const name = column.name.trim() || "Column";

  if (!raw) return { value: "Blank()", notes: [`${name} has no value, so it is set to Blank().`] };

  switch (column.type) {
    case "text":
      if (kind === "text") return { value: `${raw}.Text`, notes };
      if (kind === "pick") return { value: `${raw}.Selected.Value`, notes };
      return { value: raw, notes };
    case "number":
      if (kind === "text") return { value: `Value(${raw}.Text)`, notes };
      if (kind === "slider") return { value: `${raw}.Value`, notes };
      if (kind === "pick") return { value: `Value(${raw}.Selected.Value)`, notes };
      return { value: raw, notes };
    case "date":
      if (kind === "date") return { value: `${raw}.SelectedDate`, notes };
      if (kind === "text") {
        notes.push(`${name} reads a date typed as text. A date picker avoids values the column can't read.`);
        return { value: `DateValue(${raw}.Text)`, notes };
      }
      if (/^today$/i.test(raw)) return { value: "Today()", notes };
      if (/^now$/i.test(raw)) return { value: "Now()", notes };
      return { value: raw, notes };
    case "yesno":
      if (kind === "toggle") return { value: `${raw}.Value`, notes };
      if (/^(yes|true)$/i.test(raw)) return { value: "true", notes };
      if (/^(no|false)$/i.test(raw)) return { value: "false", notes };
      return { value: raw, notes };
    case "choice":
      if (sp) {
        if (kind === "pick") return { value: `{ Value: ${raw}.Selected.Value }`, notes };
        if (kind === "text") return { value: `{ Value: ${raw}.Text }`, notes };
        if (isQuoted(raw)) return { value: `{ Value: ${raw} }`, notes };
        return { value: `{ Value: "${raw.replace(/"/g, '""')}" }`, notes };
      }
      if (kind === "pick") {
        notes.push(`Set the Items of ${raw} to Choices(${fxName(table)}.${fxName(name)}) so Selected.Value is the choice itself, not text.`);
        return { value: `${raw}.Selected.Value`, notes };
      }
      {
        const option = raw.replace(/^"(.*)"$/, "$1");
        notes.push(`'${name.replace(/^'|'$/g, "")} (${table})' is the name of a choice that belongs to this table. If ${name} uses a global choice, use the choice's own name before the dot instead.`);
        return { value: `'${name.replace(/^'|'$/g, "")} (${table})'.${fxName(option)}`, notes };
      }
    case "multichoice":
      if (kind === "pick") {
        if (sp) return { value: `ForAll(${raw}.SelectedItems, { Value: ThisRecord.Value })`, notes };
        return { value: `${raw}.SelectedItems`, notes };
      }
      if (sp) {
        const values = raw.split(",").map((part) => part.trim().replace(/^"(.*)"$/, "$1")).filter(Boolean);
        return { value: `Table(${values.map((part) => `{ Value: "${part.replace(/"/g, '""')}" }`).join(", ")})`, notes };
      }
      notes.push(`For a fixed set of values on Dataverse, list the options, such as ['${name.replace(/^'|'$/g, "")} (${table})'.Red, '${name.replace(/^'|'$/g, "")} (${table})'.Blue].`);
      return { value: raw, notes };
    case "person":
      if (sp) {
        if (isCurrentUser(raw)) return { value: personRecord("User().Email", "User().FullName"), notes };
        if (kind === "pick") {
          notes.push(`${raw} should list people from Office 365 Users, such as Office365Users.SearchUser({searchTerm: Self.SearchText}). With Choices(${fxName(table)}.${fxName(name)}) as its Items, use ${raw}.Selected instead of building the record.`);
          return { value: personRecord(`${raw}.Selected.Mail`, `${raw}.Selected.DisplayName`), notes };
        }
        if (kind === "text" || raw.includes("@") || isQuoted(raw)) {
          const email = kind === "text" ? `${raw}.Text` : isQuoted(raw) ? raw : `"${raw}"`;
          return { value: personRecord(email, email), notes };
        }
        return { value: raw, notes };
      }
      if (isCurrentUser(raw)) return { value: "LookUp(Users, 'Primary Email' = User().Email)", notes };
      if (kind === "pick") {
        notes.push(`If ${raw} lists Office 365 Users, use LookUp(Users, 'Primary Email' = ${raw}.Selected.Mail) instead. The value must be a row from the Users table.`);
        return { value: `${raw}.Selected`, notes };
      }
      if (kind === "text" || raw.includes("@") || isQuoted(raw)) {
        const email = kind === "text" ? `${raw}.Text` : isQuoted(raw) ? raw : `"${raw}"`;
        return { value: `LookUp(Users, 'Primary Email' = ${email})`, notes };
      }
      return { value: raw, notes };
    case "lookup":
      if (sp) {
        if (kind === "pick") {
          notes.push(`${raw} should list items from the list that ${name} looks up, so it has ID and Title. Id is spelled with a lower-case d.`);
          return { value: `{ Id: ${raw}.Selected.ID, Value: ${raw}.Selected.Title }`, notes };
        }
        if (/^\d+$/.test(raw)) return { value: `{ Id: ${raw}, Value: "" }`, notes };
        return { value: raw, notes };
      }
      if (kind === "pick") {
        notes.push(`${raw} should list rows from the table that ${name} looks up, so Selected is a whole row.`);
        return { value: `${raw}.Selected`, notes };
      }
      return { value: raw, notes };
  }
}

function recordToUpdate(options: PatchOptions) {
  const table = fxName(options.table) || "Requests";
  const target = options.target.trim();
  if (options.mode === "create") return `Defaults(${table})`;
  if (options.mode === "selected") {
    const gallery = target || "galRequests";
    return `${gallery}.Selected`;
  }
  const id = target || "varRecordId";
  if (options.source === "sharepoint") return `LookUp(${table}, ID = ${id})`;
  const singular = (options.table.trim() || "Requests").replace(/s$/, "");
  return `LookUp(${table}, ${fxName(singular)} = ${id})`;
}

const indent = (text: string, spaces: number) => text.split("\n").map((line, index) => (index === 0 ? line : " ".repeat(spaces) + line)).join("\n");

export type PatchResult = { formula: string; notes: string[] };

export function buildPatch(options: PatchOptions): PatchResult {
  const table = fxName(options.table) || "Requests";
  const columns = options.columns.filter((column) => column.name.trim());
  const notes: string[] = [];

  const fields = columns.map((column) => {
    const result = columnValue(column, options);
    notes.push(...result.notes);
    return `${fxName(column.name)}: ${indent(result.value, 8)}`;
  });

  const readOnly = columns.filter((column) => /^(id|created|modified|created by|modified by|author|editor)$/i.test(column.name.trim()));
  if (readOnly.length > 0) notes.push(`${readOnly.map((column) => column.name.trim()).join(", ")} ${readOnly.length === 1 ? "is" : "are"} set by the data source and can't be saved. Remove ${readOnly.length === 1 ? "it" : "them"} from the record.`);
  if (columns.length === 0) notes.push("Add at least one column to save.");

  const record = fields.length > 0 ? `{\n        ${fields.join(",\n        ")}\n    }` : "{ }";
  const patch = `Patch(\n    ${table},\n    ${recordToUpdate(options)},\n    ${record}\n)`;

  if (options.mode === "lookup") {
    notes.push(
      options.source === "sharepoint"
        ? "LookUp by ID finds the item to change. If no item has that ID, Patch fails, so check the ID is not blank first."
        : `The LookUp compares the table's unique ID column, which is named after the table in the singular, here ${fxName((options.table.trim() || "Requests").replace(/s$/, ""))}. Change it if your table's name doesn't end in s.`
    );
  }
  if (options.mode === "selected") notes.push("Only the columns listed are changed. The rest of the selected record is left as it is.");
  if (options.source === "sharepoint" && options.mode === "create" && !columns.some((column) => /^title$/i.test(column.name.trim()))) {
    notes.push("SharePoint lists require Title unless you made it optional in the list settings. Add a Title column if the save fails.");
  }

  const variable = options.resultVariable.trim();
  const resets = options.resetControls
    ? columns.map((column) => column.value.trim()).filter((value) => controlKind(value) !== "none").map((control) => `Reset(${control})`)
    : [];
  const success = [`Notify("Saved.", NotificationType.Success)`, ...resets];
  const failure = `Notify("The record could not be saved: " & FirstError.Message, NotificationType.Error)`;

  if (!options.ifError) {
    const saved = variable ? `Set(\n    ${variable},\n    ${indent(patch, 4)}\n)` : patch;
    return { formula: resets.length > 0 ? `${saved};\n${resets.join(";\n")}` : saved, notes };
  }

  notes.push("IfError shows the data source's own reason if the save fails, such as a required column or a value the column won't take.");

  if (variable) {
    notes.push(`${variable} holds the saved record, with its new ID, or is blank if the save failed.`);
    const formula = `Set(
    ${variable},
    IfError(
        ${indent(patch, 8)},
        ${failure};
        Blank()
    )
);
If(
    !IsBlank(${variable}),
    ${success.join(";\n    ")}
)`;
    return { formula, notes };
  }

  const formula = `IfError(
    ${indent(patch, 4)},
    ${failure},
    ${success.join(";\n    ")}
)`;
  return { formula, notes };
}
