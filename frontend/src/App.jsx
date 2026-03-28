import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import NewsroomView from './components/NewsroomView';
import NewsNavigatorView from './components/NewsNavigatorView';
import StoryArcView from './components/StoryArcView';
import VernacularView from './components/VernacularView';

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.3, ease: "easeIn" } }
};

function App() {
  const [activeView, setActiveView] = useState('newsroom');
  const [persona, setPersona] = useState('Investor');
  const [language, setLanguage] = useState('English');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [briefingData, setBriefingData] = useState([]);

  const API_BASE = 'http://localhost:8000';

  const handleSearch = async (newQuery, overrideLanguage) => {
    const activeLang = overrideLanguage || language;
    setQuery(newQuery);
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: newQuery,
          persona,
          language: activeLang,
          follow_up: ""
        })
      });
      const data = await response.json();
      
      if (activeView === 'vernacular' && activeLang !== 'English') {
        const engResponse = await fetch(`${API_BASE}/ask`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: newQuery, persona, language: 'English', follow_up: "" })
        });
        const engData = await engResponse.json();
        setResult({ ...data, englishOriginal: engData.response });
      } else {
        setResult(data);
      }
      const content = data?.response;

      if (content) {
        if (content.startsWith('ARC_DATA_START')) {
          setActiveView('storyarc');
        } else if (activeView === 'navigator') {
          // If a topic was selected from Navigator, show it in the Newsroom
          setActiveView('newsroom');
        } else if (activeView !== 'vernacular') {
          // Default to newsroom if we are not in a special tool
          setActiveView('newsroom');
        }
      } 
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBriefingClick = async () => {
    setLoading(true);
    setBriefingData([]); // Clear old data to trigger shimmer effect
    await new Promise(resolve => setTimeout(resolve, 800)); // Ensure loading state is visible
    try {
      const response = await fetch(`${API_BASE}/daily-briefing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona, language, topics: [] })
      });
      const data = await response.json();
      if (data.briefing) {
        setBriefingData(data.briefing);
      }
      
      // Only switch to newsroom if we are not in vernacular mode
      // This prevents unwanted redirection when changing languages in VernacularView
      if (activeView !== 'vernacular') {
        setActiveView('newsroom');
      }
    } catch (error) {
      console.error('Briefing failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleBriefingClick();
  }, [persona, language]);

  return (
    <div className="app">
      <Navbar 
        persona={persona} 
        setPersona={setPersona} 
        language={language} 
        setLanguage={(l) => {
          console.log("[DEBUG] Navbar setLanguage:", l);
          setLanguage(l);
        }}
        onBriefingClick={() => {
          console.log("[DEBUG] Navbar onBriefingClick");
          handleBriefingClick();
        }}
      />
      
      <div className="layout-wrapper" style={{ display: 'flex' }}>
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        
        <main className="main-content" style={{ position: 'relative' }}>
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: 'var(--navbar-height)',
                left: 'var(--sidebar-width)',
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255,255,255,0.85)',
                zIndex: 2000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                backdropFilter: 'blur(4px)'
              }}>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid #eee',
                  borderTopColor: 'var(--et-red)',
                  borderRadius: '50%'
                }}
              />
              <motion.p 
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ fontWeight: 600, color: 'var(--dark-charcoal)' }}
              >
                Refining your Newsroom...
              </motion.p>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ width: '100%', height: '100%' }}
            >
              {activeView === 'newsroom' && <NewsroomView persona={persona} onSearch={handleSearch} briefingData={briefingData} setBriefingData={setBriefingData} loading={loading} searchResult={result} />}
              {activeView === 'navigator' && <NewsNavigatorView query={query} persona={persona} language={language} onFollowUp={handleSearch} data={result} />}
              {activeView === 'storyarc' && <StoryArcView query={query} onSearch={handleSearch} data={result} />}
              {activeView === 'vernacular' && <VernacularView query={query} persona={persona} language={language} setLanguage={setLanguage} onSearch={handleSearch} data={result} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;
