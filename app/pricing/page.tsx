import Link from "next/link";
import { SimplePage } from "@/components/layout/simple-page";

export const metadata = {
  title: "Pricing | BuilderVault"
};

export default function PricingPage() {
  return (
    <SimplePage
      eyebrow="Pricing"
      lead="BuilderVault is still pre-integration, so these plans are product positioning placeholders rather than active checkout plans."
      title="Simple pricing for Power Platform builders."
    >
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <Plan
          name="Free"
          price="$0"
          features={["Browse free patterns", "Save local favorites", "Use public formulas and checklists", "View premium previews"]}
        />
        <Plan
          name="Pro"
          price="$9-$19/mo"
          features={["Unlock premium patterns", "Save account-based favorites", "Use curated app and workflow packs", "Export build checklists later"]}
          highlighted
        />
      </div>
      <p>
        Stripe checkout will be added after the static product experience feels right. For now, use the Power Platform pattern library to validate the offer.
      </p>
      <Link className="button" href="/patterns" style={{ justifySelf: "start" }}>
        Browse the library
      </Link>
    </SimplePage>
  );
}

function Plan({
  features,
  highlighted = false,
  name,
  price
}: {
  features: string[];
  highlighted?: boolean;
  name: string;
  price: string;
}) {
  return (
    <div
      className="card"
      style={{
        borderColor: highlighted ? "#82cdb7" : "var(--line)",
        padding: 22
      }}
    >
      <h2 style={{ margin: 0 }}>{name}</h2>
      <div style={{ fontSize: "2rem", fontWeight: 800, marginTop: 8 }}>{price}</div>
      <ul>
        {features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
    </div>
  );
}
