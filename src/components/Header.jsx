import { useState, useMemo } from 'react';
import { debounce } from '../utils/helpers';

export default function Header({ screen, onGoPublic, onGoMyFeed, isLive, loadingText, articleCount, user, onLogout, searchQ, onSearchChange }) {
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useMemo(() => debounce(onSearchChange || (() => {}), 300), [onSearchChange]);
  const handleInput = (e) => { setSearchValue(e.target.value); debouncedSearch(e.target.value); };

  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo" onClick={onGoPublic}>
          <div className="logo-box">
            <div className="logo-dot" /><div className="logo-dot dim" />
            <div className="logo-dot dim" /><div className="logo-dot" />
          </div>
          <span className="logo-name">AccountingPulse</span>
        </div>

        <nav className="header-nav">
          <button className={`nav-btn ${screen === 'public' ? 'active' : ''}`} onClick={onGoPublic}>Feed</button>
          <button className={`nav-btn ${screen === 'myfeed' ? 'active' : ''}`} onClick={onGoMyFeed}>My Desk</button>
        </nav>

        {screen === 'public' && onSearchChange && (
          <div className="header-search">
            <svg className="header-search-icon" width="15" height="15" viewBox="0 0 15 15" fill="none">
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input className="header-search-input" type="text" placeholder="Search articles, sources, topics..." value={searchValue} onChange={handleInput} />
          </div>
        )}

        <div className="header-right">
          <div className="live-chip">
            <div className={`live-dot ${isLive ? 'on' : ''}`} />
            <span className="live-txt">{loadingText}</span>
          </div>
          {user ? (
            <>
              <span className="header-user">{user.name.split(' ')[0]}</span>
              <button className="nav-btn signout" onClick={onLogout}>Sign out</button>
            </>
          ) : (
            <button className="nav-btn sign-in-btn" onClick={onGoMyFeed}>Sign In</button>
          )}
        </div>
      </div>
    </header>
  );
}
