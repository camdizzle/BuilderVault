import { FavoritesView } from "@/components/patterns/favorites-view";
import { getAllPatterns } from "@/lib/patterns/patterns";

export const metadata = {
  title: "Favorites | BuilderVault"
};

export default function FavoritesPage() {
  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container">
        <div style={{ display: "grid", gap: 12, marginBottom: 28 }}>
          <div className="eyebrow">Local favorites</div>
          <h1 className="page-title" style={{ maxWidth: 850 }}>
            Saved patterns for this browser.
          </h1>
          <p className="lead" style={{ maxWidth: 820 }}>
            Phase 2 saves favorites locally so the workflow is visible before
            user accounts are added. In Phase 3, these can move into logged-in
            saved favorites.
          </p>
        </div>
        <FavoritesView patterns={getAllPatterns()} />
      </div>
    </section>
  );
}
