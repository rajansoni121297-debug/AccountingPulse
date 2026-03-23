import { useMemo } from 'react';
import { classifyArticle } from '../utils/helpers';
import { TOPICS } from '../data/topics';
import { SOURCES } from '../data/sources';

export default function DiscoveryPanel({ articles, clickedTopics, onTopicFilter }) {
  const { trending, unexplored, suggestTopics } = useMemo(() => {
    const tc = {};
    articles.forEach(a => {
      const t = classifyArticle(a.title, a.description);
      if (t) tc[t.id] = (tc[t.id] || 0) + 1;
    });
    const sorted = Object.entries(tc).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const maxC = sorted[0]?.[1] || 1;
    const trending = sorted.map(([tid, cnt]) => ({ topic: TOPICS.find(x => x.id === tid), count: cnt, pct: Math.round(cnt / maxC * 100) })).filter(x => x.topic);
    const unexplored = SOURCES.slice(0, 4);
    const suggestTopics = TOPICS.filter(t => !clickedTopics.has(t.id)).slice(0, 8);
    return { trending, unexplored, suggestTopics };
  }, [articles, clickedTopics]);

  if (!trending.length && !unexplored.length && !suggestTopics.length) return null;

  const firmColors = ['#86BC25', '#D04A02', '#00338D', '#CC0000', '#562D82', '#C8102E'];

  return (
    <div style={{ padding: '0 clamp(1rem, 4vw, 3rem)', marginTop: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }} className="disc-grid-responsive">
        {trending.length > 0 && (
          <div className="disc-card">
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12, color: 'var(--ad)' }}>📈 Trending This Week</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {trending.map(({ topic, count, pct }) => (
                <div key={topic.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => onTopicFilter(topic.id)}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: topic.color, width: 88, flexShrink: 0 }}>{topic.label}</span>
                  <div style={{ flex: 1, height: 4, background: '#F0EDE8', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 2, background: topic.color, width: `${pct}%`, transition: 'width 0.6s ease' }} />
                  </div>
                  <span style={{ fontSize: '10.5px', color: 'var(--tf)', width: 32, textAlign: 'right', flexShrink: 0 }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {unexplored.length > 0 && (
          <div className="disc-card">
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12, color: '#2563eb' }}>🔭 Firms to Explore</div>
            {unexplored.map((s, i) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < unexplored.length - 1 ? '1px solid #F0EDE8' : 'none', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0, color: '#fff', background: firmColors[i % firmColors.length] }}>{s.abbr}</div>
                  <div style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                </div>
                <button style={{ flexShrink: 0, padding: '3px 10px', borderRadius: 'var(--rp)', fontSize: 11, fontWeight: 500, cursor: 'pointer', background: 'transparent', border: '1.5px solid var(--border)', color: 'var(--tm)', fontFamily: "'Outfit', sans-serif" }}>Explore</button>
              </div>
            ))}
          </div>
        )}
        {suggestTopics.length > 0 && (
          <div className="disc-card">
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12, color: '#7c3aed' }}>✦ Topics to Follow</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', margin: -3 }}>
              {suggestTopics.map(t => (
                <button key={t.id} className="topic-chip" style={{ borderColor: `${t.color}25`, margin: 3 }} onClick={() => onTopicFilter(t.id)}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: t.color, display: 'inline-block' }} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
