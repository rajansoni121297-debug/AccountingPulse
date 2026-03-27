import { useMemo, useEffect, useState } from 'react';
import { TOPICS, TOPIC_MAP } from '../data/topics';
import { SOURCES } from '../data/sources';
import { fetchTopicSummary } from '../api/articles';

export default function DiscoveryPanel({ articles, clickedTopics, onTopicFilter }) {
  const [topicCounts, setTopicCounts] = useState({});

  useEffect(() => {
    fetchTopicSummary().then(setTopicCounts).catch(() => {});
  }, []);

  const trending = useMemo(() => {
    const sorted = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const maxC = sorted[0]?.[1] || 1;
    return sorted.map(([tid, cnt]) => {
      const topic = TOPIC_MAP[tid];
      return topic ? { topic, count: cnt, pct: Math.round(cnt / maxC * 100) } : null;
    }).filter(Boolean);
  }, [topicCounts]);

  const unexplored = SOURCES.slice(0, 4);
  const suggestTopics = TOPICS.filter(t => !clickedTopics.has(t.id)).slice(0, 10);
  const firmColors = ['#86BC25', '#D04A02', '#00338D', '#CC0000', '#562D82', '#C8102E'];

  if (!trending.length && !suggestTopics.length) return null;

  return (
    <div className="discovery-wrap">
      <div className="discovery-grid">
        {trending.length > 0 && (
          <div className="disc-card">
            <div className="disc-card-title">Trending This Week</div>
            <div className="disc-trending-list">
              {trending.map(({ topic, count, pct }) => (
                <div key={topic.id} className="disc-trending-row" onClick={() => onTopicFilter(topic.id)}>
                  <span className="disc-trending-label" style={{ color: topic.color }}>{topic.label}</span>
                  <div className="disc-trending-bar">
                    <div className="disc-trending-fill" style={{ width: `${pct}%`, background: topic.color }} />
                  </div>
                  <span className="disc-trending-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {unexplored.length > 0 && (
          <div className="disc-card">
            <div className="disc-card-title">Firms to Explore</div>
            <div className="disc-firms-list">
              {unexplored.map((s, i) => (
                <div key={s.id} className="disc-firm-row">
                  <div className="disc-firm-badge" style={{ background: firmColors[i % firmColors.length] }}>{s.abbr}</div>
                  <span className="disc-firm-name">{s.name}</span>
                  <button className="disc-firm-btn">Explore</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {suggestTopics.length > 0 && (
          <div className="disc-card">
            <div className="disc-card-title">Topics to Follow</div>
            <div className="disc-topics-grid">
              {suggestTopics.map(t => (
                <button key={t.id} className="disc-topic-chip" onClick={() => onTopicFilter(t.id)}>
                  <span className="disc-topic-dot" style={{ background: t.color }} />
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
