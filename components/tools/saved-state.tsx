"use client";

import { sameShape } from "@/lib/tools/saved-shape";
import { Component, createContext, useContext, useEffect, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";

// Lets every tool remember what the visitor typed, in this browser only (localStorage).
// Values are kept per tool under keys that start with buildervault:tool:<slug>:.
// Bump storageVersion if a tool's saved values change shape, so old values are ignored.

const storageVersion = "v1";

/** The slug of the tool being shown. Null means the tool does not save its inputs here. */
export const SavedToolContext = createContext<string | null>(null);

function keyPrefix(slug: string) {
  return `buildervault:tool:${slug}:${storageVersion}:`;
}

/** Removes every value saved for one tool. */
export function clearSavedTool(slug: string) {
  try {
    const prefix = `buildervault:tool:${slug}:`;
    const keys: string[] = [];
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith(prefix)) keys.push(key);
    }
    keys.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Storage can be blocked. Nothing to clear then.
  }
}

/**
 * Works like useState, but the value is saved in this browser and comes back on the next visit.
 * The first render always uses the starting value (so server and browser HTML match); a saved
 * value replaces it straight after.
 */
export function useSavedState<T>(field: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const slug = useContext(SavedToolContext);
  const [value, setValue] = useState<T>(initial);
  const initialRef = useRef(initial);
  const skipFirstSave = useRef(true);

  useEffect(() => {
    if (!slug) return;
    try {
      const raw = window.localStorage.getItem(keyPrefix(slug) + field);
      if (raw === null) return;
      const saved: unknown = JSON.parse(raw);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- storage is only readable in the browser, after the first render
      if (sameShape(initialRef.current, saved)) setValue(saved as T);
    } catch {
      // Unreadable or blocked storage: keep the starting value.
    }
  }, [slug, field]);

  useEffect(() => {
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    if (!slug) return;
    try {
      window.localStorage.setItem(keyPrefix(slug) + field, JSON.stringify(value));
    } catch {
      // Storage full or blocked: the tool still works, it just won't remember.
    }
  }, [slug, field, value]);

  return [value, setValue];
}

/** The line under a tool that says its entries are saved, with a button to forget them. */
export function SavedToolFooter() {
  const slug = useContext(SavedToolContext);
  if (!slug) return null;
  return (
    <div className="saved-tool-footer">
      <span>Your entries are saved in this browser only.</span>
      <button
        onClick={() => {
          clearSavedTool(slug);
          window.location.reload();
        }}
        type="button"
      >
        Forget my entries
      </button>
    </div>
  );
}

/**
 * If a tool fails to show (for example because a saved value no longer fits it), clear that
 * tool's saved values and offer a reload instead of a broken page.
 */
export class SavedToolBoundary extends Component<{ slug: string; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    clearSavedTool(this.props.slug);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="stat-tile" role="alert">
        <strong>This tool could not load your saved entries.</strong>
        <p style={{ color: "#415049", lineHeight: 1.55, marginBottom: 0 }}>
          They have been cleared. <button className="chip-button" onClick={() => window.location.reload()} type="button">Reload the tool</button>
        </p>
      </div>
    );
  }
}
