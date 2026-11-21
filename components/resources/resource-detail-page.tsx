import Link from "next/link";
import type { ReactNode } from "react";
import { DownloadPromo } from "@/components/growth/download-promo";
import { NewsletterSignup } from "@/components/growth/newsletter-signup";
import { ServicesCta } from "@/components/growth/services-cta";
import { CopyCodeBlock } from "@/components/ui/copy-code-block";
import { errorPath, getErrorsForTool } from "@/lib/errors";
import { getGuidesForTool, guidePath } from "@/lib/guides";
import { getPublishedPatternBySlug } from "@/lib/patterns/patterns";
import { getRelatedTools, type ResourceItem } from "@/lib/resources";
import type { Pattern } from "@/types/pattern";
import { absoluteUrl } from "@/lib/site";

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
  const isTool = resource.kind === "tool";
  const relatedTools = isTool ? getRelatedTools(resource) : [];
  const toolGuides = isTool ? getGuidesForTool(resource.slug) : [];
  const toolErrors = isTool ? getErrorsForTool(resource.slug) : [];
  const relatedPatterns = resource.relatedPatterns
    .map((slug) => getPublishedPatternBySlug(slug))
    .filter((pattern): pattern is Pattern => Boolean(pattern));
  const structuredData = isTool
    ? {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: resource.title,
        description: resource.description,
        url: absoluteUrl(resource.path),
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any (runs in the browser)",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
      }
    : null;

  return (
    <article style={{ padding: "54px 0" }}>
      {structuredData ? (
        <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} type="application/ld+json" />
      ) : null}
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

        <div className="grid content-with-aside">
          <div className="card" style={{ display: "grid", gap: 28, padding: 24 }}>
            {isTool ? children : null}
            {isTool ? <NewsletterSignup placement={"tool:" + resource.slug} title="Get new tools and Power Fx tips by email" /> : null}
            <section style={{ display: "grid", gap: 12 }}>
              <h2 className="section-title" style={{ fontSize: "1.8rem" }}>Who this helps</h2>
              <p style={{ color: "#415049", lineHeight: 1.7, margin: 0 }}>{resource.audience}</p>
            </section>
            <section style={{ display: "grid", gap: 12 }}>
              <h2 className="section-title" style={{ fontSize: "1.8rem" }}>{isTool ? "What it does" : "What to standardize"}</h2>
              <ul style={{ color: "#415049", lineHeight: 1.75, margin: 0, paddingLeft: 20 }}>
                {resource.summaryBullets.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>
            {isTool ? null : children}

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

            {toolGuides.length > 0 ? (
              <section style={{ display: "grid", gap: 14 }}>
                <h2 className="section-title" style={{ fontSize: "1.8rem" }}>How-to guides</h2>
                <p style={{ color: "#415049", lineHeight: 1.7, margin: 0 }}>Step-by-step guides that use this tool.</p>
                <div style={{ display: "grid", gap: 14 }}>
                  {toolGuides.map((guide) => (
                    <div key={guide.slug}>
                      <Link href={guidePath(guide)} style={{ fontWeight: 800 }}>{guide.title}</Link>
                      <p style={{ color: "#415049", lineHeight: 1.6, margin: "4px 0 0" }}>{guide.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {toolErrors.length > 0 ? (
              <section style={{ display: "grid", gap: 14 }}>
                <h2 className="section-title" style={{ fontSize: "1.8rem" }}>Errors this tool helps fix</h2>
                <p style={{ color: "#415049", lineHeight: 1.7, margin: 0 }}>Each page explains one error message, its causes and the fix.</p>
                <ul style={{ color: "#415049", display: "grid", gap: 8, lineHeight: 1.6, margin: 0, paddingLeft: 20 }}>
                  {toolErrors.map((page) => (
                    <li key={page.slug}>
                      <Link href={errorPath(page)} style={{ fontWeight: 800 }}>{page.shortTitle}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {resource.faqs && resource.faqs.length > 0 ? (
              <section style={{ display: "grid", gap: 14 }}>
                <h2 className="section-title" style={{ fontSize: "1.8rem" }}>Questions</h2>
                {resource.faqs.map((faq) => (
                  <div key={faq.question}>
                    <h3 style={{ fontSize: "1.1rem", margin: "0 0 6px" }}>{faq.question}</h3>
                    <p style={{ color: "#415049", lineHeight: 1.7, margin: 0 }}>{faq.answer}</p>
                  </div>
                ))}
              </section>
            ) : null}
          </div>
          <aside style={{ display: "grid", gap: 18, alignSelf: "start" }}>
            {relatedTools.length > 0 ? (
              <div className="card" style={{ padding: 20 }}>
                <h2 style={{ fontSize: "1.15rem", marginTop: 0 }}>Related tools</h2>
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
            <div className="card" style={{ padding: 20 }}>
              <h2 style={{ fontSize: "1.15rem", marginTop: 0 }}>Related patterns</h2>
              <div style={{ display: "grid", gap: 10 }}>
                {relatedPatterns.map((pattern) => (
                  <Link href={`/patterns/${pattern.slug}`} key={pattern.slug}>{pattern.title}</Link>
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
            <DownloadPromo />
            {isTool ? (
              <ServicesCta
                placement={"tool:" + resource.slug}
                text="Send a request about the formula, app, or flow you are working on."
                title="Want a second pair of eyes?"
              />
            ) : null}
          </aside>
        </div>
      </div>
    </article>
  );
}
