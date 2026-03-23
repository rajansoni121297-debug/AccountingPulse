import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './hooks/useAuth';
import { useFeed } from './hooks/useFeed';
import { useClickTracking } from './hooks/useClickTracking';
import ProgressBar from './components/ProgressBar';
import Header from './components/Header';
import TabNav from './components/TabNav';
import Hero from './components/Hero';
import DailyBriefing from './components/DailyBriefing';
import StoryThreads from './components/StoryThreads';
import DiscoveryPanel from './components/DiscoveryPanel';
import Controls from './components/Controls';
import FeedSection from './components/FeedSection';
import AuthScreen from './components/AuthScreen';
import MyFeed from './components/MyFeed';
import SourcesFooter from './components/SourcesFooter';
import Footer from './components/Footer';
import './index.css';

function App() {
  const { user, login, signup, demoLogin, logout } = useAuth();
  const { newsArticles, insightArticles, progress, isLive, loadingText, startFetch } = useFeed();
  const { clickedTopics, trackClick } = useClickTracking();

  const [screen, setScreen] = useState('public');
  const [activeTab, setActiveTab] = useState('news');
  const [selectedSources, setSelectedSources] = useState(new Set());
  const [selectedTopics, setSelectedTopics] = useState(new Set());
  const [searchQ, setSearchQ] = useState('');

  // Start fetching RSS on mount
  useEffect(() => {
    startFetch();
  }, [startFetch]);

  const allArticles = [...newsArticles, ...insightArticles];
  const articleCount = allArticles.length;

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

  const handleDemoLogin = useCallback(() => {
    demoLogin();
    setScreen('myfeed');
  }, [demoLogin]);

  const handleLogout = useCallback(() => {
    logout();
    setScreen('public');
  }, [logout]);

  const handleTopicFilter = useCallback((topicId) => {
    setSelectedTopics(new Set([topicId]));
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingLeft: 320, paddingRight: 320 }}>
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
      />

      {/* Public Feed */}
      {screen === 'public' && (
        <>
          <TabNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            newsCount={newsArticles.length}
            insightsCount={insightArticles.length}
          />
          <Hero />
          <DailyBriefing articles={allArticles} />
          <StoryThreads articles={allArticles} clickedTopics={clickedTopics} onTopicFilter={handleTopicFilter} />
          <DiscoveryPanel articles={allArticles} clickedTopics={clickedTopics} onTopicFilter={handleTopicFilter} />
          <Controls
            onSearchChange={setSearchQ}
            selectedSources={selectedSources}
            onSourcesChange={setSelectedSources}
            selectedTopics={selectedTopics}
            onTopicsChange={setSelectedTopics}
          />

          {activeTab === 'news' && (
            <FeedSection
              articles={newsArticles}
              allArticles={allArticles}
              clickedTopics={clickedTopics}
              searchQ={searchQ}
              selectedSources={selectedSources}
              selectedTopics={selectedTopics}
              onTopicClick={trackClick}
              type="news"
              isLive={isLive}
            />
          )}
          {activeTab === 'insights' && (
            <FeedSection
              articles={insightArticles}
              allArticles={allArticles}
              clickedTopics={clickedTopics}
              searchQ={searchQ}
              selectedSources={selectedSources}
              selectedTopics={selectedTopics}
              onTopicClick={trackClick}
              type="insights"
              isLive={isLive}
            />
          )}
          <SourcesFooter selectedSources={selectedSources} onSourcesChange={setSelectedSources} />
        </>
      )}

      {/* Auth Screen */}
      {screen === 'auth' && (
        <AuthScreen onLogin={handleLogin} onSignup={handleSignup} onDemoLogin={handleDemoLogin} />
      )}

      {/* My Feed */}
      {screen === 'myfeed' && user && (
        <MyFeed user={user} />
      )}

      <Footer />
    </div>
  );
}

export default App;
