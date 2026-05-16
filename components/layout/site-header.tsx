import Link from "next/link";

export function SiteHeader() {
  return (
    <header
      style={{
        background: "rgba(247, 248, 245, 0.94)",
        borderBottom: "1px solid var(--line)",
        position: "sticky",
        top: 0,
        zIndex: 20
      }}
    >
      <div
        className="container"
        style={{
          alignItems: "center",
          display: "flex",
          gap: 20,
          justifyContent: "space-between",
          minHeight: 72
        }}
      >
        <Link
          href="/"
          style={{
            alignItems: "center",
            display: "flex",
            fontSize: "1.15rem",
            fontWeight: 800,
            gap: 10
          }}
        >
          <span
            aria-hidden="true"
            style={{
              background: "var(--accent)",
              borderRadius: 6,
              color: "white",
              display: "grid",
              height: 32,
              placeItems: "center",
              width: 32
            }}
          >
            B
          </span>
          BuilderVault
        </Link>
        <nav aria-label="Main navigation" className="compact-nav-group">
          <Link href="/patterns">Patterns</Link>
          <Link href="/resources">Resources</Link>
          <Link href="/cookbooks">Cookbooks</Link>
          <Link href="/tools">Tools</Link>
          <Link className="button secondary" href="/pricing" style={{ minHeight: 38, padding: "0 14px" }}>
            Pricing
          </Link>
        </nav>
      </div>
    </header>
  );
}
