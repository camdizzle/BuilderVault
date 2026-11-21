import { notFound } from "next/navigation";
import { ResourceDetailPage } from "@/components/resources/resource-detail-page";
import { ToolWidget } from "@/components/resources/tool-widget";
import { functionPages, functionPath } from "@/lib/functions";
import { tools, getResourceBySlug } from "@/lib/resources";

/** Every function name the reference covers, with its page. "First, Last and LastN" covers three names. */
function functionLinks() {
  return functionPages.flatMap((page) =>
    page.name.split(/,\s*|\s+and\s+/).map((name) => ({ name: name.trim(), href: functionPath(page) })).filter((link) => /^[A-Za-z]+$/.test(link.name))
  );
}

export function generateStaticParams() {
  return tools.map((resource) => ({ slug: resource.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resource = getResourceBySlug("tool", slug);

  if (!resource) {
    return { title: "Resource | BuilderVault" };
  }

  return {
    title: resource.title + " | BuilderVault",
    description: resource.description,
    keywords: resource.keywords,
    alternates: { canonical: resource.path },
    openGraph: {
      title: resource.title,
      description: resource.description,
      type: "article",
      url: resource.path
    }
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resource = getResourceBySlug("tool", slug);

  if (!resource) {
    notFound();
  }

  return (
    <ResourceDetailPage resource={resource}>
      <ToolWidget functionLinks={resource.slug === "power-fx-formatter" ? functionLinks() : []} slug={resource.slug} />
    </ResourceDetailPage>
  );
}