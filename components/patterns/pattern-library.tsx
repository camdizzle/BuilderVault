"use client";

import { useMemo, useState } from "react";
import { PatternCard } from "@/components/patterns/pattern-card";
import type { Pattern } from "@/types/pattern";

type PatternLibraryProps = {
  patterns: Pattern[];
};

const allValue = "All";

const difficultyRank = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3
};

export function PatternLibrary({ patterns }: PatternLibraryProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(allValue);
  const [platform, setPlatform] = useState(allValue);
  const [difficulty, setDifficulty] = useState(allValue);
  const [access, setAccess] = useState(allValue);
  const [tag, setTag] = useState(allValue);
  const [sort, setSort] = useState("popular");

  const categories = useMemo(
    () => Array.from(new Set(patterns.map((pattern) => pattern.category))).sort(),
    [patterns]
  );
  const platforms = useMemo(
    () => Array.from(new Set(patterns.flatMap((pattern) => pattern.platform))).sort(),
    [patterns]
  );
  const difficulties = useMemo(
    () => Array.from(new Set(patterns.map((pattern) => pattern.difficulty))),
    [patterns]
  );
  const tags = useMemo(
    () => Array.from(new Set(patterns.flatMap((pattern) => pattern.tags))).sort(),
    [patterns]
  );

  const filteredPatterns = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return patterns
      .filter((pattern) => {
        const searchableText = [
          pattern.title,
          pattern.shortDescription,
          pattern.fullDescription,
          pattern.category,
          pattern.subCategory,
          ...pattern.platform,
          ...pattern.tags,
          pattern.problemStatement
        ]
          .join(" ")
          .toLowerCase();

        const matchesQuery = normalizedQuery.length === 0 || searchableText.includes(normalizedQuery);
        const matchesCategory = category === allValue || pattern.category === category;
        const matchesPlatform =
          platform === allValue || pattern.platform.some((item) => item === platform);
        const matchesDifficulty = difficulty === allValue || pattern.difficulty === difficulty;
        const matchesAccess =
          access === allValue ||
          (access === "Free" && !pattern.isPremium) ||
          (access === "Premium preview" && pattern.isPremium);
        const matchesTag = tag === allValue || pattern.tags.includes(tag);

        return (
          matchesQuery &&
          matchesCategory &&
          matchesPlatform &&
          matchesDifficulty &&
          matchesAccess &&
          matchesTag
        );
      })
      .sort((left, right) => {
        if (sort === "newest") {
          return Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
        }

        if (sort === "difficulty") {
          return difficultyRank[left.difficulty] - difficultyRank[right.difficulty];
        }

        if (sort === "title") {
          return left.title.localeCompare(right.title);
        }

        return patterns.indexOf(left) - patterns.indexOf(right);
      });
  }, [access, category, difficulty, patterns, platform, query, sort, tag]);

  function resetFilters() {
    setQuery("");
    setCategory(allValue);
    setPlatform(allValue);
    setDifficulty(allValue);
    setAccess(allValue);
    setTag(allValue);
    setSort("popular");
  }

  const activeFilterCount = [category, platform, difficulty, access, tag].filter(
    (value) => value !== allValue
  ).length + (query.trim().length > 0 ? 1 : 0);

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div className="category-strip" aria-label="Category shortcuts">
        {[allValue, ...categories].map((item) => (
          <button
            className={`chip-button${category === item ? " active" : ""}`}
            key={item}
            onClick={() => setCategory(item)}
            type="button"
          >
            {item === allValue ? "All categories" : item}
          </button>
        ))}
      </div>

      <div className="badge-row" aria-label="Popular searches">
        {["Patch SharePoint", "People picker", "Choice field", "Delegation", "Trigger conditions", "Approvals", "Dataverse security", "SharePoint schema", "Adaptive Cards", "ALM"].map((item) => (
          <button className="chip-button" key={item} onClick={() => setQuery(item)} type="button">
            {item}
          </button>
        ))}
      </div>

      <div className="toolbar-card">
        <div
          style={{
            display: "grid",
            gap: 14,
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))"
          }}
        >
          <div className="field" style={{ gridColumn: "span 2" }}>
            <label htmlFor="pattern-search">Keyword or tag</label>
            <input
              id="pattern-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try patch, people picker, trigger condition, Dataverse security, ALM..."
              type="search"
              value={query}
            />
          </div>
          <SelectField
            label="Category"
            onChange={setCategory}
            options={categories}
            value={category}
          />
          <SelectField
            label="Platform"
            onChange={setPlatform}
            options={platforms}
            value={platform}
          />
          <SelectField
            label="Difficulty"
            onChange={setDifficulty}
            options={difficulties}
            value={difficulty}
          />
          <SelectField
            label="Access"
            onChange={setAccess}
            options={["Free", "Premium preview"]}
            value={access}
          />
          <SelectField label="Tag" onChange={setTag} options={tags} value={tag} />
          <SelectField
            allowAll={false}
            label="Sort"
            onChange={setSort}
            options={[
              { label: "Popular", value: "popular" },
              { label: "Newest", value: "newest" },
              { label: "Difficulty", value: "difficulty" },
              { label: "Title", value: "title" }
            ]}
            value={sort}
          />
        </div>
        <div
          style={{
            alignItems: "center",
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: "space-between"
          }}
        >
          <strong>
            {filteredPatterns.length} of {patterns.length} patterns
          </strong>
          {activeFilterCount > 0 ? (
            <span style={{ color: "var(--muted)", fontWeight: 700 }}>
              {activeFilterCount} active filter{activeFilterCount === 1 ? "" : "s"}
            </span>
          ) : null}
          <button className="button secondary" onClick={resetFilters} type="button">
            Reset filters
          </button>
        </div>
      </div>

      {filteredPatterns.length > 0 ? (
        <div
          className="grid"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
        >
          {filteredPatterns.map((pattern) => (
            <PatternCard key={pattern.id} pattern={pattern} />
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: 28 }}>
          <h2 style={{ marginTop: 0 }}>No patterns match those filters.</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.6, marginBottom: 0 }}>
            Try removing one filter or searching for a broader term like Patch,
            SharePoint, Dataverse, approval, or governance.
          </p>
        </div>
      )}
    </div>
  );
}

type SelectOption = string | { label: string; value: string };

function SelectField({
  allowAll = true,
  label,
  onChange,
  options,
  value
}: {
  allowAll?: boolean;
  label: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  value: string;
}) {
  return (
    <div className="field">
      <label htmlFor={`pattern-${label.toLowerCase().replaceAll(" ", "-")}`}>{label}</label>
      <select
        id={`pattern-${label.toLowerCase().replaceAll(" ", "-")}`}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {allowAll ? <option value={allValue}>All</option> : null}
        {options.map((option) => {
          const optionValue = typeof option === "string" ? option : option.value;
          const optionLabel = typeof option === "string" ? option : option.label;

          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
    </div>
  );
}
