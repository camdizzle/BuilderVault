import Link from "next/link";
import { notFound } from "next/navigation";
import { GuideBlockView, RichText } from "@/components/guides/guide-blocks";
import { NewsletterSignup } from "@/components/growth/newsletter-signup";
import { ServicesCta } from "@/components/growth/services-cta";
import { CopyCodeBlock } from "@/components/ui/copy-code-block";
import { errorPath, getErrorBySlug, type ErrorPage } from "@/lib/errors";
import { functionPages, functionPath, getFunctionBySlug, type FunctionPage } from "@/lib/functions";
import { getGuideBySlug, guidePath, type Guide } from "@/lib/guides";
import { getPublishedPatternBySlug } from "@/lib/patterns/patterns";
import { getResourceBySlug, type ResourceItem } from "@/lib/resources";
import { absoluteUrl, authorStructuredData, formatDisplayDate, publisherOrganization } from "@/lib/site";
import type { Pattern } from "@/types/pattern";

export function generateStaticParams() {
  return functionPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getFunctionBySlug(slug);

  if (!page) {
    return { title: "Function not found | BuilderVault" };
  }

  return {
    title: page.title + " | BuilderVault",
    description: page.description,
    keywords: page.keywords,
    alternates: { canonical: functionPath(page) },
    openGraph: {
      title: page.title,
      description: page.description,
      type: "article",
      url: functionPath(page),
      publishedTime: page.published,
      modifiedTime: page.updated
    }
  };
}

const bodyStyle = { color: "#415049", lineHeight: 1.75, margin: 0 } as const;
const cellStyle = { borderBottom: "1px solid var(--line)", color: "#415049", lineHeight: 1.6, padding: "10px 12px", verticalAlign: "top" } as const;
const headStyle = { borderBottom: "2px solid var(--line)", color: "var(--foreground)", padding: "10px 12px", textAlign: "left" } as const;
const linkStyle = { color: "var(--accent-strong)", fontWeight: 800 } as const;

