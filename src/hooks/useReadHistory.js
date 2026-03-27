import { useState, useCallback } from 'react';

const KEY = 'ap_read_history';
const MAX = 500;

function load() {
  try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch { return new Set(); }
}
function save(set) {
  const arr = [...set];
  if (arr.length > MAX) arr.splice(0, arr.length - MAX);
  localStorage.setItem(KEY, JSON.stringify(arr));
}

export function useReadHistory() {
  const [read, setRead] = useState(load);

  const markRead = useCallback((id) => {
    setRead(prev => {
      const next = new Set(prev);
      next.add(id);
      save(next);
      return next;
    });
  }, []);

  const isRead = useCallback((id) => read.has(id), [read]);

  return { read, markRead, isRead };
}
