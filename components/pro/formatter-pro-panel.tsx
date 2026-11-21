"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { FormatterPrefs, HistoryEntry } from "@/lib/pro/plan";
import { useProStatus } from "./use-pro-status";

const historyUrl = "/api/pro/history?tool=power-fx-formatter";
const mutedText = { color: "#415049", lineHeight: 1.6, margin: 0 } as const;

type Props = {
  settings: FormatterPrefs;
  onApplySettings: (settings: FormatterPrefs) => void;
  formula: string;
  onLoadFormula: (formula: string) => void;
};

function sameSettings(a: FormatterPrefs | null, b: FormatterPrefs) {
  return Boolean(a && a.indent === b.indent && a.width === b.width && a.locale === b.locale && a.source === b.source);
}

/**
 * Pro features for the Power Fx formatter: a saved style profile and a formula history.
 * Renders nothing while Pro is switched off, and one short line for visitors without Pro.
 */
export function FormatterProPanel({ settings, onApplySettings, formula, onLoadFormula }: Props) {
  const status = useProStatus();
  const [saved, setSaved] = useState<FormatterPrefs | null>(null);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [message, setMessage] = useState("");
  const loaded = useRef(false);
  const applySettings = useRef(onApplySettings);

  useEffect(() => {
    applySettings.current = onApplySettings;
  }, [onApplySettings]);

  useEffect(() => {
    if (!status?.pro || loaded.current) return;
    loaded.current = true;
    fetch("/api/pro/prefs", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.formatter) {
          setSaved(data.formatter);
          applySettings.current(data.formatter);
        }
      })
      .catch(() => undefined);
    fetch(historyUrl, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (Array.isArray(data?.entries)) setEntries(data.entries);
      })
      .catch(() => undefined);
  }, [status?.pro]);

  if (!status?.enabled) return null;

  if (!status.pro) {
    return (
      <p style={mutedText}>
        <Link href="/pro">BuilderVault Pro</Link> saves these settings and your formulas to your account.
      </p>
    );
  }

  async function saveSettings() {
    const response = await fetch("/api/pro/prefs", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formatter: settings })
    }).catch(() => null);
    if (response?.ok) {
      const data = await response.json();
      setSaved(data.formatter);
      setMessage("Saved. The formatter opens with these settings when you're signed in.");
    } else {
      setMessage("Settings could not be saved. Please try again.");
    }
  }

  async function saveFormula() {
    const response = await fetch(historyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: formula })
    }).catch(() => null);
    if (response?.ok) {
      const data = await response.json();
      setEntries(data.entries);
      setMessage("Formula saved to your history.");
    } else {
      setMessage(response?.status === 413 ? "This formula is too long to save." : "The formula could not be saved. Please try again.");
    }
  }

  async function remove(id?: string) {
    const response = await fetch(historyUrl + (id ? "&id=" + encodeURIComponent(id) : ""), { method: "DELETE" }).catch(() => null);
    if (response?.ok) {
      const data = await response.json();
      setEntries(data.entries);
      setMessage(id ? "Removed from your history." : "History cleared.");
    }
  }

  const settingsSaved = sameSettings(saved, settings);

  return (
    <section className="pattern-detector-panel">
      <div>
        <div className="eyebrow">Pro</div>
        <h3 style={{ fontSize: "1.2rem", margin: "6px 0" }}>Your settings and history</h3>
      </div>
      <div className="badge-row">
        <button className="chip-button" disabled={settingsSaved} onClick={saveSettings} type="button">
          {settingsSaved ? "These are your saved settings" : "Save these settings as my default"}
        </button>
        <button className="chip-button" disabled={!formula.trim()} onClick={saveFormula} type="button">
          Save formula to history
        </button>
      </div>
      {message ? (
        <p role="status" style={mutedText}>
          {message}
        </p>
      ) : null}
      {entries.length > 0 ? (
        <details>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>History ({entries.length})</summary>
          <ul className="pro-history" style={{ marginTop: 10 }}>
            {entries.map((entry) => (
              <li key={entry.id}>
                <code title={entry.text}>{entry.text.replace(/\s+/g, " ").slice(0, 140)}</code>
                <span style={{ color: "#415049", fontSize: "0.85rem", whiteSpace: "nowrap" }}>{new Date(entry.savedAt).toLocaleDateString()}</span>
                <button className="chip-button" onClick={() => onLoadFormula(entry.text)} type="button">
                  Open
                </button>
                <button aria-label="Remove from history" className="chip-button" onClick={() => remove(entry.id)} type="button">
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <button className="link-button" onClick={() => remove()} style={{ color: "#415049", marginTop: 10 }} type="button">
            Clear history
          </button>
        </details>
      ) : null}
    </section>
  );
}
