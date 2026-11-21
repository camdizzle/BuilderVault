// BuilderVault Pro settings. Everything is read from environment variables at request time,
// so Pro can be switched on in Plesk without a code change. Pro stays off unless PRO_ENABLED=true.
//
//   PRO_ENABLED             "true" turns on sign-in, /pro, /account and checkout
//   STRIPE_SECRET_KEY       sk_live_... or sk_test_... (a restricted key works)
//   STRIPE_WEBHOOK_SECRET   whsec_... for the /api/stripe/webhook endpoint
//   STRIPE_PRICE_MONTHLY    price_... for $3 a month
//   STRIPE_PRICE_YEARLY     price_... for $30 a year
//   SESSION_SECRET          long random string that signs sign-in links and session cookies
//   EMAIL_API_KEY           Resend API key, for sign-in emails
//   EMAIL_FROM              sender, e.g. BuilderVault <signin@camwow.tv>
//   BASE_URL                public origin, e.g. https://buildervault.camwow.tv
//   PRO_COMP_EMAILS         comma-separated emails that get Pro without paying
//   DATA_DIR                folder for account files; keep it outside the web root
import os from "node:os";
import path from "node:path";
import { siteUrl } from "@/lib/site";

export function proEnabled() {
  return process.env.PRO_ENABLED === "true";
}

export function proSettings() {
  return {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
    priceMonthly: process.env.STRIPE_PRICE_MONTHLY ?? "",
    priceYearly: process.env.STRIPE_PRICE_YEARLY ?? "",
    sessionSecret: process.env.SESSION_SECRET ?? "",
    emailApiKey: process.env.EMAIL_API_KEY ?? "",
    emailFrom: process.env.EMAIL_FROM ?? "",
    compEmails: process.env.PRO_COMP_EMAILS ?? "",
    dataDir: process.env.DATA_DIR || path.join(os.homedir(), "buildervault-pro-data")
  };
}

/** The public origin used for links in emails and Stripe return addresses. */
export function baseUrl() {
  return (process.env.BASE_URL || siteUrl).replace(/\/$/, "");
}

/** Which settings are present, as true or false only, for the setup check. Never returns a value. */
export function proConfigStatus() {
  const s = proSettings();
  return {
    enabled: proEnabled(),
    stripeKey: Boolean(s.stripeSecretKey),
    webhookSecret: Boolean(s.stripeWebhookSecret),
    monthlyPrice: Boolean(s.priceMonthly),
    yearlyPrice: Boolean(s.priceYearly),
    sessionSecret: s.sessionSecret.length >= 32,
    email: Boolean(s.emailApiKey && s.emailFrom)
  };
}
