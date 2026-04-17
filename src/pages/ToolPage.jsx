import React from "react";
import { Link, useParams } from "react-router-dom";
import { getTool } from "../data/siteData";

const bullets = [
  "What is it?",
  "Who is it for?",
  "Key features",
  "Pricing",
  "Our verdict"
];

export default function ToolPage() {
  const { slug } = useParams();
  const tool = getTool(slug);

  if (!tool) {
    return (
      <section className="section-card not-found-block">
        <h1>Tool not found</h1>
        <Link className="inline-link" to="/tools">
          Back to all tools
        </Link>
      </section>
    );
  }

  return (
    <section className="section-card detail-card">
      <Link to="/tools" className="back-link">
        ← All tools
      </Link>
      <div className="detail-head">
        <img src={tool.image} alt={tool.name} loading="lazy" />
        <div>
          <h1>{tool.name}</h1>
          <p className="muted-line">{tool.category}</p>
          <p>{tool.tagline}</p>
          <p className="rating-line">{tool.rating.toFixed(1)} rating · {tool.price}</p>
          <a href={`https://aivario.com/tools/${tool.slug}`} target="_blank" rel="noreferrer" className="pill-btn dark inline-btn">
            View original
          </a>
        </div>
      </div>

      <div className="detail-grid">
        <article>
          <h2>What is {tool.name}?</h2>
          <p>
            {tool.name} is listed in our directory as a {tool.category.toLowerCase()} product. We include quick
            positioning, pricing context, and workflow fit so you can decide fast.
          </p>

          <h2>Who is it for?</h2>
          <ul>
            <li>Builders who need clear outcomes from AI tools.</li>
            <li>Teams evaluating stack choices before paying for seats.</li>
            <li>Solo operators optimizing speed and quality.</li>
          </ul>

          <h2>Our verdict</h2>
          <p>
            {tool.name} is a strong pick when {tool.category.toLowerCase()} is central to your workflow. Use the
            comparison hub to benchmark alternatives before committing.
          </p>
        </article>

        <aside className="toc-box">
          <h3>In this review</h3>
          {bullets.map((item) => (
            <p key={item}>{item}</p>
          ))}
          <Link to="/compare" className="inline-link">
            Compare alternatives
          </Link>
        </aside>
      </div>
    </section>
  );
}
