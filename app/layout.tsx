import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BuilderVault",
    template: "%s | BuilderVault"
  },
  description:
    "Reusable Power Platform patterns for Power Apps, Power Automate, SharePoint, Dataverse, ALM, and Microsoft 365 builders.",
  openGraph: {
    description:
      "Copy-ready Power Platform implementation patterns for business app builders, consultants, and internal automation teams.",
    siteName: "BuilderVault",
    title: "BuilderVault",
    type: "website",
    url: siteUrl
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
