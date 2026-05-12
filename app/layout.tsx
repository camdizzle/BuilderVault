import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  metadataBase: new URL("https://buildervault.app"),
  title: {
    default: "BuilderVault",
    template: "%s | BuilderVault"
  },
  description:
    "A practical pattern and report-generation toolkit for Microsoft 365 builders and PMO teams.",
  openGraph: {
    description:
      "Copy-ready Power Apps, SharePoint, Power Automate, and PMO patterns for real business builders.",
    siteName: "BuilderVault",
    title: "BuilderVault",
    type: "website",
    url: "https://buildervault.app"
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
