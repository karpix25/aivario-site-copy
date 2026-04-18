import generatedCatalog from "./generated/creati-catalog.json";
import {
  blogPosts as staticBlogPosts,
  comparisons as staticComparisons,
  formatDisplayDate,
  getBlogPost as getStaticBlogPost,
  getComparison as getStaticComparison,
  getTool as getStaticTool,
  tools as staticTools,
  topNav
} from "./siteData";

function normalizeGeneratedTool(item) {
  const profile = item.profile || {};
  return {
    entityType: item.entityType || "tool",
    slug: item.slug,
    name: item.name || item.slug,
    category: item.primaryCategory || "AI Tool",
    tagline: item.descriptionShort || item.headline || "AI tool profile from Creati index.",
    price: item.pricingLabel || "Free / Paid",
    rating: Number.isFinite(item.ratingValue) ? item.ratingValue : 4.6,
    image: item.logoUrl || item.imageUrl || "https://aivario.com/images/tools/chatgpt.svg",
    website: item.websiteUrl || item.sourceUrl,
    affiliate: item.websiteUrl || item.sourceUrl,
    intro:
      profile.intro ||
      item.descriptionShort ||
      `${item.name || item.slug} is included in our live catalog. This profile is synced from PostgreSQL and refreshed during data ingestion runs.`,
    bestFor:
      profile.targetUsers?.length > 0
        ? profile.targetUsers
        : [
            "Teams comparing options before procurement",
            "Operators looking for production-ready tools",
            "Users evaluating features and pricing quickly"
          ],
    keyFeatures:
      profile.features?.length > 0
        ? profile.features
        : [
            "Live synced listing from ingestion pipeline",
            "Category and tag metadata for filtering",
            "Structured profile designed for SEO pages"
          ],
    pros: profile.benefits?.length > 0 ? profile.benefits : ["Fresh catalog data", "Consistent structure", "Scalable ingestion workflow"],
    cons: ["Some fields can be missing in source data", "Deep review text may require additional enrichment"],
    pricingPlans: [{ plan: "Current", price: item.pricingLabel || "n/a", notes: "Synced from latest source snapshot" }],
    faqs: [
      {
        q: `What is ${item.name || item.slug}?`,
        a: item.descriptionShort || "See official website for the full product specification and latest releases."
      },
      {
        q: "How often is this profile updated?",
        a: "Profiles are updated when ingestion and enrichment jobs are executed."
      }
    ],
    alternatives: profile.alternatives || [],
    verdict:
      "This profile is powered by the live ingestion pipeline. For production selection, compare alternatives and validate pricing on the official website.",
    tags: item.tags || [],
    sourceUrl: item.sourceUrl,
    platforms: item.platforms || [],
    useCases: profile.useCases || [],
    howToSteps: profile.howToSteps || [],
    analytics: profile.analytics || {},
    companyInfo: profile.companyInfo || {},
    visitsMonthly: item.visitsMonthly || null
  };
}

const generatedTools = (generatedCatalog.tools || []).map(normalizeGeneratedTool);
const useGeneratedTools = generatedTools.length > 0;

const fallbackTools = staticTools.map((tool) => ({
  ...tool,
  entityType: "tool"
}));

export const tools = useGeneratedTools ? generatedTools : fallbackTools;
export const blogPosts = staticBlogPosts;
export const comparisons = staticComparisons;
export { formatDisplayDate, topNav };

export function getTool(slug) {
  if (useGeneratedTools) {
    return tools.find((tool) => tool.slug === slug);
  }
  return getStaticTool(slug);
}

export function getBlogPost(slug) {
  return getStaticBlogPost(slug);
}

export function getComparison(slug) {
  return getStaticComparison(slug);
}

export function getRepositoryMeta() {
  return {
    source: useGeneratedTools ? "postgres-export" : "static-fallback",
    generatedAt: generatedCatalog.generatedAt || null,
    toolCount: tools.length
  };
}

export function getCatalogCounts() {
  const base = {
    tools: 0,
    agents: 0,
    mcpServers: 0,
    mcpClients: 0
  };

  if (useGeneratedTools && generatedCatalog.counts) {
    return {
      ...generatedCatalog.counts,
      total:
        (generatedCatalog.counts.tools || 0) +
        (generatedCatalog.counts.agents || 0) +
        (generatedCatalog.counts.mcpServers || 0) +
        (generatedCatalog.counts.mcpClients || 0)
    };
  }

  for (const item of tools) {
    if (item.entityType === "agent") {
      base.agents += 1;
    } else if (item.entityType === "mcp_server") {
      base.mcpServers += 1;
    } else if (item.entityType === "mcp_client") {
      base.mcpClients += 1;
    } else {
      base.tools += 1;
    }
  }

  return {
    ...base,
    total: base.tools + base.agents + base.mcpServers + base.mcpClients
  };
}
