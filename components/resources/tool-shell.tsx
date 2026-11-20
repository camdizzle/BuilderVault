import type { ReactNode } from "react";

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className={`chip-button ${checked ? "active" : ""}`} style={{ paddingBottom: 6, paddingTop: 6, whiteSpace: "normal" }}>
      <input checked={checked} onChange={(event) => onChange(event.target.checked)} style={{ marginRight: 8 }} type="checkbox" />
      {label}
    </label>
  );
}

export function ToolShell({ children, title, description }: { children: ReactNode; title: string; description: string }) {
  return (
    <section className="tool-panel">
      <div>
        <div className="eyebrow">Interactive tool</div>
        <h2 className="section-title" style={{ fontSize: "1.8rem" }}>{title}</h2>
        <p style={{ color: "#415049", lineHeight: 1.7, marginBottom: 0 }}>{description}</p>
      </div>
      {children}
    </section>
  );
}

/** A short list of warnings or notes shown under a tool's output. Renders nothing when the list is empty. */
export function ToolNotes({ notes, title = "Check before you use it" }: { notes: string[]; title?: string }) {
  if (notes.length === 0) return null;
  return (
    <div className="stat-tile" role="status">
      <div className="eyebrow">{title}</div>
      <ul style={{ color: "#415049", lineHeight: 1.6, margin: 0, paddingLeft: 20 }}>
        {notes.map((note) => <li key={note}>{note}</li>)}
      </ul>
    </div>
  );
}
