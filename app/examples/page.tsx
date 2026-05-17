import Link from "next/link";
import { ResourceCard } from "@/components/resources/resource-card";
import { exampleGuides } from "@/lib/example-guides";
import { cookbooks, cheatSheets, tools } from "@/lib/resources";

export const metadata = {
  title: "Power Platform Examples | BuilderVault",
  description: "Focused Power Apps, Power Automate, SharePoint, Dataverse, and ALM example pages for common maker searches."
};

export default function ExamplesPage() {
  const featuredResources = [cookbooks[0], cookbooks[2], cheatSheets[0], tools[1]];

  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 34 }}>
        <div style={{ maxWidth: 940 }}>
          <div className="eyebrow">Power Platform examples</div>
          <h1 className="page-title">Focused examples for high-intent builder searches.</h1>
          <p className="lead">These pages answer specific search questions with starter code, implementation steps, common mistakes, and links into the BuilderVault pattern library.</p>
        </div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          {exampleGuides.map((guide) => (
            <Link className="card" href={`/examples/${guide.slug}`} key={guide.slug} style={{ display: "grid", gap: 14, padding: 20 }}>
              <div className="eyebrow">{guide.eyebrow}</div>
              <h2 style={{ fontSize: "1.2rem", lineHeight: 1.2, margin: 0 }}>{guide.title}</h2>
              <p style={{ color: "#415049", lineHeight: 1.6, margin: 0 }}>{guide.description}</p>
            </Link>
          ))}
        </div>
        <section style={{ display: "grid", gap: 18 }}>
          <div>
            <div className="eyebrow">Related resources</div>
            <h2 className="section-title">Keep the example handy.</h2>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {featuredResources.map((resource) => <ResourceCard key={resource.slug} resource={resource} />)}
          </div>
        </section>
      </div>
    </section>
  );
}
