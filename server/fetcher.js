import RSSParser from 'rss-parser';
import crypto from 'crypto';
import { feeds, classifySourceQuality } from './feeds.js';
import { saveArticles, archiveOldArticles } from './db.js';

const parser = new RSSParser({
  timeout: 10000,
  maxRedirects: 5,
  headers: {
    'User-Agent': 'AccountingPulse/1.0 (+https://accountingpulse.com)',
    'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml',
  },
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: false }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: false }],
      ['dc:date', 'dcDate'],
    ],
  },
});

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

function truncate(text, max = 200) {
  if (!text || text.length <= max) return text;
  return text.slice(0, max).replace(/\s\S*$/, '') + '\u2026';
}

function extractImage(item) {
  // media:content
  if (item.mediaContent?.$?.url) return item.mediaContent.$.url;
  // media:thumbnail
  if (item.mediaThumbnail?.$?.url) return item.mediaThumbnail.$.url;
  // enclosure
  if (item.enclosure?.url && /image/i.test(item.enclosure.type || '')) return item.enclosure.url;
  // Parse from content HTML
  const html = item['content:encoded'] || item.content || item.description || '';
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (m?.[1] && m[1].startsWith('http') && !/1x1|pixel|spacer|track/i.test(m[1])) return m[1];
  return null;
}

function resolveDate(item, index) {
  const candidates = [item.pubDate, item.isoDate, item.dcDate];
  for (const c of candidates) {
    if (c) {
      const d = new Date(c);
      if (!isNaN(d.getTime()) && d.getTime() > 0) return d.toISOString();
    }
  }
  // Fallback: stagger by index to preserve order
  return new Date(Date.now() - index * 5 * 60000).toISOString();
}

function generateId(url, title) {
  return crypto.createHash('md5').update(`${url}${title}`).digest('hex').substring(0, 12);
}

function normalizeUrl(url) {
  if (!url) return url;
  if (url.startsWith('http://') && !url.includes('localhost')) {
    return url.replace('http://', 'https://');
  }
  return url;
}

function isSponsored(url) {
  return /\/spons\/|\/sponsored\/|\/advertisement\/|\/partner-content\//i.test(url || '');
}

const PAYWALL_PHRASES = ['subscribe to read', 'premium content', 'members only', 'for subscribers', 'unlock this article'];

function detectPaywall(items) {
  if (items.length < 3) return false;
  const shortSummaries = items.filter(i => {
    const s = stripHtml(i.contentSnippet || i.description || i.summary || '');
    return s.length < 30;
  });
  if (shortSummaries.length >= items.length * 0.8) return true;
  const paywalled = items.filter(i => {
    const text = (i.contentSnippet || i.description || '').toLowerCase();
    return PAYWALL_PHRASES.some(p => text.includes(p));
  });
  return paywalled.length >= items.length * 0.5;
}

async function fetchFeed(feedConfig, retries = 2) {
  const { url, topic, name, urgent } = feedConfig;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const feed = await parser.parseURL(url);
      const items = feed.items || [];
      if (!items.length) return [];

      const isPaywalled = detectPaywall(items);
      const sourceQuality = classifySourceQuality(url);
      const seenImages = new Set();

      const articles = items.map((item, i) => {
        const articleUrl = normalizeUrl(item.link || item.guid || '');
        const title = stripHtml(item.title || '');
        if (!title || !articleUrl || isSponsored(articleUrl)) return null;

        let summary = truncate(stripHtml(item.contentSnippet || item.description || item.summary || item.content || ''));
        if (isPaywalled && (!summary || summary.length < 30)) {
          summary = '(Preview only \u2014 visit source to read full article)';
        }

        let imageUrl = extractImage(item);
        if (imageUrl && seenImages.has(imageUrl)) {
          // Dedupe images - use placeholder
          const hash = crypto.createHash('md5').update(articleUrl).digest('hex').substring(0, 8);
          imageUrl = `https://picsum.photos/seed/${hash}/700/380`;
        }
        if (imageUrl) seenImages.add(imageUrl);
        if (!imageUrl) {
          const hash = crypto.createHash('md5').update(articleUrl).digest('hex').substring(0, 8);
          imageUrl = `https://picsum.photos/seed/${hash}/700/380`;
        }

        return {
          id: generateId(articleUrl, title),
          title,
          summary: summary || null,
          article_url: articleUrl,
          image_url: imageUrl,
          source_name: name,
          source_url: feed.link || null,
          topic_id: topic,
          published_at: resolveDate(item, i),
          fetched_at: new Date().toISOString(),
          is_urgent: urgent ? 1 : 0,
          is_trending: 0,
          source_quality: sourceQuality,
        };
      }).filter(Boolean);

      return articles;
    } catch (err) {
      const msg = err.message || '';
      // Don't retry for permanent errors
      if (/403|404|401|410|451/.test(msg)) {
        console.error(`[SKIP] ${name}: ${msg}`);
        return [];
      }
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
      console.error(`[FAIL] ${name}: ${msg}`);
      return [];
    }
  }
  return [];
}

export async function runFetchCycle() {
  const start = Date.now();
  console.log(`\n[FETCH] Starting cycle — ${feeds.length} feeds...`);

  let totalArticles = 0;
  let succeeded = 0;
  let failed = 0;

  // Process in chunks of 5
  const CHUNK_SIZE = 5;
  for (let i = 0; i < feeds.length; i += CHUNK_SIZE) {
    const chunk = feeds.slice(i, i + CHUNK_SIZE);
    const results = await Promise.allSettled(chunk.map(f => fetchFeed(f)));

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        const inserted = saveArticles(result.value);
        totalArticles += inserted;
        succeeded++;
        if (inserted > 0) {
          const name = result.value[0]?.source_name || 'unknown';
          console.log(`  [OK] ${name}: +${inserted} articles`);
        }
      } else {
        failed++;
      }
    }

    // Delay between chunks
    if (i + CHUNK_SIZE < feeds.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  // Archive old articles
  const archived = archiveOldArticles(30);
  if (archived > 0) console.log(`  [ARCHIVE] ${archived} articles archived`);

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`[DONE] ${totalArticles} new articles | ${succeeded} ok, ${failed} failed | ${elapsed}s\n`);

  return { totalArticles, succeeded, failed, elapsed };
}
