import Link from "next/link";
import { SimplePage } from "@/components/layout/simple-page";

export const metadata = {
  title: "Free Access | BuilderVault",
  description: "BuilderVault currently unlocks the public Power Platform pattern library, examples, and tools for free."
};

export default function PricingPage() {
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
          features={["Browse public Power Platform patterns", "Use examples, cookbooks, standards, and cheat sheets", "Use browser-based tools", "Save favorites locally in your browser"]}
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
