import React from 'react'
import Link from 'next/link'
import { tools } from '../../src/data/contentRepository'

export default function ToolsPage() {
  return (
    <section className="section-card tools-page">
      <div className="section-head">
        <h2>Tools</h2>
        <Link href="/tools">View all</Link>
      </div>
      <div className="tools-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.65rem' }}>
        {tools.map((t) => (
          <article key={t.slug} className="tool-card" style={{ padding: '0.8rem' }}>
            <div className="pick-top" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src={t.image} alt={t.name} style={{ width: 40, height: 40, objectFit: 'contain' }} />
              <span style={{ fontWeight: 700 }}>{t.category}</span>
            </div>
            <h3 style={{ marginTop: '0.5rem' }}>{t.name}</h3>
            <p style={{ margin: '0.25rem 0' }}>{t.tagline}</p>
            <Link href={`/tools/${t.slug}`} className="inline-link">Open</Link>
          </article>
        ))}
      </div>
    </section>
  )
}
