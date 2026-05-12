import { SimplePage } from "@/components/layout/simple-page";

export const metadata = {
  title: "Terms | BuilderVault"
};

export default function TermsPage() {
  return (
    <SimplePage
      eyebrow="Terms"
      lead="These are placeholder terms for the prototype and should be reviewed before launch."
      title="Terms of use."
    >
      <p>
        BuilderVault content is provided as practical guidance and examples. Users
        are responsible for reviewing, testing, and adapting patterns before using
        them in production environments.
      </p>
      <p>
        The prototype does not provide professional legal, security, compliance, or
        financial advice. Production terms should cover subscriptions, refunds,
        acceptable use, intellectual property, and liability limits.
      </p>
    </SimplePage>
  );
}
