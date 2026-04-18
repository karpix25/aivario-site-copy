import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import pg from "pg";

const { Client } = pg;

const INDEX_DIR = path.resolve("data/creati/index");
const SOURCE_NAME = "creati_ai";
const SOURCE_BASE_URL = "https://creati.ai";

const FILES = [
  ["tools.json", "tool"],
  ["agents.json", "agent"],
  ["mcp_servers.json", "mcp_server"],
  ["mcp_clients.json", "mcp_client"],
  ["ai_news.json", "news"]
];

function hasArg(flag) {
  return process.argv.includes(flag);
}

function parseDateFromNewsUrl(url) {
  const pathname = new URL(url).pathname;
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length < 4) {
    return null;
  }
  const dateRaw = parts[2];
  const decoded = decodeURIComponent(dateRaw);

  const parsed = new Date(decoded);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  const dateOnly = decoded.match(/^(\d{4}-\d{2}-\d{2})/);
  if (dateOnly) {
    return `${dateOnly[1]}T00:00:00.000Z`;
  }
  return null;
}

function parseSlug(url, entityType) {
  const pathname = new URL(url).pathname;
  const parts = pathname.split("/").filter(Boolean);

  if (entityType === "news") {
    const datePart = parts[2] || "unknown-date";
    const slugPart = parts[3] || "unknown";
    return `${datePart}--${slugPart}`;
  }

  return parts[2] || parts[parts.length - 1] || "unknown";
}

function parseNameFromSlug(slug) {
  return slug
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
    .trim();
}

function hashRow(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function readIndexFile(fileName) {
  const fullPath = path.join(INDEX_DIR, fileName);
  const content = await readFile(fullPath, "utf8");
  return JSON.parse(content);
}

async function loadRows() {
  const rows = [];

  for (const [fileName, entityType] of FILES) {
    const payload = await readIndexFile(fileName);
    for (const sourceUrl of payload.urls || []) {
      const slug = parseSlug(sourceUrl, entityType);
      const name = parseNameFromSlug(slug);
      const addedAtSource = entityType === "news" ? parseDateFromNewsUrl(sourceUrl) : null;
      rows.push({
        entityType,
        sourceUrl,
        slug,
        name,
        addedAtSource,
        rawHash: hashRow(`${entityType}:${sourceUrl}`)
      });
    }
  }

  return rows;
}

async function runDrySummary(rows) {
  const buckets = new Map();
  for (const row of rows) {
    buckets.set(row.entityType, (buckets.get(row.entityType) || 0) + 1);
  }

  console.log(`Dry-run: prepared ${rows.length} entity rows`);
  for (const [type, count] of buckets.entries()) {
    console.log(`- ${type}: ${count}`);
  }
}

async function upsertRows(client, rows) {
  const startedAt = new Date();

  const jobInsert = await client.query(
    `INSERT INTO ingest_jobs (job_type, status, started_at)
     VALUES ($1, $2, $3)
     RETURNING id`,
    ["creati_index_upsert", "running", startedAt]
  );
  const jobId = jobInsert.rows[0].id;

  try {
    await client.query("BEGIN");

    const sourceRes = await client.query(
      `INSERT INTO sources (name, base_url)
       VALUES ($1, $2)
       ON CONFLICT (name)
       DO UPDATE SET base_url = EXCLUDED.base_url
       RETURNING id`,
      [SOURCE_NAME, SOURCE_BASE_URL]
    );
    const sourceId = sourceRes.rows[0].id;

    let upserted = 0;
    for (const row of rows) {
      await client.query(
        `INSERT INTO entities (
          source_id,
          entity_type,
          slug,
          source_url,
          name,
          added_at_source,
          first_seen_at,
          last_seen_at,
          raw_hash,
          is_active,
          updated_at
        ) VALUES (
          $1, $2::entity_type, $3, $4, $5, $6, now(), now(), $7, true, now()
        )
        ON CONFLICT (source_id, source_url)
        DO UPDATE SET
          slug = EXCLUDED.slug,
          name = COALESCE(NULLIF(EXCLUDED.name, ''), entities.name),
          added_at_source = COALESCE(EXCLUDED.added_at_source, entities.added_at_source),
          last_seen_at = now(),
          is_active = true,
          raw_hash = EXCLUDED.raw_hash,
          updated_at = now(),
          last_changed_at = CASE
            WHEN entities.raw_hash IS DISTINCT FROM EXCLUDED.raw_hash THEN now()
            ELSE entities.last_changed_at
          END`,
        [
          sourceId,
          row.entityType,
          row.slug,
          row.sourceUrl,
          row.name || null,
          row.addedAtSource,
          row.rawHash
        ]
      );
      upserted += 1;
    }

    await client.query("COMMIT");

    await client.query(
      `UPDATE ingest_jobs
       SET status = $2,
           finished_at = now(),
           stats_json = $3::jsonb
       WHERE id = $1`,
      [jobId, "success", JSON.stringify({ rowsUpserted: upserted })]
    );

    console.log(`Applied upsert successfully. Rows upserted: ${upserted}`);
  } catch (error) {
    await client.query("ROLLBACK");
    await client.query(
      `UPDATE ingest_jobs
       SET status = $2,
           finished_at = now(),
           error_text = $3
       WHERE id = $1`,
      [jobId, "failed", String(error.message || error)]
    );
    throw error;
  }
}

async function main() {
  const shouldApply = hasArg("--apply");
  const rows = await loadRows();

  if (!shouldApply) {
    await runDrySummary(rows);
    console.log("No database changes made. Use --apply to run upsert.");
    return;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required when using --apply");
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    await upsertRows(client, rows);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Upsert failed", error);
  process.exitCode = 1;
});
