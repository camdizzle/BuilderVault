"use client";

import { useEffect, useState } from "react";

const storageKey = "buildervault.favoritePatterns";

type FavoriteButtonProps = {
  patternSlug: string;
  compact?: boolean;
};

function readFavorites(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
}

function writeFavorites(favorites: string[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(favorites));
  window.dispatchEvent(new CustomEvent("buildervault:favorites-changed"));
}

export function FavoriteButton({ patternSlug, compact = false }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    function syncFavorite() {
      setIsFavorite(readFavorites().includes(patternSlug));
    }

    syncFavorite();
    window.addEventListener("buildervault:favorites-changed", syncFavorite);
    window.addEventListener("storage", syncFavorite);

    return () => {
      window.removeEventListener("buildervault:favorites-changed", syncFavorite);
      window.removeEventListener("storage", syncFavorite);
    };
  }, [patternSlug]);

  function toggleFavorite() {
    const favorites = readFavorites();
    const nextFavorites = favorites.includes(patternSlug)
      ? favorites.filter((slug) => slug !== patternSlug)
      : [...favorites, patternSlug];

    writeFavorites(nextFavorites);
    setIsFavorite(nextFavorites.includes(patternSlug));
  }

  return (
    <button
      aria-pressed={isFavorite}
      className={`icon-button${isFavorite ? " active" : ""}`}
      onClick={toggleFavorite}
      title={isFavorite ? "Remove from local favorites" : "Save to local favorites"}
      type="button"
    >
      <span aria-hidden="true">{isFavorite ? "Saved" : "Save"}</span>
      {!compact ? <span>{isFavorite ? "favorite" : "for later"}</span> : null}
    </button>
  );
}
