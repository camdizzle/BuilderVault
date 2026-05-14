import { CollectionCard } from "@/components/collections/collection-card";
import { FavoritesView } from "@/components/patterns/favorites-view";
import { getSuggestedCollections } from "@/lib/patterns/collections";
import { getAllPatterns, getPatternStats } from "@/lib/patterns/patterns";

export const metadata = {
  title: "Workspace Preview | BuilderVault"
};

export default function DashboardPage() {
  const stats = getPatternStats();

  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 30 }}>
        <div>
          <div className="eyebrow">Workspace preview</div>
          <h1 className="page-title">Your future Power Platform builder workspace.</h1>
          <p className="lead" style={{ maxWidth: 880 }}>
            This static workspace previews the logged-in experience without auth: local favorites, suggested collections, premium unlocks, and delivery packs for makers and consultants.
          </p>
        </div>
        <div className="stat-grid">
          <Metric label="Patterns" value={stats.totalPatterns} />
          <Metric label="Premium previews" value={stats.premiumPatterns} />
          <Metric label="Categories" value={stats.categories} />
          <Metric label="Platforms" value={stats.platforms} />
        </div>
        <div className="split-grid">
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ marginTop: 0 }}>Saved patterns</h2>
            <FavoritesView patterns={getAllPatterns()} />
          </div>
          <aside className="card" style={{ alignSelf: "start", display: "grid", gap: 14, padding: 24 }}>
            <h2 style={{ margin: 0 }}>Builder packs</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
              Future Pro workspaces can group favorites into app builds, workflow packs, Dataverse foundations, and admin governance checklists.
            </p>
            <div className="locked-preview">
              Pro preview: account favorites, private collections, deployment checklists, premium unlocks, and exports will appear here after integrations.
            </div>
          </aside>
        </div>
        <section style={{ display: "grid", gap: 18 }}>
          <h2 className="section-title">Suggested collections</h2>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {getSuggestedCollections().slice(0, 6).map((collection) => (
              <CollectionCard collection={collection} key={collection.slug} />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-tile">
      <div style={{ fontSize: "2rem", fontWeight: 800 }}>{value}</div>
      <div style={{ color: "var(--muted)" }}>{label}</div>
    </div>
  );
}
