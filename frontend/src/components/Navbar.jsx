import React from 'react';
import { Globe, ChevronDown, Bell, TrendingUp, TrendingDown } from 'lucide-react';

const PERSONAS = ['Student', 'Investor', 'Startup Founder', 'Trader', 'General Reader'];
const LANGUAGES = [
  { name: 'English', code: 'en', flag: '🇺🇸' },
  { name: 'Hindi', code: 'hi', flag: '🇮🇳' },
  { name: 'Tamil', code: 'ta', flag: '🇮🇳' },
  { name: 'Telugu', code: 'te', flag: '🇮🇳' },
  { name: 'Bengali', code: 'bn', flag: '🇮🇳' },
];

const TICKER_DATA = [
  { label: 'SENSEX', value: '72,831.94', change: '+3.22', up: true },
  { label: 'NIFTY 50', value: '22,096.75', change: '+1.45', up: true },
  { label: 'USD/INR', value: '94.85', change: '-0.89', up: false },
  { label: 'RELIANCE', value: '2,984.10', change: '+12.40', up: true },
  { label: 'HDFC BANK', value: '1,442.20', change: '-5.15', up: false },
  { label: 'GOLD', value: '71,200', change: '+450', up: true },
];

export default function Navbar({ persona, setPersona, language, setLanguage, onBriefingClick }) {
  return (
    <>
      <div className="ticker-wrap">
        <div className="ticker-content">
          {[...TICKER_DATA, ...TICKER_DATA].map((item, i) => (
            <div key={i} className="ticker-item">
              <span>{item.label}</span>
              <span style={{ fontWeight: 800 }}>{item.value}</span>
              <span className={item.up ? 'up' : 'down'} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {item.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {item.change}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--et-red)', fontWeight: 800, fontSize: '24px', letterSpacing: '-0.5px' }}>ET</span>
          <span style={{ color: 'var(--dark-charcoal)', fontWeight: 700, fontSize: '18px', borderLeft: '1px solid #ddd', paddingLeft: '12px' }}>
            Intelligence Engine
          </span>
        </div>

        <div style={{ flex: 1 }}></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Persona Selector */}
          <div style={{ position: 'relative' }}>
            <select 
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              className="select-pill"
              style={{ paddingRight: '32px', fontWeight: 600 }}
            >
              {PERSONAS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--muted-gray)' }} />
          </div>

          {/* Language Selector */}
          <div style={{ position: 'relative' }}>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="select-pill"
              style={{ paddingRight: '32px', fontWeight: 600 }}
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.name}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
            <Globe size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--muted-gray)' }} />
          </div>

          <button className="btn-red" onClick={onBriefingClick} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
            <Bell size={18} />
            My Briefing
          </button>
        </div>
      </nav>
    </>
  );
}
