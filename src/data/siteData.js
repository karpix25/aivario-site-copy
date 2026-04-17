const toolSlugs = [
  "claude",
  "elevenlabs",
  "midjourney",
  "notebooklm",
  "adobe-podcast",
  "ahrefs",
  "beehiiv",
  "chatgpt",
  "consensus",
  "cursor",
  "fathom",
  "figma",
  "framer",
  "linear",
  "magnific",
  "n8n",
  "superhuman",
  "topaz-labs",
  "v0-vercel",
  "bolt-new",
  "canva-ai",
  "capcut",
  "clay",
  "descript",
  "gamma",
  "github-copilot",
  "gong",
  "heygen",
  "krisp",
  "leonardo-ai",
  "loom",
  "make",
  "obsidian",
  "opus-clip",
  "reclaim-ai",
  "runway",
  "semrush",
  "smartlead",
  "suno",
  "surfer-seo",
  "vista-social",
  "warp",
  "webflow-ai",
  "aider",
  "apollo-io",
  "bubble",
  "captions-ai",
  "clickup-ai",
  "coderabbit",
  "crewai",
  "elicit",
  "fireflies",
  "frase",
  "gemini",
  "grammarly",
  "higgsfield",
  "hubspot-ai",
  "ideogram",
  "instantly-ai",
  "intercom",
  "kling",
  "lovable",
  "luma-ai",
  "miro",
  "murf",
  "perplexity",
  "phind",
  "pitch",
  "pixverse",
  "research-rabbit",
  "scite",
  "sora",
  "speechify",
  "typeform",
  "veed-io",
  "windsurf",
  "writer",
  "zapier",
  "adobe-firefly",
  "asana",
  "beautiful-ai",
  "codeium",
  "grok",
  "invideo-ai",
  "jasper",
  "krea-ai",
  "lavender",
  "lemlist",
  "marketmuse",
  "motion",
  "notion-ai",
  "otter-ai",
  "paperpal",
  "pictory",
  "pieces-for-developers",
  "pika-labs",
  "podcastle",
  "salesforce-einstein",
  "slack",
  "synthesia",
  "undermind",
  "writesonic",
  "copy-ai",
  "d-id",
  "devin",
  "felo-ai",
  "microsoft-copilot",
  "monday-ai",
  "replit",
  "storm-stanford",
  "sunsama",
  "tabnine",
  "you-com",
  "zoom-ai",
  "scholarai"
];

const featuredToolMap = {
  claude: {
    category: "AI Assistant",
    tagline: "Thoughtful assistant for reasoning, writing, and long-context analysis.",
    price: "Free / $20mo",
    rating: 4.9,
    image: "https://aivario.com/images/tools/claude.svg"
  },
  elevenlabs: {
    category: "AI Voice Synthesis",
    tagline: "Natural sounding voices, cloning, and studio-ready output.",
    price: "$5mo",
    rating: 4.9,
    image: "https://aivario.com/images/tools/elevenlabs.svg"
  },
  midjourney: {
    category: "AI Image Generation",
    tagline: "High quality image generation for creative teams.",
    price: "$10mo",
    rating: 4.9,
    image: "https://aivario.com/images/tools/midjourney.svg"
  },
  notebooklm: {
    category: "Research",
    tagline: "Chat with your notes, PDFs, and knowledge base.",
    price: "Free",
    rating: 4.9,
    image: "https://aivario.com/images/tools/notebooklm.svg"
  },
  "adobe-podcast": {
    category: "AI Audio Enhancement",
    tagline: "Cleans rough recordings with one-click voice enhancement.",
    price: "Free",
    rating: 4.8,
    image: "https://aivario.com/images/tools/adobe-podcast.png"
  },
  ahrefs: {
    category: "Business",
    tagline: "SEO intelligence for keywords, backlinks, and content strategy.",
    price: "$29mo",
    rating: 4.8,
    image: "https://aivario.com/images/tools/ahrefs.png"
  },
  beehiiv: {
    category: "Business",
    tagline: "Newsletter publishing with growth and monetization features.",
    price: "Free / $39mo",
    rating: 4.8,
    image: "https://aivario.com/images/tools/beehiiv.svg"
  },
  chatgpt: {
    category: "AI Assistant",
    tagline: "General purpose AI assistant with broad ecosystem support.",
    price: "Free / $20mo",
    rating: 4.8,
    image: "https://aivario.com/images/tools/chatgpt.svg"
  },
  cursor: {
    category: "Coding",
    tagline: "Code editor with deep project-level AI workflows.",
    price: "Free / $20mo",
    rating: 4.9,
    image: "https://aivario.com/images/tools/cursor.svg"
  },
  perplexity: {
    category: "Research",
    tagline: "Answer engine with citations for fast factual research.",
    price: "Free / $20mo",
    rating: 4.9,
    image: "https://aivario.com/images/tools/perplexity.svg"
  }
};

