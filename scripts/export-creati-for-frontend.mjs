import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import pg from "pg";

const { Client } = pg;

const OUTPUT_PATH = path.resolve("src/data/generated/creati-catalog.json");

function parseLimit() {
  const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
  if (!limitArg) {
    return 4000;
  }
  const value = Number.parseInt(limitArg.split("=")[1], 10);
  return Number.isFinite(value) ? value : 4000;
}

async function loadRows(client, limit) {
  const entityQuery = await client.query(
    `SELECT id, entity_type::text AS entity_type, slug, source_url, name, headline,
            description_short, website_url, logo_url, image_url,
            pricing_label, rating_value, rating_count
     FROM entities
     WHERE is_active = true
       AND entity_type IN ('tool', 'agent', 'mcp_server', 'mcp_client')
     ORDER BY last_seen_at DESC
     LIMIT $1`,
    [limit]
  );

  const ids = entityQuery.rows.map((row) => row.id);
  if (ids.length === 0) {
    return [];
  }

  const categoryQuery = await client.query(
    `SELECT ec.entity_id, c.name, c.slug
     FROM entity_categories ec
     JOIN categories c ON c.id = ec.category_id
     WHERE ec.entity_id = ANY($1::uuid[])`,
    [ids]
  );

  const tagQuery = await client.query(
    `SELECT et.entity_id, t.name, t.slug
     FROM entity_tags et
     JOIN tags t ON t.id = et.tag_id
     WHERE et.entity_id = ANY($1::uuid[])`,
    [ids]
  );

  const categoryMap = new Map();
  for (const row of categoryQuery.rows) {
    if (!categoryMap.has(row.entity_id)) {
      categoryMap.set(row.entity_id, []);
    }
    categoryMap.get(row.entity_id).push({ name: row.name, slug: row.slug });
  }

  const tagMap = new Map();
  for (const row of tagQuery.rows) {
    if (!tagMap.has(row.entity_id)) {
      tagMap.set(row.entity_id, []);
    }
    tagMap.get(row.entity_id).push({ name: row.name, slug: row.slug });
  }

  return entityQuery.rows.map((row) => {
    const categories = categoryMap.get(row.id) || [];
    const tags = tagMap.get(row.id) || [];
    return {
      entityType: row.entity_type,
      slug: row.slug,
      sourceUrl: row.source_url,
      name: row.name,
      headline: row.headline,
      descriptionShort: row.description_short,
      websiteUrl: row.website_url,
      logoUrl: row.logo_url,
      imageUrl: row.image_url,
      pricingLabel: row.pricing_label,
      ratingValue: row.rating_value ? Number(row.rating_value) : null,
      ratingCount: row.rating_count,
      primaryCategory: categories[0]?.name || null,
      categories,
      tags
    };
  });
}

function summarizeCounts(rows) {
  return rows.reduce(
    (acc, row) => {
      if (row.entityType === "tool") {
        acc.tools += 1;
      } else if (row.entityType === "agent") {
        acc.agents += 1;
      } else if (row.entityType === "mcp_server") {
        acc.mcpServers += 1;
      } else if (row.entityType === "mcp_client") {
        acc.mcpClients += 1;
      }
      return acc;
    },
    { tools: 0, agents: 0, mcpServers: 0, mcpClients: 0 }
  );
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  const limit = parseLimit();
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    const rows = await loadRows(client, limit);
    const payload = {
      generatedAt: new Date().toISOString(),
      source: "postgres-export",
      counts: summarizeCounts(rows),
      tools: rows
    };

    await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
    await writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`);

    console.log(`Export complete: ${rows.length} rows -> ${OUTPUT_PATH}`);
    console.log(`Counts: tools=${payload.counts.tools}, agents=${payload.counts.agents}, mcp_servers=${payload.counts.mcpServers}, mcp_clients=${payload.counts.mcpClients}`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Export failed", error);
  process.exitCode = 1;
});
