import React, { useState } from 'react';
import { BookOpen, Search, Sparkles, ArrowRight, User, Scale, AlertTriangle, Eye, TrendingUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function StoryArcView({ query, onSearch, data }) {
  const [localQuery, setLocalQuery] = useState("");
  const cleanText = (text) => {
    if (!text) return "";
    return text.replace(/\*\*/g, '').replace(/###/g, '').replace(/##/g, '').trim();
  };

  const parseArcData = (text) => {
    try {
      const start = text.indexOf('ARC_DATA_START') + 'ARC_DATA_START'.length;
      const end = text.indexOf('ARC_DATA_END');
      if (start > -1 && end > -1) {
        return JSON.parse(text.substring(start, end));
      }
    } catch (e) {
      console.error('Failed to parse ARC_DATA:', e);
    }
    return null;
  };

  const arcData = parseArcData(data?.response || '');

  if (!arcData) {
    const suggestions = [
      "The Rise of Jio Financial Services",
      "Paytm: From IPO to Regulatory Storm",
      "Adani Group: The Hindenburg Aftermath",
      "Air India Refurbishment Journey",
      "The Evolution of UPI in India"
    ];

    return (
      <div className="max-container" style={{ textAlign: 'center', paddingTop: '40px' }}>
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            background: 'var(--dark-charcoal)', 
            borderRadius: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 24px',
            color: 'white'
          }}>
            <BookOpen size={40} />
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '16px' }}>Story Arc</h2>
          <p style={{ color: 'var(--muted-gray)', fontSize: '18px', lineHeight: '1.6', marginBottom: '32px' }}>
            Track the evolution of any business narrative. Discover key inflection points and market sentiment shifts over time.
          </p>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                placeholder="Track any story — Paytm, Adani, Jio, Sensex..."
                className="hover-glow"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch(localQuery)}
                style={{ width: '100%', padding: '16px 20px', paddingLeft: '48px', borderRadius: '8px', border: '1px solid var(--border-gray)', fontSize: '16px', outline: 'none' }}
              />
              <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-gray)' }} />
            </div>
            <button 
              onClick={() => onSearch(localQuery)}
              className="btn-red hover-scale" 
              style={{ padding: '0 32px', borderRadius: '8px' }}
            >
              Start Tracking
            </button>
          </div>

          <div style={{ textAlign: 'left' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--muted-gray)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Trending Story Arcs</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => onSearch(s)}
                  className="card hover-glow hover-scale"
                  style={{ 
                    padding: '20px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    textAlign: 'left', 
                    cursor: 'pointer',
                    border: '1px solid #eee'
                  }}
                >
                  <Sparkles size={16} color="var(--et-red)" />
                  <span style={{ fontWeight: 700, fontSize: '14px' }}>{s}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Regular AI Response (if not formal arc data) */}
        {data && !arcData && (
          <div className="card" style={{ marginTop: '48px', padding: '32px', borderLeft: '4px solid var(--et-red)', backgroundColor: '#fff8f9', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Sparkles size={16} color="var(--et-red)" />
              <span className="text-overline" style={{ margin: 0 }}>AI STORY ANALYSIS</span>
            </div>
            <div className="markdown-content">
              <ReactMarkdown>
                {data.response || data.detail || "No results found."}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    );
  }

  const events = arcData?.timeline || [
    { date: 'Initial', event: 'Analyzing the trajectory of market forces...', sentiment: 0.1, impact: 'Low' },
  ];

  const players = arcData?.key_players || [
    { name: 'Regulatory Bodies', role: 'Monitoring compliance and market stability', sentiment: 0.0 },
    { name: 'Institutional Investors', role: 'Deploying capital based on growth signals', sentiment: 0.2 },
  ];

  const summary = arcData?.summary || "Synthesizing the story arc to identify key inflection points and risks...";
  const contrarian = arcData?.contrarian_perspectives?.[0] || { perspective: "No significant contrarian views detected in recent reports.", source: "ET Intelligence", severity: "Low" };
  const prediction = arcData?.what_to_watch?.[0] || { prediction: "Outlook remains stable with a focus on macro signals.", signal: "Gathering market indicators...", timeframe: "Next 2-4 Weeks", confidence: "Med" };

  const getSentimentColor = (s) => (s > 0.3 ? '#16a34a' : s < -0.3 ? '#dc2626' : '#6b7280');
  const getImpactSize = (i) => (i === 'High' ? '16px' : i === 'Med' ? '12px' : '8px');

  return (
    <div className="max-container">
      {/* Search Section */}
      <div className="animate-fade-in" style={{ marginBottom: '40px', animationDelay: '0.1s' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              placeholder="Track any story — Paytm, Adani, Jio, Sensex..."
              className="hover-glow"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch(localQuery)}
              style={{ width: '100%', padding: '16px 20px', paddingLeft: '48px', borderRadius: '8px', border: '1px solid var(--border-gray)', fontSize: '16px', outline: 'none' }}
            />
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-gray)' }} />
          </div>
          <button 
            onClick={() => onSearch(localQuery)}
            className="btn-red hover-scale" 
            style={{ padding: '0 32px', borderRadius: '8px' }}
          >
            Search
          </button>
        </div>
      </div>

      {/* Section A - Story Summary Banner */}
      <div className="animate-fade-in shadow-lg" style={{ backgroundColor: 'var(--dark-charcoal)', color: 'white', padding: '48px 40px', borderRadius: '12px', marginBottom: '48px', position: 'relative', overflow: 'hidden', animationDelay: '0.2s' }}>
        <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.1 }}>
          <BookOpen size={200} />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 800, marginBottom: '24px', letterSpacing: '2px' }}>
            <BookOpen size={16} /> {query?.toUpperCase() || 'STORY ARC'}
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 500, lineHeight: 1.5, maxWidth: '850px', fontStyle: 'italic', color: 'white' }}>
            {summary ? `"${cleanText(summary)}"` : "Synthesizing the narrative arc and key inflection points..."}
          </h2>
          <div style={{ display: 'flex', gap: '24px', marginTop: '32px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '6px', height: '6px', background: 'var(--et-red)', borderRadius: '50%' }}></div> {events.length} Inflection Points</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '6px', height: '6px', background: '#3b82f6', borderRadius: '50%' }}></div> {players.length} Strategists</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '6px', height: '6px', background: '#f59e0b', borderRadius: '50%' }}></div> Future Outlook Ready</span>
          </div>
        </div>
      </div>

      {/* Section B - Interactive Timeline */}
      {events.length > 0 && (
        <div className="animate-fade-in" style={{ marginBottom: '64px', overflowX: 'auto', paddingBottom: '32px', animationDelay: '0.3s' }}>
          <div style={{ minWidth: '900px', position: 'relative', height: '180px', padding: '0 60px' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: 'linear-gradient(to right, transparent, #eee 10%, #eee 90%, transparent)', zIndex: 0 }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1, top: 'calc(50% - 15px)' }}>
              {events.map((ev, i) => (
                <div key={i} className="hover-lift" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '150px', position: 'relative', cursor: 'pointer' }}>
                  <div style={{
                    width: getImpactSize(ev.impact === 'High' ? 'High' : 'Med'),
                    height: getImpactSize(ev.impact === 'High' ? 'High' : 'Med'),
                    backgroundColor: getSentimentColor(ev.sentiment),
                    borderRadius: '50%',
                    border: '4px solid white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    transition: 'all 0.3s'
                  }}></div>
                  <div style={{ marginTop: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--muted-gray)', textTransform: 'uppercase', letterSpacing: '1px' }}>{ev.date}</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '6px', maxWidth: '120px', lineHeight: '1.4' }}>{cleanText(ev.event)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section C - Key Players */}
      <section style={{ marginBottom: '56px' }}>
        <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', animationDelay: '0.4s' }}>
          <User size={22} color="var(--et-red)" />
          <h3 style={{ fontSize: '22px', fontWeight: 800 }}>Key Stakeholders</h3>
        </div>
        <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', padding: '10px 0' }}>
          {players.map((p, i) => (
            <div 
              key={p.name} 
              className="card animate-fade-in hover-glow hover-lift" 
              style={{ 
                flex: '1 0 200px', 
                padding: '24px', 
                textAlign: 'center',
                animationDelay: `${0.5 + i * 0.1}s`
              }}
            >
              <div style={{ width: '40px', height: '40px', background: '#f5f5f5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <User size={20} color={getSentimentColor(p.sentiment)} />
              </div>
              <div style={{ fontWeight: 800, fontSize: '15px', marginBottom: '8px' }}>{cleanText(p.name)}</div>
              <div style={{ fontSize: '13px', color: 'var(--muted-gray)', marginBottom: '16px', minHeight: '40px', lineHeight: '1.5' }}>{cleanText(p.role)}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '11px', fontWeight: 800, letterSpacing: '1px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getSentimentColor(p.sentiment) }}></div>
                {p.sentiment > 0.3 ? 'BULLISH' : p.sentiment < -0.3 ? 'BEARISH' : 'NEUTRAL'}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* Section D - Contrarian Perspectives */}
        <div className="animate-fade-in" style={{ animationDelay: '0.7s' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800 }}>
            <Scale size={20} color="var(--et-red)" /> The Contrarian View
          </h3>
          <div className="card hover-lift" style={{ borderLeft: '6px solid #f59e0b', position: 'relative', padding: '32px', backgroundColor: '#fffdf9' }}>
            <div style={{ position: 'absolute', right: '20px', top: '20px', fontSize: '11px', fontWeight: 900, color: '#f59e0b', letterSpacing: '1px' }}>
              LEVEL: {contrarian.severity?.toUpperCase()}
            </div>
            <div style={{ fontSize: '16px', lineHeight: 1.7, marginBottom: '20px', paddingRight: '40px', color: 'var(--dark-charcoal)' }}>
              <AlertTriangle size={18} style={{ display: 'inline', marginRight: '10px', verticalAlign: 'text-bottom', color: '#f59e0b' }} />
              {cleanText(contrarian.perspective)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted-gray)', fontWeight: 600 }}>SOURCE: {cleanText(contrarian.source)}</div>
          </div>
        </div>

        {/* Section E - What To Watch Next */}
        <div className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800 }}>
            <Eye size={20} color="var(--et-red)" /> Intelligence Signals
          </h3>
          <div className="card hover-lift" style={{ padding: '32px', borderLeft: '6px solid #3b82f6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 900, color: '#3b82f6', marginBottom: '16px', letterSpacing: '1px' }}>
              <TrendingUp size={16} /> FUTURE PROJECTION
            </div>
            <div style={{ fontSize: '17px', fontWeight: 700, marginBottom: '12px', lineHeight: '1.4' }}>{cleanText(prediction.prediction)}</div>
            <div style={{ fontSize: '14px', color: 'var(--muted-gray)', marginBottom: '24px', lineHeight: '1.6' }}>Signal: {cleanText(prediction.signal)}</div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span className="hover-scale" style={{ fontSize: '11px', fontWeight: 700, padding: '4px 12px', background: '#f5f8ff', color: '#3b82f6', borderRadius: '16px', border: '1px solid #eef2ff' }}>⏱ {prediction.timeframe}</span>
              <span className="hover-scale" style={{ fontSize: '11px', fontWeight: 700, padding: '4px 12px', background: '#f5f8ff', color: '#3b82f6', borderRadius: '16px', border: '1px solid #eef2ff' }}>📊 CONFIDENCE: {prediction.confidence}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
