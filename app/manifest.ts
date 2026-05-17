import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BuilderVault",
    short_name: "BuilderVault",
    description: "Power Platform patterns, examples, standards, cheat sheets, and tools for builders.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f8f5",
    theme_color: "#0f766e",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  };
}
