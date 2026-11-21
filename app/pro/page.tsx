import Link from "next/link";
import { notFound } from "next/navigation";
import { SimplePage } from "@/components/layout/simple-page";
import { PlanButtons } from "@/components/pro/plan-buttons";
import { proEnabled } from "@/lib/pro/config";
import { currentViewer } from "@/lib/pro/session";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "BuilderVault Pro",
  description: "BuilderVault Pro saves your Power Fx formatter settings and formula history across devices for $3 a month or $30 a year. Every BuilderVault tool stays free.",
  alternates: { canonical: "/pro" }
};

const features = [
  {
    title: "Your formatter style, everywhere",
    detail: "Save your indent, line width, separator style and data source once. The Power Fx formatter opens with them on any device you sign in on."
  },
  {
    title: "Formula history",
    detail: "Save formulas from the Power Fx formatter to a history of your last 50, and reopen any of them with one click."
  },
  {
    title: "Everything free stays free",
    detail: "All BuilderVault tools, patterns, guides, error pages and downloads stay free without an account. Pro adds conveniences on top; it never locks a tool."
  }
];

const faqs = [
  {
    question: "How do I cancel?",
    answer: "Open your account page and choose Manage billing. You can cancel, switch between monthly and yearly, or update your card there. Pro stays on until the end of the period you paid for."
  },
  {
    question: "Who handles payment?",
    answer: "Stripe processes every payment. BuilderVault never sees or stores your card number."
  },
  {
    question: "Do I need a password?",
    answer: "No. You sign in with a link sent to your email address."
  },
  {
    question: "Can I get a receipt for expenses?",
    answer: "Stripe emails a receipt for every payment, and past invoices are available from Manage billing."
  }
];

export default async function ProPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (!proEnabled()) notFound();
  const [viewer, params] = await Promise.all([currentViewer(), searchParams]);

  return (
    <SimplePage
      eyebrow="BuilderVault Pro"
      lead="Pro keeps your Power Fx formatter settings and formula history with your account, for $3 a month or $30 a year. Every tool on BuilderVault stays free."
      title="Make the formatter yours."
    >
      {params.error === "checkout" ? (
        <p className="pro-notice error" role="alert">
          Checkout could not start just now. Please try again in a minute, or contact <a href="mailto:help@camwow.tv">help@camwow.tv</a>.
        </p>
      ) : null}
      <PlanButtons viewer={viewer} />
      <h2>What Pro adds</h2>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        {features.map((feature) => (
          <div className="card" key={feature.title} style={{ padding: 20 }}>
            <h3 style={{ marginTop: 0 }}>{feature.title}</h3>
            <p style={{ color: "#415049", lineHeight: 1.6, marginBottom: 0 }}>{feature.detail}</p>
          </div>
        ))}
      </div>
      <h2>Questions</h2>
      {faqs.map((faq) => (
        <div key={faq.question}>
          <h3 style={{ marginBottom: 4 }}>{faq.question}</h3>
          <p style={{ marginTop: 0 }}>{faq.answer}</p>
        </div>
      ))}
      <p>
        Pro is covered by the <Link href="/terms">terms of use</Link> and the <Link href="/privacy">privacy policy</Link>.
      </p>
    </SimplePage>
  );
}
