import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap, Crown, Star } from 'lucide-react';

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '₹399',
    period: '/ month',
    description: 'Perfect for trying out ET Prime',
    features: ['Unlimited expert analysis', 'Member-only insights', 'Ad-free experience'],
    recommended: false
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '₹2,499',
    period: '/ year',
    description: 'Best value for long-term growth',
    features: ['All Monthly features', 'Exclusive newsletters', 'Save 48% vs Monthly'],
    recommended: true
  },
  {
    id: 'combo',
    name: 'Digital + Print',
    price: '₹3,999',
    period: '/ year',
    description: 'The ultimate ET experience',
    features: ['Full Digital access', 'Daily Newspaper delivery', 'Quarterly Magazine'],
    recommended: false
  }
];

export default function UnlockModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '900px',
              backgroundColor: '#fff',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <button
              onClick={onClose}
              style={{ position: 'absolute', right: '20px', top: '20px', color: '#666', transition: 'color 0.2s', cursor: 'pointer', zIndex: 10 }}
            >
              <X size={24} />
            </button>

            <div style={{ padding: '40px 40px 20px', textAlign: 'center', background: 'linear-gradient(to bottom, #fff5f6, #fff)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(232, 0, 45, 0.1)', borderRadius: '20px', color: 'var(--et-red)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px' }}>
                <Crown size={14} />
                ET Prime Exclusive
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px', color: 'var(--dark-charcoal)' }}>Unlock Unlimited Access</h2>
              <p style={{ color: '#666', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
                Join 1M+ members who rely on ET Prime for sharp business analysis and market intelligence.
              </p>
            </div>

            <div style={{ padding: '20px 40px 40px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {PLANS.map((plan) => (
                <motion.div
                  key={plan.id}
                  whileHover={{ y: -8 }}
                  style={{
                    position: 'relative',
                    padding: '32px 24px',
                    borderRadius: '12px',
                    border: plan.recommended ? '2px solid var(--et-red)' : '1px solid #eee',
                    backgroundColor: plan.recommended ? '#fff' : '#fafafa',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {plan.recommended && (
                    <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--et-red)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                      Most Popular
                    </div>
                  )}

                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>{plan.name}</h3>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '24px' }}>{plan.description}</div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
                    <span style={{ fontSize: '28px', fontWeight: 800 }}>{plan.price}</span>
                    <span style={{ fontSize: '14px', color: '#666' }}>{plan.period}</span>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                    {plan.features.map((feature, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#444' }}>
                        <Check size={14} color="var(--et-red)" strokeWidth={3} />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={plan.recommended ? "btn-red" : ""}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: 'pointer',
                      border: plan.recommended ? 'none' : '1px solid #ddd',
                      backgroundColor: plan.recommended ? 'var(--et-red)' : 'transparent',
                      color: plan.recommended ? '#fff' : '#333'
                    }}
                  >
                    Get {plan.name}
                  </motion.button>
                </motion.div>
              ))}
            </div>

            <div style={{ padding: '0 40px 40px', textAlign: 'center', fontSize: '12px', color: '#999' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Star size={14} fill="#FFD700" color="#FFD700" /> 4.8/5 Rating</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Zap size={14} color="#FFD700" fill="#FFD700" /> Instant Activation</div>
              </div>
              Cancel anytime. No hidden charges. Secure checkout guaranteed.
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
