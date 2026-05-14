import Link from "next/link";
import { notFound } from "next/navigation";
import { BulletList } from "@/components/patterns/bullet-list";
import { DetailSection } from "@/components/patterns/detail-section";
import { FavoriteButton } from "@/components/patterns/favorite-button";
import { PatternBadges } from "@/components/patterns/pattern-badges";
import { PatternCard } from "@/components/patterns/pattern-card";
import { PremiumLock } from "@/components/patterns/premium-lock";
import { CopyCodeBlock } from "@/components/ui/copy-code-block";
import { getCollectionsForPattern } from "@/lib/patterns/collections";
import {
  getAllPatterns,
  getPatternBySlug,
  getRelatedPatterns
} from "@/lib/patterns/patterns";
import { getPatternSeo } from "@/lib/patterns/seo";

type PatternDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getAllPatterns().map((pattern) => ({
    slug: pattern.slug
  }));
}

export async function generateMetadata({ params }: PatternDetailPageProps) {
  const { slug } = await params;
  const pattern = getPatternBySlug(slug);

  if (!pattern) {
    return {
      title: "Pattern | BuilderVault"
    };
  }

  const seo = getPatternSeo(pattern);

  return {
    alternates: {
      canonical: `/patterns/${pattern.slug}`
    },
    title: seo.seoTitle,
    description: seo.seoDescription,
    keywords: [
      seo.primaryKeyword,
      ...seo.secondaryKeywords,
      pattern.category,
      pattern.subCategory,
      pattern.difficulty,
      ...pattern.platform,
      ...pattern.tags
    ],
    openGraph: {
      description: seo.seoDescription,
      title: seo.seoTitle,
      type: "article",
      url: `/patterns/${pattern.slug}`
    }
  };
}

