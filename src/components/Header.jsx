export default function Header({ screen, onGoPublic, onGoMyFeed, isLive, loadingText, articleCount, user, onLogout }) {
  return (
    <header className="header">
      <div className="logo" onClick={onGoPublic}>
        <div className="logo-box">
          <div className="logo-dot" /><div className="logo-dot dim" />
          <div className="logo-dot dim" /><div className="logo-dot" />
        </div>
        <span className="logo-name">AccountingPulse</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button className={`nav-btn ${screen === 'public' ? 'active' : ''}`} onClick={onGoPublic}>Public Feed</button>
        <button className={`nav-btn ${screen === 'myfeed' ? 'active' : ''}`} onClick={onGoMyFeed}>
          {user ? `My Feed (${user.name.split(' ')[0]})` : 'My Feed'}
        </button>
        <div className="live-chip">
          <div className={`live-dot ${isLive ? 'on' : ''}`} />
          <span className="live-txt">{loadingText}</span>
        </div>
        {!user && screen === 'public' && (
          <span className="cnt-pill">{articleCount} articles</span>
        )}
        {user && (
          <button className="nav-btn signout" onClick={onLogout}>Sign out</button>
        )}
      </div>
    </header>
  );
}
