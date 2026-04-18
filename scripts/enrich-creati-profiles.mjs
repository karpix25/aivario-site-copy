import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import pg from "pg";

const { Client } = pg;

const SOURCE_HOST = "creati.ai";
const INDEX_URLS_PATH = path.resolve("data/creati/index/all-urls.json");
const OUTPUT_DIR = path.resolve("data/creati/enriched");

function parseArgs() {
  const options = {
    limit: 50,
    delayMs: 250,
    apply: false,
    fromDb: false,
    force: false,
    types: ["tool", "agent", "mcp_server", "mcp_client"]
  };

  for (const arg of process.argv.slice(2)) {
    if (arg === "--apply") {
      options.apply = true;
    } else if (arg === "--from-db") {
      options.fromDb = true;
    } else if (arg === "--force") {
      options.force = true;
    } else if (arg.startsWith("--limit=")) {
      options.limit = Number.parseInt(arg.split("=")[1], 10);
    } else if (arg.startsWith("--delay-ms=")) {
      options.delayMs = Number.parseInt(arg.split("=")[1], 10);
    } else if (arg.startsWith("--types=")) {
      options.types = arg
        .split("=")[1]
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    }
  }

  return options;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

function stripTags(value) {
  return normalizeWhitespace(
    value
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
  );
}

function hashValue(value) {
  return createHash("sha256").update(value).digest("hex");
}

function inferEntityType(url) {
  const pathname = new URL(url).pathname;
  if (pathname.includes("/ai-news/")) {
    return "news";
  }
  if (pathname.includes("/mcp/")) {
    if (pathname.includes("/mcp/client/")) {
      return "mcp_client";
    }
    if (pathname.includes("/mcp/server/")) {
      return "mcp_server";
    }
    return "mcp_server";
  }
  if (pathname.includes("/ai-agents/")) {
    return "agent";
  }
  return "tool";
}

function parseSlug(url, entityType) {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  if (entityType === "news") {
    return `${parts[2] || "unknown-date"}--${parts[3] || "unknown"}`;
  }
  return parts[2] || parts[parts.length - 1] || "unknown";
}

function extractTitle(html) {
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  return match ? normalizeWhitespace(stripTags(match[1])) : null;
}

function extractMetaDescription(html) {
  const match = html.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["'][^>]*>/i);
  return match ? normalizeWhitespace(stripTags(match[1])) : null;
}

function extractCanonical(html) {
  const match = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/i);
  return match ? match[1] : null;
}

function extractJsonLdObjects(html) {
  const scripts = [];
  const regex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    scripts.push(match[1]);
  }

  const objects = [];
  for (const scriptContent of scripts) {
    try {
      const parsed = JSON.parse(scriptContent.trim());
      if (Array.isArray(parsed)) {
        objects.push(...parsed);
      } else {
        objects.push(parsed);
      }
    } catch {
      continue;
    }
  }
  return objects;
}

function collectByType(nodes, type) {
  const results = [];
  const visit = (node) => {
    if (!node || typeof node !== "object") {
      return;
    }

    if (Array.isArray(node)) {
      for (const child of node) {
        visit(child);
      }
      return;
    }

    const nodeType = node["@type"];
    if (nodeType === type || (Array.isArray(nodeType) && nodeType.includes(type))) {
      results.push(node);
    }

    for (const value of Object.values(node)) {
      visit(value);
    }
  };

  for (const node of nodes) {
    visit(node);
  }

  return results;
}

function extractLinksWithText(html) {
  const links = [];
  const regex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const href = match[1];
    const text = stripTags(match[2]);
    links.push({ href, text });
  }
  return links;
}

function parseCategoryAndTagLinks(links, entityType) {
  const categoryPath =
    entityType === "agent" ? "/ru/ai-agents/categories/" : entityType.startsWith("mcp") ? "/ru/mcp/categories/" : "/ru/ai-tools/categories/";

  const categories = [];
  const tags = [];

  const decodeSafe = (value) => {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };

  for (const link of links) {
    if (link.href.includes(categoryPath)) {
      const slugRaw = link.href.split(categoryPath)[1]?.split("/")[0];
      const slug = slugRaw ? decodeSafe(slugRaw) : null;
      if (slug) {
        categories.push({ slug, name: link.text || slug });
      }
    }

    if (link.href.includes("/tags/") || link.href.includes("/tag/")) {
      const slugRaw = link.href.split("/").filter(Boolean).at(-1);
      const slug = slugRaw ? decodeSafe(slugRaw) : null;
      if (slug && link.text.trim().startsWith("#")) {
        tags.push({ slug, name: link.text || slug });
      }
    }
  }

  const dedupe = (items) => {
    const map = new Map();
    for (const item of items) {
      if (!item.name || item.name.length > 120 || !item.slug || item.slug.length > 120) {
        continue;
      }
      map.set(item.slug, item);
    }
    return Array.from(map.values());
  };

  return { categories: dedupe(categories).slice(0, 20), tags: dedupe(tags).slice(0, 30) };
}

