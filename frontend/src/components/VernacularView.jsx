import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Globe, Search, RefreshCw, Languages } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};

export default function VernacularView({ query, persona, language, setLanguage, onSearch, data }) {
  const [activeTab, setActiveTab] = useState(language);
  const [localQuery, setLocalQuery] = useState(query || "");
  const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali'];

  useEffect(() => {
    setActiveTab(language);
  }, [language]);

  const translatedContent = data?.response || "";
  const englishOriginal = data?.englishOriginal || data?.response || "";

  const handleLanguageChange = (newLang) => {
    setActiveTab(newLang);
    setLanguage(newLang);
    onSearch(localQuery || query, newLang);
  };

  if (!data) {
    return (
      <div className="max-container" style={{ textAlign: 'center', paddingTop: '60px' }}>
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          style={{ maxWidth: '600px', margin: '0 auto' }}
        >
          <div style={{ 
            width: '80px', 
            height: '80px', 
            background: '#fff5f6', 
            borderRadius: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 24px',
            color: 'var(--et-red)'
          }}>
            <Globe size={40} />
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '16px' }}>Vernacular Intelligence</h2>
          <p style={{ color: 'var(--muted-gray)', fontSize: '18px', lineHeight: '1.6', marginBottom: '40px' }}>
            Experience real-time business news adapted for your native language and cultural context.
          </p>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', borderBottom: '1px solid #eee', paddingBottom: '12px', overflowX: 'auto', justifyContent: 'center' }}>
            {languages.map((l) => (
              <button 
                key={l}
                onClick={() => handleLanguageChange(l)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: activeTab === l ? 'var(--et-red)' : 'var(--muted-gray)',
                  background: activeTab === l ? '#fff5f6' : 'white',
                  border: activeTab === l ? '1px solid var(--et-red)' : '1px solid #eee',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {l}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                placeholder="Search topic to translate..."
                className="hover-glow"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch(localQuery, activeTab)}
                style={{ width: '100%', padding: '16px 20px', paddingLeft: '48px', borderRadius: '8px', border: '1px solid var(--border-gray)', fontSize: '16px', outline: 'none' }}
              />
              <Globe size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-gray)' }} />
            </div>
            <button 
              onClick={() => onSearch(localQuery, activeTab)}
              className="btn-red" 
              style={{ padding: '0 32px', borderRadius: '8px', border: 'none', color: 'white' }}
            >
              Translate
            </button>
          </div>
        </motion.div>
      </div>
    );
  }


  return (
    <div className="max-container">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{ marginBottom: '40px' }}
      >
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '12px', overflowX: 'auto' }}>
          {languages.map((l) => (
            <motion.button 
              key={l}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleLanguageChange(l)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                color: activeTab === l ? 'var(--et-red)' : 'var(--muted-gray)',
                background: activeTab === l ? '#fff5f6' : 'white',
                border: activeTab === l ? '1px solid var(--et-red)' : '1px solid #eee',
                boxShadow: activeTab === l ? '0 4px 12px rgba(232, 0, 45, 0.1)' : 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {l}
            </motion.button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              placeholder="Ask in English or native language..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch(localQuery, activeTab)}
              style={{ width: '100%', padding: '16px 20px', paddingLeft: '48px', borderRadius: '8px', border: '1px solid var(--border-gray)', fontSize: '16px', outline: 'none' }}
            />
            <Globe size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-gray)' }} />
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSearch(localQuery, activeTab)}
            className="btn-red" 
            style={{ padding: '0 32px', borderRadius: '8px', border: 'none', color: 'white' }}
          >
            Translate
          </motion.button>
        </div>
      </motion.div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}
      >
        <motion.div variants={cardVariants} className="card hover-lift" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h4 style={{ fontSize: '11px', color: 'var(--muted-gray)', fontWeight: 800, letterSpacing: '1px' }}>ENGLISH ORIGINAL</h4>
          </div>
          <div className="markdown-content" style={{ fontSize: '16px', color: 'var(--dark-charcoal)', lineHeight: 1.8 }}>
            <ReactMarkdown>{englishOriginal}</ReactMarkdown>
          </div>
        </motion.div>

        <motion.div variants={cardVariants} className="card hover-lift" style={{ padding: '32px', backgroundColor: '#fdfdfd', borderLeft: '4px solid var(--et-red)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h4 style={{ fontSize: '11px', color: 'var(--et-red)', fontWeight: 800, letterSpacing: '1px' }}>{activeTab.toUpperCase()} VERSION</h4>
          </div>
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab + translatedContent}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="markdown-content"
              style={{ fontSize: '16px', color: 'var(--dark-charcoal)', lineHeight: 1.8 }}
            >
              <ReactMarkdown>{translatedContent}</ReactMarkdown>
            </motion.div>
          </AnimatePresence>
          <div style={{ marginTop: '24px', borderTop: '1px solid #eee', paddingTop: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--muted-gray)' }}>
            <Languages size={14} color="var(--et-red)" /> 
            <span>Culturally adapted for {activeTab} readers · Financial terms explained</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
