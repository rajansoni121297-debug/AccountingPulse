import { memo, useState, useCallback } from 'react';
import { classifyArticle, getThumb, getSignal, getWhyText, getSignalStyle, timeAgo } from '../utils/helpers';

function ArticleCard({ article, featured, allArticles, clickedTopics, onTopicClick }) {
  const [imgState, setImgState] = useState('loading'); // 'loading' | 'loaded' | 'error'
  const imgHeight = featured ? 220 : 165;
  const imgSrc = getThumb(article);
  const topic = classifyArticle(article.title, article.description);
  const signal = getSignal(article, allArticles || [], clickedTopics);
  const sigStyle = signal ? getSignalStyle(signal.cls) : null;
  const whyText = signal ? getWhyText(signal, article, allArticles || []) : '';

  const handleLoad = useCallback(() => setImgState('loaded'), []);
  const handleError = useCallback(() => setImgState('error'), []);

  return (
    <a
      className={`card${featured ? ' feat' : ''}`}
      href={article.articleUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        if (topic && onTopicClick) onTopicClick(topic.id);
      }}
    >
      <div className="card-img-wrap" style={{ height: imgHeight }}>
        {/* Fallback — always rendered behind image */}
        <div
          className="card-img-fallback"
          style={{ background: `linear-gradient(135deg, ${topic ? topic.bg : '#EDE9E2'}, #E4DDD2)` }}
        >
          {article.sourceAbbr || '?'}
        </div>

        {/* Image — no opacity animation, just show/hide (BLINK FIX) */}
        {imgState !== 'error' && (
          <img
            src={imgSrc}
            alt={article.title}
            loading="lazy"
            onLoad={handleLoad}
            onError={handleError}
            style={{
              opacity: imgState === 'loaded' ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
          />
        )}

        <div className="src-badge">{article.sourceName}</div>

        {topic && (
          <div
            className="topic-tag-img"
            style={{ background: topic.bg, color: topic.color, border: `1px solid ${topic.color}30` }}
          >
            {topic.label}
          </div>
        )}

        {signal && (
          <div className="why-read">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                className="why-badge"
                style={{ background: sigStyle.bg, color: sigStyle.color, border: `1px solid ${sigStyle.border}` }}
              >
                {signal.icon} {signal.label}
              </span>
              <span style={{ fontSize: 11, color: 'rgba(245,240,232,.88)', lineHeight: 1.4, fontWeight: 500 }}>
                {whyText}
              </span>
            </div>
          </div>
        )}

        <div className={`type-badge ${article.type === 'news' ? 'news' : 'insight'}`}>
          {article.type === 'news' ? 'News' : 'Insight'}
        </div>
      </div>

      <div className="card-body">
        <div className="card-meta">
          {timeAgo(article.publishedAt)}
          <span className="card-meta-dot" />
          {article.sourceName}
          {topic && (
            <>
              <span className="card-meta-dot" />
              <span className="topic-pill-inline" style={{ background: topic.bg, color: topic.color }}>
                {topic.label}
              </span>
            </>
          )}
        </div>
        <div className="card-title">{article.title}</div>
        {article.description && <div className="card-desc">{article.description}</div>}
        <div className="card-footer">
          <span className="card-source">{article.sourceName}</span>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ opacity: 0.4, flexShrink: 0 }}>
            <path d="M1 10L10 1M10 1H4M10 1V7" stroke="#8B7355" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {signal && (
            <span className="sig-badge" style={{ background: sigStyle.bg, color: sigStyle.color }}>
              {signal.icon} {signal.label}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

export default memo(ArticleCard);
