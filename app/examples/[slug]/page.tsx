import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyCodeBlock } from "@/components/ui/copy-code-block";
import { exampleGuides, getExampleGuideBySlug } from "@/lib/example-guides";

export function generateStaticParams() {
  return exampleGuides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getExampleGuideBySlug(slug);

  if (!guide) {
    return { title: "Power Platform example | BuilderVault" };
  }

  return {
    title: guide.title + " | BuilderVault",
    description: guide.description,
    keywords: guide.keywords,
    alternates: { canonical: `/examples/${guide.slug}` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      type: "article",
      url: `/examples/${guide.slug}`
    }
  };
}

export default async function ExampleGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getExampleGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  return (
    <article style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 30 }}>
        <nav aria-label="Breadcrumb" className="badge-row">
          <Link href="/examples" style={{ color: "var(--accent-strong)", fontWeight: 800 }}>Examples</Link>
        </nav>
        <header style={{ maxWidth: 940 }}>
          <div className="eyebrow">{guide.eyebrow}</div>
          <h1 className="page-title">{guide.title}</h1>
          <p className="lead">{guide.description}</p>
          <div className="badge-row" style={{ marginTop: 18 }}>
            {guide.keywords.map((keyword) => <span className="badge" key={keyword}>{keyword}</span>)}
          </div>
        </header>
        <div className="grid" style={{ gridTemplateColumns: "minmax(0, 0.72fr) minmax(260px, 0.28fr)" }}>
          <div className="card" style={{ display: "grid", gap: 24, padding: 24 }}>
            <section style={{ display: "grid", gap: 12 }}>
              <h2 className="section-title" style={{ fontSize: "1.8rem" }}>When to use this</h2>
              <p style={{ color: "#415049", lineHeight: 1.7, margin: 0 }}>{guide.intro}</p>
            </section>
            <section style={{ display: "grid", gap: 12 }}>
              <h2 className="section-title" style={{ fontSize: "1.8rem" }}>Implementation steps</h2>
              <ul style={{ color: "#415049", lineHeight: 1.75, margin: 0, paddingLeft: 20 }}>
                {guide.steps.map((step) => <li key={step}>{step}</li>)}
              </ul>
            </section>
            <section style={{ display: "grid", gap: 12 }}>
              <h2 className="section-title" style={{ fontSize: "1.8rem" }}>Starter example</h2>
              <CopyCodeBlock code={guide.code} />
            </section>
            <section style={{ display: "grid", gap: 12 }}>
              <h2 className="section-title" style={{ fontSize: "1.8rem" }}>Common mistakes</h2>
              <ul style={{ color: "#415049", lineHeight: 1.75, margin: 0, paddingLeft: 20 }}>
                {guide.mistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}
              </ul>
            </section>
          </div>
          <aside style={{ display: "grid", gap: 18, alignSelf: "start" }}>
            <div className="card" style={{ padding: 20 }}>
              <h2 style={{ fontSize: "1.15rem", marginTop: 0 }}>Related BuilderVault pages</h2>
              <div style={{ display: "grid", gap: 10 }}>
                {guide.relatedLinks.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
              </div>
            </div>
            <Link className="button secondary" href="/patterns">Browse all patterns</Link>
          </aside>
        </div>
      </div>
    </article>
  );
}