export default async function FunctionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getFunctionBySlug(slug);

  if (!page) {
    notFound();
  }

  const relatedTools = page.relatedTools
    .map((toolSlug) => getResourceBySlug("tool", toolSlug))
    .filter((tool): tool is ResourceItem => Boolean(tool));
  const relatedFunctions = page.relatedFunctions
    .map((other) => getFunctionBySlug(other))
    .filter((other): other is FunctionPage => Boolean(other));
  const relatedGuides = page.relatedGuides
    .map((guideSlug) => getGuideBySlug(guideSlug))
    .filter((guide): guide is Guide => Boolean(guide));
  const relatedErrors = page.relatedErrors
    .map((errorSlug) => getErrorBySlug(errorSlug))
    .filter((error): error is ErrorPage => Boolean(error));
  const relatedPatterns = page.relatedPatterns
    .map((patternSlug) => getPublishedPatternBySlug(patternSlug))
    .filter((pattern): pattern is Pattern => Boolean(pattern));
  const sameCategory = functionPages.filter((other) => other.category === page.category && other.slug !== page.slug);
  const author = authorStructuredData();

  const articleData = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: page.title,
    description: page.description,
    keywords: page.keywords.join(", "),
    datePublished: page.published,
    dateModified: page.updated,
    mainEntityOfPage: absoluteUrl(functionPath(page)),
    publisher: publisherOrganization,
    ...(author ? { author } : {})
  };
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer }
    }))
  };
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Resources", item: absoluteUrl("/resources") },
      { "@type": "ListItem", position: 2, name: "Power Fx functions", item: absoluteUrl("/functions") },
      { "@type": "ListItem", position: 3, name: page.name, item: absoluteUrl(functionPath(page)) }
    ]
  };

  const outline = [
    { id: "syntax", heading: "Syntax" },
    ...page.sections.map((item) => ({ id: item.id, heading: item.heading })),
    { id: "questions", heading: "Questions" }
  ];

  return (
    <article style={{ padding: "54px 0" }}>
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(articleData) }} type="application/ld+json" />
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }} type="application/ld+json" />
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} type="application/ld+json" />
      <div className="container" style={{ display: "grid", gap: 30 }}>
        <nav aria-label="Breadcrumb" className="badge-row">
          <Link href="/resources" style={linkStyle}>Resources</Link>
          <span aria-hidden="true" style={{ color: "var(--muted)" }}>/</span>
          <Link href="/functions" style={linkStyle}>Power Fx functions</Link>
        </nav>

        <header style={{ maxWidth: 940 }}>
          <div className="eyebrow">Power Fx function reference · {page.category}</div>
          <h1 className="page-title">{page.title}</h1>
          <p className="lead">{page.description}</p>
          <p style={{ color: "var(--muted)", margin: "14px 0 0" }}>Updated {formatDisplayDate(page.updated)}</p>
        </header>

        <div className="grid content-with-aside">
          <div className="card" style={{ display: "grid", gap: 30, padding: 24 }}>
            <section style={{ background: "var(--accent-soft)", borderRadius: 8, display: "grid", gap: 8, padding: "16px 18px" }}>
              <h2 style={{ fontSize: "1.05rem", margin: 0 }}>The short answer</h2>
              <p style={{ ...bodyStyle, color: "var(--foreground)" }}>{page.quickAnswer}</p>
            </section>

            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", fontSize: "0.95rem", minWidth: 420, width: "100%" }}>
                <caption style={{ fontWeight: 800, marginBottom: 6, textAlign: "left" }}>At a glance</caption>
                <tbody>
                  <tr>
                    <th scope="row" style={{ ...headStyle, borderBottom: "1px solid var(--line)", width: 150 }}>Returns</th>
                    <td style={cellStyle}><RichText text={page.returns} /></td>
                  </tr>
                  <tr>
                    <th scope="row" style={{ ...headStyle, borderBottom: "1px solid var(--line)" }}>Use it in</th>
                    <td style={cellStyle}>{page.usableIn === "Any formula" ? "Any formula, including properties such as Items, Text and Visible" : "Behaviour formulas only, such as OnSelect, OnVisible and OnSuccess"}</td>
                  </tr>
                  <tr>
                    <th scope="row" style={{ ...headStyle, borderBottom: "1px solid var(--line)" }}>Delegation</th>
                    <td style={cellStyle}><RichText text={page.delegation} /></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <nav aria-label="On this page" style={{ display: "grid", gap: 8 }}>
              <h2 style={{ fontSize: "1.05rem", margin: 0 }}>On this page</h2>
              <ol style={{ ...bodyStyle, display: "grid", gap: 4, paddingLeft: 22 }}>
                {outline.map((item) => (
                  <li key={item.id}>
                    <a href={"#" + item.id} style={{ color: "var(--accent-strong)", fontWeight: 700 }}>{item.heading}</a>
                  </li>
                ))}
              </ol>
            </nav>

            <section id="syntax" style={{ display: "grid", gap: 14, scrollMarginTop: 90 }}>
              <h2 className="section-title" style={{ fontSize: "1.6rem" }}>Syntax</h2>
              <CopyCodeBlock code={page.syntax} copyEvent="Function Syntax Copied" label="Syntax" />
              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", fontSize: "0.95rem", minWidth: 480, width: "100%" }}>
                  <thead>
                    <tr>
                      <th scope="col" style={headStyle}>Argument</th>
                      <th scope="col" style={headStyle}>Required</th>
                      <th scope="col" style={headStyle}>What it is</th>
                    </tr>
                  </thead>
                  <tbody>
                    {page.arguments.map((row) => (
                      <tr key={row.join("|")}>
                        {row.map((cell, index) => (
                          <td key={index} style={cellStyle}><RichText text={cell} /></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {page.sections.map((item) => (
              <section id={item.id} key={item.id} style={{ display: "grid", gap: 14, scrollMarginTop: 90 }}>
                <h2 className="section-title" style={{ fontSize: "1.6rem" }}>{item.heading}</h2>
                {item.blocks.map((block, index) => <GuideBlockView block={block} key={index} />)}
              </section>
            ))}

            <section id="questions" style={{ display: "grid", gap: 14, scrollMarginTop: 90 }}>
              <h2 className="section-title" style={{ fontSize: "1.6rem" }}>Questions</h2>
              {page.faqs.map((faq) => (
                <div key={faq.question}>
                  <h3 style={{ fontSize: "1.1rem", margin: "0 0 6px" }}>{faq.question}</h3>
                  <p style={bodyStyle}>{faq.answer}</p>
                </div>
              ))}
            </section>

            <section style={{ display: "grid", gap: 10 }}>
              <h2 style={{ fontSize: "1.15rem", margin: 0 }}>Microsoft documentation</h2>
              <p style={bodyStyle}>This page was checked against these Microsoft Learn pages.</p>
              <ul style={{ ...bodyStyle, display: "grid", gap: 4, paddingLeft: 22 }}>
                {page.sources.map((source) => (
                  <li key={source.href}>
                    <a href={source.href} rel="noopener" style={{ color: "var(--accent-strong)", fontWeight: 700 }}>{source.label}</a>
                  </li>
                ))}
              </ul>
            </section>

            <NewsletterSignup placement={"function:" + page.slug} title="Get new Power Fx guides and tips by email" />
          </div>

          <aside style={{ display: "grid", gap: 18, alignSelf: "start" }}>
            {relatedTools.length > 0 ? (
              <div className="card" style={{ padding: 20 }}>
                <h2 style={{ fontSize: "1.15rem", marginTop: 0 }}>Check your formula</h2>
                <div style={{ display: "grid", gap: 12 }}>
                  {relatedTools.map((tool) => (
                    <div key={tool.slug}>
                      <Link href={tool.path} style={{ fontWeight: 800 }}>{tool.title}</Link>
                      <p style={{ color: "var(--muted)", lineHeight: 1.5, margin: "4px 0 0" }}>{tool.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {relatedFunctions.length > 0 ? (
              <div className="card" style={{ padding: 20 }}>
                <h2 style={{ fontSize: "1.15rem", marginTop: 0 }}>Related functions</h2>
                <div style={{ display: "grid", gap: 10 }}>
                  {relatedFunctions.map((other) => <Link href={functionPath(other)} key={other.slug}>{other.name}</Link>)}
                </div>
              </div>
            ) : null}
            {relatedGuides.length + relatedErrors.length + relatedPatterns.length > 0 ? (
              <div className="card" style={{ padding: 20 }}>
                <h2 style={{ fontSize: "1.15rem", marginTop: 0 }}>Guides, errors and patterns</h2>
                <div style={{ display: "grid", gap: 10 }}>
                  {relatedGuides.map((guide) => <Link href={guidePath(guide)} key={guide.slug}>{guide.shortTitle}</Link>)}
                  {relatedErrors.map((error) => <Link href={errorPath(error)} key={error.slug}>{error.shortTitle}</Link>)}
                  {relatedPatterns.map((pattern) => <Link href={`/patterns/${pattern.slug}`} key={pattern.slug}>{pattern.title}</Link>)}
                </div>
              </div>
            ) : null}
            <div className="card" style={{ padding: 20 }}>
              <h2 style={{ fontSize: "1.15rem", marginTop: 0 }}>{page.category}</h2>
              <div style={{ display: "grid", gap: 10 }}>
                {sameCategory.map((other) => <Link href={functionPath(other)} key={other.slug}>{other.name}</Link>)}
                <Link href="/functions" style={{ fontWeight: 800 }}>All {functionPages.length} functions</Link>
              </div>
            </div>
            <ServicesCta
              placement={"function:" + page.slug}
              text="Send a request about the formula or app you are working on."
              title="Want a second pair of eyes?"
            />
          </aside>
        </div>
      </div>
    </article>
  );
}
