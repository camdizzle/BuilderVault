import type { ReactNode } from "react";

type DetailSectionProps = {
  title: string;
  children: ReactNode;
};

export function DetailSection({ title, children }: DetailSectionProps) {
  return (
    <section style={{ display: "grid", gap: 12 }}>
      <h2 style={{ fontSize: "1.35rem", margin: 0 }}>{title}</h2>
      {children}
    </section>
  );
}
