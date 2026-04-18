import React from 'react'
import Link from 'next/link'
import { comparisons } from '../../src/data/contentRepository'

export default function ComparePage() {
  return (
    <section className="section-card">
      <div className="section-head">
        <h2>Popular comparisons</h2>
        <Link href="/compare">View all</Link>
      </div>
      <div className="compare-inline-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.65rem' }}>
        {comparisons.slice(0, 6).map((c) => (
          <Link key={c.slug} href={`/compare/${c.slug}`} className="compare-inline-card">
            <strong>{c.title}</strong>
            <span>{c.winner}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
