import { notFound } from "next/navigation";
import { PatternCard } from "@/components/patterns/pattern-card";
import {
  getCollectionBySlug,
  getCollectionPatterns,
  patternCollections
} from "@/lib/patterns/collections";

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return patternCollections.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  return {
    title: collection ? `${collection.title} | BuilderVault` : "Collection | BuilderVault",
    description: collection?.shortDescription
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const patterns = getCollectionPatterns(collection);

  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 28 }}>
        <div style={{ maxWidth: 880 }}>
          <div className="eyebrow">Collection</div>
          <h1 className="page-title">{collection.title}</h1>
          <p className="lead">{collection.shortDescription}</p>
        </div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          {patterns.map((pattern) => (
            <PatternCard key={pattern.id} pattern={pattern} />
          ))}
        </div>
      </div>
    </section>
  );
}
