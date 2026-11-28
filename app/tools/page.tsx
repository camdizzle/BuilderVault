import { ToolsIndex, type ToolCard } from "@/components/tools-index/tools-index";
import { tools } from "@/lib/resources";
import { getToolCatalogEntry, toolGroups } from "@/lib/tool-catalog";

const description = `${tools.length} free browser tools for Power Apps, Power Automate, SharePoint and Dataverse: format Power Fx, build expressions and filter queries, check delegation, generate schemas and cards, and more. Everything runs in your browser.`;

export const metadata = {
  title: "Free Power Platform Tools | BuilderVault",
  description,
  alternates: { canonical: "/tools" }
};

export default function Page() {
  const cards: ToolCard[] = tools.map((tool) => {
    const entry = getToolCatalogEntry(tool.slug);
    return {
      slug: tool.slug,
      title: tool.title,
      path: tool.path,
      tagline: entry.tagline,
      glyph: entry.glyph,
      group: entry.group,
      popular: Boolean(entry.popular),
      searchText: [tool.description, ...tool.keywords].join(" ")
    };
  });

  return (
    <section style={{ padding: "32px 0 54px" }}>
      <div className="container" style={{ display: "grid", gap: 24 }}>
        <header style={{ maxWidth: 900 }}>
          <div className="eyebrow">Free · runs in your browser</div>
          <h1 className="tool-title" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginTop: 8 }}>Free Power Platform Tools</h1>
          <p className="tool-lead">{description}</p>
        </header>
        <ToolsIndex cards={cards} groups={toolGroups} />
      </div>
    </section>
  );
}
