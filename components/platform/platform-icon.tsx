import Link from "next/link";

type PlatformIconProps = {
  href: string;
  label: string;
  shortLabel: string;
  description?: string;
  color: string;
  background: string;
};

export function PlatformIcon({ href, label, shortLabel, description, color, background }: PlatformIconProps) {
  return (
    <Link
      className="platform-tile"
      href={href}
      style={{ "--platform-color": color, "--platform-bg": background } as React.CSSProperties}
    >
      <span className="platform-mark" aria-hidden="true">{shortLabel}</span>
      <span style={{ display: "grid", gap: 4 }}>
        <strong>{label}</strong>
        {description ? <span>{description}</span> : null}
      </span>
    </Link>
  );
}

export const platformLinks = [
  { href: "/power-apps", label: "Power Apps", shortLabel: "PA", description: "Canvas app patterns", color: "#742774", background: "#f7e7f7" },
  { href: "/power-automate", label: "Power Automate", shortLabel: "FL", description: "Cloud flow recipes", color: "#0f6cbd", background: "#e6f1fb" },
  { href: "/sharepoint", label: "SharePoint", shortLabel: "SP", description: "List schema guides", color: "#03787c", background: "#e3f5f5" },
  { href: "/dataverse", label: "Dataverse", shortLabel: "DV", description: "Table and role patterns", color: "#3157a4", background: "#eaf0ff" },
  { href: "/alm", label: "ALM", shortLabel: "AL", description: "Solutions and governance", color: "#107c10", background: "#e8f5e8" },
  { href: "/power-automate/adaptive-cards", label: "Teams Cards", shortLabel: "TC", description: "Adaptive card snippets", color: "#6264a7", background: "#ededfb" }
];
