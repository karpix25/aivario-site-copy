import React from "react";
import { Link } from "react-router-dom";
import { tools } from "../data/contentRepository";

export default function ToolsPage() {
  return (
    <section className="section-card tools-page">
      <p className="soft-eyebrow">{tools.length} tools indexed</p>
      <h1 className="page-title">All AI Tools</h1>
      <p className="page-lead">Browse and compare every AI tool we reviewed with honest ratings and real prices.</p>

      <div className="search-wrap page-search">
        <input type="text" placeholder="Search tools" aria-label="Search tools" />
      </div>

      <div className="tools-grid">
        {tools.map((tool) => (
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
            <Link to={`/tools/${tool.slug}`} className="inline-link">
              Read review
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
