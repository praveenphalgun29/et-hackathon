import React, { useState } from 'react';
import { Search, Navigation, Sparkles, ArrowRight, Info, MessageSquare, Globe, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export default function NewsNavigatorView({ query, persona, language, onFollowUp, data }) {
  const [localQuery, setLocalQuery] = useState("");
  const [followUpQuery, setFollowUpQuery] = useState('');

  const handleFollowUpSubmit = (e) => {
    e.preventDefault();
    if (followUpQuery.trim() && data) {
      onFollowUp(data.query || query, null, followUpQuery);
      setFollowUpQuery('');
    }
  };
  const suggestions = [
    "Sensex 2024 Year-End Target",
    "Jio Financial Services Strategy",
    "SEBI New Margin Rules Impact",
    "Tata Motors EV Roadmap",
    "AI Sector Growth in India"
  ];

  const followUpQuestions = [
    'What are the key risks?',
    'How does this impact the sector?',
    'What should an investor do next?',
    'How does this compare to global trends?'
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="max-container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{ maxWidth: '1000px', margin: '0 auto' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            background: 'var(--dark-charcoal)', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 20px',
            color: 'white',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
          }}>
            <Navigation size={32} />
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '12px', letterSpacing: '-0.5px' }}>News Navigator</h2>
          <p style={{ color: 'var(--muted-gray)', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
            The AI-powered command center for deep financial intelligence. Select a topic or ask your own.
          </p>
        </div>

        {/* Search Result Card */}
        <AnimatePresence>
          {data && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card" 
              style={{ marginBottom: '48px', borderLeft: '4px solid var(--et-red)', backgroundColor: '#fff8f9' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Sparkles size={16} color="var(--et-red)" />
                <span className="text-overline" style={{ margin: 0 }}>AI NAVIGATOR ANALYSIS</span>
              </div>
              <div className="markdown-content">
                <ReactMarkdown>
                  {data.response || data.detail || "No results found."}
                </ReactMarkdown>
              </div>

              <div style={{ marginTop: '24px', borderTop: '1px solid #ffecec', paddingTop: '20px' }}>
                <form onSubmit={handleFollowUpSubmit} style={{ display: 'flex', gap: '12px' }}>
                  <input 
                    type="text"
                    value={followUpQuery}
                    onChange={(e) => setFollowUpQuery(e.target.value)}
                    placeholder="Ask a follow-up question in Navigator..."
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #ffd0d6',
                      fontSize: '14px',
                      outline: 'none',
                      background: 'white'
                    }}
                  />
                  <button type="submit" className="btn-red hover-scale" style={{ padding: '0 24px', borderRadius: '8px', fontSize: '14px' }}>
                    Deep Dive
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }}>
          {/* Left Column: Trending Topics */}
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--muted-gray)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={14} color="var(--et-red)" />
              Curated Intelligence Deep-Dives
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {suggestions.map((s, i) => (
                <motion.button
                  key={i}
                  variants={itemVariants}
                  onClick={() => onFollowUp(s)}
                  className="card hover-glow hover-scale"
                  style={{ 
                    padding: '24px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '16px', 
                    textAlign: 'left', 
                    cursor: 'pointer',
                    background: 'white',
                    border: '1px solid #eee'
                  }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={18} color="var(--dark-charcoal)" />
                  </div>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: '15px', display: 'block' }}>{s}</span>
                    <span style={{ fontSize: '12px', color: 'var(--muted-gray)' }}>Analyze market impact and expert signals</span>
                  </div>
                  <ArrowRight size={16} style={{ marginLeft: 'auto', opacity: 0.3 }} />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Right Column: Prompts & Ask Own */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--muted-gray)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={14} color="var(--et-red)" />
                Quick Analysis Prompts
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {followUpQuestions.map((q, i) => (
                  <motion.button 
                    key={q} 
                    variants={itemVariants}
                    onClick={() => onFollowUp(q)}
                    className="hover-glow hover-scale"
                    style={{ 
                      textAlign: 'left', 
                      padding: '16px', 
                      borderRadius: '8px', 
                      border: '1px solid #eee', 
                      fontSize: '13px', 
                      fontWeight: 700,
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px', 
                      background: 'white' 
                    }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--et-red)' }}></div>
                    {q}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: '24px', background: '#fcfcfc', borderStyle: 'dashed' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px' }}>Ask Your Own</h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onFollowUp(localQuery)}
                  placeholder="e.g. Impact of Nifty at 22k..."
                  style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', outline: 'none' }}
                />
                <button 
                  onClick={() => onFollowUp(localQuery)}
                  className="btn-red hover-scale" 
                  style={{ padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <MessageSquare size={18} />
                </button>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--muted-gray)', marginTop: '12px' }}>
                Powered by ET Intelligence Engine for real-time synthesis.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
