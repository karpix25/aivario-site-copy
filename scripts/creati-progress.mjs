import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import pg from "pg";

const { Client } = pg;

const manifestPath = path.resolve("data/creati/index/manifest.json");
const enrichedPath = path.resolve("data/creati/enriched/latest.json");

async function readJsonSafe(filePath) {
  try {
    const content = await readFile(filePath, "utf8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function printLocalProgress() {
  const manifest = await readJsonSafe(manifestPath);
  const enriched = await readJsonSafe(enrichedPath);

  console.log("=== Local Progress ===");
  if (manifest) {
    console.log(`index generated: ${manifest.generatedAt}`);
    console.log(`index unique urls: ${manifest.totals?.uniqueUrls ?? 0}`);
    for (const source of manifest.sources || []) {
      console.log(`- ${source.key}: ${source.collectedCount}`);
    }
  } else {
    console.log("index manifest not found");
  }

  if (enriched) {
    console.log(`enriched generated: ${enriched.generatedAt}`);
    console.log(`enriched success: ${enriched.totalSuccess || 0}`);
    console.log(`enriched failed: ${enriched.totalFailed || 0}`);
    console.log(`enriched total input: ${enriched.totalInput || 0}`);
  } else {
    console.log("enriched snapshot not found");
  }
}

async function printDbProgress() {
  if (!process.env.DATABASE_URL) {
    console.log("DATABASE_URL not set, DB progress skipped.");
    return;
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    console.log("=== DB Progress ===");

    const total = await client.query("SELECT COUNT(*)::int AS count FROM entities WHERE is_active = true");
    console.log(`entities active: ${total.rows[0].count}`);

    const byType = await client.query(
      `SELECT entity_type::text AS type, COUNT(*)::int AS count
       FROM entities
       WHERE is_active = true
       GROUP BY entity_type
       ORDER BY count DESC`
    );
    for (const row of byType.rows) {
      console.log(`- ${row.type}: ${row.count}`);
    }

    const filled = await client.query(
      `SELECT
         COUNT(*) FILTER (WHERE description_short IS NOT NULL)::int AS with_description,
         COUNT(*) FILTER (WHERE website_url IS NOT NULL)::int AS with_website,
         COUNT(*) FILTER (WHERE pricing_label IS NOT NULL)::int AS with_pricing,
         COUNT(*) FILTER (WHERE rating_value IS NOT NULL)::int AS with_rating
       FROM entities
       WHERE is_active = true`
    );

    const row = filled.rows[0];
    console.log(`with description: ${row.with_description}`);
    console.log(`with website: ${row.with_website}`);
    console.log(`with pricing: ${row.with_pricing}`);
    console.log(`with rating: ${row.with_rating}`);

    const jobs = await client.query(
      `SELECT job_type, status, started_at, finished_at
       FROM ingest_jobs
       ORDER BY started_at DESC
       LIMIT 5`
    );
    console.log("recent jobs:");
    for (const job of jobs.rows) {
      console.log(`- ${job.job_type} ${job.status} started=${job.started_at.toISOString()} finished=${job.finished_at ? job.finished_at.toISOString() : "-"}`);
    }
  } finally {
    await client.end();
  }
}

async function main() {
  await printLocalProgress();
  await printDbProgress();
}

main().catch((error) => {
  console.error("Progress check failed", error);
  process.exitCode = 1;
});
