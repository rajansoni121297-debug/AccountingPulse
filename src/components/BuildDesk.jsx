import { useState } from 'react';
import { TOPICS } from '../data/topics';
import { SOURCES } from '../data/sources';

// Topic icons are now in TOPICS data directly

const SOURCE_GROUPS = [
  { label: 'Big Four', ids: ['deloitte', 'pwc', 'ey', 'kpmg'] },
  { label: 'National Firms', ids: ['bdo', 'grantthornton', 'rsm', 'crowe', 'forvis'] },
  { label: 'Regional Firms', ids: ['cohnreznick', 'mossadams', 'plantemoran', 'marcum', 'cbiz', 'wipfli', 'citrin', 'eisneramper', 'withum', 'aprio', 'cherrybekaert'] },
];

export default function BuildDesk({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [selectedTopics, setSelectedTopics] = useState(new Set());
  const [selectedSources, setSelectedSources] = useState(new Set());

  const toggleTopic = (id) => {
    setSelectedTopics(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSource = (id) => {
    setSelectedSources(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllInGroup = (ids) => {
    setSelectedSources(prev => {
      const next = new Set(prev);
      const allSelected = ids.every(id => next.has(id));
      ids.forEach(id => allSelected ? next.delete(id) : next.add(id));
      return next;
    });
  };

  const handleFinish = () => {
    const prefs = {
      topics: [...selectedTopics],
      sources: [...selectedSources],
      setupDone: true,
      setupAt: new Date().toISOString(),
    };
    localStorage.setItem(`ap_desk_${user.id}`, JSON.stringify(prefs));
    onComplete(prefs);
  };

  return (
    <div className="desk-wizard">
      {/* Progress */}
      <div className="desk-progress">
        <div className="desk-progress-bar" style={{ width: step === 1 ? '50%' : '100%' }} />
      </div>

      {/* Step 1: Topics */}
      {step === 1 && (
        <div className="desk-step animate-fadeUp">
          <div className="desk-step-label">Step 1 of 2</div>
          <h2 className="desk-step-title">Build Your Desk</h2>
          <p className="desk-step-sub">Choose the topics that land on your desk every day.</p>

          <div className="desk-topic-grid">
            {TOPICS.map(t => (
              <button
                key={t.id}
                className={`desk-topic-card ${selectedTopics.has(t.id) ? 'active' : ''}`}
                onClick={() => toggleTopic(t.id)}
                style={selectedTopics.has(t.id) ? { borderColor: t.color, background: t.bg } : {}}
              >
                <span className="desk-topic-icon" style={{ background: t.bg, color: t.color }}>
                  {t.icon || '📄'}
                </span>
                <span className="desk-topic-label">{t.label}</span>
                {selectedTopics.has(t.id) && (
                  <svg className="desk-topic-check" width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="9" fill={t.color} />
                    <path d="M5 9.5L7.5 12L13 6.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          <div className="desk-actions">
            <span className="desk-hint">
              {selectedTopics.size === 0 ? 'Select at least one topic' : `${selectedTopics.size} topic${selectedTopics.size > 1 ? 's' : ''} selected`}
            </span>
            <button
              className="desk-continue-btn"
              disabled={selectedTopics.size === 0}
              onClick={() => setStep(2)}
            >
              Continue
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Sources */}
      {step === 2 && (
        <div className="desk-step animate-fadeUp">
          <div className="desk-step-label">Step 2 of 2</div>
          <h2 className="desk-step-title">Pick Your Sources</h2>
          <p className="desk-step-sub">Pick your go-to firms — or skip to follow all.</p>

          <div className="desk-source-groups">
            {SOURCE_GROUPS.map(group => {
              const groupSources = group.ids.map(id => SOURCES.find(s => s.id === id)).filter(Boolean);
              const allSelected = group.ids.every(id => selectedSources.has(id));
              return (
                <div key={group.label} className="desk-source-group">
                  <div className="desk-source-group-header">
                    <span className="desk-source-group-label">{group.label}</span>
                    <button className="desk-select-all" onClick={() => selectAllInGroup(group.ids)}>
                      {allSelected ? 'Deselect all' : 'Select all'}
                    </button>
                  </div>
                  <div className="desk-source-pills">
                    {groupSources.map(s => (
                      <button
                        key={s.id}
                        className={`desk-source-pill ${selectedSources.has(s.id) ? 'active' : ''}`}
                        onClick={() => toggleSource(s.id)}
                      >
                        <span className="desk-source-dot" style={{ background: s.color }} />
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="desk-actions">
            <button className="desk-back-btn" onClick={() => setStep(1)}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </button>
            <span className="desk-hint">
              {selectedSources.size === 0 ? 'No selection = follow all sources' : `${selectedSources.size} source${selectedSources.size > 1 ? 's' : ''} selected`}
            </span>
            <button className="desk-continue-btn" onClick={handleFinish}>
              Build My Desk
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
