import { SimplePage } from "@/components/layout/simple-page";

export const metadata = {
  title: "Privacy | BuilderVault"
};

export default function PrivacyPage() {
  return (
    <SimplePage
      eyebrow="Privacy"
      lead="This is placeholder privacy language for the static prototype and should be reviewed before launch."
      title="Privacy notice."
    >
      <p>
        BuilderVault currently runs as a static local prototype. It does not create
        accounts, process payments, call AI services, or store server-side user data.
      </p>
      <p>
        Local favorites are stored in your browser local storage. Clearing browser
        data may remove those favorites.
      </p>
      <p>
        Before public launch, this page should be replaced with a full policy that
        describes authentication, analytics, payment processing, AI usage, and data
        retention.
      </p>
    </SimplePage>
  );
}
