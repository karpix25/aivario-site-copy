import React from "react";
import { Link } from "react-router-dom";
import { blogPosts, comparisons, tools } from "../data/siteData";

const featuredTools = tools.slice(0, 7);
const categories = [
  { name: "Productivity", tools: "27 tools" },
  { name: "Business", tools: "23 tools" },
  { name: "Coding", tools: "19 tools" },
  { name: "Creatives", tools: "18 tools" },
  { name: "Research", tools: "14 tools" },
  { name: "Video & Audio", tools: "14 tools" }
];

const logos = [
  "https://aivario.com/images/tools/claude.svg",
  "https://aivario.com/images/tools/elevenlabs.svg",
  "https://aivario.com/images/tools/midjourney.svg",
  "https://aivario.com/images/tools/chatgpt.svg",
  "https://aivario.com/images/tools/cursor.svg",
  "https://aivario.com/images/tools/perplexity.svg"
];

export default function HomePage() {
  return (
    <>
      <section className="hero-card">
        <p className="eyebrow">
          <span className="pulse-dot" />
          The AI intelligence layer
        </p>
        <h1>
          Find the best
          <br />
          AI tool for
          <br />
          any job.
        </h1>
        <p className="hero-copy">
          Curated reviews and honest comparisons across every AI category. Built for people who ship things.
        </p>
        <div className="hero-actions">
          <Link className="pill-btn dark" to="/tools">
            Browse all tools
          </Link>
          <Link className="pill-btn light" to="/blog">
            Read latest guides
          </Link>
        </div>
        <div className="stats-row">
          <article>
            <strong>115+</strong>
            <span>Tools reviewed</span>
          </article>
          <article>
            <strong>6</strong>
            <span>Categories</span>
          </article>
          <article>
            <strong>Free</strong>
            <span>Always</span>
          </article>
        </div>
      </section>

      <section className="search-card">
        <div className="logo-strip">
          {logos.map((logo) => (
            <img src={logo} alt="tool logo" key={logo} loading="lazy" />
          ))}
          <span className="logo-counter">+109</span>
        </div>
        <div className="search-wrap">
          <input type="text" placeholder="Search" aria-label="Search tools" />
          <Link className="pill-btn dark small" to="/tools">
            Search
          </Link>
        </div>
        <p className="subhead">Browse by category</p>
        <div className="category-grid">
          {categories.map((item) => (
            <article key={item.name} className="category-card">
              <h3>{item.name}</h3>
              <p>{item.tools}</p>
            </article>
          ))}
        </div>
        <p className="popular-line">Popular: Free tools, AI writing, Code editor, Image AI, Video AI</p>
      </section>

      <section className="section-card">
        <div className="section-head">
          <h2>Latest guides</h2>
          <Link to="/blog">View all</Link>
        </div>
        <div className="guide-layout">
          <article className="guide-featured">
            <span>New guide</span>
            <h3>{blogPosts[0].title}</h3>
            <p>{blogPosts[0].excerpt}</p>
            <small>{blogPosts[0].readTime} - {blogPosts[0].date}</small>
            <Link to={`/blog/${blogPosts[0].slug}`} className="inline-link">
              Read guide
            </Link>
          </article>
          <div className="guide-list">
            {blogPosts.slice(1).map((item) => (
              <article key={item.slug}>
                <span>{item.type}</span>
                <h4>{item.title}</h4>
                <small>{item.readTime}</small>
                <Link to={`/blog/${item.slug}`} className="inline-link">
                  Open
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-card">
        <div className="section-head">
          <h2>Editor's picks</h2>
          <Link to="/tools">View all</Link>
        </div>
        <div className="pick-grid">
          {featuredTools.map((item) => (
            <article key={item.slug} className="pick-card">
              <div className="pick-top">
                <img src={item.image} alt={item.name} loading="lazy" />
                <span>{item.rating >= 4.9 ? "Hot" : "Top"}</span>
              </div>
              <h3>{item.name}</h3>
              <p className="pick-category">{item.category}</p>
              <p className="pick-desc">{item.tagline}</p>
              <p className="pick-meta">{item.rating} star - {item.price}</p>
              <Link to={`/tools/${item.slug}`} className="inline-link">
                Review
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section-card compact-section">
        <div className="section-head">
          <h2>Popular comparisons</h2>
          <Link to="/compare">View all</Link>
        </div>
        <div className="compare-inline-grid">
          {comparisons.slice(0, 6).map((item) => (
            <Link key={item.slug} to={`/compare/${item.slug}`} className="compare-inline-card">
              <strong>{item.title}</strong>
              <span>{item.winner}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="subscribe-card">
        <div>
          <h2>Stay ahead of AI.</h2>
          <p>Weekly picks of the best new AI tools, honest reviews, and deals. Read by 48,000 builders.</p>
        </div>
        <form className="subscribe-form">
          <input type="email" placeholder="Subscribe - it's free" aria-label="Email" />
          <button type="button" className="pill-btn lime">
            Subscribe
          </button>
          <small>No spam. Unsubscribe anytime.</small>
        </form>
      </section>
    </>
  );
}
