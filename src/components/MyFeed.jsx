import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import ArticleCard from './ArticleCard';
import BuildDesk from './BuildDesk';
import { SOURCES } from '../data/sources';
import { TOPICS } from '../data/topics';
import { fetchArticles, toFrontendArticle } from '../api/articles';
import { isValidUrl, getDomain, stripHtml, truncate, classifyArticle } from '../utils/helpers';

function extractRssThumb(item) {
  if (item.thumbnail && item.thumbnail.startsWith('http')) return item.thumbnail;
  if (item.enclosure?.link && /\.(jpg|jpeg|png|webp|gif)/i.test(item.enclosure.link)) return item.enclosure.link;
  const html = item.content || item.description || '';
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (m && m[1] && m[1].startsWith('http') && !/1x1|pixel|spacer|track/i.test(m[1])) return m[1];
  return null;
}

async function fetchRssViaProxy(url) {
  try {
    const r = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(10000) });
    const d = await r.json();
    if (d.status === 'ok' && d.items?.length) return d.items;
  } catch {}
  return [];
}

function parseItems(items, sourceName, sourceId) {
  return items.map((item, i) => ({
    id: `mf-${sourceId}-${i}-${Date.now()}`,
    type: 'insight',
    title: stripHtml(item.title || ''),
    description: truncate(stripHtml(item.description || item.content || '')),
    sourceName,
    sourceAbbr: sourceName.slice(0, 2).toUpperCase(),
    sourceId,
    articleUrl: item.link || '',
    publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
    thumbnail: extractRssThumb(item),
  })).filter(a => a.title && a.articleUrl && a.articleUrl.startsWith('http'));
}

