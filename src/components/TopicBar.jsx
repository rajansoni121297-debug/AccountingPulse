import { TOPICS } from '../data/topics';

export default function TopicBar({ activeTab, onTabChange, newsCount, insightsCount, selectedTopics, onTopicsChange, topicCounts = {} }) {
  const toggleTopic = (id) => {
    const next = new Set(selectedTopics);
    if (next.has(id)) next.delete(id); else next.add(id);
    onTopicsChange(next);
  };

  const totalForTab = activeTab === 'news' ? newsCount : insightsCount;

  return (
    <div className="topicbar">
      <div className="topicbar-inner">
        <div className="topicbar-tabs">
          <button className={`topicbar-tab ${activeTab === 'news' ? 'active' : ''}`} onClick={() => onTabChange('news')}>
            News <span className="topicbar-count">{newsCount}</span>
          </button>
          <button className={`topicbar-tab ${activeTab === 'insights' ? 'active' : ''}`} onClick={() => onTabChange('insights')}>
            Insights <span className="topicbar-count">{insightsCount}</span>
          </button>
        </div>

        <div className="topicbar-divider" />

        <div className="topicbar-pills no-scrollbar">
          <button
            className={`tp ${selectedTopics.size === 0 ? 'active' : ''}`}
            onClick={() => onTopicsChange(new Set())}
          >
            All
            <span className="tp-count">{totalForTab}</span>
          </button>
          {TOPICS.map(t => {
            const count = topicCounts[t.id] || 0;
            if (count === 0) return null;
            return (
              <button
                key={t.id}
                className={`tp ${selectedTopics.has(t.id) ? 'active' : ''}`}
                style={selectedTopics.has(t.id) ? { '--tp-color': t.color } : {}}
                onClick={() => toggleTopic(t.id)}
              >
                <span className="tp-dot" style={{ background: t.color }} />
                {t.label}
                <span className="tp-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
