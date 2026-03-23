import express from 'express';
import cors from 'cors';
import RSSParser from 'rss-parser';
import crypto from 'crypto';
import { sources } from './sources.js';

const app = express();
const PORT = process.env.PORT || 3001;
const parser = new RSSParser({
  timeout: 10000,
  headers: {
    'User-Agent': 'CPA-Insights-Hub/1.0 (+https://cpainsightshub.com)',
    'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml'
  }
});

app.use(cors());
app.use(express.json());

// --- In-memory cache ---
const feedCache = {
  articles: [],
  lastFetched: null,
  ttl: 15 * 60 * 1000 // 15 minutes
};

// --- Helper: strip HTML tags ---
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// --- Helper: truncate to ~2 lines ---
function truncateDescription(text, maxLength = 160) {
  if (!text) return '';
  const clean = stripHtml(text);
  if (clean.length <= maxLength) return clean;
  return clean.substring(0, maxLength).replace(/\s+\S*$/, '') + '…';
}

// --- Helper: extract thumbnail from item ---
function extractThumbnail(item) {
  // Check common RSS media fields
  if (item.enclosure && item.enclosure.url) return item.enclosure.url;
  if (item['media:content'] && item['media:content']['$'] && item['media:content']['$'].url) {
    return item['media:content']['$'].url;
  }
  if (item['media:thumbnail'] && item['media:thumbnail']['$'] && item['media:thumbnail']['$'].url) {
    return item['media:thumbnail']['$'].url;
  }
  // Try to find image in content
  const content = item['content:encoded'] || item.content || item.description || '';
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch) return imgMatch[1];
  return null;
}

// --- Helper: extract category ---
function extractCategory(item) {
  if (item.categories && item.categories.length > 0) {
    const cat = item.categories[0];
    if (typeof cat === 'string') return cat;
    if (cat._ || cat.name) return cat._ || cat.name;
  }
  return null;
}

// --- Helper: generate stable ID ---
function generateId(url, title) {
  return crypto.createHash('md5').update(`${url}${title}`).digest('hex').substring(0, 12);
}

// --- Normalize a single feed item ---
function normalizeItem(item, source) {
  const articleUrl = item.link || item.guid || '';
  const title = stripHtml(item.title || '');

  if (!title || !articleUrl) return null;

  return {
    id: generateId(articleUrl, title),
    title,
    shortDescription: truncateDescription(item.contentSnippet || item.description || item.summary || item.content),
    thumbnail: extractThumbnail(item),
    sourceName: source.name,
    sourceSlug: source.slug,
    sourceUrl: source.url,
    sourceColor: source.color,
    articleUrl,
    publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
    category: extractCategory(item),
    fetchedAt: new Date().toISOString()
  };
}

// --- Fetch a single source ---
async function fetchSource(source) {
  try {
    const feed = await parser.parseURL(source.feedUrl);
    const items = (feed.items || [])
      .map(item => normalizeItem(item, source))
      .filter(Boolean);
    console.log(`[OK] ${source.name}: ${items.length} articles`);
    return items;
  } catch (err) {
    console.error(`[FAIL] ${source.name}: ${err.message}`);
    return [];
  }
}

// --- Fetch all sources ---
let fetchInProgress = null;

async function fetchAllFeeds() {
  const now = Date.now();

  // Return cache if still fresh
  if (feedCache.lastFetched && (now - feedCache.lastFetched) < feedCache.ttl) {
    return feedCache.articles;
  }

  // If a fetch is already in progress, wait for it
  if (fetchInProgress) {
    return fetchInProgress;
  }

  fetchInProgress = (async () => {
    console.log('[FETCHING] Refreshing all feeds...');

    // Fetch all sources concurrently
    const results = await Promise.allSettled(
      sources.map(source => fetchSource(source))
    );

    // Flatten results
    const allArticles = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value);

    // Deduplicate by article URL
    const seen = new Set();
    const uniqueArticles = allArticles.filter(article => {
      if (seen.has(article.articleUrl)) return false;
      seen.add(article.articleUrl);
      return true;
    });

    // Sort by publish date (newest first)
    uniqueArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    // Update cache (mutate, don't reassign)
    feedCache.articles = uniqueArticles;
    feedCache.lastFetched = Date.now();

    console.log(`[DONE] ${uniqueArticles.length} unique articles from ${sources.length} sources`);
    return uniqueArticles;
  })();

  try {
    const result = await fetchInProgress;
    return result;
  } finally {
    fetchInProgress = null;
  }
}

// --- API Routes ---

// GET /api/feed - Main feed endpoint
app.get('/api/feed', async (req, res) => {
  try {
    const articles = await fetchAllFeeds();

    const { search, source, category, limit = 100, offset = 0 } = req.query;
    let filtered = [...articles];

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.shortDescription.toLowerCase().includes(q) ||
        a.sourceName.toLowerCase().includes(q)
      );
    }

    // Source filter
    if (source) {
      filtered = filtered.filter(a => a.sourceSlug === source);
    }

    // Category filter
    if (category) {
      const cat = category.toLowerCase();
      filtered = filtered.filter(a => a.category && a.category.toLowerCase().includes(cat));
    }

    const total = filtered.length;
    const paginated = filtered.slice(Number(offset), Number(offset) + Number(limit));

    res.json({
      success: true,
      total,
      count: paginated.length,
      lastFetched: feedCache.lastFetched ? new Date(feedCache.lastFetched).toISOString() : null,
      articles: paginated
    });
  } catch (err) {
    console.error('Feed error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch feeds' });
  }
});

// GET /api/sources - List all sources
app.get('/api/sources', (req, res) => {
  const sourcesInfo = sources.map(({ name, slug, url, color }) => ({ name, slug, url, color }));
  res.json({ success: true, sources: sourcesInfo });
});

// GET /api/refresh - Force refresh cache
app.get('/api/refresh', async (req, res) => {
  feedCache.lastFetched = null;
  const articles = await fetchAllFeeds();
  res.json({ success: true, total: articles.length, message: 'Cache refreshed' });
});

// --- Start server ---
async function start() {
  // Pre-fetch feeds before accepting requests
  console.log('Pre-fetching feeds...');
  await fetchAllFeeds().catch(console.error);

  app.listen(PORT, () => {
    console.log(`\nCPA Insights Hub API running on http://localhost:${PORT}`);
    console.log(`Endpoints:`);
    console.log(`  GET /api/feed?search=&source=&category=&limit=&offset=`);
    console.log(`  GET /api/sources`);
    console.log(`  GET /api/refresh\n`);
  });
}

start();
