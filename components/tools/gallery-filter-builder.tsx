"use client";

import Link from "next/link";

import { useSavedState } from "@/components/tools/saved-state";
import { CopyCodeBlock } from "@/components/ui/copy-code-block";
import { Toggle, ToolNotes, ToolShell } from "@/components/resources/tool-shell";
import { formatterLink } from "@/lib/tools/formula-link";
import {
  buildGalleryItems,
  galleryFilterLabels,
  gallerySourceLabels,
  type GalleryFilter,
  type GalleryFilterType,
  type GallerySource
} from "@/lib/tools/gallery-filter";

const starterFilters: GalleryFilter[] = [
  { type: "choice", column: "Status", control: "cmbStatus" },
  { type: "person", column: "Assigned To", control: "tglMyItems" },
  { type: "daterange", column: "Created", control: "dpFrom", controlTo: "dpTo" }
];

const controlLabel: Record<GalleryFilterType, string> = {
  choice: "Dropdown or combo box",
  text: "Dropdown or combo box",
  person: "Toggle",
  lookup: "Combo box",
  yesno: "Toggle",
  daterange: "From date picker"
};

const controlPlaceholder: Record<GalleryFilterType, string> = {
  choice: "cmbStatus",
  text: "drpDepartment",
  person: "tglMyItems",
  lookup: "cmbCustomer",
  yesno: "tglUrgent",
  daterange: "dpFrom"
};

export function GalleryFilterBuilder() {
  const [source, setSource] = useSavedState<GallerySource>("source", "sharepoint");
  const [table, setTable] = useSavedState("table", "Requests");
  const [useSearch, setUseSearch] = useSavedState("useSearch", true);
  const [searchControl, setSearchControl] = useSavedState("searchControl", "txtSearch");
  const [searchColumns, setSearchColumns] = useSavedState("searchColumns", "Title");
  const [filters, setFilters] = useSavedState<GalleryFilter[]>("filters", starterFilters);
  const [sortColumn, setSortColumn] = useSavedState("sortColumn", "Created");
  const [sortDescending, setSortDescending] = useSavedState("sortDescending", true);

  const result = buildGalleryItems({
    source,
    table,
    searchControl: useSearch ? searchControl : "",
    searchColumns: useSearch ? searchColumns.split(",").map((column) => column.trim()).filter(Boolean) : [],
    filters,
    sortColumn,
    sortDescending
  });

  function updateFilter(index: number, patch: Partial<GalleryFilter>) {
    setFilters((current) => current.map((filter, filterIndex) => (filterIndex === index ? { ...filter, ...patch } : filter)));
  }

  return (
    <ToolShell
      title="Gallery search and filter builder"
      description="Describe the search box, dropdowns and toggles above your gallery. The tool writes the gallery's Items formula so each filter can be left empty, and keeps it delegable for the data source you pick."
    >
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <label className="field">
          <span>Data source type</span>
          <select onChange={(event) => setSource(event.target.value as GallerySource)} value={source}>
            {(Object.keys(gallerySourceLabels) as GallerySource[]).map((key) => (
              <option key={key} value={key}>{gallerySourceLabels[key]}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{source === "sharepoint" ? "List name" : "Table name"}</span>
          <input onChange={(event) => setTable(event.target.value)} spellCheck={false} value={table} />
        </label>
        <label className="field">
          <span>Sort by column (optional)</span>
          <input onChange={(event) => setSortColumn(event.target.value)} spellCheck={false} value={sortColumn} />
        </label>
      </div>
      <div className="badge-row">
        <Toggle checked={useSearch} label="Search box" onChange={setUseSearch} />
        {sortColumn.trim() ? <Toggle checked={sortDescending} label="Newest or largest first" onChange={setSortDescending} /> : null}
      </div>
      {useSearch ? (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
          <label className="field">
            <span>Search box name</span>
            <input onChange={(event) => setSearchControl(event.target.value)} spellCheck={false} value={searchControl} />
          </label>
          <label className="field">
            <span>Text columns to search, split by commas</span>
            <input onChange={(event) => setSearchColumns(event.target.value)} spellCheck={false} value={searchColumns} />
          </label>
        </div>
      ) : null}

      <div style={{ display: "grid", gap: 14 }}>
        {filters.map((filter, index) => (
          <fieldset key={index} style={{ border: "1px solid var(--line)", borderRadius: 8, display: "grid", gap: 10, margin: 0, padding: 14 }}>
            <legend style={{ fontWeight: 800, padding: "0 6px" }}>Filter {index + 1}</legend>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
              <label className="field">
                <span>Filter type</span>
                <select onChange={(event) => updateFilter(index, { type: event.target.value as GalleryFilterType, control: "" })} value={filter.type}>
                  {(Object.keys(galleryFilterLabels) as GalleryFilterType[]).map((type) => (
                    <option key={type} value={type}>{galleryFilterLabels[type]}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Column name, as shown in the app</span>
                <input onChange={(event) => updateFilter(index, { column: event.target.value })} spellCheck={false} value={filter.column} />
              </label>
              <label className="field">
                <span>{controlLabel[filter.type]}</span>
                <input onChange={(event) => updateFilter(index, { control: event.target.value })} placeholder={controlPlaceholder[filter.type]} spellCheck={false} value={filter.control} />
              </label>
              {filter.type === "daterange" ? (
                <label className="field">
                  <span>To date picker</span>
                  <input onChange={(event) => updateFilter(index, { controlTo: event.target.value })} placeholder="dpTo" spellCheck={false} value={filter.controlTo ?? ""} />
                </label>
              ) : null}
            </div>
            <div>
              <button className="link-button" onClick={() => setFilters((current) => current.filter((_, filterIndex) => filterIndex !== index))} style={{ color: "var(--accent-strong)" }} type="button">
                Remove filter
              </button>
            </div>
          </fieldset>
        ))}
        <div>
          <button className="button secondary" onClick={() => setFilters((current) => [...current, { type: "choice", column: "", control: "" }])} type="button">
            Add filter
          </button>
        </div>
      </div>

      <CopyCodeBlock code={result.items} copyEvent="Gallery Filter Copied" label="Gallery Items" />
      <div>
        <Link className="button secondary" href={formatterLink(result.items)}>
          Check it in the Power Fx formatter
        </Link>
      </div>
      {result.namedFormulas.length > 0 ? <CopyCodeBlock code={result.namedFormulas.join("\n")} copyEvent="Gallery Filter Copied" label="App.Formulas" /> : null}
      {result.controls.length > 0 ? (
        <CopyCodeBlock
          code={result.controls.map((setting) => `${setting.control}.${setting.property}: ${setting.value}`).join("\n")}
          copyEvent="Gallery Filter Copied"
          label="Control settings"
        />
      ) : null}
      <ToolNotes notes={result.notes} />
    </ToolShell>
  );
}
