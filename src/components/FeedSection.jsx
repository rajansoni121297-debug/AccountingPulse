import { useMemo, useState, useEffect } from 'react';
import { classifyArticle, timeAgo, readingTime, getThumb } from '../utils/helpers';
import { TOPIC_MAP } from '../data/topics';
import { fetchTopicSummary } from '../api/articles';

function getTopic(a) {
  return (a.topicId && TOPIC_MAP[a.topicId]) || classifyArticle(a.title, a.description);
}
function openLink(e, url) {
  e.preventDefault();
  const a = document.createElement('a');
  a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.click();
}
function showDesc(a) {
  return a.description && a.description !== a.title && !a.description.startsWith('(Preview only');
}
function hasRealImage(a) {
  return a.thumbnail && a.thumbnail.startsWith('http') && !a.thumbnail.includes('picsum.photos');
}

// ═══════════════════════════════════════════
// BOOKMARK BUTTON
// ═══════════════════════════════════════════
function BookmarkBtn({ id, isBookmarked, onBookmark }) {
  const saved = isBookmarked?.(id);
  return (
    <button
      className={`bookmark-btn ${saved ? 'active' : ''}`}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onBookmark?.(id); }}
      title={saved ? 'Remove bookmark' : 'Save for later'}
    >
      <svg width="14" height="16" viewBox="0 0 14 18" fill={saved ? 'currentColor' : 'none'}>
        <path d="M1 3C1 1.895 1.895 1 3 1H11C12.105 1 13 1.895 13 3V16.5L7 13L1 16.5V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

// ═══════════════════════════════════════════
// VISUAL CARD (has thumbnail)
// ═══════════════════════════════════════════
function VisualCard({ article, onBookmark, isBookmarked, featured }) {
  const topic = getTopic(article);
  const [imgErr, setImgErr] = useState(false);

  return (
    <a className={`vcard ${featured ? 'vcard-featured' : ''}`} href={article.articleUrl} onClick={(e) => openLink(e, article.articleUrl)}>
      <div className="vcard-img">
        {!imgErr && <img src={article.thumbnail} alt="" loading={featured ? 'eager' : 'lazy'} onError={() => setImgErr(true)} />}
        {featured && (
          <div className="vcard-overlay">
            {topic && <span className="vcard-overlay-topic" style={{ background: topic.color }}>{topic.label}</span>}
            <h2 className="vcard-overlay-title">{article.title}</h2>
            <div className="vcard-overlay-meta">
              <span>{article.sourceName}</span>
              <span>·</span>
              <span>{timeAgo(article.publishedAt)}</span>
              <BookmarkBtn id={article.id} isBookmarked={isBookmarked} onBookmark={onBookmark} />
            </div>
          </div>
        )}
      </div>
      {!featured && (
        <div className="vcard-body">
          {topic && <span className="vcard-cat" style={{ color: topic.color }}>{topic.label}</span>}
          <h3 className="vcard-title">{article.title}</h3>
          {showDesc(article) && <p className="vcard-desc">{article.description}</p>}
          <div className="vcard-footer">
            <span className="vcard-source">{article.sourceName}</span>
            {article.sourceQuality === 'gov' && <span className="tag tag-gov">Official</span>}
            {article.sourceQuality === 'tier1' && <span className="tag tag-tier1">Tier 1</span>}
            <span className="vcard-time">{timeAgo(article.publishedAt)}</span>
            <BookmarkBtn id={article.id} isBookmarked={isBookmarked} onBookmark={onBookmark} />
          </div>
        </div>
      )}
    </a>
  );
}

// ═══════════════════════════════════════════
// TEXT ROW (no thumbnail)
// ═══════════════════════════════════════════
function TextRow({ article, onBookmark, isBookmarked }) {
  const topic = getTopic(article);

  return (
    <a className="trow" href={article.articleUrl} onClick={(e) => openLink(e, article.articleUrl)}>
      <div className="trow-body">
        <div className="trow-top">
          {topic && <span className="trow-cat" style={{ color: topic.color }}>{topic.label}</span>}
          <span className="trow-time">{timeAgo(article.publishedAt)}</span>
        </div>
        <h3 className="trow-title">{article.title}</h3>
        {showDesc(article) && <p className="trow-desc">{article.description}</p>}
        <div className="trow-footer">
          <span className="trow-source">{article.sourceName}</span>
          {article.sourceQuality === 'gov' && <span className="tag tag-gov">Official</span>}
          {article.sourceQuality === 'tier1' && <span className="tag tag-tier1">Tier 1</span>}
          <BookmarkBtn id={article.id} isBookmarked={isBookmarked} onBookmark={onBookmark} />
        </div>
      </div>
    </a>
  );
}

// ═══════════════════════════════════════════
// SECTION HEADER
// ═══════════════════════════════════════════
function SectionHeader({ title, count, icon }) {
  return (
    <div className="sec-header">
      {icon && <span className="sec-header-icon">{icon}</span>}
      <h2 className="sec-header-title">{title}</h2>
      {count > 0 && <span className="sec-header-count">{count}</span>}
      <div className="sec-header-line" />
    </div>
  );
}

