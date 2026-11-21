import Link from "next/link";
import { FunctionCard } from "@/components/functions/function-card";
import { GuideCard } from "@/components/guides/guide-card";
import { categoryIntro, functionCategories, functionPages, getFunctionsByCategory } from "@/lib/functions";
import { getGuideBySlug, type Guide } from "@/lib/guides";

export const metadata = {
  title: "Power Fx Function Reference for Power Apps: Syntax, Examples and Delegation | BuilderVault",
  description: "The Power Apps functions you use most, one page each: Filter, LookUp, Search, Sort, Patch, Collect, If, Switch, IfError, ForAll, Text, DateDiff, Navigate, Set and more, with syntax, worked examples, delegation notes and common mistakes.",
  alternates: { canonical: "/functions" }
};

const guideSlugs = ["format-power-fx-formulas", "fix-common-power-fx-formula-errors", "power-apps-delegation-warning-explained"];

export default function FunctionsPage() {
  const guides = guideSlugs.map((slug) => getGuideBySlug(slug)).filter((guide): guide is Guide => Boolean(guide));

  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 34 }}>
        <nav aria-label="Breadcrumb" className="badge-row">
          <Link href="/resources" style={{ color: "var(--accent-strong)", fontWeight: 800 }}>Resources</Link>
        </nav>
        <div style={{ maxWidth: 940 }}>
          <div className="eyebrow">Power Fx function reference</div>
          <h1 className="page-title">Power Fx functions for Power Apps, with examples you can copy.</h1>
          <p className="lead">
            {functionPages.length} of the functions canvas app makers use most, one page each: the syntax, what it returns, whether SharePoint and Dataverse can run it on the server, worked examples and the mistakes people make. Paste any formula into the <Link href="/tools/power-fx-formatter" style={{ color: "var(--accent-strong)", fontWeight: 700 }}>Power Fx formatter</Link> to tidy it, and see the <Link href="/guides" style={{ color: "var(--accent-strong)", fontWeight: 700 }}>how-to guides</Link> for side-by-side comparisons.
          </p>
        </div>

        {functionCategories.map((category) => (
          <section key={category} style={{ display: "grid", gap: 18 }}>
            <div>
              <h2 className="section-title">{category}</h2>
              <p style={{ color: "#415049", lineHeight: 1.7, margin: "8px 0 0" }}>{categoryIntro[category]}</p>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
              {getFunctionsByCategory(category).map((page) => <FunctionCard key={page.slug} page={page} />)}
            </div>
          </section>
        ))}

        <section style={{ display: "grid", gap: 18 }}>
          <div>
            <div className="eyebrow">Start here</div>
            <h2 className="section-title">Formulas that will not work?</h2>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {guides.map((guide) => <GuideCard guide={guide} key={guide.slug} />)}
          </div>
        </section>
      </div>
    </section>
  );
}
