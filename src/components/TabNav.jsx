export default function TabNav({ activeTab, onTabChange, newsCount, insightsCount }) {
  return (
    <nav className="tabnav">
      <div className="tabnav-inner">
        <button className={`tab-btn ${activeTab === 'news' ? 'active' : ''}`} onClick={() => onTabChange('news')}>
          News <span className="tab-badge">{newsCount}</span>
        </button>
        <button className={`tab-btn ${activeTab === 'insights' ? 'active' : ''}`} onClick={() => onTabChange('insights')}>
          Insights <span className="tab-badge">{insightsCount}</span>
        </button>
      </div>
    </nav>
  );
}
