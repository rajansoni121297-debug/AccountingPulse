import { useState, useEffect } from 'react';
import { TOPIC_MAP } from '../data/topics';
import { fetchTopicSummary } from '../api/articles';

export default function DailyBriefing({ articles }) {
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('ap_br_dismissed') === '1');
  const [topicCounts, setTopicCounts] = useState({});

  useEffect(() => {
    fetchTopicSummary().then(setTopicCounts).catch(() => {});
  }, []);

  if (dismissed) return null;

  const sorted = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]);
  const totalArticles = sorted.reduce((sum, [, c]) => sum + c, 0);
  if (!sorted.length) return null;

  const top3 = sorted.slice(0, 3);
  const topTopic = TOPIC_MAP[top3[0]?.[0]];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const topHeadlines = top3.map(([tid]) => {
    const topic = TOPIC_MAP[tid];
    if (!topic) return null;
    const match = articles.find(a => a.topicId === tid);
    return { topic, headline: match?.title || `${topic.label} coverage` };
  }).filter(Boolean);

  const handleDismiss = () => {
    sessionStorage.setItem('ap_br_dismissed', '1');
    setDismissed(true);
  };

  return (
    <div className="briefing-wrap">
      <div className="briefing-card">
        <div className="briefing-icon">
          <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
            <path d="M11 2L13.5 8H20L14.7 11.8L16.9 18L11 14.2L5.1 18L7.3 11.8L2 8H8.5L11 2Z" fill="currentColor"/>
          </svg>
        </div>
        <div className="briefing-body">
          <div className="briefing-label">Today's Briefing — {today}</div>
          <h2 className="briefing-headline">
            Top today: {topTopic?.label || 'News'} — {totalArticles} articles across {Object.keys(topicCounts).length} topics
          </h2>
          <div className="briefing-items">
            {topHeadlines.map((item, i) => (
              <div key={item.topic.id} className="briefing-item">
                <span className="briefing-num" style={{ background: item.topic.color }}>{i + 1}</span>
                <span className="briefing-item-text">
                  <strong>{item.topic.label}:</strong> {item.headline.length > 90 ? item.headline.slice(0, 90) + '\u2026' : item.headline}
                </span>
              </div>
            ))}
          </div>
        </div>
        <button className="briefing-close" onClick={handleDismiss} aria-label="Dismiss">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
