import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUTPUT_DIR = path.resolve("data/creati/index");

const SOURCES = [
  {
    key: "tools",
    entryUrl: "https://creati.ai/ru/ai-tools/",
    pageUrl: (page) => `https://creati.ai/ru/ai-tools/?page=${page}`,
    pattern: /\/ru\/ai-tools\/([^\/?#"']+)\//g,
    ignoreSlugs: new Set(["new", "most-saved", "most-reviewed", "categories", "platform", "tag"])
  },
  {
    key: "agents",
    entryUrl: "https://creati.ai/ru/ai-agents/",
    pageUrl: (page) => `https://creati.ai/ru/ai-agents/?page=${page}`,
    pattern: /\/ru\/ai-tools\/([^\/?#"']+)\//g,
    ignoreSlugs: new Set(["new", "most-saved", "most-reviewed", "categories", "platform", "tag"])
  },
  {
    key: "mcp_servers",
    entryUrl: "https://creati.ai/ru/mcp/server/",
    pageUrl: (page) => `https://creati.ai/ru/mcp/server/?page=${page}`,
    pattern: /\/ru\/mcp\/([^\/?#"']+)\//g,
    ignoreSlugs: new Set(["server", "client", "categories", "tag"])
  },
  {
    key: "mcp_clients",
    entryUrl: "https://creati.ai/ru/mcp/client/",
    pageUrl: (page) => `https://creati.ai/ru/mcp/client/?page=${page}`,
    pattern: /\/ru\/mcp\/([^\/?#"']+)\//g,
    ignoreSlugs: new Set(["server", "client", "categories", "tag"])
  },
  {
    key: "ai_news",
    entryUrl: "https://creati.ai/ru/ai-news/",
    pageUrl: (page) => `https://creati.ai/ru/ai-news/?page=${page}`,
    pattern: /\/ru\/ai-news\/([^\/?#"']+)\/([^\/?#"']+)\//g,
    ignoreSlugs: new Set([])
  }
];

const maxPages = Number.parseInt(process.env.CREATI_MAX_PAGES || "35", 10);
const minPages = Number.parseInt(process.env.CREATI_MIN_PAGES || "2", 10);
const noNewLimit = Number.parseInt(process.env.CREATI_NO_NEW_LIMIT || "2", 10);
const delayMs = Number.parseInt(process.env.CREATI_DELAY_MS || "150", 10);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; CreatiIndexer/1.0; +https://github.com/karpix25/aivario-site-copy)",
      accept: "text/html,application/xhtml+xml"
    }
  });

  if (!response.ok) {
    return null;
  }

  return response.text();
}

function extractIndexedCount(html) {
  const match = html.match(/(\d[\d,.]*)\s*Indexed/i);
  if (!match) {
    return null;
  }

  return Number.parseInt(match[1].replace(/[^\d]/g, ""), 10);
}

function normalizeUrl(relativePath) {
  return new URL(relativePath, "https://creati.ai").toString();
}

function extractLinks(html, source) {
  const links = [];
  let match;

  while ((match = source.pattern.exec(html)) !== null) {
    if (source.key === "ai_news") {
      const datePart = match[1];
      const slug = match[2];
      if (!datePart || !slug) {
        continue;
      }
      links.push(normalizeUrl(`/ru/ai-news/${datePart}/${slug}/`));
      continue;
    }

    const slug = match[1];
    if (!slug || source.ignoreSlugs.has(slug)) {
      continue;
    }

    const base = source.key.startsWith("mcp") ? "/ru/mcp/" : "/ru/ai-tools/";
    links.push(normalizeUrl(`${base}${slug}/`));
  }

  source.pattern.lastIndex = 0;
  return links;
}

async function collectSource(source) {
  const seen = new Set();
  const pages = [];
  let indexedCount = null;
  let noNewStreak = 0;

  for (let page = 1; page <= maxPages; page += 1) {
    const url = page === 1 ? source.entryUrl : source.pageUrl(page);
    const html = await fetchHtml(url);

    if (!html) {
      pages.push({ page, url, status: "failed" });
      break;
    }

    if (indexedCount === null) {
      indexedCount = extractIndexedCount(html);
    }

    const links = extractLinks(html, source);
    let newCount = 0;

    for (const link of links) {
      if (!seen.has(link)) {
        seen.add(link);
        newCount += 1;
      }
    }

    pages.push({
      page,
      url,
      extracted: links.length,
      newLinks: newCount
    });

    console.log(`[${source.key}] page ${page}: extracted ${links.length}, new ${newCount}, total ${seen.size}`);

    if (newCount === 0) {
      noNewStreak += 1;
    } else {
      noNewStreak = 0;
    }

    if (page >= minPages && noNewStreak >= noNewLimit) {
      break;
    }

    await sleep(delayMs);
  }

  return {
    key: source.key,
    entryUrl: source.entryUrl,
    indexedCount,
    collectedCount: seen.size,
    urls: Array.from(seen).sort(),
    pages
  };
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const results = [];
  for (const source of SOURCES) {
    console.log(`Start source: ${source.key}`);
    const result = await collectSource(source);
    results.push(result);

    await writeFile(
      path.join(OUTPUT_DIR, `${source.key}.json`),
      `${JSON.stringify(
        {
          key: result.key,
          entryUrl: result.entryUrl,
          indexedCount: result.indexedCount,
          collectedCount: result.collectedCount,
          urls: result.urls,
          pages: result.pages
        },
        null,
        2
      )}\n`
    );
  }

  const allUrls = new Set();
  for (const result of results) {
    for (const url of result.urls) {
      allUrls.add(url);
    }
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    params: {
      maxPages,
      minPages,
      noNewLimit,
      delayMs
    },
    totals: {
      sources: results.length,
      uniqueUrls: allUrls.size
    },
    sources: results.map((result) => ({
      key: result.key,
      indexedCount: result.indexedCount,
      collectedCount: result.collectedCount,
      pagesFetched: result.pages.length,
      lastPage: result.pages[result.pages.length - 1]?.page || 0
    }))
  };

  await writeFile(path.join(OUTPUT_DIR, "manifest.json"), `${JSON.stringify(summary, null, 2)}\n`);
  await writeFile(path.join(OUTPUT_DIR, "all-urls.json"), `${JSON.stringify(Array.from(allUrls).sort(), null, 2)}\n`);

  console.log(`Creati index collection complete. Unique URLs: ${allUrls.size}`);
  for (const source of summary.sources) {
    console.log(`- ${source.key}: ${source.collectedCount} links (indexed label: ${source.indexedCount ?? "n/a"})`);
  }
}

main().catch((error) => {
  console.error("Collection failed", error);
  process.exitCode = 1;
});
