import React from "react";
import { Link } from "react-router-dom";

const principles = [
  {
    title: "Independent",
    text: "No investor pressure and no sponsored ranking placements in core recommendations."
  },
  {
    title: "Opinionated",
    text: "Comparisons end with a clear winner instead of vague tie language."
  },
  {
    title: "Updated",
    text: "Reviews are revisited as products ship major updates."
  },
  {
    title: "Honest",
    text: "Affiliate links may exist, but they never define rankings."
  }
];

export default function AboutPage() {
  return (
    <section className="section-card about-page">
      <p className="soft-eyebrow">About AIVario</p>
      <h1 className="page-title">
        The AI tools
        <br />
        directory that
        <br />
        does not lie.
      </h1>
      <p className="page-lead">
        AIVario is an independent directory of AI tools. We test, compare, and review tools so you can make faster,
        higher-confidence decisions.
      </p>

      <div className="stats-row about-stats">
        <article>
          <strong>115+</strong>
          <span>Tools indexed</span>
        </article>
        <article>
          <strong>6</strong>
          <span>Categories</span>
        </article>
        <article>
          <strong>2026</strong>
          <span>Founded</span>
        </article>
      </div>

      <article className="article-body">
        <h2>Cut through AI hype</h2>
        <p>
          Every week new products launch and most are not worth adopting. The directory exists to separate useful
          products from noise and document where each tool actually fits.
        </p>
      </article>

      <div className="principles-grid">
        {principles.map((item, index) => (
          <article key={item.title} className="principle-card">
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </div>

      <section className="section-card compact-section in-article-card">
        <h2>Find your AI stack</h2>
        <p>Browse all listed tools or jump into the latest practical guides and comparisons.</p>
        <div className="compare-links-row">
          <Link className="pill-btn dark" to="/tools">
            Browse tools
          </Link>
          <Link className="pill-btn light" to="/blog">
            Read guides
          </Link>
        </div>
      </section>
    </section>
  );
}
