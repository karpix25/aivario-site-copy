# test-opencode

React template project based on Vite.

## Quick start

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Collect Creati Index

```bash
# default run (up to 35 paginated pages per section)
npm run collect:creati:index

# quick run for testing
CREATI_MAX_PAGES=8 npm run collect:creati:index
```

Outputs are written to `data/creati/index/`:

- `tools.json`
- `agents.json`
- `mcp_servers.json`
- `mcp_clients.json`
- `ai_news.json`
- `all-urls.json`
- `manifest.json`

## Load Into PostgreSQL

1) Apply migration:

```bash
psql "$DATABASE_URL" -f db/migrations/001_creati_ingestion_init.sql
psql "$DATABASE_URL" -f db/migrations/002_entity_profiles.sql
```

2) Preview upsert payload (no DB writes):

```bash
npm run db:creati:upsert
```

3) Apply upsert:

```bash
DATABASE_URL="postgres://user:pass@host:5432/dbname" npm run db:creati:upsert:apply
```

The upsert script reads all files from `data/creati/index/` and writes normalized base entities into the `entities` table.

## Enrich Profile Pages

```bash
# enrich first 50 URLs from index and write local output only
npm run enrich:creati:profiles

# enrich 200 URLs from DB candidates (missing core fields)
DATABASE_URL="postgres://user:pass@host:5432/dbname" npm run enrich:creati:profiles -- --from-db --limit=200

# enrich and persist into Postgres
DATABASE_URL="postgres://user:pass@host:5432/dbname" npm run enrich:creati:profiles -- --from-db --limit=200 --apply
```

Generated file: `data/creati/enriched/latest.json`

## Quality Report

```bash
DATABASE_URL="postgres://user:pass@host:5432/dbname" npm run creati:quality
```

This report prints fill-rate for core fields and profile section coverage.

## Check Progress

```bash
# local progress from generated JSON files
npm run creati:progress

# include DB metrics
DATABASE_URL="postgres://user:pass@host:5432/dbname" npm run creati:progress
```

During collection/enrichment, scripts print live progress like `[42/300] 14.0% ok ...`.

## Postgres + Frontend Sync

This site is deployed as static pages, so it cannot query Postgres directly in the browser.
Use an export step that reads Postgres and writes `src/data/generated/creati-catalog.json`.

```bash
# 1) ingest into Postgres
npm run collect:creati:index
DATABASE_URL="postgres://user:pass@host:5432/dbname" npm run db:creati:upsert:apply
DATABASE_URL="postgres://user:pass@host:5432/dbname" npm run enrich:creati:profiles -- --from-db --limit=600 --apply

# 2) sync DB data into frontend JSON
DATABASE_URL="postgres://user:pass@host:5432/dbname" npm run db:creati:export:frontend

# 3) build/deploy site
npm run build
```

After step 2, pages like `/tools` and `/tools/:slug` automatically use the generated catalog.
