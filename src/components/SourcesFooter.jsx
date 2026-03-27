import { SOURCES } from '../data/sources';

export default function SourcesFooter({ selectedSources, onSourcesChange }) {
  const toggle = (id) => {
    const next = new Set(selectedSources);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSourcesChange(next);
  };

  return (
    <section className="sources-section">
      <div>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--tm)', marginBottom: 14, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Content Sources</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {SOURCES.map(s => (
            <button key={s.id} className={`src-pill ${selectedSources.has(s.id) ? 'active' : ''}`} onClick={() => toggle(s.id)}>
              {s.name}
            </button>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--tf)', marginTop: 12, lineHeight: 1.65 }}>
          All content belongs to their respective publishers. AccountingPulse aggregates publicly available feeds and redirects readers to the original source.
        </p>
      </div>
    </section>
  );
}
