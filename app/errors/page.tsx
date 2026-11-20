import Link from "next/link";
import { ErrorCard } from "@/components/errors/error-card";
import { GuideCard } from "@/components/guides/guide-card";
import { errorPages, errorProducts, getErrorsByProduct } from "@/lib/errors";
import { getGuideBySlug, type Guide } from "@/lib/guides";

export const metadata = {
  title: "Power Automate and Power Apps Error Messages and Fixes | BuilderVault",
  description: "Look up a Power Automate or Power Apps error message and get its meaning, causes and fix. Covers InvalidTemplate, null values, Parse JSON, Filter Query, throttling, Patch errors and more.",
  alternates: { canonical: "/errors" }
};

const productIntro: Record<string, string> = {
  "Power Automate": "Errors from a failed flow run, the expression editor or a trigger.",
  "Power Apps": "Errors that appear when a canvas app saves or loads data, and notices from Power Apps Studio."
};

const guideSlugs = ["troubleshoot-failed-flow-run", "fix-common-power-fx-formula-errors"];

export default function ErrorsPage() {
  const guides = guideSlugs.map((slug) => getGuideBySlug(slug)).filter((guide): guide is Guide => Boolean(guide));

  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 34 }}>
        <nav aria-label="Breadcrumb" className="badge-row">
          <Link href="/resources" style={{ color: "var(--accent-strong)", fontWeight: 800 }}>Resources</Link>
        </nav>
        <div style={{ maxWidth: 940 }}>
          <div className="eyebrow">Error library</div>
          <h1 className="page-title">Power Automate and Power Apps errors, explained and fixed.</h1>
          <p className="lead">
            {errorPages.length} error messages, each on its own page: what the message means, the causes in order of likelihood, the fix for each one, and how to stop it coming back. Match your error on its first few words, because the wording changes a little between releases.
          </p>
        </div>

        {errorProducts.map((product) => (
          <section key={product} style={{ display: "grid", gap: 18 }}>
            <div>
              <div className="eyebrow">{product}</div>
              <h2 className="section-title">{product} errors</h2>
              <p style={{ color: "#415049", lineHeight: 1.7, margin: "8px 0 0" }}>{productIntro[product]}</p>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
              {getErrorsByProduct(product).map((page) => <ErrorCard key={page.slug} page={page} />)}
            </div>
          </section>
        ))}

        <section style={{ display: "grid", gap: 18 }}>
          <div>
            <div className="eyebrow">Start here</div>
            <h2 className="section-title">Not sure which error you have?</h2>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {guides.map((guide) => <GuideCard guide={guide} key={guide.slug} />)}
          </div>
        </section>
      </div>
    </section>
  );
}
