import { useMemo, useState } from 'react';
import ArticleCard from './ArticleCard';
import { classifyArticle } from '../utils/helpers';

export default function FeedSection({ articles, allArticles, clickedTopics, searchQ, selectedSources, selectedTopics, onTopicClick, type, isLive }) {
  const filtered = useMemo(() => {
    const q = (searchQ || '').toLowerCase().trim();
    return articles.filter(a => {
      const ms = selectedSources.size === 0 || selectedSources.has(a.sourceId);
      const mq = !q || a.title.toLowerCase().includes(q) || (a.description || '').toLowerCase().includes(q) || a.sourceName.toLowerCase().includes(q);
      const mt = selectedTopics.size === 0 || selectedTopics.has(classifyArticle(a.title, a.description)?.id);
      return ms && mq && mt;
    });
  }, [articles, searchQ, selectedSources, selectedTopics]);

  const [page, setPage] = useState(1);
  const PER = 9;
  const featured = filtered.slice(0, 3);
  const feed = filtered.slice(3, 3 + page * PER);
  const hasMore = filtered.length > 3 + page * PER;
  const label = type === 'news' ? 'News' : 'Insights';

  return (
    <div style={{ padding: 'clamp(1.2rem, 2.5vw, 2rem) clamp(1rem, 4vw, 3rem) 5rem' }}>
      {/* Featured */}
      <div className="sec-label">
        <span className="sec-label-text">Featured {label}</span>
        <span className="sec-label-count">{featured.length}</span>
        <div className="sec-label-line" />
      </div>
      {featured.length > 0 && (
        <div className="feat-grid">
          {featured.map(a => (
            <ArticleCard key={a.id} article={a} featured allArticles={allArticles} clickedTopics={clickedTopics} onTopicClick={onTopicClick} />
          ))}
        </div>
      )}

      {/* Latest */}
      <div className="sec-label" style={{ marginTop: 6 }}>
        <span className="sec-label-text">Latest {label}</span>
        <span className="sec-label-count">{filtered.length - 3 > 0 ? filtered.length - 3 : 0}</span>
        <div className="sec-label-line" />
      </div>
      {feed.length > 0 && (
        <div className="art-grid">
          {feed.map(a => (
            <ArticleCard key={a.id} article={a} allArticles={allArticles} clickedTopics={clickedTopics} onTopicClick={onTopicClick} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && isLive && (
        <div className="empty-state">
          <div style={{ fontSize: 38 }}>{type === 'news' ? '📰' : '💡'}</div>
          <h3>No {label.toLowerCase()} found</h3>
          <p>Try adjusting your search or topic filter.</p>
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <button className="load-more-btn" onClick={() => setPage(p => p + 1)}>Load more {label.toLowerCase()}</button>
        </div>
      )}
    </div>
  );
}