function extractWebsiteUrl(links) {
  const candidates = links
    .map((item) => item.href)
    .filter((href) => href.startsWith("http://") || href.startsWith("https://"))
    .filter((href) => !href.includes(SOURCE_HOST))
    .filter((href) => !href.includes("cdn-image.creati.ai"));

  const tracked = candidates.find((href) => href.includes("utm_source=creati.ai"));
  return tracked || candidates[0] || null;
}

function extractPricingLabel(software) {
  if (software?.offers?.price && software?.offers?.priceCurrency) {
    return `${software.offers.priceCurrency} ${software.offers.price}`;
  }
  if (software?.offers?.price) {
    return String(software.offers.price);
  }
  return null;
}

function extractFaqs(jsonLdObjects) {
  const faqPages = collectByType(jsonLdObjects, "FAQPage");
  const faqs = [];

  for (const page of faqPages) {
    const entities = Array.isArray(page.mainEntity) ? page.mainEntity : [];
    for (const item of entities) {
      if (!item || typeof item !== "object") {
        continue;
      }
      const question = normalizeWhitespace(String(item.name || ""));
      const answer = normalizeWhitespace(String(item.acceptedAnswer?.text || ""));
      if (question) {
        faqs.push({ question, answer });
      }
    }
  }

  return faqs;
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; CreatiProfileEnricher/1.0; +https://github.com/karpix25/aivario-site-copy)",
      accept: "text/html,application/xhtml+xml",
      "accept-language": "ru,en;q=0.8"
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.text();
}

function buildEnrichedRecord(url, html) {
  const entityType = inferEntityType(url);
  const slug = parseSlug(url, entityType);
  const title = extractTitle(html);
  const description = extractMetaDescription(html);
  const canonical = extractCanonical(html);
  const jsonLd = extractJsonLdObjects(html);
  const links = extractLinksWithText(html);
  const websiteUrl = extractWebsiteUrl(links);
  const { categories, tags } = parseCategoryAndTagLinks(links, entityType);

  const softwareApplications = collectByType(jsonLd, "SoftwareApplication");
  const software = softwareApplications[0] || null;
  const offers = software?.offers || null;

  const ratingValue = Number.parseFloat(software?.aggregateRating?.ratingValue ?? "");
  const ratingCount = Number.parseInt(String(software?.aggregateRating?.ratingCount ?? ""), 10);
  const pricingLabel = extractPricingLabel(software);
  const faqs = extractFaqs(jsonLd);

  const normalized = {
    sourceUrl: url,
    canonicalUrl: canonical,
    entityType,
    slug,
    name: software?.name || null,
    headline: title,
    descriptionShort: description,
    websiteUrl,
    pricingLabel,
    pricingModel: offers?.category || null,
    hasFreePlan:
      description?.toLowerCase().includes("free") ||
      pricingLabel?.toLowerCase().includes("free") ||
      false,
    ratingValue: Number.isFinite(ratingValue) ? ratingValue : null,
    ratingCount: Number.isFinite(ratingCount) ? ratingCount : null,
    categories,
    tags,
    platforms: [],
    faqs,
    rawHash: hashValue(html)
  };

  return normalized;
}

async function loadUrlsFromIndex(limit, types) {
  const content = await readFile(INDEX_URLS_PATH, "utf8");
  const urls = JSON.parse(content);
  return urls
    .filter((url) => types.includes(inferEntityType(url)))
    .slice(0, limit);
}

async function loadUrlsFromDb(client, limit, force, types) {
  const query = force
    ? `SELECT source_url
       FROM entities
       WHERE is_active = true
         AND entity_type = ANY($2::entity_type[])
       ORDER BY last_seen_at DESC
       LIMIT $1`
    : `SELECT source_url
       FROM entities
       WHERE is_active = true
         AND entity_type = ANY($2::entity_type[])
         AND (description_short IS NULL OR website_url IS NULL OR pricing_label IS NULL)
       ORDER BY last_seen_at DESC
       LIMIT $1`;
  const result = await client.query(query, [limit, types]);
  return result.rows.map((row) => row.source_url);
}

async function upsertCategory(client, category, entityType) {
  const result = await client.query(
    `INSERT INTO categories (name, slug, entity_type_scope)
     VALUES ($1, $2, $3::entity_type)
     ON CONFLICT (slug, entity_type_scope)
     DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [category.name, category.slug, entityType]
  );
  return result.rows[0].id;
}

async function upsertTag(client, tag) {
  const result = await client.query(
    `INSERT INTO tags (name, slug)
     VALUES ($1, $2)
     ON CONFLICT (slug)
     DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [tag.name, tag.slug]
  );
  return result.rows[0].id;
}

