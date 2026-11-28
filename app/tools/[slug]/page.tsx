import { notFound } from "next/navigation";
import { ResourceDetailPage } from "@/components/resources/resource-detail-page";
import { ToolWidget } from "@/components/resources/tool-widget";
import { errorPages, errorPath } from "@/lib/errors";
import { functionPages, functionPath } from "@/lib/functions";
import { tools, getResourceBySlug } from "@/lib/resources";

/** Every function name the reference covers, with its page. "First, Last and LastN" covers three names. */
function functionLinks() {
  return functionPages.flatMap((page) =>
    page.name.split(/,\s*|\s+and\s+/).map((name) => ({ name: name.trim(), href: functionPath(page) })).filter((link) => /^[A-Za-z]+$/.test(link.name))
  );
}

/** The error library, cut down to what the error message finder searches. */
function errorEntries() {
  return errorPages.map((page) => ({
    slug: page.slug,
    href: errorPath(page),
    title: page.shortTitle,
    product: page.product,
    message: page.message,
    variants: page.variants,
    keywords: page.keywords,
    quickAnswer: page.quickAnswer,
    tools: page.relatedTools
      .filter((slug) => slug !== "error-message-finder")
      .flatMap((slug) => {
        const tool = getResourceBySlug("tool", slug);
        return tool ? [{ href: tool.path, title: tool.title }] : [];
      })
  }));
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
      <ToolWidget
        errorEntries={resource.slug === "error-message-finder" ? errorEntries() : []}
        functionLinks={resource.slug === "power-fx-formatter" ? functionLinks() : []}
        slug={resource.slug}
      />
    </ResourceDetailPage>
  );
}