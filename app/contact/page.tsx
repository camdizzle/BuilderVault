import { SimplePage } from "@/components/layout/simple-page";

export const metadata = {
  title: "Contact | BuilderVault",
  description: "Contact BuilderVault for Power Platform pattern requests, bug reports, and consulting inquiries."
};

export default function ContactPage() {
  return (
    <SimplePage
      eyebrow="Contact"
      lead="Send BuilderVault pattern requests, bug reports, consulting inquiries, and feedback to the support inbox."
      title="Have a pattern request?"
    >
      <div className="card" style={{ padding: 22 }}>
        <p style={{ marginTop: 0 }}>
          I read requests for new Power Platform patterns, corrections to existing examples,
          and ideas for future BuilderVault collections.
        </p>
        <p style={{ marginBottom: 0 }}>
          Email: <a href="mailto:help@camwow.tv">help@camwow.tv</a>
        </p>
      </div>
    </SimplePage>
  );
}
