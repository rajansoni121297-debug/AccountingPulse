import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './hooks/useAuth';
import { useFeed } from './hooks/useFeed';
import { useClickTracking } from './hooks/useClickTracking';
import { useBookmarks } from './hooks/useBookmarks';
import { useReadHistory } from './hooks/useReadHistory';
import { classifyArticle } from './utils/helpers';
import ProgressBar from './components/ProgressBar';
import Header from './components/Header';
import Controls from './components/Controls';
import FeedSection from './components/FeedSection';
import AuthScreen from './components/AuthScreen';
import MyFeed from './components/MyFeed';
import Footer from './components/Footer';
import './index.css';

function App() {
  const { user, login, signup, demoLogin, logout } = useAuth();
  const { newsArticles, insightArticles, progress, isLive, loadingText, startFetch } = useFeed();
  const { clickedTopics, trackClick } = useClickTracking();
  const bookmarks = useBookmarks();
  const readHistory = useReadHistory();

  const [screen, setScreen] = useState('public');
  const [selectedTopics, setSelectedTopics] = useState(new Set());
  const [searchQ, setSearchQ] = useState('');

  useEffect(() => { startFetch(); }, [startFetch]);

  const allArticles = useMemo(() => [...newsArticles, ...insightArticles], [newsArticles, insightArticles]);
  const articleCount = allArticles.length;

  // Topic counts for the topic bar
  const topicCounts = useMemo(() => {
    const counts = {};
    allArticles.forEach(a => {
      const tid = a.topicId || classifyArticle(a.title, a.description)?.id;
      if (tid) counts[tid] = (counts[tid] || 0) + 1;
    });
    return counts;
  }, [allArticles]);

  const goPublic = useCallback(() => setScreen('public'), []);
  const goMyFeed = useCallback(() => {
    if (!user) setScreen('auth');
    else setScreen('myfeed');
  }, [user]);

  const handleLogin = useCallback((email, pass) => {
    const result = login(email, pass);
    if (result.success) setScreen('myfeed');
    return result;
  }, [login]);

  const handleSignup = useCallback((name, email, pass) => {
    const result = signup(name, email, pass);
    if (result.success) setScreen('myfeed');
    return result;
  }, [signup]);

  const handleDemoLogin = useCallback(() => { demoLogin(); setScreen('myfeed'); }, [demoLogin]);
  const handleLogout = useCallback(() => { logout(); setScreen('public'); }, [logout]);

  const handleBookmark = useCallback((id) => {
    if (!user) { setScreen('auth'); return; }
    bookmarks.toggle(id);
  }, [user, bookmarks]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ProgressBar progress={progress} />
      <Header
        screen={screen}
        onGoPublic={goPublic}
        onGoMyFeed={goMyFeed}
        isLive={isLive}
        loadingText={loadingText}
        articleCount={articleCount}
        user={user}
        onLogout={handleLogout}
        searchQ={searchQ}
        onSearchChange={setSearchQ}
      />

      {screen === 'public' && (
        <>
          <Controls
            selectedTopics={selectedTopics}
            onTopicsChange={setSelectedTopics}
            topicCounts={topicCounts}
            articleCount={articleCount}
          />

          <FeedSection
            articles={allArticles}
            allArticles={allArticles}
            clickedTopics={clickedTopics}
            searchQ={searchQ}
            selectedSources={new Set()}
            selectedTopics={selectedTopics}
            onTopicClick={trackClick}
            type="all"
            isLive={isLive}
            onBookmark={handleBookmark}
            isBookmarked={bookmarks.isBookmarked}
            onArticleRead={readHistory.markRead}
            isRead={readHistory.isRead}
          />
        </>
      )}

      {screen === 'auth' && (
        <AuthScreen onLogin={handleLogin} onSignup={handleSignup} onDemoLogin={handleDemoLogin} />
      )}

      {screen === 'myfeed' && user && (
        <MyFeed user={user} allArticles={allArticles} />
      )}

      <Footer />
    </div>
  );
}

export default App;
