import Link from "next/link";
import { BulletList } from "@/components/patterns/bullet-list";
import { getPmoStageBySlug, pmoModuleComparisons } from "@/lib/pmo-toolkit";

export const metadata = {
  title: "PMO Module Comparison Matrix | BuilderVault",
  robots: { index: false, follow: false }
};

const headings = ["Module", "Build when", "Complexity", "First release", "Working signals"];

export default function PmoComparePage() {
  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 30 }}>
        <PmoBreadcrumb current="Module comparison" />
        <header style={{ display: "grid", gap: 14, maxWidth: 980 }}>
          <div className="eyebrow">Hidden PMO decision matrix</div>
          <h1 className="page-title">PMO module comparison matrix</h1>
          <p className="lead">Compare each PMO build module by business trigger, complexity, dependencies, first release scope, and signals that the module is working.</p>
        </header>

        <div className="card" style={{ overflowX: "auto", padding: 18 }}>
          <table style={{ borderCollapse: "collapse", minWidth: 980, width: "100%" }}>
            <thead>
              <tr>{headings.map((heading) => <th key={heading} style={{ borderBottom: "1px solid var(--line)", padding: "10px", textAlign: "left" }}>{heading}</th>)}</tr>
            </thead>
            <tbody>
              {pmoModuleComparisons.map((item) => {
                const stage = getPmoStageBySlug(item.slug);
                return (
                  <tr key={item.slug}>
                    <td style={cellStyle}><Link href={`/pmo/${item.slug}`} style={{ fontWeight: 800 }}>{stage?.title ?? item.slug}</Link></td>
                    <td style={cellStyle}>{item.buildWhen}</td>
                    <td style={cellStyle}><span className="badge free">{item.complexity}</span></td>
                    <td style={cellStyle}>{item.firstReleaseScope.join("; ")}</td>
                    <td style={cellStyle}>{item.workingSignals.join("; ")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <section style={{ display: "grid", gap: 18 }}>
          {pmoModuleComparisons.map((item) => {
            const stage = getPmoStageBySlug(item.slug);
            return (
              <article className="card" key={item.slug} style={{ display: "grid", gap: 18, padding: 22 }}>
                <div className="badge-row">
                  <span className="badge free">{item.complexity}</span>
                  <Link href={`/pmo/packages/${item.slug}`} style={{ color: "var(--accent-strong)", fontWeight: 800 }}>Implementation package</Link>
                </div>
                <h2 style={{ fontSize: "1.35rem", margin: 0 }}>{stage?.title}</h2>
                <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
                  <MiniPanel title="Dependencies" items={item.dependencies} />
                  <MiniPanel title="Data sources" items={item.dataSources} />
                  <MiniPanel title="Power Apps screens" items={item.appScreens} />
                  <MiniPanel title="Power Automate" items={item.automations} />
                  <MiniPanel title="Power BI outputs" items={item.reports} />
                  <MiniPanel title="Signs it works" items={item.workingSignals} />
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </section>
  );
}

const cellStyle = { borderBottom: "1px solid var(--line)", color: "#415049", lineHeight: 1.5, padding: "10px", verticalAlign: "top" } as const;

function MiniPanel({ items, title }: { items: string[]; title: string }) {
  return <div className="surface" style={{ borderRadius: 10, padding: 16 }}><h3 style={{ fontSize: "1rem", margin: "0 0 10px" }}>{title}</h3><BulletList items={items} /></div>;
}

function PmoBreadcrumb({ current }: { current: string }) {
  return <nav aria-label="Breadcrumb" className="badge-row"><Link href="/pmo" style={{ color: "var(--accent-strong)", fontWeight: 800 }}>PMO toolkit</Link><span aria-hidden="true" style={{ color: "var(--muted)" }}>/</span><span style={{ color: "var(--muted)" }}>{current}</span></nav>;
}
