import { TOPICS } from '../data/topics';
import { SOURCES } from '../data/sources';

// Topic icon/color used for CSS gradient placeholders when no real image exists
const TOPIC_ICONS = {
  tax: '🏛️', acc: '📊', fin: '💹', law: '⚖️', hr: '👥',
  cys: '🛡️', tec: '🤖', str: '🎯', dat: '📈', wlt: '💎',
};

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

// Topic search terms for Unsplash fallback images
const TOPIC_SEARCH = {
  tax: 'tax-documents-office', acc: 'accounting-calculator-finance', fin: 'stock-market-trading',
  law: 'courthouse-law-legal', hr: 'office-team-meeting', cys: 'cybersecurity-code-hacking',
  tec: 'technology-computer-ai', str: 'business-strategy-chart', dat: 'data-analytics-dashboard',
  wlt: 'wealth-investment-coins',
};

// Simple hash for deterministic image selection
function quickHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Returns a real image URL, or a topic-relevant Unsplash fallback.
 * Never returns null — every article always gets an image.
 */
export function getThumb(article) {
  // Real thumbnail from RSS feed
  if (article.thumbnail && article.thumbnail.startsWith('http') && !article.thumbnail.includes('picsum.photos')) {
    return article.thumbnail;
  }
  // Fallback: Unsplash source with topic search + article hash for variety
  const tid = article.topicId || classifyArticle(article.title, article.description)?.id || 'fin';
  const search = TOPIC_SEARCH[tid] || 'business-news';
  const hash = quickHash((article.id || '') + (article.title || ''));
  // Using picsum with a deterministic seed derived from article — reliable, no API key needed
  return `https://picsum.photos/seed/${search}-${hash % 9999}/700/400`;
}

/** Get the topic icon emoji for placeholder use */
export function getTopicIcon(article) {
  const tid = article.topicId || classifyArticle(article.title, article.description)?.id;
  return TOPIC_ICONS[tid] || '📰';
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
    rare: { bg: 'rgba(40,63,177,.1)', color: '#283FB1', border: 'rgba(40,63,177,.4)' },
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

export function readingTime(text) {
  if (!text) return '1 min';
  const words = text.split(/\s+/).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}
