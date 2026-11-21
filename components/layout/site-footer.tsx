import Link from "next/link";
import type { ReactNode } from "react";
import { CookieSettingsButton } from "@/components/analytics/cookie-consent";
import { errorProducts } from "@/lib/errors";
import { errorProductAnchor } from "@/lib/navigation";
import { tools } from "@/lib/resources";

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
        <FooterGroup title="Tools" links={[["/tools/power-fx-formatter", "Power Fx Formatter"], ["/tools/power-automate-expression-builder", "Expression Builder"], ["/tools/odata-filter-query-builder", "Filter Query Builder"], ["/tools/power-apps-delegation-checker", "Delegation Checker"], ["/tools/patch-formula-builder", "Patch Formula Builder"], ["/tools/date-format-tester", "Date Format Tester"], ["/tools/error-message-finder", "Error Message Finder"], ["/tools", `All ${tools.length} tools`]]} />
        <FooterGroup title="Learn" links={[["/guides", "How-to guides"], ["/functions", "Power Fx functions"], ["/examples", "Worked examples"], ["/cookbooks", "Cookbooks"], ["/cheat-sheets", "Cheat sheets"], ["/standards", "Team standards"], ["/downloads", "Free downloads"], ["/pmo", "PMO Toolkit"]]} />
        <FooterGroup title="Fix an error" links={[["/errors", "Error library"], ...errorProducts.map((product) => [`/errors#${errorProductAnchor(product)}`, product])]} />
        <FooterGroup title="Patterns" links={[["/patterns", "Pattern library"], ["/collections", "Collections"], ["/power-apps", "Power Apps"], ["/power-automate", "Power Automate"], ["/sharepoint", "SharePoint"], ["/dataverse", "Dataverse"], ["/alm", "ALM and governance"]]} />
        <FooterGroup title="Company" links={[["/about", "About"], ["/services", "Get help"], ["/contact", "Contact"], ["/pricing", "Free access"], ["/privacy", "Privacy"], ["/terms", "Terms"], ["/disclaimer", "Disclaimer"]]}>
          <CookieSettingsButton />
        </FooterGroup>
      </div>
    </footer>
  );
}

function FooterGroup({ children, links, title }: { children?: ReactNode; links: string[][]; title: string }) {
  return (
    <nav aria-label={title} style={{ display: "grid", gap: 8, alignSelf: "start" }}>
      <strong style={{ color: "var(--foreground)" }}>{title}</strong>
      {links.map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}
      {children}
    </nav>
  );
}
