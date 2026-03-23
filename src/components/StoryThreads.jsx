import { useMemo } from 'react';
import { classifyArticle, timeAgo } from '../utils/helpers';
import { TOPICS } from '../data/topics';

export default function StoryThreads({ articles, clickedTopics, onTopicFilter }) {
  const chips = useMemo(() => {
    if (!clickedTopics.size) return [];
    const result = [];
    clickedTopics.forEach(tid => {
      const tp = TOPICS.find(t => t.id === tid);
      if (!tp) return;
      const rel = articles.filter(a => classifyArticle(a.title, a.description)?.id === tid);
      if (!rel.length) return;
      const latest = rel.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))[0];
      result.push({ topic: tp, latest, count: rel.length });
    });
    return result;
  }, [articles, clickedTopics]);

  if (!chips.length) return null;

  return (
    <div style={{ padding: '0 clamp(1rem, 4vw, 3rem)', marginTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.2px', color: 'var(--ad)', textTransform: 'uppercase' }}>🧵 Continue Reading</span>
        <span style={{ fontSize: 12, color: 'var(--tf)' }}>Topics you've explored — new updates available</span>
      </div>
      <div className="no-scrollbar" style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
        {chips.map(({ topic, latest, count }) => (
          <div key={topic.id} className="thread-chip" onClick={() => onTopicFilter(topic.id)}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: topic.color, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{topic.label}</div>
              <div style={{ fontSize: '10.5px', color: 'var(--tf)', marginTop: 1 }}>{count} article{count !== 1 ? 's' : ''} · {timeAgo(latest.publishedAt)}</div>
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, background: 'rgba(34,197,94,.12)', color: '#16a34a', borderRadius: 6, padding: '2px 6px', flexShrink: 0 }}>{count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
