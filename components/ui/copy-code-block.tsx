"use client";

import { useState } from "react";

type CopyCodeBlockProps = {
  code: string;
  label?: string;
};

export function CopyCodeBlock({ code, label = "Formula / code" }: CopyCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="code-block">
      <div
        style={{
          alignItems: "center",
          borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
          display: "flex",
          justifyContent: "space-between",
          padding: "10px 12px"
        }}
      >
        <span style={{ color: "#b8d8ce", fontSize: "0.85rem", fontWeight: 700 }}>
          {label}
        </span>
        <button
          aria-label="Copy code"
          onClick={copyCode}
          style={{
            background: copied ? "#d9f99d" : "#f8fafc",
            border: "0",
            borderRadius: 6,
            color: "#14211d",
            cursor: "pointer",
            fontWeight: 800,
            minHeight: 34,
            padding: "0 12px"
          }}
          type="button"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
