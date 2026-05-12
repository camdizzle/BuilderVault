import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  tone?: "default" | "free" | "premium" | "difficulty";
};

export function Badge({ children, tone = "default" }: BadgeProps) {
  const className = tone === "default" ? "badge" : `badge ${tone}`;

  return <span className={className}>{children}</span>;
}
