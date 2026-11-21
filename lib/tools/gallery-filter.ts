/** Column names that hold spaces or symbols need single quotes in Power Fx. */
function fxName(name: string) {
  const clean = name.trim().replace(/^'(.*)'$/, "$1");
  if (!clean) return "";
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(clean) ? clean : `'${clean.replace(/'/g, "''")}'`;
}

export type GallerySource = "sharepoint" | "dataverse" | "sql";
export type GalleryFilterType = "choice" | "text" | "person" | "lookup" | "yesno" | "daterange";

export type GalleryFilter = {
  type: GalleryFilterType;
  /** The column's display name. */
  column: string;
  /** The control that picks the value. For a date range, the "from" date picker. */
  control: string;
  /** For a date range only: the "to" date picker. */
  controlTo?: string;
};

export type GalleryOptions = {
  source: GallerySource;
  table: string;
  searchControl: string;
  searchColumns: string[];
  filters: GalleryFilter[];
  sortColumn: string;
  sortDescending: boolean;
};

export const galleryFilterLabels: Record<GalleryFilterType, string> = {
  choice: "Choice column, from a dropdown",
  text: "Text column, from a dropdown",
  person: "Person, only my items (toggle)",
  lookup: "Lookup column, from a dropdown",
  yesno: "Yes/No column, from a toggle",
  daterange: "Date column, between two date pickers"
};

export const gallerySourceLabels: Record<GallerySource, string> = {
  sharepoint: "SharePoint",
  dataverse: "Dataverse",
  sql: "SQL Server"
};

export type ControlSetting = { control: string; property: string; value: string };
export type GalleryResult = { items: string; controls: ControlSetting[]; namedFormulas: string[]; notes: string[] };

/** One condition per filter. Each one lets everything through while its control is empty or off. */
function condition(filter: GalleryFilter, options: GalleryOptions, result: GalleryResult): string | null {
  const column = fxName(filter.column);
  const control = filter.control.trim();
  const table = fxName(options.table) || "Requests";
  if (!column) return null;
  const sp = options.source === "sharepoint";

  switch (filter.type) {
    case "choice": {
      const ctl = control || `cmb${filter.column.replace(/[^A-Za-z0-9]/g, "")}`;
      if (options.source === "sql") {
        result.controls.push({ control: ctl, property: "Items", value: `Distinct(${table}, ${column})` });
        result.notes.push(`SQL Server has no choice columns, so ${ctl} lists the distinct values. Distinct isn't delegated, so for a large table list the values from a lookup table instead.`);
        return `(IsBlank(${ctl}.Selected.Value) || ${column} = ${ctl}.Selected.Value)`;
      }
      result.controls.push({ control: ctl, property: "Items", value: `Choices(${table}.${column})` });
      return sp
        ? `(IsBlank(${ctl}.Selected.Value) || ${column}.Value = ${ctl}.Selected.Value)`
        : `(IsBlank(${ctl}.Selected.Value) || ${column} = ${ctl}.Selected.Value)`;
    }
    case "text": {
      const ctl = control || `drp${filter.column.replace(/[^A-Za-z0-9]/g, "")}`;
      result.controls.push({ control: ctl, property: "Items", value: `Distinct(${table}, ${column})` });
      result.notes.push(`Distinct isn't delegated, so ${ctl} only lists values from the first rows of ${options.table.trim() || "the table"}. For a long list, keep the values in a small list or table of their own and use that as Items.`);
      return `(IsBlank(${ctl}.Selected.Value) || ${column} = ${ctl}.Selected.Value)`;
    }
    case "person": {
      const ctl = control || "tglMyItems";
      if (sp) return `(${ctl}.Value = false || ${column}.Email = User().Email)`;
      if (options.source === "dataverse") {
        if (!result.namedFormulas.some((formula) => formula.startsWith("CurrentUser"))) {
          result.namedFormulas.push("CurrentUser = LookUp(Users, 'Primary Email' = User().Email);");
        }
        return `(${ctl}.Value = false || ${column} = CurrentUser)`;
      }
      result.notes.push(`On SQL Server, ${filter.column.trim()} is taken to hold the user's email address as text.`);
      return `(${ctl}.Value = false || ${column} = User().Email)`;
    }
    case "lookup": {
      const ctl = control || `cmb${filter.column.replace(/[^A-Za-z0-9]/g, "")}`;
      if (sp) {
        result.controls.push({ control: ctl, property: "Items", value: `Choices(${table}.${column})` });
        result.notes.push(`On SharePoint the lookup is matched on its Id, which SharePoint can filter on itself, so the whole list is searched.`);
        return `(IsBlank(${ctl}.Selected) || ${column}.Id = ${ctl}.Selected.Id)`;
      }
      if (options.source === "dataverse") {
        result.controls.push({ control: ctl, property: "Items", value: `Choices(${table}.${column})` });
        return `(IsBlank(${ctl}.Selected) || ${column} = ${ctl}.Selected)`;
      }
      result.notes.push(`On SQL Server a lookup is a foreign key column, so ${ctl} should list the other table and ${filter.column.trim()} hold its ID.`);
      return `(IsBlank(${ctl}.Selected) || ${column} = ${ctl}.Selected.ID)`;
    }
    case "yesno": {
      const ctl = control || `tgl${filter.column.replace(/[^A-Za-z0-9]/g, "")}`;
      return `(${ctl}.Value = false || ${column} = true)`;
    }
    case "daterange": {
      const from = control || "dpFrom";
      const to = filter.controlTo?.trim() || "dpTo";
      return `(IsBlank(${from}.SelectedDate) || ${column} >= ${from}.SelectedDate) &&\n(IsBlank(${to}.SelectedDate) || ${column} < DateAdd(${to}.SelectedDate, 1, TimeUnit.Days))`;
    }
  }
}

