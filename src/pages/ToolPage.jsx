import React, { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { getTool } from "../data/siteData";

const tableOfContents = [
  { id: "overview", label: "Overview" },
  { id: "best-for", label: "Who it is for" },
  { id: "features", label: "Key features" },
  { id: "pricing", label: "Pricing" },
  { id: "pros-cons", label: "Pros and cons" },
  { id: "faq", label: "FAQ" },
  { id: "verdict", label: "Our verdict" }
];

function setMetaTag(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}='${key}']`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

export default function ToolPage() {
  const { slug } = useParams();
  const tool = getTool(slug);

  const seoTitle = useMemo(() => {
    if (!tool) {
      return "Tool review";
    }
    return `${tool.name} Review 2026: Pricing, Features, Pros and Cons`;
  }, [tool]);

  const seoDescription = useMemo(() => {
    if (!tool) {
      return "AI tool review page.";
    }
    return `${tool.name} review: pricing, key features, pros and cons, best use cases, and alternatives. Updated guide for 2026.`;
  }, [tool]);

  useEffect(() => {
    if (!tool) {
      return;
    }

    const previousTitle = document.title;
    document.title = seoTitle;

    setMetaTag("name", "description", seoDescription);
    setMetaTag("property", "og:title", seoTitle);
    setMetaTag("property", "og:description", seoDescription);
    setMetaTag("property", "og:type", "article");
    setMetaTag("property", "og:url", window.location.href);

    return () => {
      document.title = previousTitle;
    };
  }, [tool, seoTitle, seoDescription]);

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

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: tool.faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a
      }
    }))
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    applicationCategory: tool.category,
    operatingSystem: "Web",
    description: tool.tagline,
    offers: {
      "@type": "Offer",
      price: tool.price,
      priceCurrency: "USD"
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: String(tool.rating),
      ratingCount: "100"
    },
    url: window.location.href
  };

  return (
    <section className="section-card detail-card">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span> / </span>
        <Link to="/tools">Tools</Link>
        <span> / </span>
        <span>{tool.name}</span>
      </nav>

      <Link to="/tools" className="back-link">
        ← All tools
      </Link>
      <div className="detail-head">
        <img src={tool.image} alt={tool.name} loading="lazy" />
        <div>
          <h1>{tool.name} Review 2026</h1>
          <p className="muted-line">{tool.category}</p>
          <p>{tool.tagline}</p>
          <p className="rating-line">{tool.rating.toFixed(1)} rating · {tool.price}</p>
          <a href={tool.website} target="_blank" rel="noreferrer" className="pill-btn dark inline-btn">
            Visit website
          </a>
        </div>
      </div>

      <div className="tool-kpis">
        <article className="kpi-card">
          <small>Pricing</small>
          <strong>{tool.price}</strong>
        </article>
        <article className="kpi-card">
          <small>Category</small>
          <strong>{tool.category}</strong>
        </article>
        <article className="kpi-card">
          <small>Rating</small>
          <strong>{tool.rating.toFixed(1)} / 5</strong>
        </article>
        <article className="kpi-card">
          <small>Updated</small>
          <strong>Apr 2026</strong>
        </article>
      </div>

      <div className="detail-grid">
        <article className="article-body">
          <section id="overview" className="content-section">
            <h2>What is {tool.name}?</h2>
            <p>{tool.intro}</p>
          </section>

          <section id="best-for" className="content-section">
            <h2>Who is {tool.name} best for?</h2>
            <ul>
              {tool.bestFor.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section id="features" className="content-section">
            <h2>Key features</h2>
            <ul>
              {tool.keyFeatures.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section id="pricing" className="content-section">
            <h2>{tool.name} pricing</h2>
            <table className="pricing-table">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Price</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {tool.pricingPlans.map((plan) => (
                  <tr key={plan.plan}>
                    <td>{plan.plan}</td>
                    <td>{plan.price}</td>
                    <td>{plan.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section id="pros-cons" className="content-section pros-cons-grid">
            <div>
              <h2>Pros</h2>
              <ul className="check-list">
                {tool.pros.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2>Cons</h2>
              <ul className="x-list">
                {tool.cons.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          <section id="faq" className="content-section">
            <h2>{tool.name} FAQ</h2>
            {tool.faqs.map((item) => (
              <details key={item.q} className="faq-item" open={tool.slug === "notebooklm"}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </section>

          <section id="verdict" className="content-section">
            <h2>Our verdict</h2>
            <p>{tool.verdict}</p>
            <div className="compare-links-row">
              <a href={tool.affiliate} target="_blank" rel="noreferrer" className="pill-btn dark">
                Try {tool.name}
              </a>
              <Link className="pill-btn light" to="/compare">
                Compare alternatives
              </Link>
            </div>
          </section>
        </article>

        <aside className="toc-box">
          <h3>In this review</h3>
          {tableOfContents.map((item) => (
            <a key={item.id} href={`#${item.id}`} className="toc-link">
              {item.label}
            </a>
          ))}
          <div className="toc-divider" />
          <h4>Alternatives</h4>
          {tool.alternatives.map((alternative) => (
            <Link key={alternative} to={`/tools/${alternative}`} className="toc-link">
              {alternative.replace(/-/g, " ")}
            </Link>
          ))}
        </aside>
      </div>
    </section>
  );
}
