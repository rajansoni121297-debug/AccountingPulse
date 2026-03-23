import { TOPICS } from '../data/topics';
import { SOURCES } from '../data/sources';

// Topic-matched thumbnail images using picsum.photos
const TOPIC_IMGS = {
  tax: 'https://picsum.photos/seed/tax-accounting-irs/700/380',
  audit: 'https://picsum.photos/seed/audit-finance-chart/700/380',
  advisory: 'https://picsum.photos/seed/business-advisory-meeting/700/380',
  esg: 'https://picsum.photos/seed/esg-sustainability-green/700/380',
  ma: 'https://picsum.photos/seed/mergers-acquisitions-deal/700/380',
  tech: 'https://picsum.photos/seed/technology-digital-data/700/380',
  realestate: 'https://picsum.photos/seed/real-estate-building-city/700/380',
  risk: 'https://picsum.photos/seed/risk-compliance-legal/700/380',
};

// Per-source fallback images
const SOURCE_IMGS = {};
SOURCES.forEach(s => {
  SOURCE_IMGS[s.id] = `https://picsum.photos/seed/${s.id}-cpa-firm/700/380`;
});

const GENERIC_IMGS = [
  'https://picsum.photos/seed/accounting-business-a/700/380',
  'https://picsum.photos/seed/accounting-business-b/700/380',
  'https://picsum.photos/seed/accounting-business-c/700/380',
  'https://picsum.photos/seed/accounting-business-d/700/380',
  'https://picsum.photos/seed/accounting-business-e/700/380',
  'https://picsum.photos/seed/accounting-business-f/700/380',
];

export function classifyArticle(title, desc) {
  const t = ((title || '') + (desc || '')).toLowerCase();
  const scores = {};
  TOPICS.forEach(tp => tp.keywords.forEach(kw => {
    if (t.includes(kw)) scores[tp.id] = (scores[tp.id] || 0) + 1;
  }));
  const keys = Object.keys(scores);
  if (!keys.length) return null;
  const best = keys.sort((a, b) => scores[b] - scores[a])[0];
  return TOPICS.find(tp => tp.id === best);
}

export function getThumb(article) {
  if (article.thumbnail && article.thumbnail.startsWith('http')) return article.thumbnail;
  const topic = classifyArticle(article.title, article.description);
  if (topic && TOPIC_IMGS[topic.id]) return TOPIC_IMGS[topic.id];
  if (SOURCE_IMGS[article.sourceId]) return SOURCE_IMGS[article.sourceId];
  const idx = Math.abs((article.id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % GENERIC_IMGS.length;
  return GENERIC_IMGS[idx];
}

const SIGNALS = {
  trending: { label: 'Trending', cls: 'trending', icon: '🔥' },
  followup: { label: 'Follow-up', cls: 'followup', icon: '🧵' },
  breaking: { label: 'Breaking', cls: 'breaking', icon: '⚡' },
  deep: { label: 'Deep Dive', cls: 'deep', icon: '📖' },
  rare: { label: 'Rare Post', cls: 'rare', icon: '✨' },
};

export function getSignal(article, allArticles, clickedTopics = new Set()) {
  const ageH = (Date.now() - new Date(article.publishedAt).getTime()) / 3600000;
  const topic = classifyArticle(article.title, article.description);
  const topicCnt = topic ? allArticles.filter(x => classifyArticle(x.title, x.description)?.id === topic?.id).length : 0;

  // Breaking: only within the last hour
  if (ageH < 1) return SIGNALS.breaking;

  // Follow-up: only if user has clicked this topic AND there are 6+ articles on it
  if (topic && clickedTopics.has(topic.id) && topicCnt >= 6) return SIGNALS.followup;

  // Trending: only the single most-covered topic, and only if it has 8+ articles
  if (topic && topicCnt >= 8) {
    const tc = {};
    allArticles.forEach(a => {
      const t = classifyArticle(a.title, a.description);
      if (t) tc[t.id] = (tc[t.id] || 0) + 1;
    });
    const topId = Object.entries(tc).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (topic.id === topId) return SIGNALS.trending;
  }

  // Deep Dive: only insights (not news) with very long descriptions
  if (article.type === 'insight' && article.description && article.description.length > 200 && ageH > 12) {
    return SIGNALS.deep;
  }

  // Most articles get no signal — this is intentional
  return null;
}

export function getWhyText(signal, article, allArticles) {
  if (!signal) return '';
  const t = classifyArticle(article.title, article.description);
  const cnt = t ? allArticles.filter(x => classifyArticle(x.title, x.description)?.id === t?.id).length : 0;
  const map = {
    trending: `${cnt} articles on this topic across firms`,
    followup: "New update in a topic you've been reading",
    breaking: 'Published in the last 3 hours',
    deep: 'Long-form analysis — set aside 5 min',
    rare: "This firm rarely publishes — worth checking",
  };
  return map[signal.cls] || '';
}

export function getSignalStyle(cls) {
  const styles = {
    trending: { bg: 'rgba(249,115,22,.1)', color: '#f97316', border: 'rgba(249,115,22,.4)' },
    followup: { bg: 'rgba(59,130,246,.1)', color: '#3b82f6', border: 'rgba(59,130,246,.4)' },
    breaking: { bg: 'rgba(239,68,68,.1)', color: '#ef4444', border: 'rgba(239,68,68,.4)' },
    deep: { bg: 'rgba(139,92,246,.1)', color: '#8b5cf6', border: 'rgba(139,92,246,.4)' },
    rare: { bg: 'rgba(200,169,106,.1)', color: '#c8a96a', border: 'rgba(200,169,106,.4)' },
  };
  return styles[cls] || {};
}

export function timeAgo(d) {
  const date = d instanceof Date ? d : new Date(d);
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 6e4);
  const h = Math.floor(diff / 36e5);
  const dy = Math.floor(diff / 864e5);
  if (m < 1) return 'just now';
  if (m < 60) return m + 'm ago';
  if (h < 24) return h + 'h ago';
  if (dy < 7) return dy + 'd ago';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function truncate(t, n = 130) {
  if (!t || t.length <= n) return t;
  return t.slice(0, n).replace(/\s\S*$/, '') + '\u2026';
}

export function stripHtml(h) {
  return (h || '').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

export function getDomain(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}

export function isValidUrl(url) {
  try { const u = new URL(url); return ['http:', 'https:'].includes(u.protocol); } catch { return false; }
}

export function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
