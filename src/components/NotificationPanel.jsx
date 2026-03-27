import { Bell } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useState } from 'react';

export default function NotificationPanel() {
  const { notifications, markNotificationRead } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ position: 'relative' }}>
      <button 
        style={{ 
          background: 'var(--bg-surface-elevated)', 
          padding: '0.5rem', 
          borderRadius: '50%',
          position: 'relative',
          color: 'var(--text-primary)',
          transition: 'var(--transition-fast)'
        }}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-primary)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-surface-elevated)'}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -2, right: -2,
            background: 'var(--error)', color: 'white',
            fontSize: '0.7rem', fontWeight: 'bold',
            borderRadius: '50%', width: 18, height: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="glass-panel" style={{
          position: 'absolute', right: 0, top: '120%', 
          width: 320, maxHeight: 400, overflowY: 'auto',
          zIndex: 1000, padding: '1rem'
        }}>
          <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
            Notifications
          </h4>
          {notifications.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No notifications yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {notifications.map(n => (
                <li 
                  key={n.id} 
                  style={{
                    padding: '0.75rem',
                    background: n.read ? 'transparent' : 'rgba(99, 102, 241, 0.1)',
                    borderLeft: n.read ? '2px solid transparent' : '2px solid var(--accent-primary)',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => markNotificationRead(n.id)}
                >
                  <p style={{ color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                    {n.message}
                  </p>
                  {!n.read && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginTop: '4px', display: 'block' }}>
                      Click to mark read
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
