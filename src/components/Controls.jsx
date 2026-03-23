import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { SOURCES } from '../data/sources';
import { TOPICS } from '../data/topics';
import { debounce } from '../utils/helpers';

function MultiDropdown({ label, options, selected, onChange, renderOption }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  };

  const clearAll = () => onChange(new Set());

  const count = selected.size;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 14px', background: 'var(--white)',
          border: `1.5px solid ${count > 0 ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 10, fontSize: 13, fontWeight: 500,
          color: count > 0 ? 'var(--text)' : 'var(--tf)',
          fontFamily: "'Outfit', sans-serif", cursor: 'pointer',
          transition: 'all 0.18s', whiteSpace: 'nowrap',
        }}
      >
        {label}
        {count > 0 && (
          <span style={{
            background: 'var(--accent)', color: '#fff', fontSize: 10, fontWeight: 700,
            borderRadius: 10, padding: '1px 7px', lineHeight: '16px',
          }}>
            {count}
          </span>
        )}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : '' }}>
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 100,
          background: 'var(--white)', border: '1px solid var(--border)',
          borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,.12)',
          padding: '8px 0', minWidth: 220, maxHeight: 320, overflowY: 'auto',
        }}>
          {count > 0 && (
            <button
              onClick={clearAll}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '6px 14px', fontSize: 11, fontWeight: 600,
                color: 'var(--red)', background: 'transparent', border: 'none',
                cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                borderBottom: '1px solid var(--border)', marginBottom: 4,
              }}
            >
              Clear all
            </button>
          )}
          {options.map(opt => {
            const checked = selected.has(opt.id);
            return (
              <label
                key={opt.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '7px 14px', cursor: 'pointer', fontSize: 13,
                  color: 'var(--text)', transition: 'background 0.12s',
                  background: checked ? 'var(--s1)' : 'transparent',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--s1)'}
                onMouseLeave={e => e.currentTarget.style.background = checked ? 'var(--s1)' : 'transparent'}
              >
                <span style={{
                  width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                  border: `1.5px solid ${checked ? 'var(--accent)' : 'var(--border)'}`,
                  background: checked ? 'var(--accent)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}>
                  {checked && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l2.5 3L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                {renderOption ? renderOption(opt) : opt.label}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Controls({ onSearchChange, selectedSources, onSourcesChange, selectedTopics, onTopicsChange }) {
  const [searchValue, setSearchValue] = useState('');

  const debouncedSearch = useMemo(() => debounce(onSearchChange, 300), [onSearchChange]);

  const handleInput = useCallback((e) => {
    setSearchValue(e.target.value);
    debouncedSearch(e.target.value);
  }, [debouncedSearch]);

  const sourceOptions = SOURCES.map(s => ({ id: s.id, label: s.name, abbr: s.abbr, color: s.color }));
  const topicOptions = TOPICS.map(t => ({ id: t.id, label: t.label, color: t.color }));

  return (
    <section style={{ padding: 'clamp(.8rem, 2vw, 1.2rem) clamp(1rem, 4vw, 3rem) 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Left: Dropdowns */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <MultiDropdown
            label="Sources"
            options={sourceOptions}
            selected={selectedSources}
            onChange={onSourcesChange}
            renderOption={(opt) => (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 20, height: 20, borderRadius: 5, fontSize: 9, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', background: opt.color, flexShrink: 0,
                }}>
                  {opt.abbr}
                </span>
                {opt.label}
              </span>
            )}
          />
          <MultiDropdown
            label="Topics"
            options={topicOptions}
            selected={selectedTopics}
            onChange={onTopicsChange}
            renderOption={(opt) => (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: opt.color, flexShrink: 0 }} />
                {opt.label}
              </span>
            )}
          />
        </div>

        {/* Right: Search */}
        <div className="search-wrap" style={{ marginLeft: 'auto', flex: '0 1 360px' }}>
          <svg className="search-icon" width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="6" cy="6" r="5" stroke="#6B6259" strokeWidth="1.5" />
            <path d="M10 10l3.5 3.5" stroke="#6B6259" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            className="search-input"
            type="text"
            placeholder="Search articles, firms, topics…"
            value={searchValue}
            onChange={handleInput}
          />
        </div>
      </div>
    </section>
  );
}
