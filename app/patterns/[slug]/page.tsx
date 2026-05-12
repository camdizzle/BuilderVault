import Link from "next/link";
import { notFound } from "next/navigation";
import { BulletList } from "@/components/patterns/bullet-list";
import { DetailSection } from "@/components/patterns/detail-section";
import { FavoriteButton } from "@/components/patterns/favorite-button";
import { PatternBadges } from "@/components/patterns/pattern-badges";
import { PatternCard } from "@/components/patterns/pattern-card";
import { PremiumLock } from "@/components/patterns/premium-lock";
import { CopyCodeBlock } from "@/components/ui/copy-code-block";
import {
  getAllPatterns,
  getPatternBySlug,
  getRelatedPatterns
} from "@/lib/patterns/patterns";

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

  return {
    alternates: {
      canonical: pattern ? `/patterns/${pattern.slug}` : undefined
    },
    title: pattern ? `${pattern.title} | BuilderVault` : "Pattern | BuilderVault",
    description: pattern?.shortDescription,
    keywords: pattern
      ? [
          pattern.category,
          pattern.subCategory,
          pattern.difficulty,
          ...pattern.platform,
          ...pattern.tags
        ]
      : undefined,
    openGraph: pattern
      ? {
          description: pattern.shortDescription,
          title: `${pattern.title} | BuilderVault`,
          type: "article",
          url: `/patterns/${pattern.slug}`
        }
      : undefined
  };
}

export default async function PatternDetailPage({ params }: PatternDetailPageProps) {
  const { slug } = await params;
  const pattern = getPatternBySlug(slug);

  if (!pattern) {
    notFound();
  }

  const relatedPatterns = getRelatedPatterns(pattern);
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
            item: `https://buildervault.app/patterns/${pattern.slug}`,
            name: pattern.title,
            position: 2
          }
        ]
      },
      {
        "@type": "TechArticle",
        about: pattern.tags,
        articleSection: pattern.category,
        dateModified: pattern.updatedAt,
        datePublished: pattern.createdAt,
        description: pattern.shortDescription,
        headline: pattern.title,
        isAccessibleForFree: !pattern.isPremium,
        keywords: pattern.tags.join(", "),
        mainEntityOfPage: `https://buildervault.app/patterns/${pattern.slug}`,
        proficiencyLevel: pattern.difficulty,
        publisher: {
          "@type": "Organization",
          name: "BuilderVault"
        }
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
          <span style={{ color: "var(--muted)" }}>{pattern.category}</span>
        </nav>

        <header style={{ display: "grid", gap: 18 }}>
          <PatternBadges pattern={pattern} />
          <h1 className="page-title" style={{ maxWidth: 920 }}>
            {pattern.title}
          </h1>
          <p className="lead" style={{ maxWidth: 860 }}>
            {pattern.fullDescription}
          </p>
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
              You can still see the problem, use cases, and fit guidance. The
              detailed formula and implementation notes are locked to model the
              Pro experience before subscriptions are wired in.
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
            <DetailSection title="Problem">
              <p style={{ color: "#415049", lineHeight: 1.65, margin: 0 }}>
                {pattern.problemStatement}
              </p>
            </DetailSection>

            <DetailSection title="Solution">
              {pattern.isPremium ? <PremiumLock title="Formula locked" /> : <CopyCodeBlock code={pattern.formulaOrCode} />}
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
                  <dt style={{ color: "var(--foreground)", fontWeight: 800 }}>
                    Estimated time saved
                  </dt>
                  <dd style={{ margin: 0 }}>{pattern.estimatedTimeSaved}</dd>
                </div>
              </dl>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <h2 style={{ fontSize: "1.15rem", marginTop: 0 }}>Tags</h2>
              <div className="badge-row">
                {pattern.tags.map((tag) => (
                  <span className="badge" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
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
