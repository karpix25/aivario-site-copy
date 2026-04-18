BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'entity_type') THEN
    CREATE TYPE entity_type AS ENUM ('tool', 'agent', 'mcp_server', 'mcp_client', 'news');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  base_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  entity_type entity_type NOT NULL,
  slug text NOT NULL,
  source_url text NOT NULL,
  name text,
  headline text,
  description_short text,
  description_long text,
  website_url text,
  logo_url text,
  image_url text,
  pricing_label text,
  pricing_model text,
  free_trial boolean,
  has_free_plan boolean,
  rating_value numeric(3,2),
  rating_count integer,
  visits_monthly integer,
  traffic_sources_json jsonb,
  top_keywords_json jsonb,
  geo_json jsonb,
  added_at_source timestamptz,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  last_changed_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  raw_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(source_id, source_url)
);

CREATE TABLE IF NOT EXISTS platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS entity_platforms (
  entity_id uuid NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  platform_id uuid NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (entity_id, platform_id)
);

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  entity_type_scope entity_type,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(slug, entity_type_scope)
);

CREATE TABLE IF NOT EXISTS entity_categories (
  entity_id uuid NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (entity_id, category_id)
);

CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS entity_tags (
  entity_id uuid NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (entity_id, tag_id)
);

CREATE TABLE IF NOT EXISTS entity_alternatives (
  entity_id uuid NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  alternative_entity_id uuid NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (entity_id, alternative_entity_id),
  CHECK (entity_id <> alternative_entity_id)
);

CREATE TABLE IF NOT EXISTS entity_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS entity_raw_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  raw_json jsonb NOT NULL,
  fetched_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ingest_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type text NOT NULL,
  status text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  stats_json jsonb,
  error_text text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_entities_entity_type_slug ON entities(entity_type, slug);
CREATE INDEX IF NOT EXISTS idx_entities_last_seen_at ON entities(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_entities_source_id ON entities(source_id);
CREATE INDEX IF NOT EXISTS idx_entities_traffic_sources_gin ON entities USING gin (traffic_sources_json);
CREATE INDEX IF NOT EXISTS idx_entities_top_keywords_gin ON entities USING gin (top_keywords_json);
CREATE INDEX IF NOT EXISTS idx_entities_geo_gin ON entities USING gin (geo_json);
CREATE INDEX IF NOT EXISTS idx_entity_raw_snapshots_entity_id ON entity_raw_snapshots(entity_id, fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_ingest_jobs_job_type_started_at ON ingest_jobs(job_type, started_at DESC);

COMMIT;
