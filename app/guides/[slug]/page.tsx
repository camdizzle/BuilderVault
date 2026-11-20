import Link from "next/link";
import { notFound } from "next/navigation";
import { GuideBlockView } from "@/components/guides/guide-blocks";
import { NewsletterSignup } from "@/components/growth/newsletter-signup";
import { ServicesCta } from "@/components/growth/services-cta";
import { getGuideBySlug, guidePath, guides } from "@/lib/guides";
import { getPublishedPatternBySlug } from "@/lib/patterns/patterns";
import { getResourceBySlug, type ResourceItem } from "@/lib/resources";
import { absoluteUrl, authorStructuredData, formatDisplayDate, publisherOrganization } from "@/lib/site";
import type { Pattern } from "@/types/pattern";

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    return { title: "Guide not found | BuilderVault" };
  }

  return {
    title: guide.title + " | BuilderVault",
    description: guide.description,
    keywords: guide.keywords,
    alternates: { canonical: guidePath(guide) },
    openGraph: {
      title: guide.title,
      description: guide.description,
      type: "article",
      url: guidePath(guide),
      publishedTime: guide.published,
      modifiedTime: guide.updated
    }
  };
}

const bodyStyle = { color: "#415049", lineHeight: 1.75, margin: 0 } as const;

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const relatedTools = guide.relatedTools
    .map((toolSlug) => getResourceBySlug("tool", toolSlug))
    .filter((tool): tool is ResourceItem => Boolean(tool));
  const relatedPatterns = guide.relatedPatterns
    .map((patternSlug) => getPublishedPatternBySlug(patternSlug))
    .filter((pattern): pattern is Pattern => Boolean(pattern));
  const otherGuides = guides.filter((other) => other.slug !== guide.slug && other.eyebrow === guide.eyebrow);
  const author = authorStructuredData();

  const articleData = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: guide.title,
    description: guide.description,
    keywords: guide.keywords.join(", "),
    datePublished: guide.published,
    dateModified: guide.updated,
    mainEntityOfPage: absoluteUrl(guidePath(guide)),
    publisher: publisherOrganization,
    ...(author ? { author } : {})
  };
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faqs.map((faq) => ({
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
      { "@type": "ListItem", position: 2, name: "Guides", item: absoluteUrl("/guides") },
      { "@type": "ListItem", position: 3, name: guide.title, item: absoluteUrl(guidePath(guide)) }
    ]
  };

  return (
    <article style={{ padding: "54px 0" }}>
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(articleData) }} type="application/ld+json" />
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }} type="application/ld+json" />
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} type="application/ld+json" />
      <div className="container" style={{ display: "grid", gap: 30 }}>
        <nav aria-label="Breadcrumb" className="badge-row">
          <Link href="/resources" style={{ color: "var(--accent-strong)", fontWeight: 800 }}>Resources</Link>
          <span aria-hidden="true" style={{ color: "var(--muted)" }}>/</span>
          <Link href="/guides" style={{ color: "var(--accent-strong)", fontWeight: 800 }}>Guides</Link>
        </nav>

        <header style={{ maxWidth: 940 }}>
          <div className="eyebrow">{guide.eyebrow}</div>
          <h1 className="page-title">{guide.title}</h1>
          <p className="lead">{guide.description}</p>
          <p style={{ color: "var(--muted)", margin: "14px 0 0" }}>Updated {formatDisplayDate(guide.updated)}</p>
        </header>

        <div className="grid content-with-aside">
          <div className="card" style={{ display: "grid", gap: 30, padding: 24 }}>
            <section style={{ background: "var(--accent-soft)", borderRadius: 8, display: "grid", gap: 8, padding: "16px 18px" }}>
              <h2 style={{ fontSize: "1.05rem", margin: 0 }}>The short answer</h2>
              <p style={{ ...bodyStyle, color: "var(--foreground)" }}>{guide.quickAnswer}</p>
            </section>

            <nav aria-label="On this page" style={{ display: "grid", gap: 8 }}>
              <h2 style={{ fontSize: "1.05rem", margin: 0 }}>On this page</h2>
              <ol style={{ ...bodyStyle, display: "grid", gap: 4, paddingLeft: 22 }}>
                {guide.sections.map((item) => (
                  <li key={item.id}>
                    <a href={"#" + item.id} style={{ color: "var(--accent-strong)", fontWeight: 700 }}>{item.heading}</a>
                  </li>
                ))}
              </ol>
            </nav>

            {guide.sections.map((item) => (
              <section id={item.id} key={item.id} style={{ display: "grid", gap: 14, scrollMarginTop: 90 }}>
                <h2 className="section-title" style={{ fontSize: "1.6rem" }}>{item.heading}</h2>
                {item.blocks.map((block, index) => <GuideBlockView block={block} key={index} />)}
              </section>
            ))}

            <section id="questions" style={{ display: "grid", gap: 14, scrollMarginTop: 90 }}>
              <h2 className="section-title" style={{ fontSize: "1.6rem" }}>Questions</h2>
              {guide.faqs.map((faq) => (
                <div key={faq.question}>
                  <h3 style={{ fontSize: "1.1rem", margin: "0 0 6px" }}>{faq.question}</h3>
                  <p style={bodyStyle}>{faq.answer}</p>
                </div>
              ))}
            </section>

            <section style={{ display: "grid", gap: 10 }}>
              <h2 style={{ fontSize: "1.15rem", margin: 0 }}>Microsoft documentation</h2>
              <p style={bodyStyle}>This guide was checked against these Microsoft Learn pages.</p>
              <ul style={{ ...bodyStyle, display: "grid", gap: 4, paddingLeft: 22 }}>
                {guide.sources.map((source) => (
                  <li key={source.href}>
                    <a href={source.href} rel="noopener" style={{ color: "var(--accent-strong)", fontWeight: 700 }}>{source.label}</a>
                  </li>
                ))}
              </ul>
            </section>

            <NewsletterSignup placement={"guide:" + guide.slug} title="Get new guides and Power Platform tips by email" />
          </div>

          <aside style={{ display: "grid", gap: 18, alignSelf: "start" }}>
            {relatedTools.length > 0 ? (
              <div className="card" style={{ padding: 20 }}>
                <h2 style={{ fontSize: "1.15rem", marginTop: 0 }}>Tools for this guide</h2>
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
            {relatedPatterns.length + guide.relatedLinks.length > 0 ? (
              <div className="card" style={{ padding: 20 }}>
                <h2 style={{ fontSize: "1.15rem", marginTop: 0 }}>Related pages</h2>
                <div style={{ display: "grid", gap: 10 }}>
                  {guide.relatedLinks.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
                  {relatedPatterns.map((pattern) => (
                    <Link href={`/patterns/${pattern.slug}`} key={pattern.slug}>{pattern.title}</Link>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="card" style={{ padding: 20 }}>
              <h2 style={{ fontSize: "1.15rem", marginTop: 0 }}>More guides</h2>
              <div style={{ display: "grid", gap: 10 }}>
                {otherGuides.map((other) => <Link href={guidePath(other)} key={other.slug}>{other.shortTitle}</Link>)}
              </div>
            </div>
            <ServicesCta
              placement={"guide:" + guide.slug}
              text="Send a request about the formula, app, or flow you are working on."
              title="Want a second pair of eyes?"
            />
          </aside>
        </div>
      </div>
    </article>
  );
}
