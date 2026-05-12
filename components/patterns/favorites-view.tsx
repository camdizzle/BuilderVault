"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PatternCard } from "@/components/patterns/pattern-card";
import type { Pattern } from "@/types/pattern";

const storageKey = "buildervault.favoritePatterns";

type FavoritesViewProps = {
  patterns: Pattern[];
};

export function FavoritesView({ patterns }: FavoritesViewProps) {
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>([]);

  useEffect(() => {
    function syncFavorites() {
      try {
        const stored = window.localStorage.getItem(storageKey);
        setFavoriteSlugs(stored ? (JSON.parse(stored) as string[]) : []);
      } catch {
        setFavoriteSlugs([]);
      }
    }

    syncFavorites();
    window.addEventListener("buildervault:favorites-changed", syncFavorites);
    window.addEventListener("storage", syncFavorites);

    return () => {
      window.removeEventListener("buildervault:favorites-changed", syncFavorites);
      window.removeEventListener("storage", syncFavorites);
    };
  }, []);

  const favoritePatterns = useMemo(
    () => patterns.filter((pattern) => favoriteSlugs.includes(pattern.slug)),
    [favoriteSlugs, patterns]
  );

  if (favoritePatterns.length === 0) {
    return (
      <div className="card" style={{ display: "grid", gap: 14, padding: 28 }}>
        <h2 style={{ margin: 0 }}>No saved patterns yet.</h2>
        <p style={{ color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
          Use the save button on any pattern card or detail page to build a
          lightweight reading list.
        </p>
        <Link className="button" href="/patterns" style={{ justifySelf: "start" }}>
          Browse patterns
        </Link>
      </div>
    );
  }

  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
    >
      {favoritePatterns.map((pattern) => (
        <PatternCard key={pattern.id} pattern={pattern} />
      ))}
    </div>
  );
}
