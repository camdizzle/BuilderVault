import Link from "next/link";
import type { ReactNode } from "react";
import { NewsletterSignup } from "@/components/growth/newsletter-signup";
import type { PathStep } from "@/lib/learning-path";
import { absoluteUrl } from "@/lib/site";

type Props = {
  path: string;
  name: string;
  eyebrow: string;
  heading: string;
  lead: string;
  stepsHeading: string;
  steps: PathStep[];
  faqs: Array<{ question: string; answer: string }>;
  afterPath: ReactNode;
  placement: string;
};

const bodyStyle = { color: "#415049", lineHeight: 1.7, margin: 0 } as const;
const linkStyle = { color: "var(--accent-strong)", fontWeight: 700 } as const;

/** The ordered learning path layout shared by /start and /start/flows. */
export function LearningPathView({ path, name, eyebrow, heading, lead, stepsHeading, steps, faqs, afterPath, placement }: Props) {
  const itemListData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: steps.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.title,
      url: absoluteUrl(path + "#" + step.id)
    }))
  };
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer }
    }))
  };

  return (
    <section style={{ padding: "54px 0" }}>
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListData) }} type="application/ld+json" />
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }} type="application/ld+json" />
      <div className="container" style={{ display: "grid", gap: 34 }}>
        <nav aria-label="Breadcrumb" className="badge-row">
          <Link href="/guides" style={{ color: "var(--accent-strong)", fontWeight: 800 }}>Guides</Link>
        </nav>

        <header style={{ maxWidth: 940 }}>
          <div className="eyebrow">{eyebrow}</div>
          <h1 className="page-title">{heading}</h1>
          <p className="lead">{lead}</p>
        </header>

        <nav aria-label="Steps" className="card" style={{ display: "grid", gap: 10, padding: 20 }}>
          <h2 style={{ fontSize: "1.05rem", margin: 0 }}>{stepsHeading}</h2>
          <ol style={{ ...bodyStyle, display: "grid", gap: 4, paddingLeft: 22 }}>
            {steps.map((step) => (
              <li key={step.id}>
                <a href={"#" + step.id} style={linkStyle}>{step.title}</a>
              </li>
            ))}
          </ol>
        </nav>

        <ol style={{ display: "grid", gap: 22, listStyle: "none", margin: 0, padding: 0 }}>
          {steps.map((step, index) => (
            <li className="card" id={step.id} key={step.id} style={{ display: "grid", gap: 16, padding: 24, scrollMarginTop: 90 }}>
              <div style={{ alignItems: "center", display: "flex", gap: 14 }}>
                <span
                  aria-hidden="true"
                  style={{ alignItems: "center", background: "var(--accent-soft)", borderRadius: 999, color: "var(--accent-strong)", display: "inline-flex", flex: "0 0 auto", fontWeight: 800, height: 40, justifyContent: "center", width: 40 }}
                >
                  {index + 1}
                </span>
                <h2 className="section-title" style={{ fontSize: "1.6rem", margin: 0 }}>
                  <span className="sr-only">Step {index + 1}: </span>
                  {step.title}
                </h2>
              </div>
              <p style={bodyStyle}>{step.summary}</p>

              <div>
                <h3 style={{ fontSize: "1.05rem", margin: "0 0 6px" }}>What you&apos;ll learn</h3>
                <ul style={{ ...bodyStyle, display: "grid", gap: 4, paddingLeft: 22 }}>
                  {step.learn.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>

              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
                {step.links.map((link) => (
                  <Link className="card" href={link.href} key={link.href} style={{ alignContent: "start", display: "grid", gap: 6, minHeight: 0, padding: 16 }}>
                    <span className="eyebrow" style={{ fontSize: "0.75rem" }}>{link.kind}</span>
                    <span style={{ fontWeight: 800 }}>{link.label}</span>
                    <span style={{ color: "var(--muted)", lineHeight: 1.5 }}>{link.note}</span>
                  </Link>
                ))}
              </div>

              <div style={{ background: "var(--accent-soft)", borderRadius: 8, display: "grid", gap: 6, padding: "14px 16px" }}>
                <h3 style={{ fontSize: "1rem", margin: 0 }}>Checkpoint</h3>
                <p style={{ ...bodyStyle, color: "var(--foreground)" }}>{step.checkpoint}</p>
              </div>
            </li>
          ))}
        </ol>

        <section style={{ display: "grid", gap: 14, maxWidth: 940 }}>
          <h2 className="section-title">After the path</h2>
          <p style={bodyStyle}>{afterPath}</p>
        </section>

        <section style={{ display: "grid", gap: 14, maxWidth: 940 }}>
          <h2 className="section-title">Questions</h2>
          {faqs.map((faq) => (
            <div key={faq.question}>
              <h3 style={{ fontSize: "1.1rem", margin: "0 0 6px" }}>{faq.question}</h3>
              <p style={bodyStyle}>{faq.answer}</p>
            </div>
          ))}
        </section>

        <NewsletterSignup placement={placement} title="Get new guides and Power Platform tips by email" />
      </div>
    </section>
  );
}

export const pathLinkStyle = linkStyle;
