import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { getCatalogCounts, tools } from "../data/contentRepository";

const typeOptions = [
  { key: "all", label: "All" },
  { key: "tool", label: "Tools" },
  { key: "agent", label: "Agents" },
  { key: "mcp_server", label: "MCP Servers" },
  { key: "mcp_client", label: "MCP Clients" }
];

const typeTitles = {
  all: "All AI Catalog",
  tool: "AI Tools",
  agent: "AI Agents",
  mcp_server: "MCP Servers",
  mcp_client: "MCP Clients"
};

function normalizeSearch(value) {
  return value.trim().toLowerCase();
}

export default function ToolsPage() {
  const counts = getCatalogCounts();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeType = searchParams.get("type") || "all";
  const activeCategory = searchParams.get("category") || "all";
  const query = searchParams.get("q") || "";

  const scoped = useMemo(() => {
    if (activeType === "all") {
      return tools;
    }
    return tools.filter((item) => item.entityType === activeType);
  }, [activeType]);

  const categories = useMemo(() => {
    const bucket = new Map();
    for (const item of scoped) {
      const name = item.category || "Uncategorized";
      bucket.set(name, (bucket.get(name) || 0) + 1);
    }
    return Array.from(bucket.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 18)
      .map(([name, count]) => ({ name, count }));
  }, [scoped]);

  const filtered = useMemo(() => {
    const needle = normalizeSearch(query);
    return scoped.filter((item) => {
      if (activeCategory !== "all" && item.category !== activeCategory) {
        return false;
      }

      if (!needle) {
        return true;
      }

      const hay = [item.name, item.category, item.tagline, item.slug].join(" ").toLowerCase();
      return hay.includes(needle);
    });
  }, [scoped, activeCategory, query]);

  function patchParams(next) {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (!value || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    setSearchParams(params);
  }

  return (
    <section className="section-card tools-page">
      <p className="soft-eyebrow">{counts.total} items indexed</p>
      <h1 className="page-title">{typeTitles[activeType] || "AI Catalog"}</h1>
      <p className="page-lead">Browse tools, agents, and MCP directories with category filtering and live catalog sync.</p>

      <div className="entity-summary-grid">
        <article>
          <strong>{counts.tools}</strong>
          <span>Tools</span>
        </article>
        <article>
          <strong>{counts.agents}</strong>
          <span>Agents</span>
        </article>
        <article>
          <strong>{counts.mcpServers}</strong>
          <span>MCP Servers</span>
        </article>
        <article>
          <strong>{counts.mcpClients}</strong>
          <span>MCP Clients</span>
        </article>
      </div>

      <div className="type-tabs" role="tablist" aria-label="Entity type filters">
        {typeOptions.map((item) => (
          <button
            key={item.key}
            type="button"
            className={item.key === activeType ? "tab-btn active" : "tab-btn"}
            onClick={() => patchParams({ type: item.key, category: "all" })}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="search-wrap page-search">
        <input
          type="text"
          placeholder="Search by name, slug, description"
          aria-label="Search catalog"
          value={query}
          onChange={(event) => patchParams({ q: event.target.value })}
        />
      </div>

      <div className="category-filters">
        <button
          type="button"
          className={activeCategory === "all" ? "chip active" : "chip"}
          onClick={() => patchParams({ category: "all" })}
        >
          All categories
        </button>
        {categories.map((category) => (
          <button
            key={category.name}
            type="button"
            className={activeCategory === category.name ? "chip active" : "chip"}
            onClick={() => patchParams({ category: category.name })}
          >
            {category.name} ({category.count})
          </button>
        ))}
      </div>

      <p className="soft-eyebrow result-line">Showing {filtered.length} items</p>

      <div className="tools-grid">
        {filtered.map((tool) => (
          <article key={tool.slug} className="tool-card">
            <div className="tool-card-head">
              <img src={tool.image} alt={tool.name} loading="lazy" />
              <span>{tool.category}</span>
            </div>
            <h3>{tool.name}</h3>
            <p>{tool.tagline}</p>
            <div className="tool-card-foot">
              <small>{tool.price}</small>
              <strong>{tool.rating.toFixed(1)}</strong>
            </div>
            <small className="entity-pill">{tool.entityType?.replace("_", " ") || "tool"}</small>
            <Link to={`/tools/${tool.slug}`} className="inline-link">
              Read review
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
