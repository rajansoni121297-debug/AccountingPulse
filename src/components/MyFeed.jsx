import { useState, useEffect, useCallback, useRef } from 'react';
import ArticleCard from './ArticleCard';
import { isValidUrl, getDomain, stripHtml, truncate } from '../utils/helpers';

function extractRssThumb(item) {
  if (item.thumbnail && item.thumbnail.startsWith('http')) return item.thumbnail;
  if (item.enclosure?.link && /\.(jpg|jpeg|png|webp|gif)/i.test(item.enclosure.link)) return item.enclosure.link;
  const html = item.content || item.description || '';
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (m && m[1] && m[1].startsWith('http') && !/1x1|pixel|spacer|track/i.test(m[1])) return m[1];
  return null;
}

async function detectRss(url) {
  for (const c of [url, url.replace(/\/$/, '') + '/feed', url.replace(/\/$/, '') + '/rss']) {
    try {
      const r = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(c)}&count=10`, { signal: AbortSignal.timeout(8000) });
      const d = await r.json();
      if (d.status === 'ok' && d.items?.length) return { items: d.items };
    } catch {}
  }
  return null;
}

async function fetchMfSrc(src) {
  const r = await detectRss(src.url);
  if (!r) return [];
  return r.items.map((item, i) => ({
    id: `mf-${src.url}-${i}`,
    type: 'insight',
    title: stripHtml(item.title || ''),
    description: truncate(stripHtml(item.description || item.content || '')),
    sourceName: getDomain(src.url),
    sourceAbbr: getDomain(src.url).slice(0, 2).toUpperCase(),
    sourceId: src.url,
    articleUrl: item.link || src.url,
    publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
    thumbnail: extractRssThumb(item),
  })).filter(a => a.title && a.articleUrl);
}

const SRCK_PREFIX = 'ap_sources_';

export default function MyFeed({ user }) {
  const [sources, setSources] = useState([]);
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [addUrl, setAddUrl] = useState('');
  const [addError, setAddError] = useState('');
  const [addOk, setAddOk] = useState('');
  const [adding, setAdding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const seenRef = useRef(new Set());
  const timerRef = useRef(null);
  const [countdown, setCountdown] = useState(300);
  const MF_PER = 8;

  const srcKey = SRCK_PREFIX + user.id;

  // Load sources from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(srcKey) || '[]');
    setSources(stored);
  }, [srcKey]);

  const saveSources = useCallback((srcs) => {
    localStorage.setItem(srcKey, JSON.stringify(srcs));
    setSources(srcs);
  }, [srcKey]);

  // Fetch articles from all sources
  const loadArticles = useCallback(async (srcs, silent = false) => {
    if (!srcs.length) { setArticles([]); return; }
    if (!silent) setRefreshing(true);
    const allItems = [];
    const seen = new Set();
    for (const src of srcs) {
      const items = await fetchMfSrc(src);
      items.forEach(a => {
        const k = a.title.toLowerCase().slice(0, 60);
        if (k && !seen.has(k)) { seen.add(k); allItems.push(a); }
      });
    }
    allItems.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    seenRef.current = seen;
    setArticles(allItems);
    if (!silent) setRefreshing(false);
  }, []);

  // Initial load
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(srcKey) || '[]');
    if (stored.length) loadArticles(stored);
  }, [srcKey, loadArticles]);

  // Countdown timer
  useEffect(() => {
    if (!sources.length) return;
    setCountdown(300);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          loadArticles(sources, true);
          return 300;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [sources, loadArticles]);

  const handleAdd = async () => {
    let url = addUrl.trim();
    if (!url.startsWith('http')) url = 'https://' + url;
    setAddError(''); setAddOk('');
    if (!isValidUrl(url)) { setAddError('Please enter a valid URL.'); return; }
    if (sources.find(s => s.url === url)) { setAddError('Source already added.'); return; }
    setAdding(true);
    const res = await detectRss(url);
    setAdding(false);
    if (!res) { setAddError('No RSS feed found at this URL.'); return; }
    const newSrcs = [...sources, { url, addedAt: new Date().toISOString() }];
    saveSources(newSrcs);
    setAddUrl('');
    setAddOk(`✓ Added ${getDomain(url)}`);
    setTimeout(() => setAddOk(''), 3000);
    // Fetch new source articles
    const items = await fetchMfSrc({ url });
    const newArticles = [];
    items.forEach(a => {
      const k = a.title.toLowerCase().slice(0, 60);
      if (k && !seenRef.current.has(k)) { seenRef.current.add(k); newArticles.push(a); }
    });
    if (newArticles.length) {
      setArticles(prev => [...prev, ...newArticles].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)));
    }
  };

  const handleRemove = (url) => {
    const newSrcs = sources.filter(s => s.url !== url);
    saveSources(newSrcs);
    setArticles(prev => prev.filter(a => a.sourceId !== url));
  };

  const handleRefresh = async () => {
    setArticles([]);
    seenRef.current.clear();
    setPage(1);
    await loadArticles(sources);
  };

  const countdownStr = `${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, '0')}`;
  const visible = articles.slice(0, page * MF_PER);

  return (
    <div className="mf-layout">
      <aside className="mf-sidebar">
        <div className="mf-panel">
          <div className="mf-panel-title">Add Source</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <input className="add-input" type="url" placeholder="https://blog.example.com" value={addUrl} onChange={e => setAddUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} />
            {addError && <div style={{ fontSize: 11, color: '#dc2626' }}>{addError}</div>}
            {addOk && <div style={{ fontSize: 11, color: '#16a34a' }}>{addOk}</div>}
            <button className="add-btn" onClick={handleAdd} disabled={adding}>
              {adding ? (
                <><span>Checking…</span><div className="spinner" /></>
              ) : (
                <><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg><span>Add Source</span></>
              )}
            </button>
          </div>
        </div>
        <div className="mf-panel">
          <div className="mf-panel-title">
            My Sources <span style={{ fontWeight: 400, color: 'var(--tf)', textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>({sources.length})</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
            {sources.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--tf)', textAlign: 'center', padding: '16px 0', lineHeight: 1.6 }}>No sources yet. Add a URL above.</div>
            ) : (
              sources.map(s => (
                <div key={s.url} className="src-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <img style={{ width: 16, height: 16, borderRadius: 3, objectFit: 'contain', flexShrink: 0 }} src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(s.url)}&sz=32`} alt="" onError={e => e.target.style.opacity = '.2'} />
                    <span style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getDomain(s.url)}</span>
                  </div>
                  <button className="src-remove" onClick={() => handleRemove(s.url)}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </button>
                </div>
              ))
            )}
          </div>
          {sources.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '10.5px', color: 'var(--tf)', marginTop: 10 }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--green)' }} />
              <span>Refreshes in {countdownStr}</span>
            </div>
          )}
        </div>
      </aside>
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
          <div className="mf-greet">Your <span>personalized</span> feed</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--tf)' }}>{articles.length} article{articles.length !== 1 ? 's' : ''}</span>
            <button onClick={handleRefresh} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 'var(--rp)', fontSize: 12, fontWeight: 500, color: 'var(--tm)', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>
              {refreshing ? (
                <><svg style={{ animation: 'spin .8s linear infinite' }} width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4"/></svg> Refreshing…</>
              ) : (
                <><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M11 6.5A4.5 4.5 0 0 1 2.2 9.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M2 6.5A4.5 4.5 0 0 1 10.8 3.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M11 3.5v2.5H8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 9.5V7H4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> Refresh</>
              )}
            </button>
          </div>
        </div>
        {articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 36 }}>✦</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, margin: '10px 0 7px' }}>Your feed is empty</h3>
            <p style={{ fontSize: 13, color: 'var(--tf)', lineHeight: 1.7, maxWidth: 300 }}>Add website URLs in the sidebar to start building your personalized accounting content feed.</p>
          </div>
        ) : (
          <div className="mf-feed-grid">
            {visible.map(a => (
              <ArticleCard key={a.id} article={a} allArticles={articles} clickedTopics={new Set()} onTopicClick={() => {}} />
            ))}
          </div>
        )}
        {articles.length > page * MF_PER && (
          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <button className="load-more-btn" onClick={() => setPage(p => p + 1)}>Load more</button>
          </div>
        )}
      </section>
    </div>
  );
}
