import React from 'react';
import { Newspaper, Navigation, BookOpen, Globe } from 'lucide-react';

const MENU_ITEMS = [
  { id: 'newsroom', label: 'My Newsroom', icon: Newspaper },
  { id: 'navigator', label: 'News Navigator', icon: Navigation },
  { id: 'storyarc', label: 'Story Arc', icon: BookOpen },
  { id: 'vernacular', label: 'Vernacular', icon: Globe },
];

export default function Sidebar({ activeView, setActiveView }) {
  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      backgroundColor: 'white',
      borderRight: '1px solid var(--border-gray)',
      position: 'fixed',
      top: 'var(--navbar-height)',
      bottom: 0,
      left: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      zIndex: 900
    }}>
      <div style={{ padding: '16px 0' }}>
        {MENU_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`sidebar-item ${activeView === item.id ? 'active' : ''}`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '16px', borderTop: '1px solid var(--border-gray)' }}>
        <p style={{ fontSize: '10px', color: 'var(--muted-gray)', fontWeight: 600, marginBottom: '4px' }}>Source: Economic Times</p>
      </div>
    </aside>
  );
}
