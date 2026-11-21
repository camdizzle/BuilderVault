"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ToolShell } from "@/components/resources/tool-shell";
import { createErrorFinder, statusHint, type ErrorEntry } from "@/lib/tools/error-finder";

const sample = `Unable to process template language expressions in action 'Compose' inputs at line '0' and column '0': 'The template language function 'split' expects its first parameter to be of type string. The provided value is of type 'Null'.`;

export function ErrorMessageFinder({ entries }: { entries: ErrorEntry[] }) {
  const [text, setText] = useState(sample);
  const find = useMemo(() => createErrorFinder(entries), [entries]);
  const matches = useMemo(() => find(text), [find, text]);
  const hint = statusHint(text);

  return (
    <ToolShell
      title="Error message finder"
      description="Paste the error exactly as Power Automate, Power Apps or the solution import shows it. The finder matches it against the BuilderVault error library and links the page with the fix."
    >
      <label className="field">
        <span>Error message</span>
        <textarea className="tool-textarea" onChange={(event) => setText(event.target.value)} spellCheck={false} style={{ minHeight: 130, whiteSpace: "pre-wrap" }} value={text} />
      </label>
      <p style={{ color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.6, margin: 0 }}>
        Names in quotes, IDs, GUIDs, emails and links are ignored, so you don&apos;t need to remove them. In a failed flow run, copy the message from the failed action&apos;s outputs, not only the red banner.
      </p>

      <div aria-live="polite" role="status" style={{ display: "grid", gap: 12 }}>
        {!text.trim() ? (
          <div className="stat-tile">Paste an error message to search the library.</div>
        ) : matches.length === 0 ? (
          <div className="stat-tile">
            <strong>No page in the library matches this message yet.</strong>
            <p style={{ color: "#415049", lineHeight: 1.6, margin: "6px 0 0" }}>
              Try pasting only the first sentence of the error, or <Link href="/errors">browse the error library</Link> by product.
            </p>
          </div>
        ) : (
          matches.map((match, index) => (
            <div className="stat-tile" key={match.entry.slug}>
              <div className="eyebrow">
                {index === 0 && match.score >= 1 ? "Best match" : index === 0 ? "Closest match" : "Also possible"} · {match.entry.product}
              </div>
              <strong style={{ fontSize: "1.05rem" }}>
                <Link href={match.entry.href}>{match.entry.title}</Link>
              </strong>
              <p style={{ color: "#415049", lineHeight: 1.6, margin: "6px 0 0" }}>{match.entry.quickAnswer}</p>
            </div>
          ))
        )}
        {hint ? (
          <div className="stat-tile">
            <div className="eyebrow">Status code</div>
            <p style={{ color: "#415049", lineHeight: 1.6, margin: 0 }}>{hint}</p>
          </div>
        ) : null}
      </div>
      <p style={{ color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.6, margin: 0 }}>
        The search runs in your browser against {entries.length} error pages. Nothing you paste is uploaded or stored.
      </p>
    </ToolShell>
  );
}
