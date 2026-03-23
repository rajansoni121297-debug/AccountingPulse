import { useState, useCallback, useRef } from 'react';
import { SOURCES } from '../data/sources';
import { NEWS_SEED, INS_SEED } from '../data/seedData';
import { stripHtml, truncate } from '../utils/helpers';

function extractRssThumb(item) {
  if (item.thumbnail && item.thumbnail.startsWith('http')) return item.thumbnail;
  if (item.enclosure?.link && /\.(jpg|jpeg|png|webp|gif)/i.test(item.enclosure.link)) return item.enclosure.link;
  const html = item.content || item.description || '';
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (m && m[1] && m[1].startsWith('http') && !/1x1|pixel|spacer|track/i.test(m[1])) return m[1];
  return null;
}

async function fetchRss(url) {
  try {
    const r = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&count=6`, { signal: AbortSignal.timeout(9000) });
    const d = await r.json();
    if (d.status === 'ok' && d.items?.length) return d.items;
  } catch {}
  return [];
}

function parseItems(items, src, type) {
  return items.map((item, i) => ({
    id: `live-${type}-${src.id}-${i}`,
    type,
    title: stripHtml(item.title || ''),
    description: truncate(stripHtml(item.description || item.content || '')),
    sourceName: src.name,
    sourceAbbr: src.abbr,
    sourceId: src.id,
    articleUrl: item.link || src.url,
    publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
    thumbnail: extractRssThumb(item),
  })).filter(a => a.title && a.articleUrl && a.articleUrl.startsWith('http'));
}

export function useFeed() {
  const [newsArticles, setNewsArticles] = useState([...NEWS_SEED]);
  const [insightArticles, setInsightArticles] = useState([...INS_SEED]);
  const [progress, setProgress] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading…');
  const seenNewsRef = useRef(new Set(NEWS_SEED.map(a => a.title.toLowerCase().slice(0, 60))));
  const seenInsRef = useRef(new Set(INS_SEED.map(a => a.title.toLowerCase().slice(0, 60))));

  const startFetch = useCallback(async () => {
    const total = SOURCES.length * 2;
    let done = 0;

    // Collect articles in batches per source to reduce re-renders
    for (let i = 0; i < SOURCES.length; i++) {
      const src = SOURCES[i];

      // Fetch news for this source
      const newsItems = parseItems(await fetchRss(src.newsRss), src, 'news');
      const newNews = [];
      newsItems.forEach(a => {
        const k = a.title.toLowerCase().slice(0, 60);
        if (k && !seenNewsRef.current.has(k)) {
          seenNewsRef.current.add(k);
          newNews.push(a);
        }
      });
      if (newNews.length > 0) {
        setNewsArticles(prev => [...prev, ...newNews].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)));
      }
      done++;
      setProgress(Math.round(done / total * 100));
      setLoadingText(`Loading ${Math.round(done / total * 100)}%`);

      // Fetch insights for this source
      const insItems = parseItems(await fetchRss(src.insightRss), src, 'insight');
      const newIns = [];
      insItems.forEach(a => {
        const k = a.title.toLowerCase().slice(0, 60);
        if (k && !seenInsRef.current.has(k)) {
          seenInsRef.current.add(k);
          newIns.push(a);
        }
      });
      if (newIns.length > 0) {
        setInsightArticles(prev => [...prev, ...newIns].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)));
      }
      done++;
      setProgress(Math.round(done / total * 100));
    }

    setIsLive(true);
    setLoadingText('Live');
    setTimeout(() => setProgress(0), 800);
  }, []);

  return { newsArticles, insightArticles, progress, isLive, loadingText, startFetch };
}
