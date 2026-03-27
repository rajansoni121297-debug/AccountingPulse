import { TOPICS } from '../data/topics';

export default function Controls({ selectedTopics, onTopicsChange, topicCounts = {}, articleCount = 0 }) {
  // Single select — clicking a topic replaces the previous one
  const selectTopic = (id) => {
    if (selectedTopics.has(id)) {
      onTopicsChange(new Set()); // deselect = show all
    } else {
      onTopicsChange(new Set([id])); // single select
    }
  };

  return (
    <div className="controls-bar">
      <div className="controls-bar-inner">
        <button
          className={`topic-pill ${selectedTopics.size === 0 ? 'active' : ''}`}
          onClick={() => onTopicsChange(new Set())}
        >
          All
          <span className="topic-pill-count">{articleCount}</span>
        </button>
        {TOPICS.map(t => {
          const count = topicCounts[t.id] || 0;
          const isActive = selectedTopics.has(t.id);
          return (
            <button
              key={t.id}
              className={`topic-pill ${isActive ? 'active' : ''}`}
              onClick={() => selectTopic(t.id)}
            >
              <span className="topic-pill-dot" style={{ background: isActive ? '#fff' : t.color }} />
              {t.label}
              {count > 0 && <span className="topic-pill-count">{count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
