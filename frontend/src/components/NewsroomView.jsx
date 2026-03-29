import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Search, MapPin, Calendar, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import RightSidebar from './RightSidebar';

const SUGGESTIONS = {
  'Investor': ['Sensex outlook', 'FII flows today', 'Nifty resistance levels'],
  'Student': ['What is repo rate', 'How does IPO work', 'Why rupee falls'],
  'Startup Founder': ['Latest funding rounds', 'SEBI startup rules', 'Zomato vs Swiggy'],
  'Trader': ['Options strategy', 'Bank Nifty levels', 'GIFT Nifty'],
  'General Reader': ['Budget 2024 news', 'Real estate trends', 'Gold price today']
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function NewsroomView({ persona, onSearch, briefingData, setBriefingData, loading, searchResult }) {
  const [query, setQuery] = useState('');
  const [expandedCard, setExpandedCard] = useState(null);
  const [progress, setProgress] = useState(0);
  const [followUpQuery, setFollowUpQuery] = useState('');

  const cleanLine = (text) => {
    if (!text) return "";
    return text.replace(/#/g, '').replace(/\*\*/g, '').replace(/\*/g, '').trim();
  };

  useEffect(() => {
    let interval;
    if (loading && briefingData.length === 0) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => Math.min(prev + (100 / 25), 99)); 
      }, 1000);
    } else {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [loading, briefingData.length]);

  const handleSearchLocal = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query);
  };

  const handleFollowUpSubmit = (e) => {
    e.preventDefault();
    if (followUpQuery.trim() && searchResult) {
      onSearch(searchResult.query || query, null, followUpQuery); // Use original query + new follow-up
      setFollowUpQuery('');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Morning";
    if (hour < 17) return "Afternoon";
    return "Evening";
  };

  return (
    <div className="max-container">
      <div className="newsroom-grid">
        <div className="briefing-area">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            style={{ marginBottom: '40px' }}
          >
            <form onSubmit={handleSearchLocal} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask anything — Jio IPO, SEBI rules, Paytm story..."
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    paddingLeft: '48px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-gray)',
                    fontSize: '16px',
                    outline: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}
                />
                <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-gray)' }} />
              </div>
              <button type="submit" className="btn-red hover-scale" style={{ padding: '0 32px', borderRadius: '8px', fontSize: '16px', border: 'none', color: 'white', cursor: 'pointer' }}>
                Search
              </button>
            </form>

            <div style={{ display: 'flex', gap: '8px' }}>
              {SUGGESTIONS[persona]?.map(tag => (
                <motion.button 
                  key={tag} 
                  whileHover={{ scale: 1.05, backgroundColor: '#eee' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setQuery(tag); onSearch(tag); }}
                  style={{ padding: '4px 12px', borderRadius: '16px', border: '1px solid var(--border-gray)', fontSize: '12px', color: 'var(--muted-gray)', background: '#f5f5f5', cursor: 'pointer' }}
                >
                  {tag}
                </motion.button>
              ))}
            </div>
          </motion.div>

          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '24px', marginBottom: '4px' }}>Your {getGreeting()} Briefing</h2>
                <p style={{ color: 'var(--muted-gray)', fontSize: '14px' }}>Personalized for {persona} · Updated just now</p>
              </div>
            </div>

            {loading && briefingData.length === 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ width: '100%', height: '4px', background: '#eee', borderRadius: '2px', overflow: 'hidden' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    style={{ height: '100%', background: 'var(--et-red)' }} 
                  />
                </div>
                <p style={{ fontSize: '12px', color: 'var(--muted-gray)', marginTop: '4px' }}>Refining latest business intelligence... ({Math.floor(progress / 20)}/5 ready)</p>
              </div>
            )}

            <AnimatePresence>
              {searchResult && !loading && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="card" 
                  style={{ marginBottom: '32px', borderLeft: '4px solid var(--et-red)', backgroundColor: '#fff8f9', overflow: 'hidden' }}
                >
                  <span className="text-overline">SEARCH RESULT</span>
                  <div className="markdown-content" style={{ marginTop: '12px' }}>
                    <ReactMarkdown>
                      {searchResult.response || searchResult.detail || "No results found."}
                    </ReactMarkdown>
                  </div>

                  <div style={{ marginTop: '24px', borderTop: '1px solid #ffecec', paddingTop: '20px' }}>
                    <form onSubmit={handleFollowUpSubmit} style={{ display: 'flex', gap: '12px' }}>
                      <input 
                        type="text"
                        value={followUpQuery}
                        onChange={(e) => setFollowUpQuery(e.target.value)}
                        placeholder="Ask a follow-up question..."
                        style={{
                          flex: 1,
                          padding: '12px 16px',
                          borderRadius: '6px',
                          border: '1px solid #ffd0d6',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                      />
                      <button type="submit" className="btn-red" style={{ padding: '0 20px', borderRadius: '6px', fontSize: '14px' }}>
                        Ask AI
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div 
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
              {briefingData.length > 0 ? (
                briefingData.map((card, i) => (
                  <motion.div 
                    key={i} 
                    variants={cardVariants}
                    layout
                    className="card hover-lift" 
                    style={{ 
                      cursor: 'pointer',
                      borderLeft: expandedCard === i ? '6px solid var(--et-red)' : '1px solid var(--border-gray)',
                      padding: expandedCard === i ? '32px' : '24px'
                    }}
                    onClick={() => setExpandedCard(expandedCard === i ? null : i)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className="text-overline" style={{ fontSize: '11px' }}>{card.topic}</span>
                      {expandedCard === i ? <ChevronUp size={18} color="var(--et-red)" /> : <ChevronDown size={18} color="#999" />}
                    </div>
                    
                    <motion.h3 layout className="headline" style={{ 
                      fontWeight: 800, 
                      fontSize: expandedCard === i ? '26px' : '20px', 
                      margin: '12px 0',
                      lineHeight: '1.2'
                    }}>
                      {cleanLine(card.summary.split('\n')[0])}
                    </motion.h3>

                    <motion.div layout className="markdown-content" style={{ 
                      color: expandedCard === i ? 'var(--dark-charcoal)' : 'var(--muted-gray)', 
                      display: expandedCard === i ? 'block' : '-webkit-box',
                      WebkitLineClamp: expandedCard === i ? 'unset' : '3',
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      fontSize: '16px',
                      lineHeight: '1.7'
                    }}>
                      {expandedCard === i ? (
                        <ReactMarkdown>
                          {card.summary}
                        </ReactMarkdown>
                      ) : (
                        cleanLine(card.summary.split('\n').slice(1).join(' ').substring(0, 180)) + "..."
                      )}
                    </motion.div>
                    
                    <AnimatePresence>
                      {expandedCard === i && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          style={{ marginTop: '24px', padding: '24px', background: '#fcfcfc', borderRadius: '8px', border: '1px solid #eee' }}
                        >
                          <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px', lineHeight: '1.6' }}>
                            This analysis is synthesized from multiple Economic Times sources to provide a focus on {persona} interests.
                          </p>
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn-red" 
                            style={{ fontSize: '13px', padding: '10px 20px', boxShadow: '0 4px 12px rgba(232, 0, 45, 0.2)', cursor: 'pointer', borderRadius: '4px', border: 'none', color: 'white' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSearch(`Deep dive into ${card.topic} for an ${persona}`);
                            }}
                          >
                            Ask AI for Deep Analysis →
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div style={{ borderTop: '1px solid var(--border-gray)', paddingTop: '16px', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: 'var(--muted-gray)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> Today</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ArrowRight size={14} /> ET Intelligence Engine</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                [1, 2, 3].map((i) => (
                  <motion.div key={i} variants={cardVariants} className="card loading-shimmer" style={{ height: '200px', opacity: 0.6, marginBottom: '20px' }} />
                ))
              )}
            </motion.div>
          </section>
        </div>

        <RightSidebar />
      </div>
    </div>
  );
}
