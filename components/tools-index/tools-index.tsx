"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import type { ToolGroup, ToolGroupId } from "@/lib/tool-catalog";

export type ToolCard = {
  slug: string;
  title: string;
  path: string;
  tagline: string;
  glyph: string;
  group: ToolGroupId;
  popular: boolean;
  /** Extra words the search box matches: the full description and keywords. */
  searchText: string;
};

function matches(card: ToolCard, words: string[]) {
  const haystack = (card.title + " " + card.tagline + " " + card.searchText).toLowerCase();
  return words.every((word) => haystack.includes(word));
}

export function ToolsIndex({ cards, groups }: { cards: ToolCard[]; groups: ToolGroup[] }) {
  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState<ToolGroupId | "all">("all");
  const words = useMemo(() => query.toLowerCase().split(/\s+/).filter(Boolean), [query]);
  const groupById = useMemo(() => new Map(groups.map((group) => [group.id, group])), [groups]);
  const visible = cards.filter((card) => (groupFilter === "all" || card.group === groupFilter) && matches(card, words));
  const filtering = words.length > 0 || groupFilter !== "all";
  const popular = cards.filter((card) => card.popular);

  return (
    <div className="tools-index">
      <div className="tools-index-controls">
        <label className="tools-search">
          <span className="sr-only">Find a tool</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder='Find a tool, for example "filter query", "json" or "date"'
            type="search"
            value={query}
          />
        </label>
        <div className="badge-row" role="group" aria-label="Filter tools by product">
          <button aria-pressed={groupFilter === "all"} className={`chip-button ${groupFilter === "all" ? "active" : ""}`} onClick={() => setGroupFilter("all")} type="button">
            All {cards.length}
          </button>
          {groups.map((group) => (
            <button
              aria-pressed={groupFilter === group.id}
              className={`chip-button ${groupFilter === group.id ? "active" : ""}`}
              key={group.id}
              onClick={() => setGroupFilter(group.id)}
              type="button"
            >
              {group.label} {cards.filter((card) => card.group === group.id).length}
            </button>
          ))}
        </div>
      </div>

      {filtering ? (
        <section aria-live="polite" className="tools-section">
          <h2 className="tools-section-title">
            {visible.length === 0 ? "No tools match" : `${visible.length} ${visible.length === 1 ? "tool" : "tools"}`}
          </h2>
          {visible.length === 0 ? (
            <p className="tools-empty">
              Try a shorter word, or <button onClick={() => { setQuery(""); setGroupFilter("all"); }} type="button">show all tools</button>.
            </p>
          ) : (
            <div className="tools-grid">
              {visible.map((card) => <ToolCardLink card={card} group={groupById.get(card.group)} key={card.slug} />)}
            </div>
          )}
        </section>
      ) : (
        <>
          <section className="tools-section">
            <h2 className="tools-section-title">Most used</h2>
            <div className="tools-grid tools-grid-popular">
              {popular.map((card) => <ToolCardLink card={card} featured group={groupById.get(card.group)} key={card.slug} />)}
            </div>
          </section>
          {groups.map((group) => {
            const groupCards = cards.filter((card) => card.group === group.id);
            if (groupCards.length === 0) return null;
            return (
              <section className="tools-section" id={group.id} key={group.id}>
                <h2 className="tools-section-title">
                  <span aria-hidden="true" className="tools-dot" style={{ background: group.color }} />
                  {group.label}
                </h2>
                <p className="tools-section-text">{group.description}</p>
                <div className="tools-grid">
                  {groupCards.map((card) => <ToolCardLink card={card} group={group} key={card.slug} />)}
                </div>
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}

function ToolCardLink({ card, group, featured = false }: { card: ToolCard; group?: ToolGroup; featured?: boolean }) {
  const style = { "--tool-color": group?.color, "--tool-bg": group?.background } as CSSProperties;
  return (
    <Link className={`tool-card ${featured ? "featured" : ""}`} href={card.path} style={style}>
      <span aria-hidden="true" className="tool-glyph">{card.glyph}</span>
      <span>
        <strong>{card.title}</strong>
        <span>{card.tagline}</span>
      </span>
    </Link>
  );
}
