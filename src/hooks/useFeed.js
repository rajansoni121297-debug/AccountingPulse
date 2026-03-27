import { useState, useCallback, useRef } from 'react';
import { fetchArticles, toFrontendArticle } from '../api/articles';

export function useFeed() {
  const [newsArticles, setNewsArticles] = useState([]);
  const [insightArticles, setInsightArticles] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [loadingText, setLoadingText] = useState('Connecting\u2026');
  const fetchedRef = useRef(false);

  const startFetch = useCallback(async () => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    setProgress(10);
    setLoadingText('Fetching articles\u2026');

    try {
      // Fetch all articles from backend API
      setProgress(30);
      const data = await fetchArticles({ limit: 100, offset: 0 });
      setProgress(70);

      const articles = (data.articles || []).map(toFrontendArticle);

      // Split into news vs insights
      const news = articles.filter(a => a.type === 'news');
      const insights = articles.filter(a => a.type === 'insight');

      setNewsArticles(news);
      setInsightArticles(insights);
      setProgress(100);
      setIsLive(true);
      setLoadingText('Live');
      setTimeout(() => setProgress(0), 800);

      // Auto-refresh every 60 seconds
      setInterval(async () => {
        try {
          const fresh = await fetchArticles({ limit: 100, offset: 0 });
          const freshArticles = (fresh.articles || []).map(toFrontendArticle);
          setNewsArticles(freshArticles.filter(a => a.type === 'news'));
          setInsightArticles(freshArticles.filter(a => a.type === 'insight'));
        } catch {}
      }, 60000);

    } catch (err) {
      console.error('Failed to fetch from API:', err);
      setLoadingText('Offline');
      setProgress(0);
      // Fallback: try loading directly with rss2json as backup
      setIsLive(false);
    }
  }, []);

  return { newsArticles, insightArticles, progress, isLive, loadingText, startFetch };
}
