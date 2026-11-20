import Link from "next/link";
import { notFound } from "next/navigation";
import { GuideBlockView } from "@/components/guides/guide-blocks";
import { NewsletterSignup } from "@/components/growth/newsletter-signup";
import { ServicesCta } from "@/components/growth/services-cta";
import { errorPath, errorPages, errorSections, getErrorBySlug } from "@/lib/errors";
import { CopyCodeBlock } from "@/components/ui/copy-code-block";
import { getPublishedPatternBySlug } from "@/lib/patterns/patterns";
import { getResourceBySlug, type ResourceItem } from "@/lib/resources";
import { absoluteUrl, authorStructuredData, formatDisplayDate, publisherOrganization } from "@/lib/site";
import type { Pattern } from "@/types/pattern";

export function generateStaticParams() {
  return errorPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getErrorBySlug(slug);

  if (!page) {
    return { title: "Error not found | BuilderVault" };
  }

  return {
    title: page.title + " | BuilderVault",
    description: page.description,
    keywords: page.keywords,
    alternates: { canonical: errorPath(page) },
    openGraph: {
      title: page.title,
      description: page.description,
      type: "article",
      url: errorPath(page),
      publishedTime: page.published,
      modifiedTime: page.updated
    }
  };
}

const bodyStyle = { color: "#415049", lineHeight: 1.75, margin: 0 } as const;

export default async function ErrorDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getErrorBySlug(slug);

  if (!page) {
    notFound();
  }

  const relatedTools = page.relatedTools
    .map((toolSlug) => getResourceBySlug("tool", toolSlug))
    .filter((tool): tool is ResourceItem => Boolean(tool));
  const relatedPatterns = page.relatedPatterns
    .map((patternSlug) => getPublishedPatternBySlug(patternSlug))
    .filter((pattern): pattern is Pattern => Boolean(pattern));
  const relatedErrors = page.relatedErrors
    .map((errorSlug) => getErrorBySlug(errorSlug))
    .filter((other): other is NonNullable<typeof other> => Boolean(other));
  const sameProduct = errorPages.filter((other) => other.product === page.product && other.slug !== page.slug && !page.relatedErrors.includes(other.slug));
  const author = authorStructuredData();

  const articleData = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: page.title,
    description: page.description,
    keywords: page.keywords.join(", "),
    datePublished: page.published,
    dateModified: page.updated,
    mainEntityOfPage: absoluteUrl(errorPath(page)),
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
      { "@type": "ListItem", position: 2, name: "Error library", item: absoluteUrl("/errors") },
      { "@type": "ListItem", position: 3, name: page.title, item: absoluteUrl(errorPath(page)) }
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
          <Link href="/errors" style={{ color: "var(--accent-strong)", fontWeight: 800 }}>Error library</Link>
        </nav>

        <header style={{ maxWidth: 940 }}>
          <div className="eyebrow">{page.product} error</div>
          <h1 className="page-title">{page.title}</h1>
          <p className="lead">{page.description}</p>
          <p style={{ color: "var(--muted)", margin: "14px 0 0" }}>Updated {formatDisplayDate(page.updated)}</p>
        </header>

        <div className="grid content-with-aside">
          <div className="card" style={{ display: "grid", gap: 30, padding: 24 }}>
            <section style={{ background: "var(--accent-soft)", borderRadius: 8, display: "grid", gap: 8, padding: "16px 18px" }}>
              <h2 style={{ fontSize: "1.05rem", margin: 0 }}>The short fix</h2>
              <p style={{ ...bodyStyle, color: "var(--foreground)" }}>{page.quickAnswer}</p>
            </section>

            <section id="message" style={{ display: "grid", gap: 14, scrollMarginTop: 90 }}>
              <h2 className="section-title" style={{ fontSize: "1.6rem" }}>The message</h2>
              <CopyCodeBlock code={page.message} copyEvent="Error Message Copied" label={page.product + " error"} />
              {page.variants.length > 0 ? (
                <>
                  <p style={bodyStyle}>The same error also appears in these forms. Names, numbers and addresses in the message will be your own.</p>
                  <ul style={{ ...bodyStyle, display: "grid", gap: 6, paddingLeft: 22 }}>
                    {page.variants.map((variant) => <li key={variant}>{variant}</li>)}
                  </ul>
                </>
              ) : null}
            </section>

            {errorSections.map((item) => (
              <section id={item.id} key={item.id} style={{ display: "grid", gap: 14, scrollMarginTop: 90 }}>
                <h2 className="section-title" style={{ fontSize: "1.6rem" }}>{item.heading}</h2>
                {page[item.key].map((block, index) => <GuideBlockView block={block} key={index} />)}
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
              <p style={bodyStyle}>These Microsoft Learn pages cover the feature behind this error.</p>
              <ul style={{ ...bodyStyle, display: "grid", gap: 4, paddingLeft: 22 }}>
                {page.sources.map((source) => (
                  <li key={source.href}>
                    <a href={source.href} rel="noopener" style={{ color: "var(--accent-strong)", fontWeight: 700 }}>{source.label}</a>
                  </li>
                ))}
              </ul>
            </section>

            <NewsletterSignup placement={"error:" + page.slug} title="Get new fixes and Power Platform tips by email" />
          </div>

          <aside style={{ display: "grid", gap: 18, alignSelf: "start" }}>
            {relatedTools.length > 0 ? (
              <div className="card" style={{ padding: 20 }}>
                <h2 style={{ fontSize: "1.15rem", marginTop: 0 }}>Tools that help</h2>
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
            {relatedPatterns.length + page.relatedLinks.length > 0 ? (
              <div className="card" style={{ padding: 20 }}>
                <h2 style={{ fontSize: "1.15rem", marginTop: 0 }}>Related pages</h2>
                <div style={{ display: "grid", gap: 10 }}>
                  {page.relatedLinks.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
                  {relatedPatterns.map((pattern) => (
                    <Link href={`/patterns/${pattern.slug}`} key={pattern.slug}>{pattern.title}</Link>
                  ))}
                </div>
              </div>
            ) : null}
            {relatedErrors.length > 0 ? (
              <div className="card" style={{ padding: 20 }}>
                <h2 style={{ fontSize: "1.15rem", marginTop: 0 }}>Related errors</h2>
                <div style={{ display: "grid", gap: 10 }}>
                  {relatedErrors.map((other) => <Link href={errorPath(other)} key={other.slug}>{other.shortTitle}</Link>)}
                </div>
              </div>
            ) : null}
            <div className="card" style={{ padding: 20 }}>
              <h2 style={{ fontSize: "1.15rem", marginTop: 0 }}>More {page.product} errors</h2>
              <div style={{ display: "grid", gap: 10 }}>
                {sameProduct.map((other) => <Link href={errorPath(other)} key={other.slug}>{other.shortTitle}</Link>)}
              </div>
            </div>
            <ServicesCta
              placement={"error:" + page.slug}
              text="Send a request about the flow or app that is failing."
              title="Want a second pair of eyes?"
            />
          </aside>
        </div>
      </div>
    </article>
  );
}
