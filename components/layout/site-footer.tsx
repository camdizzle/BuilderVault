import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ borderTop: "1px solid var(--line)", marginTop: 72 }}>
      <div
        className="container footer-grid"
        style={{
          color: "var(--muted)",
          paddingBottom: 28,
          paddingTop: 28
        }}
      >
        <div>
          <strong style={{ color: "var(--foreground)" }}>BuilderVault</strong>
          <p style={{ lineHeight: 1.6, marginBottom: 10 }}>
            Practical Power Platform patterns for Power Apps, Power Automate,
            SharePoint, Dataverse, ALM, and Microsoft 365 builders.
          </p>
          <p style={{ fontSize: "0.9rem", lineHeight: 1.55, margin: 0 }}>
            BuilderVault is an independent resource and is not affiliated with, sponsored by, or endorsed by Microsoft.
          </p>
          <p style={{ fontSize: "0.9rem", marginBottom: 0 }}>© {year} BuilderVault.</p>
        </div>
        <FooterGroup title="Learn" links={[["/patterns", "Patterns"], ["/resources", "Resources"], ["/examples", "Examples"], ["/cookbooks", "Cookbooks"]]} />
        <FooterGroup title="Tools" links={[["/tools/power-fx-formatter", "Power Fx Formatter"], ["/tools/sharepoint-internal-name-helper", "Internal Name Helper"], ["/tools/power-automate-expression-builder", "Expression Builder"], ["/tools/solution-layering-checklist-generator", "ALM Checklist"]]} />
        <FooterGroup title="Company" links={[["/about", "About"], ["/contact", "Contact"], ["/pricing", "Free access"]]} />
        <FooterGroup title="Legal" links={[["/privacy", "Privacy"], ["/terms", "Terms"], ["/disclaimer", "Disclaimer"]]} />
      </div>
    </footer>
  );
}

function FooterGroup({ links, title }: { links: string[][]; title: string }) {
  return (
    <nav aria-label={title} style={{ display: "grid", gap: 8, alignSelf: "start" }}>
      <strong style={{ color: "var(--foreground)" }}>{title}</strong>
      {links.map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}
    </nav>
  );
}
