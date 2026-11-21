import { notFound, redirect } from "next/navigation";
import { SimplePage } from "@/components/layout/simple-page";
import { proEnabled } from "@/lib/pro/config";
import { currentViewer } from "@/lib/pro/session";
import { safeNextPath } from "@/lib/pro/tokens";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sign in",
  robots: { index: false, follow: false }
};

const errors: Record<string, string> = {
  email: "That doesn't look like an email address. Please check it and try again.",
  limit: "Too many sign-in emails were requested. Please wait 15 minutes and try again.",
  expired: "That sign-in link has expired or was already used. Enter your email to get a new one.",
  unavailable: "Sign-in isn't available just now. Please try again later."
};

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string; next?: string }> }) {
  if (!proEnabled()) notFound();
  const params = await searchParams;
  const next = safeNextPath(params.next);
  if (await currentViewer()) redirect(next);

  if (params.sent) {
    return (
      <SimplePage eyebrow="Sign in" lead="We sent a sign-in link to your email. It works once and expires in 15 minutes." title="Check your email.">
        <p>Open the email from BuilderVault and choose Sign in. If it isn&apos;t there within a few minutes, check your junk or spam folder.</p>
      </SimplePage>
    );
  }

  return (
    <SimplePage eyebrow="Sign in" lead="Enter your email and we'll send you a link to sign in. There's no password to remember." title="Sign in to BuilderVault.">
      {params.error && errors[params.error] ? (
        <p className="pro-notice error" role="alert">
          {errors[params.error]}
        </p>
      ) : null}
      <form action="/api/auth/request-link" className="pro-form" method="post">
        <label className="field">
          <span>Email address</span>
          <input autoComplete="email" maxLength={254} name="email" required type="email" />
        </label>
        <input name="next" type="hidden" value={next} />
        <button className="button" type="submit">
          Email me a sign-in link
        </button>
      </form>
      <p style={{ color: "#415049" }}>
        Your email is used only to sign you in and to link your account to your Pro subscription. All BuilderVault tools work without an account.
      </p>
    </SimplePage>
  );
}
