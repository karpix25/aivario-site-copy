import React from "react";
import { Link, useParams } from "react-router-dom";
import { formatDisplayDate, getBlogPost, tools } from "../data/siteData";

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = getBlogPost(slug);

  if (!post) {
    return (
      <section className="section-card not-found-block">
        <h1>Article not found</h1>
        <Link className="inline-link" to="/blog">
          Back to blog
        </Link>
      </section>
    );
  }

  const picks = tools.slice(0, 4);

  return (
    <section className="section-card detail-card">
      <Link to="/blog" className="back-link">
        ← All articles
      </Link>
      <p className="soft-eyebrow">{post.type}</p>
      <h1>{post.title}</h1>
      <p className="muted-line">
        {post.readTime} · {formatDisplayDate(post.date)}
      </p>
      <p className="page-lead">{post.excerpt}</p>

      <article className="article-body">
        <h2>Why this guide exists</h2>
        <p>
          The AI landscape moves quickly and most directories focus on hype over practical value. This page mirrors the
          structure of AIVario content so each topic is easy to scan and compare.
        </p>
        <h2>How to use it</h2>
        <p>
          Start with your use case, shortlist two or three tools, and jump to comparisons before committing to paid
          plans. This process usually removes weeks of trial-and-error.
        </p>
        <h2>Recommended starting stack</h2>
        <ul>
          {picks.map((tool) => (
            <li key={tool.slug}>
              <strong>{tool.name}</strong> - {tool.tagline}
            </li>
          ))}
        </ul>
      </article>

      <section className="section-card compact-section in-article-card">
        <div className="section-head">
          <h2>Browse tools</h2>
          <Link to="/tools">View all</Link>
        </div>
        <div className="compare-inline-grid">
          {picks.map((tool) => (
            <Link key={tool.slug} className="compare-inline-card" to={`/tools/${tool.slug}`}>
              <strong>{tool.name}</strong>
              <span>{tool.price}</span>
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}
