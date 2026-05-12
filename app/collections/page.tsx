import { CollectionCard } from "@/components/collections/collection-card";
import { getSuggestedCollections } from "@/lib/patterns/collections";

export const metadata = {
  title: "Collections | BuilderVault"
};

export default function CollectionsPage() {
  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 28 }}>
        <div style={{ maxWidth: 880 }}>
          <div className="eyebrow">Collections</div>
          <h1 className="page-title">Browse patterns by practical workstream.</h1>
          <p className="lead">
            Collections package the larger library into focused kits for patching,
            governance, approvals, status reporting, and starter examples.
          </p>
        </div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          {getSuggestedCollections().map((collection) => (
            <CollectionCard collection={collection} key={collection.slug} />
          ))}
        </div>
      </div>
    </section>
  );
}
