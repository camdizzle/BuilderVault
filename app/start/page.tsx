import Link from "next/link";
import { NewsletterSignup } from "@/components/growth/newsletter-signup";
import { learningPath, learningPathFaqs, learningPathPath } from "@/lib/learning-path";
import { absoluteUrl } from "@/lib/site";

const title = "Learn Power Apps step by step: a learning path for new makers";
const description =
  "A free, ordered path from your first SharePoint list to a shared canvas app: choose a data source, build a gallery and form, learn Power Fx, filter without delegation warnings, save with Patch, add a flow and share the app.";

export const metadata = {
  title: title + " | BuilderVault",
  description,
  keywords: ["learn Power Apps", "Power Apps for beginners", "Power Apps learning path", "Power Apps tutorial", "how to start with Power Apps", "Power Fx basics"],
  alternates: { canonical: learningPathPath },
  openGraph: { title, description, type: "website", url: learningPathPath }
};

const bodyStyle = { color: "#415049", lineHeight: 1.7, margin: 0 } as const;
const linkStyle = { color: "var(--accent-strong)", fontWeight: 700 } as const;

export default function StartPage() {
  const itemListData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Learn Power Apps step by step",
    itemListElement: learningPath.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.title,
      url: absoluteUrl(learningPathPath + "#" + step.id)
    }))
  };
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: learningPathFaqs.map((faq) => ({
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
          <div className="eyebrow">Learning path for new makers</div>
          <h1 className="page-title">Learn Power Apps step by step.</h1>
          <p className="lead">
            Seven steps that take you from an empty SharePoint list to a canvas app your team uses. Each step says what you&apos;ll learn, links to the guides, functions and tools that teach it, and ends with a checkpoint you can test in your own app before moving on.
          </p>
        </header>

        <nav aria-label="Steps" className="card" style={{ display: "grid", gap: 10, padding: 20 }}>
          <h2 style={{ fontSize: "1.05rem", margin: 0 }}>The seven steps</h2>
          <ol style={{ ...bodyStyle, display: "grid", gap: 4, paddingLeft: 22 }}>
            {learningPath.map((step) => (
              <li key={step.id}>
                <a href={"#" + step.id} style={linkStyle}>{step.title}</a>
              </li>
            ))}
          </ol>
        </nav>

        <ol style={{ display: "grid", gap: 22, listStyle: "none", margin: 0, padding: 0 }}>
          {learningPath.map((step, index) => (
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
          <p style={bodyStyle}>
            Once your first app is shared, the rest of the site is organised by the job in front of you. Look up any function in the <Link href="/functions" style={linkStyle}>Power Fx function reference</Link>, paste an error message into the <Link href="/errors" style={linkStyle}>error library</Link>, copy a tested approach from the <Link href="/patterns" style={linkStyle}>pattern library</Link>, or browse every <Link href="/guides" style={linkStyle}>how-to guide</Link>.
          </p>
        </section>

        <section style={{ display: "grid", gap: 14, maxWidth: 940 }}>
          <h2 className="section-title">Questions</h2>
          {learningPathFaqs.map((faq) => (
            <div key={faq.question}>
              <h3 style={{ fontSize: "1.1rem", margin: "0 0 6px" }}>{faq.question}</h3>
              <p style={bodyStyle}>{faq.answer}</p>
            </div>
          ))}
        </section>

        <NewsletterSignup placement="start" title="Get new guides and Power Platform tips by email" />
      </div>
    </section>
  );
}
