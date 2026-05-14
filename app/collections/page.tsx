import { CollectionCard } from "@/components/collections/collection-card";
import { getSuggestedCollections } from "@/lib/patterns/collections";

export const metadata = {
  title: "Power Platform Collections | BuilderVault",
  description:
    "Browse curated Power Platform pattern collections for Power Apps, Power Automate, SharePoint, Dataverse, ALM, admin governance, and Teams workflows."
};

export default function CollectionsPage() {
  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 28 }}>
        <div style={{ maxWidth: 880 }}>
          <div className="eyebrow">Collections</div>
          <h1 className="page-title">Browse Power Platform patterns by practical build path.</h1>
          <p className="lead">
            Collections package the larger library into focused kits for patching, delegation, approvals, Dataverse foundations, SharePoint backends, ALM, admin governance, and Teams workflow experiences.
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
