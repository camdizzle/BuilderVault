import type { ReactNode } from "react";
import { SavedToolFooter } from "@/components/tools/saved-state";

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
    <section aria-label={title} className="tool-panel">
      <div>
        <h2 className="sr-only">{title}</h2>
        <p className="tool-instructions">{description}</p>
      </div>
      {children}
      <SavedToolFooter />
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
