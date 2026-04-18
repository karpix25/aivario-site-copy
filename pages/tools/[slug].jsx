import React from 'react'
import { useRouter } from 'next/router'
import { getTool } from '../../src/data/contentRepository'

export default function ToolDetail() {
  const router = useRouter()
  const { slug } = router.query
  const tool = slug ? getTool(slug) : null

  if (!tool) {
    return <div className="not-found-block"><h1>Tool not found</h1></div>
  }

  return (
    <section className="section-card tool-detail">
      <div className="detail-head">
        <img src={tool.image} alt={tool.name} />
        <div>
          <h1 style={{ margin: 0 }}>{tool.name}</h1>
          <p>{tool.tagline}</p>
          <p className="detail-grid" style={{ marginTop: '0.5rem' }}>
            <span>Category: {tool.category}</span>
            <span>Rating: {tool.rating}</span>
          </p>
        </div>
      </div>
      <div className="content-section">
        <h2>Overview</h2>
        <p>{tool.intro}</p>
      </div>
    </section>
  )
}
