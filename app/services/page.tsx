import Link from "next/link";
import { SimplePage } from "@/components/layout/simple-page";
import { ServicesRequestLink } from "@/components/growth/services-request-link";
import { serviceOffers } from "@/lib/services";

export const metadata = {
  title: "Power Apps and Power Automate Help",
  description: "Get hands-on help with Power Apps formulas, Power Automate flows, SharePoint and Dataverse data models, and Power Platform ALM from the builder behind BuilderVault.",
  alternates: { canonical: "/services" }
};

export default function ServicesPage() {
  return (
    <SimplePage
      eyebrow="Get help"
      lead="BuilderVault's patterns and tools are free. When you'd rather have someone look at your app or flow directly, here's how I can help."
      title="Stuck on an app or flow?"
    >
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        {serviceOffers.map((offer) => (
          <article className="card" key={offer.slug} style={{ display: "grid", gap: 12, padding: 22 }}>
            <h2 style={{ fontSize: "1.3rem", margin: 0 }}>{offer.title}</h2>
            <p style={{ color: "#415049", lineHeight: 1.6, margin: 0 }}>{offer.summary}</p>
            <div>
              <strong>Good for</strong>
              <ul style={{ color: "#415049", lineHeight: 1.7, margin: "6px 0 0", paddingLeft: 20 }}>
                {offer.goodFor.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <ServicesRequestLink className="button secondary" label="Ask about this" offer={offer.title} />
          </article>
        ))}
      </div>
      <h2>How it works</h2>
      <ol>
        <li>Email a short description of what you&apos;re building and what&apos;s going wrong.</li>
        <li>I reply with whether I can help, a rough scope, and a quote before any work starts.</li>
        <li>Share formulas, screenshots, or a solution export. Don&apos;t send production data or credentials.</li>
      </ol>
      <ServicesRequestLink label="Email a request" />
      <p>
        Prefer to keep going on your own? Try the <Link href="/tools/power-fx-formatter">Power Fx Formatter</Link> or browse the{" "}
        <Link href="/patterns">pattern library</Link>.
      </p>
    </SimplePage>
  );
}
