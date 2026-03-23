import { useMemo } from 'react';
import { classifyArticle } from '../utils/helpers';
import { TOPICS } from '../data/topics';
import { SOURCES } from '../data/sources';

export default function DailyBriefing({ articles }) {
  const dismissed = sessionStorage.getItem('ap_br_dismissed');

  const briefingData = useMemo(() => {
    const tc = {};
    articles.forEach(a => {
      const t = classifyArticle(a.title, a.description);
      if (t) tc[t.id] = (tc[t.id] || 0) + 1;
    });
    const top = Object.entries(tc).sort((a, b) => b[1] - a[1]).slice(0, 3);
    if (!top.length) return null;

    const items = top.map(([tid, cnt]) => {
      const tp = TOPICS.find(x => x.id === tid);
      const latest = articles
        .filter(a => classifyArticle(a.title, a.description)?.id === tid)
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))[0];
      if (!tp || !latest) return null;
      return { topic: tp, title: latest.title, count: cnt };
    }).filter(Boolean);

    const topTopic = TOPICS.find(t => t.id === top[0][0]);
    return {
      headline: `Top today: ${topTopic?.label || 'Accounting'} — ${top[0][1]} articles from ${SOURCES.length} firms`,
      items,
    };
  }, [articles]);

  if (dismissed || !briefingData) return null;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const colors = ['#C8A96A', '#86BC25', '#2563eb'];

  const handleDismiss = () => {
    sessionStorage.setItem('ap_br_dismissed', '1');
    // Force re-render by using window event or just hide via DOM
    document.getElementById('daily-briefing')?.remove();
  };

  return (
    <div id="daily-briefing" style={{ padding: '0 clamp(1rem, 4vw, 3rem)', marginTop: 22 }}>
      <div className="briefing-card">
        <div style={{ width: 42, height: 42, background: 'rgba(200,169,106,.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 2L13.5 8H20L14.7 11.8L16.9 18L11 14.2L5.1 18L7.3 11.8L2 8H8.5L11 2Z" fill="#C8A96A"/></svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1.2px', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 6 }}>
            ☀️ Today's Briefing — {today}
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, color: '#F5F2EC', marginBottom: 10, lineHeight: 1.3 }}>
            {briefingData.headline}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {briefingData.items.map((item, i) => (
              <div key={item.topic.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '12.5px', color: 'rgba(245,242,236,.75)', lineHeight: 1.5 }}>
                <div style={{ width: 18, height: 18, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, flexShrink: 0, marginTop: 1, background: colors[i], color: '#0F0A05' }}>
                  {i + 1}
                </div>
                <span>
                  <strong style={{ color: 'rgba(245,242,236,.95)' }}>{item.topic.label}:</strong>{' '}
                  {item.title.length > 80 ? item.title.slice(0, 80) + '…' : item.title}
                </span>
              </div>
            ))}
          </div>
        </div>
        <button onClick={handleDismiss} style={{ position: 'absolute', top: 12, right: 14, width: 24, height: 24, borderRadius: 5, background: 'rgba(255,255,255,.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.5)' }}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
      </div>
    </div>
  );
}
