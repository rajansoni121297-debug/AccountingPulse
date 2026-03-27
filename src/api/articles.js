const API_URL = import.meta.env.VITE_API_URL || '';

export async function fetchArticles({ topicId, search, limit = 30, offset = 0 } = {}) {
  const params = new URLSearchParams();
  if (topicId) params.set('topicId', topicId);
  if (search) params.set('search', search);
  params.set('limit', String(limit));
  params.set('offset', String(offset));

  const res = await fetch(`${API_URL}/api/articles?${params}`, {
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchTopicSummary() {
  const res = await fetch(`${API_URL}/api/articles/topics/summary`, {
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function refreshFeeds() {
  const res = await fetch(`${API_URL}/api/refresh`, {
    method: 'POST',
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// Convert backend article to frontend format
export function toFrontendArticle(a) {
  return {
    id: a.id,
    title: a.title,
    description: a.summary,
    articleUrl: a.article_url,
    thumbnail: a.image_url,
    sourceName: a.source_name,
    sourceUrl: a.source_url,
    sourceAbbr: (a.source_name || '').slice(0, 2).toUpperCase(),
    sourceId: (a.source_name || '').toLowerCase().replace(/\s+/g, '-'),
    topicId: a.topic_id,
    publishedAt: new Date(a.published_at),
    isUrgent: !!a.is_urgent,
    isTrending: !!a.is_trending,
    sourceQuality: a.source_quality || 'tier2',
    type: a.topic_id === 'fin' || a.topic_id === 'tax' || a.topic_id === 'law' ? 'news' : 'insight',
  };
}
