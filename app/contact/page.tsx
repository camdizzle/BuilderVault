import { SimplePage } from "@/components/layout/simple-page";

export const metadata = {
  title: "Contact | BuilderVault"
};

export default function ContactPage() {
  return (
    <SimplePage
      eyebrow="Contact"
      lead="This static prototype does not send messages yet, but this page reserves the future contact surface."
      title="Have a pattern request?"
    >
      <div className="card" style={{ padding: 22 }}>
        <p style={{ marginTop: 0 }}>
          Future contact options can include pattern requests, consulting
          inquiries, bug reports, and PMO template suggestions.
        </p>
        <p style={{ marginBottom: 0 }}>
          Suggested launch email placeholder: hello@buildervault.app
        </p>
      </div>
    </SimplePage>
  );
}
