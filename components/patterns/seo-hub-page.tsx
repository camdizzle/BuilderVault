import Link from "next/link";
import { CollectionCard } from "@/components/collections/collection-card";
import { PatternCard } from "@/components/patterns/pattern-card";
import { getCollectionBySlug } from "@/lib/patterns/collections";
import { getAllPatterns } from "@/lib/patterns/patterns";
import type { Pattern } from "@/types/pattern";

export type SeoHubConfig = {
  title: string;
  eyebrow: string;
  description: string;
  keywords: string[];
  collectionSlugs: string[];
  match: (pattern: Pattern) => boolean;
};

export function SeoHubPage({ config }: { config: SeoHubConfig }) {
  const patterns = getAllPatterns().filter(config.match).slice(0, 18);
  const collections = config.collectionSlugs
    .map((slug) => getCollectionBySlug(slug))
    .filter((collection): collection is NonNullable<typeof collection> => Boolean(collection));

  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 34 }}>
        <div style={{ maxWidth: 900 }}>
          <div className="eyebrow">{config.eyebrow}</div>
          <h1 className="page-title">{config.title}</h1>
          <p className="lead">{config.description}</p>
          <div className="badge-row" style={{ marginTop: 18 }}>
            {config.keywords.map((keyword) => (
              <span className="badge" key={keyword}>{keyword}</span>
            ))}
          </div>
        </div>

        {collections.length > 0 ? (
          <section style={{ display: "grid", gap: 18 }}>
            <h2 className="section-title">Recommended collections</h2>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
              {collections.map((collection) => (
                <CollectionCard collection={{ ...collection, count: collection.patternSlugs.length }} key={collection.slug} />
              ))}
            </div>
          </section>
        ) : null}

        <section style={{ display: "grid", gap: 18 }}>
          <div style={{ alignItems: "end", display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "space-between" }}>
            <h2 className="section-title" style={{ margin: 0 }}>Featured patterns</h2>
            <Link className="button secondary" href="/patterns">Browse all patterns</Link>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {patterns.map((pattern) => (
              <PatternCard key={pattern.id} pattern={pattern} />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

export function textIncludes(pattern: Pattern, terms: string[]) {
  const text = [
    pattern.title,
    pattern.slug,
    pattern.shortDescription,
    pattern.fullDescription,
    pattern.category,
    pattern.subCategory,
    pattern.problemStatement,
    ...pattern.tags,
    ...pattern.platform
  ]
    .join(" ")
    .toLowerCase();

  return terms.some((term) => text.includes(term));
}
