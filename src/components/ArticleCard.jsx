import { memo, useState, useCallback } from 'react';
import { classifyArticle, getThumb, getSignal, getSignalStyle, timeAgo } from '../utils/helpers';
import { TOPIC_MAP } from '../data/topics';

function ArticleCard({ article, variant = 'card', allArticles, clickedTopics, onTopicClick }) {
  const [imgState, setImgState] = useState('loading');
  const imgSrc = article.thumbnail || getThumb(article);
  const topic = (article.topicId && TOPIC_MAP[article.topicId]) || classifyArticle(article.title, article.description);
  const signal = getSignal(article, allArticles || [], clickedTopics);
  const sigStyle = signal ? getSignalStyle(signal.cls) : null;
  const hasThumbnail = article.thumbnail && article.thumbnail.startsWith('http');
  const hasRealImg = hasThumbnail && !article.thumbnail.includes('picsum.photos');

  const openArticle = useCallback((e) => {
    e.preventDefault();
    if (topic && onTopicClick) onTopicClick(topic.id);
    const a = document.createElement('a');
    a.href = article.articleUrl;
    a.target = '_blank';
    a.rel = 'noopener';
    a.click();
  }, [article.articleUrl, topic, onTopicClick]);

  const handleLoad = useCallback(() => setImgState('loaded'), []);
  const handleError = useCallback(() => setImgState('error'), []);
  const showDesc = article.description && !article.description.startsWith('(Preview only');

  // ── HERO ──
  if (variant === 'hero') {
    return (
      <a className="card-hero" href={article.articleUrl} onClick={openArticle}>
        <div className="card-hero-img">
          {imgState !== 'error' && (
            <img src={imgSrc} alt="" onLoad={handleLoad} onError={handleError} style={{ opacity: imgState === 'loaded' ? 1 : 0 }} />
          )}
        </div>
        <div className="card-hero-overlay">
          {topic && <span className="card-hero-topic" style={{ color: '#fff', background: topic.color }}>{topic.label}</span>}
          <h2 className="card-hero-title">{article.title}</h2>
          {showDesc && <p className="card-hero-desc">{article.description}</p>}
          <div className="card-hero-meta">
            <span className="card-hero-source">{article.sourceName}</span>
            {article.sourceQuality === 'tier1' && <span className="tier-badge" style={{ background: 'rgba(255,255,255,.15)', color: '#fff' }}>Tier 1</span>}
            {article.sourceQuality === 'gov' && <span className="tier-badge" style={{ background: 'rgba(255,255,255,.15)', color: '#fff' }}>Official</span>}
            <span className="card-hero-time">{timeAgo(article.publishedAt)}</span>
          </div>
        </div>
      </a>
    );
  }

  // ── LIST ──
  if (variant === 'list') {
    return (
      <a className="card-list" href={article.articleUrl} onClick={openArticle}>
        {(hasRealImg || (hasThumbnail && imgState !== 'error')) && (
          <div className="card-list-img">
            {imgState !== 'error' && (
              <img src={hasRealImg ? article.thumbnail : imgSrc} alt="" loading="lazy" onLoad={handleLoad} onError={handleError} style={{ opacity: imgState === 'loaded' ? 1 : 0 }} />
            )}
          </div>
        )}
        <div className="card-list-body">
          {topic && <span className="topic-pill-inline" style={{ background: topic.bg, color: topic.color }}>{topic.label}</span>}
          <h3 className="card-list-title">{article.title}</h3>
          {showDesc && <p className="card-list-desc">{article.description}</p>}
          <div className="card-list-footer">
            <span className="card-list-source">{article.sourceName}</span>
            {article.sourceQuality === 'tier1' && <span className="tier-badge">Tier 1</span>}
            {article.sourceQuality === 'gov' && <span className="tier-badge gov">Official</span>}
            <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{timeAgo(article.publishedAt)}</span>
            {signal && <span className="sig-badge" style={{ background: sigStyle.bg, color: sigStyle.color }}>{signal.icon} {signal.label}</span>}
          </div>
        </div>
      </a>
    );
  }

  // ── CARD ──
  return (
    <a className="card" href={article.articleUrl} onClick={openArticle}>
      {(hasRealImg || imgState !== 'error') && (
        <div className="card-img-wrap">
          {imgState !== 'error' && (
            <img src={hasRealImg ? article.thumbnail : imgSrc} alt="" loading="lazy" onLoad={handleLoad} onError={handleError} style={{ opacity: imgState === 'loaded' ? 1 : 0, transition: 'opacity 0.3s' }} />
          )}
        </div>
      )}
      <div className="card-body">
        {topic && <span className="topic-pill-inline" style={{ background: topic.bg, color: topic.color }}>{topic.label}</span>}
        <div className="card-title">{article.title}</div>
        {showDesc && <div className="card-desc">{article.description}</div>}
        <div className="card-footer">
          <span className="card-source">{article.sourceName}</span>
          {article.sourceQuality === 'tier1' && <span className="tier-badge">Tier 1</span>}
          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{timeAgo(article.publishedAt)}</span>
        </div>
      </div>
    </a>
  );
}

export default memo(ArticleCard);
