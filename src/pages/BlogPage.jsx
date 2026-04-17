import React from "react";
import { Link } from "react-router-dom";
import { blogPosts, formatDisplayDate } from "../data/siteData";

export default function BlogPage() {
  const [featured, ...rest] = blogPosts;

  return (
    <section className="section-card blog-page">
      <p className="soft-eyebrow">{blogPosts.length} articles published</p>
      <h1 className="page-title">Guides & Reviews</h1>
      <p className="page-lead">Honest guides, comparisons, and lists to help you navigate the AI landscape.</p>

      <article className="guide-featured featured-article">
        <span>Featured guide</span>
        <h2>{featured.title}</h2>
        <p>{featured.excerpt}</p>
        <small>
          {featured.readTime} · {formatDisplayDate(featured.date)}
        </small>
        <Link to={`/blog/${featured.slug}`} className="inline-link">
          Read guide
        </Link>
      </article>

      <h3 className="sub-section-title">All articles</h3>
      <div className="article-grid">
        {rest.map((post) => (
          <article key={post.slug} className="article-card">
            <span>{post.type}</span>
            <h4>{post.title}</h4>
            <p>{post.excerpt}</p>
            <small>
              {post.readTime} · {formatDisplayDate(post.date)}
            </small>
            <Link to={`/blog/${post.slug}`} className="inline-link">
              Open article
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
