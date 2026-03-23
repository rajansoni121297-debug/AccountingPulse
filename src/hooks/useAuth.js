import { useState, useEffect, useCallback } from 'react';

const UK = 'ap_users';
const SK = 'ap_session';

// Initialize demo user
function initUsers() {
  const users = JSON.parse(localStorage.getItem(UK) || '[]');
  if (!users.find(u => u.email === 'demo@accountingpulse.com')) {
    users.push({ id: 'demo', name: 'Demo User', email: 'demo@accountingpulse.com', pass: 'demo1234' });
    localStorage.setItem(UK, JSON.stringify(users));
  }
  return users;
}

export function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    initUsers();
    try {
      const s = localStorage.getItem(SK);
      if (s) setUser(JSON.parse(s));
    } catch {}
  }, []);

  const login = useCallback((email, password) => {
    const users = JSON.parse(localStorage.getItem(UK) || '[]');
    const u = users.find(u => u.email === email.toLowerCase().trim() && u.pass === password);
    if (!u) return { error: 'Invalid credentials. Try the demo account.' };
    localStorage.setItem(SK, JSON.stringify(u));
    setUser(u);
    return { success: true };
  }, []);

  const signup = useCallback((name, email, password) => {
    if (password.length < 6) return { error: 'Password must be at least 6 characters.' };
    const users = JSON.parse(localStorage.getItem(UK) || '[]');
    if (users.find(u => u.email === email.toLowerCase().trim())) return { error: 'Email already registered.' };
    const u = { id: 'u_' + Date.now(), name: name.trim(), email: email.toLowerCase().trim(), pass: password };
    users.push(u);
    localStorage.setItem(UK, JSON.stringify(users));
    localStorage.setItem(SK, JSON.stringify(u));
    setUser(u);
    return { success: true };
  }, []);

  const demoLogin = useCallback(() => {
    const users = JSON.parse(localStorage.getItem(UK) || '[]');
    const u = users.find(u => u.email === 'demo@accountingpulse.com');
    if (u) {
      localStorage.setItem(SK, JSON.stringify(u));
      setUser(u);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SK);
    setUser(null);
  }, []);

  return { user, login, signup, demoLogin, logout };
}
