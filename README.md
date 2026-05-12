# BuilderVault

Phase 1 foundation for BuilderVault: a Next.js TypeScript app with a public homepage, static pattern library, pattern detail pages, reusable layout components, copyable code blocks, and seed JSON content.

## What is included

- Public homepage explaining the two initial products
- Pattern list page powered by static JSON
- Pattern detail pages generated from pattern slugs
- Client-side pattern search, filters, and sorting
- Local browser favorites for saved patterns
- Premium pattern previews with locked advanced sections
- 1,000 static patterns covering Power Apps, SharePoint, Power Automate, and PMO scenarios
- TypeScript pattern model
- Reusable header, footer, badges, pattern cards, detail sections, and copy code block

## Not included yet

- Supabase authentication or database
- Stripe payments
- AI report generation
- Favorites, dashboard, or report history

## Phase 2 notes

The pattern library is still powered by static JSON. Favorites are stored in browser local storage under `buildervault.favoritePatterns` so the workflow can be demonstrated before Supabase Auth exists.

Premium patterns currently show public summary and fit guidance while locking formula, build steps, and troubleshooting sections. Real subscriber unlocks are planned for Phase 3.

## Run locally

Install dependencies, then start the development server:

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Validate content

Run the static pattern checks:

```bash
npm run validate:content
```

Useful content helper commands:

```bash
npm run content:stats
npm run content:audit
npm run content:export
npm run content:slug -- "Patch a SharePoint Date Field"
```

## Main folders

```text
buildervault/
  app/
    page.tsx
    collections/
      page.tsx
      [slug]/
        page.tsx
    dashboard/
      page.tsx
    favorites/
      page.tsx
    patterns/
      page.tsx
      [slug]/
        page.tsx
  components/
    layout/
    patterns/
    ui/
  data/
    patterns.seed.json
  lib/
    patterns/
  types/
    pattern.ts
```
