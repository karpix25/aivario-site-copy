import React from 'react'
import Link from 'next/link'
import { topNav } from '../data/contentRepository'

export default function NextLayout({ children }) {
  return (
    <div className="aivario-page">
      <div className="canvas-noise" />
      <header className="topbar glass-card" style={{ padding: '0.8rem 1rem' }}>
        <Link href="/" className="brand">AIVario</Link>
        <nav className="menu">
          {topNav.map((item) => (
            <Link href={item.to} key={item.to} className="active-link" aria-label={item.label}>
              {item.label}
            </Link>
          ))}
        </nav>
        <button className="pill-btn dark">Submit tool Soon</button>
      </header>

      <main className="layout" style={{ padding: '1rem' }}>
        {children}
      </main>

      <footer className="footer" style={{ width: '100%', padding: '0.65rem 1rem' }}>
        <div>
          <Link href="/" className="brand">AIVario</Link>
        </div>
        <div>
          <Link href="/about">About</Link>
          <Link href="/blog">Newsletter</Link>
          <a href="https://x.com/aivario" target="_blank" rel="noreferrer">Twitter</a>
        </div>
        <p>© 2026 AIVario</p>
      </footer>
    </div>
  )
}
