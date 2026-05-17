import { notFound } from "next/navigation";
import { ResourceDetailPage } from "@/components/resources/resource-detail-page";
import { ToolWidget } from "@/components/resources/tool-widget";
import { tools, getResourceBySlug } from "@/lib/resources";

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
      <ToolWidget slug={resource.slug} />
    </ResourceDetailPage>
  );
}