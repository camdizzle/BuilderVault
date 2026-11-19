// Newsletter signup posts straight to your email provider's embed form endpoint.
// Off until NEXT_PUBLIC_NEWSLETTER_FORM_ACTION is set. Works with Buttondown, Kit (ConvertKit),
// MailerLite, Mailchimp, and most providers that publish an HTML embed form.
export const newsletterConfig = {
  formAction: process.env.NEXT_PUBLIC_NEWSLETTER_FORM_ACTION ?? "",
  emailField: process.env.NEXT_PUBLIC_NEWSLETTER_EMAIL_FIELD || "email"
};

export const newsletterEnabled = Boolean(newsletterConfig.formAction);

export type DownloadPack = {
  slug: string;
  title: string;
  description: string;
  href: string;
  format: string;
  contents: string[];
  relatedTool?: { href: string; label: string };
};

export const downloadPacks: DownloadPack[] = [
  {
    slug: "power-fx-review-pack",
    title: "Power Fx Review Pack",
    description: "A formula review checklist, eight copy-ready Power Fx snippets, and a control naming table to use before handoff or code review.",
    href: "/packs/power-fx-review-pack.md",
    format: "Markdown",
    contents: [
      "Review checklist: readability, saving data, delegation, performance, handoff",
      "Snippets: save with IfError, delegation-safe user filter, Switch, With, caching, validation, confirm-delete, person column Patch",
      "Naming convention table for controls, variables, and collections"
    ],
    relatedTool: { href: "/tools/power-fx-formatter", label: "Power Fx Formatter" }
  }
];
