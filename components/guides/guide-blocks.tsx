import Link from "next/link";
import type { ReactNode } from "react";
import { CopyCodeBlock } from "@/components/ui/copy-code-block";
import type { GuideBlock } from "@/lib/guides/types";
import { getResourceBySlug } from "@/lib/resources";

const bodyStyle = { color: "#415049", lineHeight: 1.75, margin: 0 } as const;
const inlineCodeStyle = {
  background: "rgba(15, 118, 110, 0.09)",
  borderRadius: 5,
  color: "var(--foreground)",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSize: "0.92em",
  padding: "1px 5px"
} as const;

const inlinePattern = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\[[^\]]+\]\((?:\/|https:\/\/)[^)\s]*\))/g;

/** Renders `code`, **bold** and [label](/path) inside article text. */
export function RichText({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;

  for (const match of text.matchAll(inlinePattern)) {
    const index = match.index ?? 0;
    if (index > last) nodes.push(text.slice(last, index));
    const token = match[0];

    if (token.startsWith("`")) {
      nodes.push(<code key={key++} style={inlineCodeStyle}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("**")) {
      nodes.push(<strong key={key++} style={{ color: "var(--foreground)" }}>{token.slice(2, -2)}</strong>);
    } else {
      const split = token.indexOf("](");
      const label = token.slice(1, split);
      const href = token.slice(split + 2, -1);
      nodes.push(
        href.startsWith("/")
          ? <Link href={href} key={key++} style={{ color: "var(--accent-strong)", fontWeight: 700 }}>{label}</Link>
          : <a href={href} key={key++} rel="noopener" style={{ color: "var(--accent-strong)", fontWeight: 700 }}>{label}</a>
      );
    }
    last = index + token.length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
}

export function GuideBlockView({ block }: { block: GuideBlock }) {
  switch (block.type) {
    case "p":
      return <p style={bodyStyle}><RichText text={block.text} /></p>;
    case "list": {
      const items = block.items.map((item) => <li key={item}><RichText text={item} /></li>);
      const style = { ...bodyStyle, display: "grid", gap: 6, paddingLeft: 22 } as const;
      return block.ordered ? <ol style={style}>{items}</ol> : <ul style={style}>{items}</ul>;
    }
    case "code":
      return <CopyCodeBlock code={block.code} copyEvent="Guide Code Copied" label={block.label ?? "Power Fx"} />;
    case "table":
      return (
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", fontSize: "0.95rem", minWidth: 480, width: "100%" }}>
            <thead>
              <tr>
                {block.headers.map((header) => (
                  <th key={header} scope="col" style={{ borderBottom: "2px solid var(--line)", color: "var(--foreground)", padding: "10px 12px", textAlign: "left" }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row.join("|")}>
                  {row.map((cell, index) => (
                    <td key={index} style={{ borderBottom: "1px solid var(--line)", color: "#415049", lineHeight: 1.6, padding: "10px 12px", verticalAlign: "top" }}>
                      <RichText text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "tool": {
      const resource = getResourceBySlug("tool", block.slug);
      if (!resource) return null;
      return (
        <div style={{ alignItems: "center", background: "rgba(15, 118, 110, 0.07)", border: "1px solid rgba(15, 118, 110, 0.25)", borderRadius: 8, display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "space-between", padding: "14px 16px" }}>
          <p style={{ ...bodyStyle, flex: "1 1 320px" }}>
            <strong style={{ color: "var(--foreground)" }}>Try it: </strong>
            <RichText text={block.text} />
          </p>
          <Link className="button" href={resource.path}>Open the {resource.title}</Link>
        </div>
      );
    }
    case "note":
      return (
        <p style={{ ...bodyStyle, borderLeft: "4px solid var(--accent-strong)", paddingLeft: 14 }}>
          <RichText text={block.text} />
        </p>
      );
  }
}
