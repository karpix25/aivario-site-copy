import React from 'react'
import { useRouter } from 'next/router'
import { getComparison } from '../../src/data/contentRepository'

export default function CompareDetail() {
  const router = useRouter()
  const { slug } = router.query
  const comp = slug ? getComparison(slug) : null

  if (!comp) {
    return <div className="not-found-block"><h1>Comparison not found</h1></div>
  }

  return (
    <section className="section-card compare-detail">
      <h2>{comp.title}</h2>
      <p>Winner: {comp.winner}</p>
      <div dangerouslySetInnerHTML={{ __html: comp.content || '' }} />
    </section>
  )
}
