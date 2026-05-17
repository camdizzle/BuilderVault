import Link from "next/link";
import type { ReactNode } from "react";
import { CopyCodeBlock } from "@/components/ui/copy-code-block";
import type { ResourceItem } from "@/lib/resources";

const parentPathByKind = {
  cookbook: "/cookbooks",
  standard: "/standards",
  "cheat-sheet": "/cheat-sheets",
  tool: "/tools"
};

const parentLabelByKind = {
  cookbook: "Cookbooks",
  standard: "Standards",
  "cheat-sheet": "Cheat sheets",
  tool: "Free tools"
};

export function ResourceDetailPage({ children, resource }: { children?: ReactNode; resource: ResourceItem }) {
  return (
    <article style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 30 }}>
        <nav aria-label="Breadcrumb" className="badge-row">
          <Link href="/resources" style={{ color: "var(--accent-strong)", fontWeight: 800 }}>Resources</Link>
          <span aria-hidden="true" style={{ color: "var(--muted)" }}>/</span>
          <Link href={parentPathByKind[resource.kind]} style={{ color: "var(--accent-strong)", fontWeight: 800 }}>
            {parentLabelByKind[resource.kind]}
          </Link>
        </nav>

        <header style={{ maxWidth: 940 }}>
          <div className="eyebrow">{resource.eyebrow}</div>
          <h1 className="page-title">{resource.title}</h1>
          <p className="lead">{resource.description}</p>
          <div className="badge-row" style={{ marginTop: 18 }}>
            {resource.keywords.map((keyword) => <span className="badge" key={keyword}>{keyword}</span>)}
          </div>
        </header>

        <div className="grid" style={{ gridTemplateColumns: "minmax(0, 0.72fr) minmax(260px, 0.28fr)" }}>
          <div className="card" style={{ display: "grid", gap: 28, padding: 24 }}>
            <section style={{ display: "grid", gap: 12 }}>
              <h2 className="section-title" style={{ fontSize: "1.8rem" }}>Who this helps</h2>
              <p style={{ color: "#415049", lineHeight: 1.7, margin: 0 }}>{resource.audience}</p>
            </section>
            <section style={{ display: "grid", gap: 12 }}>
              <h2 className="section-title" style={{ fontSize: "1.8rem" }}>What to standardize</h2>
              <ul style={{ color: "#415049", lineHeight: 1.75, margin: 0, paddingLeft: 20 }}>
                {resource.summaryBullets.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>
            {children}

            <section style={{ display: "grid", gap: 18 }}>
              <h2 className="section-title" style={{ fontSize: "1.8rem" }}>Examples</h2>
              {resource.examples.map((example) => (
                <div key={example.title} style={{ display: "grid", gap: 12 }}>
                  <h3 style={{ fontSize: "1.25rem", margin: 0 }}>{example.title}</h3>
                  <p style={{ color: "#415049", lineHeight: 1.7, margin: 0 }}>{example.problem}</p>
                  {example.code ? <CopyCodeBlock code={example.code} /> : null}
                  {example.expectedResult ? (
                    <p style={{ color: "#415049", lineHeight: 1.7, margin: 0 }}>
                      <strong style={{ color: "var(--foreground)" }}>Expected result:</strong> {example.expectedResult}
                    </p>
                  ) : null}
                  {example.commonMistakes.length > 0 ? (
                    <div>
                      <h4 style={{ margin: "0 0 8px" }}>Common mistakes</h4>
                      <ul style={{ color: "#415049", lineHeight: 1.75, margin: 0, paddingLeft: 20 }}>
                        {example.commonMistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ))}
            </section>
          </div>
          <aside style={{ display: "grid", gap: 18, alignSelf: "start" }}>
            <div className="card" style={{ padding: 20 }}>
              <h2 style={{ fontSize: "1.15rem", marginTop: 0 }}>Related patterns</h2>
              <div style={{ display: "grid", gap: 10 }}>
                {resource.relatedPatterns.map((slug) => (
                  <Link href={`/patterns/${slug}`} key={slug}>{slug.replaceAll("-", " ")}</Link>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <h2 style={{ fontSize: "1.15rem", marginTop: 0 }}>Resource set</h2>
              <p style={{ color: "var(--muted)", lineHeight: 1.6, marginTop: 0 }}>
                Original BuilderVault guidance that links reusable reference material back to the pattern library.
              </p>
              <Link className="button secondary" href={parentPathByKind[resource.kind]}>View more</Link>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
