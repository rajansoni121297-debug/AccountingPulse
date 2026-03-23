import { useState } from 'react';

export default function AuthScreen({ onLogin, onSignup, onDemoLogin }) {
  const [tab, setTab] = useState('li'); // 'li' = login, 'su' = signup
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Login fields
  const [liEmail, setLiEmail] = useState('');
  const [liPass, setLiPass] = useState('');

  // Signup fields
  const [suName, setSuName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPass, setSuPass] = useState('');

  const handleLogin = () => {
    if (!liEmail || !liPass) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setTimeout(() => {
      const result = onLogin(liEmail, liPass);
      setLoading(false);
      if (result.error) setError(result.error);
    }, 800);
  };

  const handleSignup = () => {
    if (!suName || !suEmail || !suPass) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setTimeout(() => {
      const result = onSignup(suName, suEmail, suPass);
      setLoading(false);
      if (result.error) setError(result.error);
    }, 800);
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 26, justifyContent: 'center' }}>
          <div className="logo-box" style={{ width: 26, height: 26 }}>
            <div className="logo-dot" /><div className="logo-dot dim" />
            <div className="logo-dot dim" /><div className="logo-dot" />
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700 }}>AccountingPulse</span>
        </div>
        <h2 className="auth-title">{tab === 'li' ? 'Welcome back' : 'Create account'}</h2>
        <p className="auth-sub">Sign in to access your personalized feed,<br />story threads and discovery tools.</p>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'li' ? 'active' : ''}`} onClick={() => { setTab('li'); setError(''); }}>Sign in</button>
          <button className={`auth-tab ${tab === 'su' ? 'active' : ''}`} onClick={() => { setTab('su'); setError(''); }}>Create account</button>
        </div>

        {error && <div className="auth-err">{error}</div>}

        {tab === 'li' ? (
          <div>
            <div className="form-group"><label className="form-label">EMAIL</label><input className="form-input" type="email" placeholder="you@example.com" value={liEmail} onChange={e => setLiEmail(e.target.value)} /></div>
            <div className="form-group"><label className="form-label">PASSWORD</label><input className="form-input" type="password" placeholder="Your password" value={liPass} onChange={e => setLiPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} /></div>
            <button className="form-btn" onClick={handleLogin} disabled={loading}>
              {loading ? <><span>Signing in…</span><div className="spinner" /></> : 'Sign in'}
            </button>
          </div>
        ) : (
          <div>
            <div className="form-group"><label className="form-label">FULL NAME</label><input className="form-input" type="text" placeholder="Your name" value={suName} onChange={e => setSuName(e.target.value)} /></div>
            <div className="form-group"><label className="form-label">EMAIL</label><input className="form-input" type="email" placeholder="you@example.com" value={suEmail} onChange={e => setSuEmail(e.target.value)} /></div>
            <div className="form-group"><label className="form-label">PASSWORD</label><input className="form-input" type="password" placeholder="At least 6 characters" value={suPass} onChange={e => setSuPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSignup()} /></div>
            <button className="form-btn" onClick={handleSignup} disabled={loading}>
              {loading ? <><span>Creating…</span><div className="spinner" /></> : 'Create account'}
            </button>
          </div>
        )}

        <div className="auth-divider">or use demo account</div>
        <button className="form-btn" style={{ background: 'var(--s2)', color: 'var(--text)', border: '1.5px solid var(--border)' }} onClick={onDemoLogin}>
          Sign in as Demo User
        </button>
        <div className="demo-box"><strong>Demo:</strong> demo@accountingpulse.com / demo1234</div>
      </div>
    </div>
  );
}