export default function MyFeed({ user, allArticles }) {
  const [deskPrefs, setDeskPrefs] = useState(null);
  const [customSources, setCustomSources] = useState([]);
  const [customArticles, setCustomArticles] = useState([]);
  const [addUrl, setAddUrl] = useState('');
  const [addError, setAddError] = useState('');
  const [addOk, setAddOk] = useState('');
  const [adding, setAdding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [showEditPrefs, setShowEditPrefs] = useState(false);
  const seenRef = useRef(new Set());
  const MF_PER = 12;

  const deskKey = `ap_desk_${user.id}`;
  const srcKey = `ap_custom_sources_${user.id}`;

  // Load desk preferences
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(deskKey) || 'null');
      if (stored?.setupDone) setDeskPrefs(stored);
    } catch {}
    try {
      const cs = JSON.parse(localStorage.getItem(srcKey) || '[]');
      setCustomSources(cs);
    } catch {}
  }, [deskKey, srcKey]);

  // Fetch articles from API based on desk preferences
  const [deskArticles, setDeskArticles] = useState([]);
  const [deskLoading, setDeskLoading] = useState(false);

  useEffect(() => {
    if (!deskPrefs) return;
    const topicIds = deskPrefs.topics || [];
    if (!topicIds.length) return;

    setDeskLoading(true);
    // Fetch articles for each selected topic from the API
    Promise.all(
      topicIds.map(tid => fetchArticles({ topicId: tid, limit: 20 }).catch(() => ({ articles: [] })))
    ).then(results => {
      const all = results.flatMap(r => (r.articles || []).map(toFrontendArticle));
      // Deduplicate
      const seen = new Set();
      const unique = all.filter(a => {
        if (seen.has(a.id)) return false;
        seen.add(a.id);
        return true;
      });
      unique.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
      setDeskArticles(unique);
      setDeskLoading(false);
    });
  }, [deskPrefs]);

  // Combine desk articles + custom feed articles
  const allFeedArticles = useMemo(() => {
    const combined = [...deskArticles, ...customArticles];
    combined.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    // Deduplicate
    const seen = new Set();
    return combined.filter(a => {
      const k = a.title.toLowerCase().slice(0, 60);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [deskArticles, customArticles]);

  // Fetch custom source articles
  const loadCustomArticles = useCallback(async (srcs) => {
    if (!srcs.length) { setCustomArticles([]); return; }
    setRefreshing(true);
    const allItems = [];
    const seen = new Set();
    for (const src of srcs) {
      const items = await fetchRssViaProxy(src.url);
      const parsed = parseItems(items, getDomain(src.url), src.url);
      parsed.forEach(a => {
        const k = a.title.toLowerCase().slice(0, 60);
        if (!seen.has(k)) { seen.add(k); allItems.push(a); }
      });
    }
    seenRef.current = seen;
    setCustomArticles(allItems);
    setRefreshing(false);
  }, []);

  // Load custom articles on mount
  useEffect(() => {
    if (customSources.length && deskPrefs) loadCustomArticles(customSources);
  }, [customSources.length, deskPrefs, loadCustomArticles]);

  const handleAddSource = async () => {
    let url = addUrl.trim();
    if (!url.startsWith('http')) url = 'https://' + url;
    setAddError(''); setAddOk('');
    if (!isValidUrl(url)) { setAddError('Please enter a valid URL.'); return; }
    if (customSources.find(s => s.url === url)) { setAddError('Source already added.'); return; }
    setAdding(true);
    const items = await fetchRssViaProxy(url);
    setAdding(false);
    if (!items.length) {
      // Try /feed and /rss variants
      for (const suffix of ['/feed', '/rss', '/feed/']) {
        const altUrl = url.replace(/\/$/, '') + suffix;
        const altItems = await fetchRssViaProxy(altUrl);
        if (altItems.length) {
          const newSrcs = [...customSources, { url: altUrl, addedAt: new Date().toISOString() }];
          localStorage.setItem(srcKey, JSON.stringify(newSrcs));
          setCustomSources(newSrcs);
          setAddUrl('');
          setAddOk(`Added ${getDomain(altUrl)}`);
          setTimeout(() => setAddOk(''), 3000);
          const parsed = parseItems(altItems, getDomain(altUrl), altUrl);
          setCustomArticles(prev => [...prev, ...parsed].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)));
          return;
        }
      }
      setAddError('No RSS feed found. Try adding /feed or /rss to the URL.');
      return;
    }
    const newSrcs = [...customSources, { url, addedAt: new Date().toISOString() }];
    localStorage.setItem(srcKey, JSON.stringify(newSrcs));
    setCustomSources(newSrcs);
    setAddUrl('');
    setAddOk(`Added ${getDomain(url)}`);
    setTimeout(() => setAddOk(''), 3000);
    const parsed = parseItems(items, getDomain(url), url);
    setCustomArticles(prev => [...prev, ...parsed].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)));
  };

  const handleRemoveSource = (url) => {
    const newSrcs = customSources.filter(s => s.url !== url);
    localStorage.setItem(srcKey, JSON.stringify(newSrcs));
    setCustomSources(newSrcs);
    setCustomArticles(prev => prev.filter(a => a.sourceId !== url));
  };

  const handleDeskComplete = (prefs) => {
    setDeskPrefs(prefs);
    setShowEditPrefs(false);
  };

  const handleEditPrefs = () => setShowEditPrefs(true);
  const handleResetDesk = () => {
    localStorage.removeItem(deskKey);
    setDeskPrefs(null);
  };

  // Show onboarding if no preferences set
  if (!deskPrefs || showEditPrefs) {
    return <BuildDesk user={user} onComplete={handleDeskComplete} />;
  }

  const prefTopics = TOPICS.filter(t => deskPrefs.topics.includes(t.id));
  const prefSources = SOURCES.filter(s => deskPrefs.sources.includes(s.id));
  const visible = allFeedArticles.slice(0, page * MF_PER);
  const hasMore = allFeedArticles.length > page * MF_PER;

  return (
    <div className="myfeed-page">
      {/* Header */}
      <div className="myfeed-header">
        <div>
          <h1 className="myfeed-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L15 8.5H22L16.5 12.5L18.5 19L12 15L5.5 19L7.5 12.5L2 8.5H9L12 2Z" fill="var(--accent)" />
            </svg>
            My Desk
          </h1>
          <p className="myfeed-count">{allFeedArticles.length} articles on your desk today</p>
          {prefTopics.length > 0 && (
            <div className="myfeed-topic-pills">
              {prefTopics.map(t => (
                <span key={t.id} className="myfeed-topic-pill" style={{ color: t.color }}>{t.label}</span>
              ))}
            </div>
          )}
        </div>
        <button className="myfeed-edit-btn" onClick={handleEditPrefs}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 11V14H5L13.5 5.5L10.5 2.5L2 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
          Edit Preferences
        </button>
      </div>

      {/* Custom Sources Panel */}
      <div className="myfeed-custom-sources">
        <div className="myfeed-custom-header">
          <span className="myfeed-custom-title">Custom Sources</span>
          <span className="myfeed-custom-count">{customSources.length} added</span>
        </div>
        <div className="myfeed-add-row">
          <input
            className="myfeed-add-input"
            type="url"
            placeholder="Add any RSS feed URL (e.g., https://blog.example.com)"
            value={addUrl}
            onChange={e => setAddUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddSource()}
          />
          <button className="myfeed-add-btn" onClick={handleAddSource} disabled={adding}>
            {adding ? (
              <><div className="spinner" /> Checking...</>
            ) : (
              <><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> Add</>
            )}
          </button>
        </div>
        {addError && <div className="myfeed-msg error">{addError}</div>}
        {addOk && <div className="myfeed-msg success">{addOk}</div>}
        {customSources.length > 0 && (
          <div className="myfeed-custom-list">
            {customSources.map(s => (
              <div key={s.url} className="myfeed-custom-item">
                <img
                  className="myfeed-custom-favicon"
                  src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(s.url)}&sz=32`}
                  alt="" onError={e => e.target.style.opacity = '.2'}
                />
                <span className="myfeed-custom-domain">{getDomain(s.url)}</span>
                <button className="myfeed-custom-remove" onClick={() => handleRemoveSource(s.url)}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Articles */}
      {allFeedArticles.length === 0 ? (
        <div className="myfeed-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L15 8.5H22L16.5 12.5L18.5 19L12 15L5.5 19L7.5 12.5L2 8.5H9L12 2Z" stroke="var(--bh)" strokeWidth="1.5" />
          </svg>
          <h3>Your desk is empty</h3>
          <p>Try broadening your topics or sources.</p>
          <button className="myfeed-edit-link" onClick={handleEditPrefs}>Edit Preferences</button>
        </div>
      ) : (
        <div className="myfeed-grid">
          {visible.map(a => (
            <ArticleCard key={a.id} article={a} allArticles={allFeedArticles} clickedTopics={new Set()} onTopicClick={() => {}} />
          ))}
        </div>
      )}

      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <button className="load-more-btn" onClick={() => setPage(p => p + 1)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
