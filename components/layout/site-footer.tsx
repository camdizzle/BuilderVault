import Link from "next/link";

export function SiteFooter() {
  return (
    <footer style={{ borderTop: "1px solid var(--line)", marginTop: 72 }}>
      <div
        className="container"
        style={{
          color: "var(--muted)",
          display: "grid",
          gap: 22,
          gridTemplateColumns: "minmax(240px, 1fr) minmax(260px, 1fr)",
          paddingBottom: 28,
          paddingTop: 28
        }}
      >
        <div>
          <strong style={{ color: "var(--foreground)" }}>BuilderVault</strong>
          <p style={{ lineHeight: 1.6, marginBottom: 0 }}>
            Practical Microsoft 365 patterns and PMO reporting tools. Static
            prototype only; auth, payments, and AI come later.
          </p>
        </div>
        <nav
          aria-label="Footer navigation"
          style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "flex-end" }}
        >
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/disclaimer">Disclaimer</Link>
        </nav>
      </div>
    </footer>
  );
}
