// Sends the sign-in email through Resend's HTTP API.
import { proSettings } from "./config";

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function sendSignInEmail(to: string, link: string) {
  const { emailApiKey, emailFrom } = proSettings();
  if (!emailApiKey || !emailFrom) throw new Error("Sign-in email is not configured");

  const text = [
    "Use this link to sign in to BuilderVault. It works once and expires in 15 minutes.",
    "",
    link,
    "",
    "If you didn't ask to sign in, you can ignore this email."
  ].join("\n");

  const html = `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;line-height:1.6;color:#17201d;max-width:520px">
<p>Use this button to sign in to BuilderVault. It works once and expires in 15 minutes.</p>
<p><a href="${escapeHtml(link)}" style="display:inline-block;background:#0f766e;color:#ffffff;padding:12px 20px;border-radius:8px;font-weight:700;text-decoration:none">Sign in to BuilderVault</a></p>
<p style="color:#415049;font-size:14px">Or paste this link into your browser:<br>${escapeHtml(link)}</p>
<p style="color:#415049;font-size:14px">If you didn't ask to sign in, you can ignore this email.</p>
</div>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: "Bearer " + emailApiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ from: emailFrom, to: [to], subject: "Your BuilderVault sign-in link", text, html })
  });
  if (!response.ok) {
    throw new Error("Resend returned " + response.status + ": " + (await response.text()).slice(0, 300));
  }
}
