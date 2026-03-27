import { useAppContext } from '../context/AppContext';
import NotificationPanel from './NotificationPanel';
import { Home, Users } from 'lucide-react';

export default function Navbar() {
  const { currentUser, users, setCurrentUser } = useAppContext();

  return (
    <nav className="glass-panel container" style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '1rem 1.5rem', margin: '1rem auto',
      position: 'sticky', top: '1rem', zIndex: 1000
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          background: 'var(--accent-gradient)', padding: '0.5rem', borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--accent-glow)'
        }}>
          <Home color="white" size={24} />
        </div>
        <h1 style={{ fontSize: '1.5rem', margin: 0, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          CommuteIQ
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={18} color="var(--text-secondary)" />
          <select 
            value={currentUser?.id || ''}
            onChange={(e) => setCurrentUser(users.find(u => u.id === e.target.value))}
            style={{
              background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)',
              border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)',
              padding: '0.5rem', outline: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-sans)'
            }}
          >
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
            ))}
          </select>
        </div>

        <NotificationPanel />

        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: 'var(--accent-secondary)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontWeight: 'bold', color: '#000', fontSize: '14px'
        }}>
          {currentUser?.name.substring(0, 2).toUpperCase()}
        </div>
      </div>
    </nav>
  );
}
