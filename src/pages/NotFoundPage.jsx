import React from "react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="section-card not-found-block">
      <p className="soft-eyebrow">404</p>
      <h1>Page not found</h1>
      <p>This URL is not in the cloned public structure yet.</p>
      <div className="compare-links-row">
        <Link className="pill-btn dark" to="/">
          Home
        </Link>
        <Link className="pill-btn light" to="/tools">
          Tools
        </Link>
      </div>
    </section>
  );
}