export function buildGalleryItems(options: GalleryOptions): GalleryResult {
  const result: GalleryResult = { items: "", controls: [], namedFormulas: [], notes: [] };
  const table = fxName(options.table) || "Requests";
  const search = options.searchControl.trim();
  const searchColumns = options.searchColumns.map(fxName).filter(Boolean);
  const conditions: string[] = [];

  for (const filter of options.filters) {
    const built = condition(filter, options, result);
    if (built) conditions.push(built);
  }

  let useSearchFunction = false;
  if (search && searchColumns.length > 0) {
    if (options.source === "sharepoint") {
      const parts = searchColumns.map((column) => `StartsWith(${column}, ${search}.Text)`);
      conditions.unshift(parts.length === 1 ? parts[0] : `(${parts.join(" || ")})`);
      result.notes.push("SharePoint can't delegate Search or the in operator, so the search matches the start of each column. Searching \"inv\" finds \"Invoice 42\" but not \"Late invoice\".");
    } else {
      useSearchFunction = true;
    }
  }

  let items = conditions.length > 0 ? `Filter(\n    ${table},\n    ${conditions.map((part) => indent(part, 4)).join(" &&\n    ")}\n)` : table;
  if (useSearchFunction) {
    items = `Search(\n    ${indent(items, 4)},\n    ${search}.Text,\n    ${searchColumns.join(",\n    ")}\n)`;
    result.notes.push(`${gallerySourceLabels[options.source]} delegates Search, so it finds the text anywhere in ${searchColumns.length === 1 ? "the column" : "the columns"}, across the whole table. An empty search box shows every row.`);
  }

  const sort = fxName(options.sortColumn);
  if (sort) {
    items = `Sort(\n    ${indent(items, 4)},\n    ${sort},\n    SortOrder.${options.sortDescending ? "Descending" : "Ascending"}\n)`;
  }
  result.items = items;

  if (search) {
    result.controls.unshift({ control: search, property: "DelayOutput", value: "true" });
    result.notes.push(`DelayOutput on ${search} waits until the user stops typing, so the gallery doesn't reload on every key.`);
  }
  // A dropdown always has a value unless AllowEmptySelection is on. A combo box starts empty and can be cleared.
  const dropdowns = result.controls.filter((setting) => setting.property === "Items" && /^(drp|dd|ddl|dropdown)/i.test(setting.control));
  for (const dropdown of dropdowns) result.controls.push({ control: dropdown.control, property: "AllowEmptySelection", value: "true" });
  if (result.controls.some((setting) => setting.property === "Items")) {
    result.notes.push("A filter shows everything while its dropdown or combo box is empty, so the user clears it to see all rows again. Dropdowns need AllowEmptySelection turned on for that.");
  }
  if (result.namedFormulas.length > 0) {
    result.notes.push("Add CurrentUser to App.Formulas so the user is looked up once, not for every row.");
  }
  if (conditions.length === 0 && !useSearchFunction) result.notes.push("Add a search box or a filter to build a formula.");
  return result;
}

const indent = (text: string, spaces: number) => text.split("\n").map((line, index) => (index === 0 ? line : " ".repeat(spaces) + line)).join("\n");
