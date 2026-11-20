import Link from "next/link";
import { GuideCard } from "@/components/guides/guide-card";
import { ResourceCard } from "@/components/resources/resource-card";
import { guides } from "@/lib/guides";
import { getResourceBySlug, type ResourceItem } from "@/lib/resources";

export const metadata = {
  title: "Power Fx How-To Guides | BuilderVault",
  description: "Step-by-step guides for Power Apps formulas: fixing formula errors, finding missing brackets, clearing delegation warnings, formatting, speeding up slow formulas and moving from Excel.",
  alternates: { canonical: "/guides" }
};

const toolSlugs = ["power-fx-formatter", "power-apps-delegation-checker", "power-apps-naming-linter", "excel-to-power-fx"];

export default function GuidesPage() {
  const tools = toolSlugs
    .map((slug) => getResourceBySlug("tool", slug))
    .filter((tool): tool is ResourceItem => Boolean(tool));

  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 34 }}>
        <nav aria-label="Breadcrumb" className="badge-row">
          <Link href="/resources" style={{ color: "var(--accent-strong)", fontWeight: 800 }}>Resources</Link>
        </nav>
        <div style={{ maxWidth: 940 }}>
          <div className="eyebrow">Power Fx how-to guides</div>
          <h1 className="page-title">Fix, tidy and speed up Power Apps formulas.</h1>
          <p className="lead">
            Each guide answers one question about Power Fx, shows the formula before and after, and points to the free tool that does the checking for you. The guides are checked against Microsoft&apos;s documentation.
          </p>
        </div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          {guides.map((guide) => <GuideCard guide={guide} key={guide.slug} />)}
        </div>
        <section style={{ display: "grid", gap: 18 }}>
          <div>
            <div className="eyebrow">Tools used in the guides</div>
            <h2 className="section-title">Check a formula as you read.</h2>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {tools.map((tool) => <ResourceCard key={tool.slug} resource={tool} />)}
          </div>
        </section>
      </div>
    </section>
  );
}
