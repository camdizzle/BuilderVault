import type { ReactNode } from "react";

type SimplePageProps = {
  eyebrow: string;
  title: string;
  lead: string;
  children: ReactNode;
};

export function SimplePage({ eyebrow, title, lead, children }: SimplePageProps) {
  return (
    <section className="content-page">
      <div className="container">
        <div className="content-stack">
          <div>
            <div className="eyebrow">{eyebrow}</div>
            <h1 className="page-title">{title}</h1>
            <p className="lead">{lead}</p>
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}
