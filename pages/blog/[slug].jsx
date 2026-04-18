import React from 'react'
import { useRouter } from 'next/router'
import { getBlogPost } from '../../src/data/contentRepository'

export default function BlogPostPage() {
  const router = useRouter()
  const { slug } = router.query
  const post = slug ? getBlogPost(slug) : null

  if (!post) {
    return <div className="not-found-block"><h1>Post not found</h1></div>
  }

  return (
    <section className="section-card blog-post">
      <div className="detail-head">
        <img src={post.image || '/favicon.ico'} alt={post.title} />
        <div>
          <h1 style={{ margin: 0 }}>{post.title}</h1>
          <p className="detail-grid" style={{ marginTop: '0.5rem' }}>
            <span>{post.readTime}</span>
            <span>{post.date}</span>
          </p>
        </div>
      </div>
      <div className="content-section article-body" dangerouslySetInnerHTML={{ __html: post.content || '' }} />
    </section>
  )
}