const categoryCycle = [
  "AI Assistant",
  "Coding",
  "Business",
  "Creatives",
  "Research",
  "Video & Audio",
  "Productivity"
];

function titleFromSlug(slug) {
  return slug
    .split("-")
    .map((part) => {
      if (part === "ai") {
        return "AI";
      }
      if (part === "io") {
        return "IO";
      }
      if (part === "vs") {
        return "vs";
      }
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

function getFallbackTool(slug, index) {
  const category = categoryCycle[index % categoryCycle.length];
  return {
    slug,
    name: titleFromSlug(slug),
    category,
    tagline: `${titleFromSlug(slug)} review, pricing, and use cases for ${category.toLowerCase()} workflows.`,
    price: "Free / Paid",
    rating: 4.7,
    image: "https://aivario.com/images/tools/chatgpt.svg"
  };
}

export const tools = toolSlugs.map((slug, index) => {
  const featured = featuredToolMap[slug];
  if (featured) {
    return {
      slug,
      name: titleFromSlug(slug),
      ...featured
    };
  }
  return getFallbackTool(slug, index);
});

const toolProfileDetails = {
  notebooklm: {
    website: "https://notebooklm.google.com",
    affiliate: "https://notebooklm.google.com",
    intro:
      "NotebookLM is Google's AI research workspace that lets you upload your own sources and query them with grounded answers. Instead of generic chat, it focuses on your documents, notes, and references.",
    bestFor: [
      "Researchers and analysts summarizing long PDFs",
      "Students building study guides from source material",
      "Teams creating internal knowledge briefs",
      "Writers turning scattered notes into structured drafts"
    ],
    keyFeatures: [
      "Source-grounded answers with citations",
      "Notebook-level context across files and notes",
      "Audio overview mode for quick consumption",
      "Fast summary generation for long technical docs",
      "Question-answer workflow built for research"
    ],
    pros: [
      "Excellent at staying grounded in uploaded material",
      "Very fast summaries with clear structure",
      "Strong workflow for note synthesis and outlines",
      "Free entry point for individuals"
    ],
    cons: [
      "Less suited for broad open-web exploration",
      "Output quality depends on source quality",
      "Not a full writing suite with deep publishing features"
    ],
    pricingPlans: [
      { plan: "Free", price: "$0", notes: "Core notebook workflow and source Q&A" },
      { plan: "Workspace tiers", price: "Varies", notes: "Organization controls and scale depend on Google plan" }
    ],
    faqs: [
      {
        q: "Is NotebookLM free to use?",
        a: "Yes, there is a free tier for core workflows. Team-level capabilities may depend on your Google Workspace setup."
      },
      {
        q: "What makes NotebookLM different from ChatGPT?",
        a: "NotebookLM is optimized for grounded answers from your uploaded sources, while general assistants are broader and less source-constrained by default."
      },
      {
        q: "Can NotebookLM replace academic research tools?",
        a: "It speeds up synthesis and note analysis, but you should still validate citations and claims in primary sources before publication."
      }
    ],
    alternatives: ["perplexity", "consensus", "scite"],
    verdict:
      "NotebookLM is one of the strongest options for document-first research workflows. If your main bottleneck is understanding and synthesizing source material, it is a high-value pick."
  }
};

function getDefaultToolProfile(tool) {
  return {
    website: `https://aivario.com/tools/${tool.slug}`,
    affiliate: `https://aivario.com/tools/${tool.slug}`,
    intro: `${tool.name} is listed in our directory as a ${tool.category.toLowerCase()} tool. This profile covers practical fit, pricing context, and decision criteria so you can evaluate it quickly.`,
    bestFor: [
      "Solo operators choosing a practical AI stack",
      "Teams evaluating tools before paid rollout",
      `Users focused on ${tool.category.toLowerCase()} workflows`
    ],
    keyFeatures: [
      "Core workflow automation and output acceleration",
      "AI-assisted quality improvements for repetitive tasks",
      "Integrations or handoff paths for team operations"
    ],
    pros: ["Fast time-to-value", "Clear use-case alignment", "Useful for production workflows"],
    cons: ["Needs testing against your real data", "Feature depth varies by plan"],
    pricingPlans: [{ plan: "Starter", price: tool.price, notes: "Pricing can change; confirm on official website" }],
    faqs: [
      {
        q: `Is ${tool.name} worth it in 2026?`,
        a: `It is worth testing if ${tool.category.toLowerCase()} is a critical part of your workflow and the expected time savings justify subscription cost.`
      },
      {
        q: `What is the best alternative to ${tool.name}?`,
        a: "Use the comparison pages to benchmark alternatives by output quality, speed, and team fit before committing."
      }
    ],
    alternatives: ["claude", "chatgpt", "perplexity"].filter((slug) => slug !== tool.slug),
    verdict: `${tool.name} is a strong candidate when ${tool.category.toLowerCase()} outcomes are central to your work. Validate with a short real-world trial before scaling.`
  };
}

export const blogPosts = [
  {
    slug: "ai-starterpack-2026",
    type: "Guide",
    title: "AI Starterpack 2026: Best Tools for Every Use Case",
    excerpt:
      "We tested 250+ AI tools so you do not have to. This is the practical stack by category, budget, and workload.",
    readTime: "2 min read",
    date: "2026-03-22"
  },
  {
    slug: "chatgpt-vs-claude-vs-gemini",
    type: "Comparison",
    title: "ChatGPT vs Claude vs Gemini: Which One Is Actually Worth Paying For?",
    excerpt:
      "Real-world differences in writing, coding, and research quality after daily use across all three assistants.",
    readTime: "5 min read",
    date: "2026-03-22"
  },
  {
    slug: "cursor-vs-github-copilot-2026",
    type: "Comparison",
    title: "Cursor vs GitHub Copilot in 2026: Which AI Code Editor Actually Wins?",
    excerpt:
      "A practical breakdown of speed, context awareness, and pricing for modern coding workflows.",
    readTime: "5 min read",
    date: "2026-03-22"
  },
  {
    slug: "best-free-ai-tools-2026",
    type: "List",
    title: "Best Free AI Tools in 2026: 12 Tools That Cost $0",
    excerpt:
      "A tested list of free tools that are actually useful for daily work, from coding to content production.",
    readTime: "5 min read",
    date: "2026-03-20"
  },
  {
    slug: "best-ai-tools-solo-founders-2026",
    type: "Guide",
    title: "Best AI Tools for Solo Founders in 2026: Run a Business With 5 Tools",
    excerpt:
      "A compact AI operating stack for one-person companies that need leverage across sales, support, and content.",
    readTime: "4 min read",
    date: "2026-03-15"
  },
  {
    slug: "elevenlabs-vs-murf-vs-descript",
    type: "Comparison",
    title: "ElevenLabs vs Murf vs Descript: Best AI Voice Tool for Creators in 2026",
    excerpt:
      "Voice realism, workflow speed, and final output quality compared using real creator production tasks.",
    readTime: "5 min read",
    date: "2026-03-10"
  }
];

export const comparisons = [
  {
    slug: "cursor-vs-github-copilot",
    title: "Cursor vs GitHub Copilot",
    summary: "We tested both coding assistants daily and compared speed, context understanding, and value.",
    winner: "Cursor wins",
    group: "Coding"
  },
  {
    slug: "claude-vs-chatgpt",
    title: "Claude vs ChatGPT",
    summary: "Both are top assistants at the same price point, but they win in different use cases.",
    winner: "Claude wins",
    group: "Writing & AI Assistants"
  },
  {
    slug: "midjourney-vs-dalle",
    title: "Midjourney vs DALL-E",
    summary: "Image quality, prompt fidelity, and consistency tested across practical creative prompts.",
    winner: "Midjourney wins",
    group: "Creative & Design"
  },
  {
    slug: "notion-ai-vs-obsidian",
    title: "Notion AI vs Obsidian",
    summary: "Connected workspace versus local-first knowledge graph for daily thinking workflows.",
    winner: "Tie",
    group: "General"
  },
  {
    slug: "elevenlabs-vs-murf",
    title: "ElevenLabs vs Murf",
    summary: "Voice realism, editing workflow, and licensing flexibility for creators and teams.",
    winner: "ElevenLabs wins",
    group: "Audio & Voice"
  },
  {
    slug: "perplexity-vs-chatgpt",
    title: "Perplexity vs ChatGPT",
    summary: "Search-first research engine versus conversational assistant for fact-heavy tasks.",
    winner: "Perplexity wins",
    group: "Research"
  },
  {
    slug: "jasper-vs-copy-ai",
    title: "Jasper vs Copy.ai",
    summary: "Marketing content generation compared on control, output quality, and scale.",
    winner: "Jasper wins",
    group: "Writing & AI Assistants"
  },
  {
    slug: "runway-vs-kling",
    title: "Runway vs Kling AI",
    summary: "Video generation quality and production reliability compared side by side.",
    winner: "Kling wins",
    group: "Video"
  },
  {
    slug: "grammarly-vs-claude",
    title: "Grammarly vs Claude",
    summary: "Editor and assistant approach to writing quality, rewriting, and workflow integration.",
    winner: "Tie",
    group: "Writing & AI Assistants"
  },
  {
    slug: "cursor-vs-windsurf",
    title: "Cursor vs Windsurf",
    summary: "Code editor ergonomics, coding accuracy, and context handling over real projects.",
    winner: "Cursor wins",
    group: "Coding"
  },
  {
    slug: "heygen-vs-synthesia",
    title: "HeyGen vs Synthesia",
    summary: "Avatar video generation for localization, corporate training, and fast publishing.",
    winner: "HeyGen wins",
    group: "Video"
  },
  {
    slug: "claude-vs-gemini",
    title: "Claude vs Gemini",
    summary: "Reasoning quality and writing style versus native Google ecosystem integration.",
    winner: "Claude wins",
    group: "Writing & AI Assistants"
  },
  {
    slug: "zapier-vs-make",
    title: "Zapier vs Make",
    summary: "Automation depth, onboarding speed, and operational maintainability.",
    winner: "Zapier wins",
    group: "Productivity"
  },
  {
    slug: "leonardo-vs-midjourney",
    title: "Leonardo AI vs Midjourney",
    summary: "Consistency and asset workflow versus artistic quality and aesthetic output.",
    winner: "Midjourney wins",
    group: "Creative & Design"
  },
  {
    slug: "opus-clip-vs-veed",
    title: "Opus Clip vs VEED.IO",
    summary: "Automated clipping versus full editing suite for short-form video distribution.",
    winner: "Tie",
    group: "Video"
  }
];

export const topNav = [
  { to: "/", label: "Home" },
  { to: "/tools", label: "Tools" },
  { to: "/blog", label: "Blog" },
  { to: "/compare", label: "Compare" }
];

export function getTool(slug) {
  const tool = tools.find((item) => item.slug === slug);
  if (!tool) {
    return undefined;
  }

  return {
    ...tool,
    ...getDefaultToolProfile(tool),
    ...(toolProfileDetails[tool.slug] || {})
  };
}

export function getBlogPost(slug) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getComparison(slug) {
  return comparisons.find((item) => item.slug === slug);
}

export function formatDisplayDate(value) {
  const date = new Date(value);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  });
}
