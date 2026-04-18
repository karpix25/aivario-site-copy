import React from "react";
import { Link } from "react-router-dom";
import { comparisons } from "../data/contentRepository";

function groupComparisons(items) {
  return items.reduce((acc, item) => {
    if (!acc[item.group]) {
      acc[item.group] = [];
    }
    acc[item.group].push(item);
    return acc;
  }, {});
}

export default function ComparePage() {
  const grouped = groupComparisons(comparisons);

  return (
    <section className="section-card compare-page">
      <p className="soft-eyebrow">{comparisons.length} comparisons</p>
      <h1 className="page-title">AI Tool Comparisons</h1>
      <p className="page-lead">Honest head-to-head breakdowns with a clear recommendation.</p>

      {Object.entries(grouped).map(([group, entries]) => (
        <section key={group} className="compare-group">
          <h2>{group}</h2>
          <div className="compare-grid">
            {entries.map((item) => (
              <Link key={item.slug} to={`/compare/${item.slug}`} className="compare-card">
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <strong>{item.winner}</strong>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}
