import process from "node:process";
import pg from "pg";

const { Client } = pg;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    const totals = await client.query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE description_short IS NOT NULL)::int AS with_description,
         COUNT(*) FILTER (WHERE website_url IS NOT NULL)::int AS with_website,
         COUNT(*) FILTER (WHERE pricing_label IS NOT NULL)::int AS with_pricing,
         COUNT(*) FILTER (WHERE rating_value IS NOT NULL)::int AS with_rating,
         COUNT(*) FILTER (WHERE visits_monthly IS NOT NULL)::int AS with_visits
       FROM entities
       WHERE is_active = true
         AND entity_type IN ('tool', 'agent', 'mcp_server', 'mcp_client')`
    );

    const byType = await client.query(
      `SELECT
         entity_type::text AS type,
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE description_short IS NOT NULL)::int AS with_description,
         COUNT(*) FILTER (WHERE pricing_label IS NOT NULL)::int AS with_pricing,
         COUNT(*) FILTER (WHERE rating_value IS NOT NULL)::int AS with_rating
       FROM entities
       WHERE is_active = true
         AND entity_type IN ('tool', 'agent', 'mcp_server', 'mcp_client')
       GROUP BY entity_type
       ORDER BY total DESC`
    );

    const profileCoverage = await client.query(
      `SELECT
         COUNT(*)::int AS total_profiles,
         COUNT(*) FILTER (WHERE jsonb_array_length(COALESCE(target_users_json, '[]'::jsonb)) > 0)::int AS with_target_users,
         COUNT(*) FILTER (WHERE jsonb_array_length(COALESCE(how_to_steps_json, '[]'::jsonb)) > 0)::int AS with_how_to,
         COUNT(*) FILTER (WHERE jsonb_array_length(COALESCE(features_json, '[]'::jsonb)) > 0)::int AS with_features,
         COUNT(*) FILTER (WHERE jsonb_array_length(COALESCE(use_cases_json, '[]'::jsonb)) > 0)::int AS with_use_cases,
         COUNT(*) FILTER (WHERE jsonb_array_length(COALESCE(alternatives_json, '[]'::jsonb)) > 0)::int AS with_alternatives
       FROM entity_profiles`
    );

    const t = totals.rows[0];
    const pct = (value, base) => (base > 0 ? `${((value / base) * 100).toFixed(1)}%` : "0.0%");

    console.log("=== Creati Quality Report ===");
    console.log(`total entities: ${t.total}`);
    console.log(`description fill-rate: ${t.with_description}/${t.total} (${pct(t.with_description, t.total)})`);
    console.log(`website fill-rate: ${t.with_website}/${t.total} (${pct(t.with_website, t.total)})`);
    console.log(`pricing fill-rate: ${t.with_pricing}/${t.total} (${pct(t.with_pricing, t.total)})`);
    console.log(`rating fill-rate: ${t.with_rating}/${t.total} (${pct(t.with_rating, t.total)})`);
    console.log(`visits fill-rate: ${t.with_visits}/${t.total} (${pct(t.with_visits, t.total)})`);

    console.log("\nby type:");
    for (const row of byType.rows) {
      console.log(`- ${row.type}: total=${row.total}, description=${pct(row.with_description, row.total)}, pricing=${pct(row.with_pricing, row.total)}, rating=${pct(row.with_rating, row.total)}`);
    }

    const p = profileCoverage.rows[0];
    console.log("\nprofile section coverage:");
    console.log(`- profiles rows: ${p.total_profiles}`);
    console.log(`- target users: ${p.with_target_users}`);
    console.log(`- how to steps: ${p.with_how_to}`);
    console.log(`- features: ${p.with_features}`);
    console.log(`- use cases: ${p.with_use_cases}`);
    console.log(`- alternatives: ${p.with_alternatives}`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Quality report failed", error);
  process.exitCode = 1;
});
