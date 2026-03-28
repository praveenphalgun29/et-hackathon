import React, { useState } from 'react';
import { motion } from 'framer-motion';
import UnlockModal from './UnlockModal';

const TRENDING_CARDS = [
  { id: 1, category: 'IPO Watch', title: 'Rentomojo Files DRHP', impact: 'High', color: '#E8002D' },
  { id: 2, category: 'Policy', title: 'New SEBI Margin Rules', impact: 'Medium', color: '#1a1818' },
  { id: 3, category: 'Fintech', title: 'Paytm User Migration Status', impact: 'High', color: '#00BAF2' },
  { id: 4, category: 'Macro', title: 'FII Inflows Spike', impact: 'Positive', color: '#008D48' },
];

const MARKET_MOVERS = [
  { name: 'Reliance', price: '2,984', change: '+1.2%', up: true },
  { name: 'HDFC Bank', price: '1,442', change: '-0.4%', up: false },
  { name: 'Ceinsys Tech', price: '412', change: '+5.7%', up: true },
];
import { TrendingUp, Zap, Users, BarChart3, ArrowRight, X } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { x: 20, opacity: 0 },
  visible: { x: 0, opacity: 1 }
};

export default function RightSidebar() {
  const [showPrime, setShowPrime] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <aside className="right-sidebar">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Zap size={18} fill="currentColor" color="var(--et-red)" />
          <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Trending Insights</h3>
        </div>
        
        <div className="swipe-container">
          {TRENDING_CARDS.map((card) => (
            <motion.div 
              key={card.id} 
              variants={itemVariants}
              className="swipe-item"
            >
              <motion.div 
                whileHover={{ y: -5, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
                className="trending-card" 
                style={{ borderLeftColor: card.color, cursor: 'pointer' }}
              >
                <span className="text-overline" style={{ color: card.color }}>{card.category}</span>
                <h4 style={{ fontSize: '15px', marginTop: '4px', marginBottom: '12px' }}>{card.title}</h4>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', background: '#f0f0f0', padding: '2px 8px', borderRadius: '10px' }}>
                    {card.impact} Impact
                  </span>
                  <ArrowRight size={14} color="#999" />
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '24px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <BarChart3 size={18} color="var(--muted-gray)" />
          <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Market Movers</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {MARKET_MOVERS.map((mover, i) => (
            <motion.div 
              key={mover.name} 
              whileHover={{ x: 5, backgroundColor: '#f0f0f0' }}
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '12px', 
                background: '#fafafa', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{mover.name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>₹{mover.price}</div>
              </div>
              <div style={{ 
                color: mover.up ? '#008D48' : '#E8002D', 
                fontWeight: 700,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {mover.up ? '+' : ''}{mover.change}
                {mover.up ? <TrendingUp size={14} /> : <BarChart3 size={14} style={{ transform: 'rotate(180deg)' }} />}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {showPrime && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ boxShadow: '0 15px 30px rgba(0,0,0,0.3)' }}
          style={{ 
            marginTop: 'auto', 
            padding: '24px 20px', 
            background: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)', 
            color: '#ffffff', 
            borderRadius: '12px', 
            overflow: 'hidden', 
            position: 'relative',
            marginTop: '24px'
          }}
        >
          <motion.button 
            whileHover={{ scale: 1.2, color: '#fff' }}
            onClick={() => setShowPrime(false)}
            style={{ position: 'absolute', right: '12px', top: '12px', color: 'rgba(255,255,255,0.5)', zIndex: 10, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <X size={18} />
          </motion.button>
          <Users size={60} style={{ position: 'absolute', right: '-15px', bottom: '-15px', opacity: 0.1, color: '#fff' }} />
          <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px', color: '#fff' }}>Join ET Prime</h4>
          <p style={{ fontSize: '12px', opacity: 0.9, lineHeight: '1.5', color: '#eee', marginBottom: '16px' }}>
            Get unlimited access to expert analysis and members-only insights.
          </p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-red" 
            onClick={() => setIsModalOpen(true)}
            style={{ width: '100%', fontSize: '13px', padding: '10px', boxShadow: '0 4px 12px rgba(232, 0, 45, 0.3)', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white' }}
          >
            Unlock Now
          </motion.button>
        </motion.div>
      )}
      <UnlockModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </aside>
  );
}
