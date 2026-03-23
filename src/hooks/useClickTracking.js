import { useState, useCallback } from 'react';

const CK = 'ap_clicks';

function loadClicks() {
  try { return new Set(JSON.parse(localStorage.getItem(CK) || '[]')); } catch { return new Set(); }
}

export function useClickTracking() {
  const [clickedTopics, setClickedTopics] = useState(() => loadClicks());

  const trackClick = useCallback((topicId) => {
    if (!topicId) return;
    setClickedTopics(prev => {
      const next = new Set(prev);
      next.add(topicId);
      // Keep only last 10
      const arr = [...next].slice(-10);
      localStorage.setItem(CK, JSON.stringify(arr));
      return new Set(arr);
    });
  }, []);

  return { clickedTopics, trackClick };
}
