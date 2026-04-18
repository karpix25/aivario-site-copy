BEGIN;

CREATE TABLE IF NOT EXISTS entity_profiles (
  entity_id uuid PRIMARY KEY REFERENCES entities(id) ON DELETE CASCADE,
  intro text,
  target_users_json jsonb,
  how_to_steps_json jsonb,
  features_json jsonb,
  benefits_json jsonb,
  use_cases_json jsonb,
  alternatives_json jsonb,
  company_json jsonb,
  analytics_json jsonb,
  section_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_entity_profiles_target_users_gin ON entity_profiles USING gin (target_users_json);
CREATE INDEX IF NOT EXISTS idx_entity_profiles_analytics_gin ON entity_profiles USING gin (analytics_json);

COMMIT;
