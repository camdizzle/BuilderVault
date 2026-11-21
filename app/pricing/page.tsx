import Link from "next/link";
import { SimplePage } from "@/components/layout/simple-page";
import { proEnabled } from "@/lib/pro/config";

// Reads PRO_ENABLED when the page is requested, so switching Pro on in Plesk needs no rebuild.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Free Access | BuilderVault",
  description: "BuilderVault currently unlocks the public Power Platform pattern library, examples, and tools for free."
};

export default function PricingPage() {
  if (proEnabled()) return <ProPricing />;
  return (
    <SimplePage
      eyebrow="Free access"
      lead="BuilderVault is currently an open public resource for Power Platform developers. Patterns, examples, cookbooks, standards, cheat sheets, and browser tools are available without checkout or login."
      title="Everything public is free right now."
    >
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <Plan
          name="Public library"
          price="Free"
          features={["Browse public Power Platform patterns", "Use examples, cookbooks, standards, and cheat sheets", "Use browser-based tools", "Download free checklist packs"]}
        />
        <Plan
          name="Open developer resources"
          price="Free"
          features={["Full pattern details", "Implementation examples", "Troubleshooting notes", "SEO-friendly topic guides"]}
          highlighted
        />
      </div>
      <p>
        No checkout, billing, or account system is active. The current product goal is to be the clearest free Power Platform reference library possible.
      </p>
      <Link className="button" href="/tools/power-fx-formatter" style={{ justifySelf: "start" }}>
        Try a free tool
      </Link>
    </SimplePage>
  );
}

function ProPricing() {
  return (
    <SimplePage
      eyebrow="Pricing"
      lead="Every BuilderVault tool, pattern, guide and download is free without an account. Pro adds saved settings and history to the Power Fx formatter for $3 a month or $30 a year."
      title="Free to use. Pro if you want more."
    >
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <Plan
          name="Free"
          price="$0"
          features={["Every browser tool, including the Power Fx formatter", "All patterns, guides, examples and error pages", "Cookbooks, standards, cheat sheets and download packs", "No account needed"]}
        />
        <Plan
          name="Pro"
          price="$3 a month"
          features={["Or $30 a year, two months free", "Everything in Free", "Formatter settings saved to your account", "History of your last 50 saved formulas", "Sign in with an email link, cancel any time"]}
          highlighted
        />
      </div>
      <Link className="button" href="/pro" style={{ justifySelf: "start" }}>
        See BuilderVault Pro
      </Link>
    </SimplePage>
  );
}

function Plan({ features, highlighted = false, name, price }: { features: string[]; highlighted?: boolean; name: string; price: string }) {
  return (
    <div className="card" style={{ borderColor: highlighted ? "#82cdb7" : "var(--line)", padding: 22 }}>
      <h2 style={{ margin: 0 }}>{name}</h2>
      <div style={{ fontSize: "2rem", fontWeight: 800, marginTop: 8 }}>{price}</div>
      <ul>
        {features.map((feature) => <li key={feature}>{feature}</li>)}
      </ul>
    </div>
  );
}
