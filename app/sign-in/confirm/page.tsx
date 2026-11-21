import { notFound } from "next/navigation";
import { SimplePage } from "@/components/layout/simple-page";
import { ConfirmSignIn } from "@/components/pro/confirm-sign-in";
import { proEnabled } from "@/lib/pro/config";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Finish signing in",
  robots: { index: false, follow: false }
};

export default function ConfirmSignInPage() {
  if (!proEnabled()) notFound();
  return (
    <SimplePage eyebrow="Sign in" lead="Choose the button below to finish signing in on this device." title="Finish signing in.">
      <ConfirmSignIn />
    </SimplePage>
  );
}