async function persistEnrichment(client, rows) {
  const jobRes = await client.query(
    `INSERT INTO ingest_jobs (job_type, status)
     VALUES ($1, $2)
     RETURNING id`,
    ["creati_profile_enrich", "running"]
  );
  const jobId = jobRes.rows[0].id;

  try {
    await client.query("BEGIN");
    let updated = 0;

    for (const row of rows) {
      const entityRes = await client.query(
        `UPDATE entities
         SET
           entity_type = $2::entity_type,
           slug = $3,
           headline = COALESCE($4, headline),
           description_short = COALESCE($5, description_short),
           website_url = COALESCE($6, website_url),
           pricing_label = COALESCE($7, pricing_label),
           pricing_model = COALESCE($8, pricing_model),
           has_free_plan = COALESCE($9, has_free_plan),
           rating_value = COALESCE($10, rating_value),
           rating_count = COALESCE($11, rating_count),
           raw_hash = $12,
           updated_at = now(),
           last_seen_at = now(),
           last_changed_at = CASE
             WHEN raw_hash IS DISTINCT FROM $12 THEN now()
             ELSE last_changed_at
           END
         WHERE source_url = $1
         RETURNING id`,
        [
          row.sourceUrl,
          row.entityType,
          row.slug,
          row.headline,
          row.descriptionShort,
          row.websiteUrl,
          row.pricingLabel,
          row.pricingModel,
          row.hasFreePlan,
          row.ratingValue,
          row.ratingCount,
          row.rawHash
        ]
      );

      if (entityRes.rowCount === 0) {
        continue;
      }

      const entityId = entityRes.rows[0].id;

      await client.query(`DELETE FROM entity_categories WHERE entity_id = $1`, [entityId]);
      for (const category of row.categories) {
        const categoryId = await upsertCategory(client, category, row.entityType);
        await client.query(
          `INSERT INTO entity_categories (entity_id, category_id)
           VALUES ($1, $2)
           ON CONFLICT (entity_id, category_id) DO NOTHING`,
          [entityId, categoryId]
        );
      }

      await client.query(`DELETE FROM entity_tags WHERE entity_id = $1`, [entityId]);
      for (const tag of row.tags) {
        const tagId = await upsertTag(client, tag);
        await client.query(
          `INSERT INTO entity_tags (entity_id, tag_id)
           VALUES ($1, $2)
           ON CONFLICT (entity_id, tag_id) DO NOTHING`,
          [entityId, tagId]
        );
      }

      await client.query(`DELETE FROM entity_faqs WHERE entity_id = $1`, [entityId]);
      for (let i = 0; i < row.faqs.length; i += 1) {
        const faq = row.faqs[i];
        await client.query(
          `INSERT INTO entity_faqs (entity_id, question, answer, position)
           VALUES ($1, $2, $3, $4)`,
          [entityId, faq.question, faq.answer, i]
        );
      }

      await client.query(
        `INSERT INTO entity_raw_snapshots (entity_id, raw_json)
         VALUES ($1, $2::jsonb)`,
        [entityId, JSON.stringify(row)]
      );

      updated += 1;
    }

    await client.query("COMMIT");
    await client.query(
      `UPDATE ingest_jobs
       SET status = 'success', finished_at = now(), stats_json = $2::jsonb
       WHERE id = $1`,
      [jobId, JSON.stringify({ rowsUpdated: updated })]
    );

    console.log(`Applied enrichment to ${updated} rows.`);
  } catch (error) {
    await client.query("ROLLBACK");
    await client.query(
      `UPDATE ingest_jobs
       SET status = 'failed', finished_at = now(), error_text = $2
       WHERE id = $1`,
      [jobId, String(error.message || error)]
    );
    throw error;
  }
}

async function main() {
  const options = parseArgs();
  await mkdir(OUTPUT_DIR, { recursive: true });

  let client = null;
  if ((options.fromDb || options.apply) && !process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for --from-db or --apply mode");
  }

  if (process.env.DATABASE_URL) {
    client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
  }

  try {
    const urls = options.fromDb && client
      ? await loadUrlsFromDb(client, options.limit, options.force, options.types)
      : await loadUrlsFromIndex(options.limit, options.types);

    const results = [];
    let failed = 0;
    const startedAt = Date.now();

    for (let index = 0; index < urls.length; index += 1) {
      const url = urls[index];
      const step = index + 1;
      try {
        const html = await fetchHtml(url);
        const enriched = buildEnrichedRecord(url, html);
        results.push(enriched);
        const elapsedSec = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
        const speed = (step / elapsedSec).toFixed(2);
        const percent = ((step / urls.length) * 100).toFixed(1);
        console.log(`[${step}/${urls.length}] ${percent}% ok ${url} (speed ${speed}/s)`);
      } catch (error) {
        failed += 1;
        const percent = ((step / urls.length) * 100).toFixed(1);
        console.log(`[${step}/${urls.length}] ${percent}% fail ${url} (${String(error.message || error)})`);
      }
      await sleep(options.delayMs);
    }

    const output = {
      generatedAt: new Date().toISOString(),
      options,
      totalInput: urls.length,
      totalSuccess: results.length,
      totalFailed: failed,
      rows: results
    };

    const outputPath = path.join(OUTPUT_DIR, "latest.json");
    await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
    console.log(`Saved enriched output: ${outputPath}`);

    if (options.apply) {
      if (!client) {
        throw new Error("Database connection is not available");
      }
      await persistEnrichment(client, results);
    } else {
      console.log("Dry-run mode: no database writes. Use --apply to persist.");
    }
  } finally {
    if (client) {
      await client.end();
    }
  }
}

main().catch((error) => {
  console.error("Enrichment failed", error);
  process.exitCode = 1;
});
