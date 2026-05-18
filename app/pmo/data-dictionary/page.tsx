import Link from "next/link";
import { BulletList } from "@/components/patterns/bullet-list";
import {
  getPmoDeepDiveBySlug,
  getPmoSolutionMapBySlug,
  getPmoStageBySlug,
  pmoLifecycleStages,
  pmoTableSpecs
} from "@/lib/pmo-toolkit";

export const metadata = {
  title: "PMO Data Dictionary | BuilderVault",
  description: "A BuilderVault data dictionary for PMO tables, fields, relationships, indexes, statuses, measures, and solution components."
};

export default function PmoDataDictionaryPage() {
  const allTables = Object.values(pmoTableSpecs).flat();
  const requiredFieldCount = allTables.reduce((count, table) => count + table.columns.filter((column) => column.required).length, 0);
  const totalFieldCount = allTables.reduce((count, table) => count + table.columns.length, 0);

  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 32 }}>
        <nav aria-label="Breadcrumb" className="badge-row">
          <Link href="/pmo" style={{ color: "var(--accent-strong)", fontWeight: 800 }}>PMO toolkit</Link>
          <span aria-hidden="true" style={{ color: "var(--muted)" }}>/</span>
          <span style={{ color: "var(--muted)" }}>Data dictionary</span>
        </nav>

        <header style={{ display: "grid", gap: 14, maxWidth: 980 }}>
          <div className="eyebrow">PMO technical reference</div>
          <h1 className="page-title">PMO data dictionary</h1>
          <p className="lead">
            A consolidated reference for PMO tables, columns, relationships, indexes, status models, Power BI measures, and Dataverse solution components across the build-your-own PMO toolkit.
          </p>
        </header>

        <section className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <Stat label="Modules" value={pmoLifecycleStages.length.toString()} />
          <Stat label="Tables or lists" value={allTables.length.toString()} />
          <Stat label="Fields" value={totalFieldCount.toString()} />
          <Stat label="Required fields" value={requiredFieldCount.toString()} />
        </section>

        <section className="surface" style={{ borderRadius: 12, padding: 24 }}>
          <div style={{ display: "grid", gap: 14, maxWidth: 920 }}>
            <div className="eyebrow">How to use this</div>
            <h2 className="section-title">Treat this as the build contract for PMO data.</h2>
            <p style={{ color: "#415049", lineHeight: 1.7, margin: 0 }}>
              Start with the tables for the phase you are building, then confirm required fields, relationships, indexes, status values, and reporting measures before creating screens or flows. The table names are intentionally plain-language so they can be implemented in SharePoint first or mapped to Dataverse schema names later.
            </p>
            <div className="badge-row">
              <a className="button" download href="/pmo-guides/pmo-data-dictionary.md">Download data dictionary</a>
              <Link className="button secondary" href="/pmo/architecture">Open architecture</Link>
              <Link className="button secondary" href="/pmo/bundle">Open implementation bundle</Link>
            </div>
          </div>
        </section>

        <section style={{ display: "grid", gap: 26 }}>
          {pmoLifecycleStages.map((stage) => {
            const tables = pmoTableSpecs[stage.slug] ?? [];
            const deepDive = getPmoDeepDiveBySlug(stage.slug);
            const solution = getPmoSolutionMapBySlug(stage.slug);
            const stageRecord = getPmoStageBySlug(stage.slug);

            return (
              <article className="card" key={stage.slug} style={{ display: "grid", gap: 22, padding: 24 }}>
                <div className="badge-row">
                  <span className="badge free">{stageRecord?.title}</span>
                  <Link href={`/pmo/packages/${stage.slug}`} style={{ color: "var(--accent-strong)", fontWeight: 800 }}>Implementation package</Link>
                </div>
                <div style={{ display: "grid", gap: 8, maxWidth: 940 }}>
                  <h2 style={{ fontSize: "1.45rem", lineHeight: 1.2, margin: 0 }}>{stage.title}</h2>
                  <p style={{ color: "#415049", lineHeight: 1.65, margin: 0 }}>{stage.summary}</p>
                </div>

                <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
                  {deepDive ? <MiniPanel title="Status model" items={deepDive.statusModel} /> : null}
                  {deepDive ? <MiniPanel title="Power BI measures" items={deepDive.powerBiMeasures} /> : null}
                  {solution ? <MiniPanel title="Dataverse tables" items={solution.tables} /> : null}
                  {solution ? <MiniPanel title="Choices" items={solution.choices} /> : null}
                </div>

                <div style={{ display: "grid", gap: 18 }}>
                  {tables.map((table) => (
                    <section className="surface" key={table.name} style={{ borderRadius: 10, display: "grid", gap: 14, padding: 18 }}>
                      <div className="badge-row">
                        <span className="badge free">{table.platform}</span>
                        <span className="badge">{table.name}</span>
                      </div>
                      <p style={{ color: "#415049", lineHeight: 1.6, margin: 0 }}>{table.purpose}</p>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ borderCollapse: "collapse", minWidth: 820, width: "100%" }}>
                          <thead>
                            <tr>
                              {["Field", "Type", "Required", "Notes"].map((heading) => (
                                <th key={heading} style={headerCell}>{heading}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {table.columns.map((column) => (
                              <tr key={column.name}>
                                <td style={bodyCell}><strong>{column.name}</strong></td>
                                <td style={bodyCell}>{column.type}</td>
                                <td style={bodyCell}>{column.required ? "Yes" : "No"}</td>
                                <td style={bodyCell}>{column.notes}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
                        <MiniPanel title="Relationships" items={table.relationships} />
                        <MiniPanel title="Recommended indexes" items={table.indexes} />
                      </div>
                    </section>
                  ))}
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </section>
  );
}

const headerCell = { borderBottom: "1px solid var(--line)", padding: "9px 10px", textAlign: "left" } as const;
const bodyCell = { borderBottom: "1px solid var(--line)", color: "#415049", lineHeight: 1.5, padding: "9px 10px", verticalAlign: "top" } as const;

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-tile">
      <div style={{ fontSize: "2rem", fontWeight: 800 }}>{value}</div>
      <div style={{ color: "var(--muted)" }}>{label}</div>
    </div>
  );
}

function MiniPanel({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="surface" style={{ borderRadius: 10, padding: 16 }}>
      <h3 style={{ fontSize: "1rem", margin: "0 0 10px" }}>{title}</h3>
      <BulletList items={items} />
    </div>
  );
}


