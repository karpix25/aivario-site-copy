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
  return {
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
      item.descriptionShort ||
      `${item.name || item.slug} is included in our live catalog. This profile is synced from PostgreSQL and refreshed during data ingestion runs.`,
    bestFor: [
      "Teams comparing options before procurement",
      "Operators looking for production-ready tools",
      "Users evaluating features and pricing quickly"
    ],
    keyFeatures: [
      "Live synced listing from ingestion pipeline",
      "Category and tag metadata for filtering",
      "Structured profile designed for SEO pages"
    ],
    pros: ["Fresh catalog data", "Consistent structure", "Scalable ingestion workflow"],
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
    alternatives: [],
    verdict:
      "This profile is powered by the live ingestion pipeline. For production selection, compare alternatives and validate pricing on the official website.",
    tags: item.tags || [],
    sourceUrl: item.sourceUrl
  };
}

const generatedTools = (generatedCatalog.tools || []).map(normalizeGeneratedTool);
const useGeneratedTools = generatedTools.length > 0;

export const tools = useGeneratedTools ? generatedTools : staticTools;
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
