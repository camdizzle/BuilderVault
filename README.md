# BuilderVault

BuilderVault is a Next.js TypeScript pattern library for Power Platform builders, makers, consultants, and internal automation teams.

## Current focus

The public product is focused on reusable implementation patterns for:

- Power Apps
- Power Automate
- SharePoint app backends
- Dataverse
- Power Platform ALM and governance
- Power Platform Admin Center operations
- Power Pages
- Teams and Adaptive Cards

PMO and status reporting content is intentionally kept out of the core public experience for now so it can become a separate paid offer later.

## What is included

- Public homepage focused on Power Platform builders
- Static pattern library with search, filters, sorting, and popular search chips
- Pattern detail pages generated from pattern slugs
- SEO topic hubs for Power Apps, Power Automate, SharePoint, Dataverse, and ALM
- Curated collections for app builds, workflows, Dataverse foundations, admin governance, and delivery handoff
- Local browser favorites for saved patterns
- Premium pattern previews with locked advanced sections
- 1,500 stored static patterns, with 1,253 public Power Platform patterns after PMO content is archived from the main experience
- TypeScript pattern model
- Reusable header, footer, badges, pattern cards, detail sections, and copy code block
- Plesk-compatible Next.js startup file at server.js

## Not included yet

- Supabase authentication or database
- Stripe payments
- AI/API generation
- Account-based favorites, private collections, or export history

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

## Production build

```bash
npm ci --include=dev
npm run build
npm start
```

For Plesk, set the Node.js startup file to:

```text
server.js
```

## Main folders

```text
BuilderVault/
  app/
    page.tsx
    alm/
    collections/
    dashboard/
    dataverse/
    favorites/
    patterns/
    power-apps/
    power-automate/
    sharepoint/
  components/
    layout/
    patterns/
    ui/
  data/
    patterns.seed.json
    pattern-expansion-*.json
  lib/
    patterns/
  scripts/
  types/
```
