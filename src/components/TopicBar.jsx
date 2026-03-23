import { TOPICS } from '../data/topics';

export default function TopicBar({ activeTopic, onTopicChange }) {
  return (
    <div style={{ padding: '0 clamp(1rem, 4vw, 3rem)', marginTop: 10 }}>
      <div className="no-scrollbar" style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 4, alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--tf)', fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0 }}>Topics:</span>
        <button
          className={`topic-chip ${activeTopic === 'all' ? 'active' : ''}`}
          style={activeTopic === 'all' ? { background: 'var(--text)', color: '#F5F2EC', borderColor: 'var(--text)' } : {}}
          onClick={() => onTopicChange('all')}
        >
          All Topics
        </button>
        {TOPICS.map(t => (
          <button
            key={t.id}
            className={`topic-chip ${activeTopic === t.id ? 'active' : ''}`}
            style={activeTopic === t.id
              ? { background: t.bg, color: t.color, borderColor: t.color }
              : { color: t.color, borderColor: `${t.color}30` }}
            onClick={() => onTopicChange(t.id)}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: t.color, display: 'inline-block' }} />
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