// ═══════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════
function Sidebar({ articles }) {
  const [topicCounts, setTopicCounts] = useState({});
  useEffect(() => { fetchTopicSummary().then(setTopicCounts).catch(() => {}); }, []);

  // Latest headlines — text only, different from visual feed
  const headlines = useMemo(() => {
    return [...articles]
      .filter(a => !hasRealImage(a))
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 8);
  }, [articles]);

  const trendingSections = useMemo(() => {
    return Object.entries(topicCounts).sort((a, b) => b[1] - a[1]).slice(0, 6)
      .map(([tid, count]) => ({ topic: TOPIC_MAP[tid], count })).filter(t => t.topic);
  }, [topicCounts]);

  return (
    <aside className="feed-sidebar">
      {headlines.length > 0 && (
        <div className="sb-card">
          <h3 className="sb-title">Latest Headlines</h3>
          <div className="sb-headline-list">
            {headlines.map(a => {
              const t = getTopic(a);
              return (
                <a key={a.id} className="sb-headline" href={a.articleUrl} target="_blank" rel="noopener">
                  {t && <span className="sb-headline-cat" style={{ color: t.color }}>{t.label}</span>}
                  <h4 className="sb-headline-title">{a.title}</h4>
                  <span className="sb-headline-meta">{a.sourceName} · {timeAgo(a.publishedAt)}</span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {trendingSections.length > 0 && (
        <div className="sb-card">
          <h3 className="sb-title">Topics Overview</h3>
          <div className="sb-sections-list">
            {trendingSections.map(({ topic, count }) => (
              <div key={topic.id} className="sb-section-row">
                <span className="sb-section-dot" style={{ background: topic.color }} />
                <span className="sb-section-name">{topic.label}</span>
                <span className="sb-section-count">{count.toLocaleString()} articles</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

// ═══════════════════════════════════════════
// MAIN FEED
// ═══════════════════════════════════════════
export default function FeedSection({ articles, allArticles, searchQ, selectedTopics, isLive, onBookmark, isBookmarked }) {
  const filtered = useMemo(() => {
    const q = (searchQ || '').toLowerCase().trim();
    return articles.filter(a => {
      const mq = !q || a.title.toLowerCase().includes(q) || (a.description || '').toLowerCase().includes(q) || a.sourceName.toLowerCase().includes(q);
      const mt = selectedTopics.size === 0 || selectedTopics.has(a.topicId || classifyArticle(a.title, a.description)?.id);
      return mq && mt;
    });
  }, [articles, searchQ, selectedTopics]);

  // Split: articles with real thumbnails vs text-only
  const withImages = useMemo(() => filtered.filter(hasRealImage), [filtered]);
  const withoutImages = useMemo(() => filtered.filter(a => !hasRealImage(a)), [filtered]);

  const [visualPage, setVisualPage] = useState(1);
  const [textPage, setTextPage] = useState(1);
  const V_PER = 9;
  const T_PER = 10;

  // Featured = first article with image
  const featured = withImages[0];
  const visualGrid = withImages.slice(1, 1 + visualPage * V_PER);
  const hasMoreVisual = withImages.length > 1 + visualPage * V_PER;

  const textList = withoutImages.slice(0, textPage * T_PER);
  const hasMoreText = withoutImages.length > textPage * T_PER;

  if (filtered.length === 0 && isLive) {
    return (
      <div className="feed-container">
        <div className="empty-state">
          <div style={{ fontSize: 38 }}>📰</div>
          <h3>No articles found</h3>
          <p>Try adjusting your search or topic filter.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feed-container">
      {/* ── FEATURED STORY ── */}
      {featured && (
        <div className="featured-section">
          <VisualCard article={featured} featured onBookmark={onBookmark} isBookmarked={isBookmarked} />
        </div>
      )}

      {/* ── MAIN LAYOUT: Visual Cards + Sidebar ── */}
      <div className="feed-layout">
        <div className="feed-main">
          {/* Visual stories (with thumbnails) */}
          {visualGrid.length > 0 && (
            <>
              <SectionHeader title="Top Stories" count={withImages.length} icon="📸" />
              <div className="grid-3">
                {visualGrid.map(a => (
                  <VisualCard key={a.id} article={a} onBookmark={onBookmark} isBookmarked={isBookmarked} />
                ))}
              </div>
              {hasMoreVisual && (
                <div className="load-more-wrap">
                  <button className="load-more-btn" onClick={() => setVisualPage(p => p + 1)}>Load More Stories</button>
                </div>
              )}
            </>
          )}

          {/* Text stories (without thumbnails) */}
          {textList.length > 0 && (
            <>
              <SectionHeader title="More Headlines" count={withoutImages.length} icon="📝" />
              <div className="text-list">
                {textList.map(a => (
                  <TextRow key={a.id} article={a} onBookmark={onBookmark} isBookmarked={isBookmarked} />
                ))}
              </div>
              {hasMoreText && (
                <div className="load-more-wrap">
                  <button className="load-more-btn secondary" onClick={() => setTextPage(p => p + 1)}>Load More Headlines</button>
                </div>
              )}
            </>
          )}
        </div>

        <Sidebar articles={allArticles} />
      </div>
    </div>
  );
}
