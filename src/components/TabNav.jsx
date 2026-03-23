export default function TabNav({ activeTab, onTabChange, newsCount, insightsCount }) {
  return (
    <nav className="tabnav">
      <button className={`tab-btn ${activeTab === 'news' ? 'active' : ''}`} onClick={() => onTabChange('news')}>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="1" width="11" height="3" rx="1" fill="currentColor" opacity=".7"/><rect x="1" y="6" width="7" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="1" y="10" width="9" height="2" rx="1" fill="currentColor" opacity=".5"/></svg>
        News <span className="tab-badge">{newsCount}</span>
      </button>
      <button className={`tab-btn ${activeTab === 'insights' ? 'active' : ''}`} onClick={() => onTabChange('insights')}>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="5" r="3.2" stroke="currentColor" strokeWidth="1.2" opacity=".7"/><path d="M3.5 10c0-1.66 1.34-3 3-3s3 1.34 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".7"/></svg>
        Insights <span className="tab-badge">{insightsCount}</span>
      </button>
    </nav>
  );
}
