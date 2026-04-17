const categories = [
  { name: "Productivity", tools: "27 tools" },
  { name: "Business", tools: "23 tools" },
  { name: "Coding", tools: "19 tools" },
  { name: "Creatives", tools: "18 tools" },
  { name: "Research", tools: "14 tools" },
  { name: "Video & Audio", tools: "14 tools" }
];

const guides = [
  {
    label: "Comparison",
    title: "ChatGPT vs Claude vs Gemini: Which one is worth paying for?",
    minutes: "5 min read"
  },
  {
    label: "Comparison",
    title: "Cursor vs GitHub Copilot in 2026: Which AI code editor wins?",
    minutes: "5 min read"
  },
  {
    label: "List",
    title: "Best free AI tools in 2026: 12 tools that cost $0",
    minutes: "5 min read"
  },
  {
    label: "Guide",
    title: "Best AI tools for solo founders in 2026",
    minutes: "4 min read"
  }
];

const picks = [
  {
    name: "Claude",
    category: "AI Assistant",
    desc: "Best for complex reasoning, long-form writing, coding, and deep document analysis.",
    score: "4.9",
    price: "Free",
    image: "https://aivario.com/images/tools/claude.svg",
    badge: "Hot"
  },
  {
    name: "ElevenLabs",
    category: "AI Voice Synthesis",
    desc: "The most realistic AI voice synthesis platform with fast voice cloning.",
    score: "4.9",
    price: "$5/mo",
    image: "https://aivario.com/images/tools/elevenlabs.svg",
    badge: "Hot"
  },
  {
    name: "Midjourney",
    category: "AI Image Generation",
    desc: "Industry standard image generator for creative professionals and teams.",
    score: "4.9",
    price: "$10/mo",
    image: "https://aivario.com/images/tools/midjourney.svg",
    badge: "Hot"
  },
  {
    name: "NotebookLM",
    category: "Research",
    desc: "Upload PDFs and notes, then chat with your sources to get fast summaries.",
    score: "4.9",
    price: "Free",
    image: "https://aivario.com/images/tools/notebooklm.svg",
    badge: "Hot"
  },
  {
    name: "Adobe Podcast",
    category: "AI Audio Enhancement",
    desc: "Makes basic recordings sound like a professional studio microphone.",
    score: "4.8",
    price: "Free",
    image: "https://aivario.com/images/tools/adobe-podcast.png",
    badge: "Top"
  },
  {
    name: "Ahrefs",
    category: "Business",
    desc: "Trusted SEO toolkit for backlink analysis, keyword research, and audits.",
    score: "4.8",
    price: "$29/mo",
    image: "https://aivario.com/images/tools/ahrefs.png",
    badge: "Top"
  },
  {
    name: "Beehiiv",
    category: "Business",
    desc: "Newsletter platform with AI writing, monetization, and analytics.",
    score: "4.8",
    price: "Free / $39/mo",
    image: "https://aivario.com/images/tools/beehiiv.svg",
    badge: "Hot"
  }
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
    <div className="aivario-page">
      <div className="canvas-noise" />
      <main className="layout">
        <nav className="topbar glass-card">
          <a href="#" className="brand">AIVario</a>
          <div className="menu">
            <a href="#">Home</a>
            <a href="#">Tools</a>
            <a href="#">Blog</a>
            <a href="#">Compare</a>
          </div>
          <button className="pill-btn dark">Submit tool Soon</button>
        </nav>

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
            <button className="pill-btn dark">Browse all tools</button>
            <button className="pill-btn light">Read latest guides</button>
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
            <button className="pill-btn dark small">Search</button>
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
            <a href="#">View all</a>
          </div>
          <div className="guide-layout">
            <article className="guide-featured">
              <span>New guide</span>
              <h3>AI Starterpack 2026: Best tools for every use case</h3>
              <p>
                We tested 250+ AI tools so you do not have to. Here is the definitive list by category,
                budget, and use case.
              </p>
              <small>2 min read - 2026-03-22</small>
            </article>
            <div className="guide-list">
              {guides.map((item) => (
                <article key={item.title}>
                  <span>{item.label}</span>
                  <h4>{item.title}</h4>
                  <small>{item.minutes}</small>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-card">
          <div className="section-head">
            <h2>Editor's picks</h2>
            <a href="#">View all</a>
          </div>
          <div className="pick-grid">
            {picks.map((item) => (
              <article key={item.name} className="pick-card">
                <div className="pick-top">
                  <img src={item.image} alt={item.name} loading="lazy" />
                  <span>{item.badge}</span>
                </div>
                <h3>{item.name}</h3>
                <p className="pick-category">{item.category}</p>
                <p className="pick-desc">{item.desc}</p>
                <p className="pick-meta">{item.score} star - {item.price}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="subscribe-card">
          <div>
            <h2>Stay ahead of AI.</h2>
            <p>
              Weekly picks of the best new AI tools, honest reviews, and deals. Read by 48,000 builders.
            </p>
          </div>
          <form className="subscribe-form">
            <input type="email" placeholder="Subscribe - it's free" aria-label="Email" />
            <button type="button" className="pill-btn lime">Subscribe</button>
            <small>No spam. Unsubscribe anytime.</small>
          </form>
        </section>

        <footer className="footer">
          <a href="#" className="brand">AIVario</a>
          <div>
            <a href="#">About</a>
            <a href="#">Newsletter</a>
            <a href="#">Advertise</a>
            <a href="#">Twitter</a>
          </div>
          <p>© 2026 AIVario</p>
        </footer>
      </main>
    </div>
  );
}
