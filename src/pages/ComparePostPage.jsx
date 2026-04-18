import React from "react";
import { Link, useParams } from "react-router-dom";
import { getComparison } from "../data/contentRepository";

function parseNames(title) {
  const parts = title.split(" vs ");
  return {
    left: parts[0] || "Tool A",
    right: parts[1] || "Tool B"
  };
}

export default function ComparePostPage() {
  const { slug } = useParams();
  const entry = getComparison(slug);

  if (!entry) {
    return (
      <section className="section-card not-found-block">
        <h1>Comparison not found</h1>
        <Link className="inline-link" to="/compare">
          Back to comparisons
        </Link>
      </section>
    );
  }

  const names = parseNames(entry.title);

  return (
    <section className="section-card detail-card">
      <Link to="/compare" className="back-link">
        ← All comparisons
      </Link>
      <p className="soft-eyebrow">Comparison</p>
      <h1>{entry.title}</h1>
      <p className="page-lead">{entry.summary}</p>

      <div className="versus-row">
        <article>
          <h3>{names.left}</h3>
          <p>Strong in focused workflows, reliability, and practical day-to-day usage.</p>
        </article>
        <span>VS</span>
        <article>
          <h3>{names.right}</h3>
          <p>Strong in flexibility, ecosystem integrations, and broad feature coverage.</p>
        </article>
      </div>

      <article className="article-body">
        <h2>The short answer</h2>
        <p>
          Both tools are capable, but they optimize for different users. Pick based on your most frequent workflow,
          not on feature checklists.
        </p>
        <h2>Performance and quality</h2>
        <p>
          In repeated practical tasks, the winner below consistently delivered better output quality and less rework.
        </p>
        <h2>Our verdict</h2>
        <p className="winner-line">{entry.winner}</p>
      </article>

      <div className="compare-links-row">
        <Link className="pill-btn dark" to="/tools">
          Browse tools
        </Link>
        <Link className="pill-btn light" to="/compare">
          More comparisons
        </Link>
      </div>
    </section>
  );
}