export default async function PatternDetailPage({ params }: PatternDetailPageProps) {
  const { slug } = await params;
  const pattern = getPatternBySlug(slug);

  if (!pattern) {
    notFound();
  }

  const seo = getPatternSeo(pattern);
  const relatedPatterns = getRelatedPatterns(pattern);
  const relatedCollections = getCollectionsForPattern(pattern.slug);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            item: "https://buildervault.app/patterns",
            name: "Patterns",
            position: 1
          },
          {
            "@type": "ListItem",
            item: `https://buildervault.app${seo.topicPath}`,
            name: seo.topicLabel,
            position: 2
          },
          {
            "@type": "ListItem",
            item: `https://buildervault.app/patterns/${pattern.slug}`,
            name: pattern.title,
            position: 3
          }
        ]
      },
      {
        "@type": "TechArticle",
        about: seo.secondaryKeywords,
        articleSection: pattern.category,
        dateModified: pattern.updatedAt,
        datePublished: pattern.createdAt,
        description: seo.seoDescription,
        headline: seo.seoTitle,
        isAccessibleForFree: !pattern.isPremium,
        keywords: seo.secondaryKeywords.join(", "),
        mainEntityOfPage: `https://buildervault.app/patterns/${pattern.slug}`,
        proficiencyLevel: pattern.difficulty,
        publisher: {
          "@type": "Organization",
          name: "BuilderVault"
        }
      },
      {
        "@type": "FAQPage",
        mainEntity: seo.faqs.map((faq) => ({
          "@type": "Question",
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer
          },
          name: faq.question
        }))
      }
    ]
  };

  return (
    <article style={{ padding: "44px 0 12px" }}>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        type="application/ld+json"
      />
      <div className="container" style={{ display: "grid", gap: 28 }}>
        <nav aria-label="Breadcrumb" className="badge-row">
          <Link href="/patterns" style={{ color: "var(--accent-strong)", fontWeight: 800 }}>
            Patterns
          </Link>
          <span aria-hidden="true" style={{ color: "var(--muted)" }}>
            /
          </span>
          <Link href={seo.topicPath} style={{ color: "var(--accent-strong)", fontWeight: 800 }}>
            {seo.topicLabel}
          </Link>
          <span aria-hidden="true" style={{ color: "var(--muted)" }}>
            /
          </span>
          <span style={{ color: "var(--muted)" }}>{pattern.category}</span>
        </nav>

        <header style={{ display: "grid", gap: 18 }}>
          <PatternBadges pattern={pattern} />
          <h1 className="page-title" style={{ maxWidth: 920 }}>
            {pattern.title}
          </h1>
          <p className="lead" style={{ maxWidth: 860 }}>
            {seo.seoDescription}
          </p>
          <div className="badge-row" aria-label="Search intent and keywords">
            <span className="badge">{seo.primaryKeyword}</span>
            <span className="badge">{seo.seoPriority} intent</span>
            <span className="badge">{pattern.difficulty}</span>
          </div>
          <FavoriteButton patternSlug={pattern.slug} />
        </header>

        {pattern.isPremium ? (
          <div
            className="card"
            style={{
              background: "#fffaf0",
              borderColor: "#f4d77a",
              display: "grid",
              gap: 10,
              padding: 20
            }}
          >
            <strong>Premium pattern preview</strong>
            <p style={{ color: "#6f4d14", lineHeight: 1.6, margin: 0 }}>
              You can still see the search intent, fit guidance, FAQ, and related resources. The detailed formula and implementation notes are locked to model the Pro experience before subscriptions are wired in.
            </p>
          </div>
        ) : null}

        <div
          style={{
            display: "grid",
            gap: 28,
            gridTemplateColumns: "minmax(0, 0.72fr) minmax(260px, 0.28fr)"
          }}
        >
          <div className="card" style={{ display: "grid", gap: 28, padding: 24 }}>
            <DetailSection title="What this pattern solves">
              <div style={{ display: "grid", gap: 14 }}>
                {seo.intro.map((paragraph) => (
                  <p key={paragraph} style={{ color: "#415049", lineHeight: 1.65, margin: 0 }}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </DetailSection>

            <DetailSection title="Search intent">
              <p style={{ color: "#415049", lineHeight: 1.65, margin: 0 }}>{seo.searchIntent}</p>
            </DetailSection>

            <DetailSection title="Problem">
              <p style={{ color: "#415049", lineHeight: 1.65, margin: 0 }}>
                {pattern.problemStatement}
              </p>
            </DetailSection>

            <DetailSection title="What the finished pattern should include">
              <BulletList items={seo.finishedOutcome} />
            </DetailSection>

            <DetailSection title="Solution">
              {pattern.isPremium ? <PremiumLock title="Formula locked" /> : <CopyCodeBlock code={pattern.formulaOrCode} />}
            </DetailSection>

            <DetailSection title="Implementation checklist">
              <BulletList items={seo.implementationChecklist} />
            </DetailSection>

            <DetailSection title="Step-by-step instructions">
              {pattern.isPremium ? (
                <PremiumLock title="Implementation steps locked" />
              ) : (
                <BulletList items={pattern.stepByStepInstructions} />
              )}
            </DetailSection>

            <DetailSection title="When to use">
              <BulletList items={pattern.whenToUse} />
            </DetailSection>

            <DetailSection title="When not to use">
              <BulletList items={pattern.whenNotToUse} />
            </DetailSection>

            {!pattern.isPremium ? (
              <DetailSection title="Common mistakes">
                <BulletList items={pattern.commonMistakes} />
              </DetailSection>
            ) : null}

            {!pattern.isPremium ? (
              <DetailSection title="Troubleshooting">
                <BulletList items={pattern.troubleshooting} />
              </DetailSection>
            ) : (
              <DetailSection title="Troubleshooting">
                <PremiumLock title="Troubleshooting locked" />
              </DetailSection>
            )}

            <DetailSection title="FAQ">
              <div style={{ display: "grid", gap: 16 }}>
                {seo.faqs.map((faq) => (
                  <div key={faq.question}>
                    <h3 style={{ fontSize: "1rem", margin: "0 0 6px" }}>{faq.question}</h3>
                    <p style={{ color: "#415049", lineHeight: 1.65, margin: 0 }}>{faq.answer}</p>
                  </div>
                ))}
              </div>
            </DetailSection>
          </div>

          <aside style={{ display: "grid", gap: 18, alignSelf: "start" }}>
            <div className="card" style={{ padding: 20 }}>
              <h2 style={{ fontSize: "1.15rem", marginTop: 0 }}>Pattern notes</h2>
              <dl style={{ color: "var(--muted)", display: "grid", gap: 12, margin: 0 }}>
                <div>
                  <dt style={{ color: "var(--foreground)", fontWeight: 800 }}>Subcategory</dt>
                  <dd style={{ margin: 0 }}>{pattern.subCategory}</dd>
                </div>
                <div>
                  <dt style={{ color: "var(--foreground)", fontWeight: 800 }}>Estimated time saved</dt>
                  <dd style={{ margin: 0 }}>{pattern.estimatedTimeSaved}</dd>
                </div>
                <div>
                  <dt style={{ color: "var(--foreground)", fontWeight: 800 }}>Topic hub</dt>
                  <dd style={{ margin: 0 }}>
                    <Link href={seo.topicPath}>{seo.topicLabel}</Link>
                  </dd>
                </div>
              </dl>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <h2 style={{ fontSize: "1.15rem", marginTop: 0 }}>Keywords</h2>
              <div className="badge-row">
                {seo.secondaryKeywords.slice(0, 8).map((keyword) => (
                  <span className="badge" key={keyword}>
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            {relatedCollections.length > 0 ? (
              <div className="card" style={{ padding: 20 }}>
                <h2 style={{ fontSize: "1.15rem", marginTop: 0 }}>Related collections</h2>
                <div style={{ display: "grid", gap: 10 }}>
                  {relatedCollections.map((collection) => (
                    <Link href={`/collections/${collection.slug}`} key={collection.slug}>
                      {collection.title}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>

        {relatedPatterns.length > 0 ? (
          <section style={{ display: "grid", gap: 18 }}>
            <h2 className="section-title">Related patterns</h2>
            <div
              className="grid"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}
            >
              {relatedPatterns.map((relatedPattern) => (
                <PatternCard key={relatedPattern.id} pattern={relatedPattern} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </article>
  );
}
