import Link from "next/link";
import { SimplePage } from "@/components/layout/simple-page";

export const metadata = {
  title: "Pricing Roadmap | BuilderVault",
  description: "BuilderVault is currently free while the public Power Platform pattern library, examples, and tools are being completed."
};

export default function PricingPage() {
  return (
    <SimplePage
      eyebrow="Pricing roadmap"
      lead="BuilderVault is currently a free public resource while the pattern library, examples, and tools are being completed. Paid plans will wait until the product experience is ready."
      title="Free now. Paid features later."
    >
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <Plan
          name="Public library"
          price="Free"
          features={["Browse public Power Platform patterns", "Use examples, cookbooks, standards, and cheat sheets", "Use browser-based tools", "Save favorites locally in your browser"]}
        />
        <Plan
          name="Future paid options"
          price="Planned"
          features={["Deeper curated pattern packs", "Downloadable implementation bundles", "Account-based saved libraries", "PMO and delivery toolkits as a separate offer"]}
          highlighted
        />
      </div>
      <p>
        No checkout, billing, account system, or paid access is active yet. Stripe and Supabase will be added only after the public product surface is polished and the paid offer is clear.
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
