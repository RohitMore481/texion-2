import { Bell, MapPin, User, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const { currentUser, logout, updateProfile } = useAuth();
  const { notifications, markNotificationRead } = useAppContext();
  const [showNotifs, setShowNotifs] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const fileInputRef = useRef(null);

  // Persist and apply theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('commuteiq_theme') || 'dark';
    setIsDark(savedTheme === 'dark');
    document.body.classList.toggle('light-mode', savedTheme === 'light');
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.body.classList.toggle('light-mode', !newDark);
    localStorage.setItem('commuteiq_theme', newDark ? 'dark' : 'light');
  };

  if (!currentUser) return null;

  const myNotifications = notifications.filter(n => n.userId === currentUser.id || n.recipient === currentUser.id);
  const unreadCount = myNotifications.filter(n => !n.read).length;

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2000000) { alert("File > 2MB"); return; }
      const reader = new FileReader();
      reader.onloadend = () => updateProfile({ avatarUrl: reader.result });
      reader.readAsDataURL(file);
    }
  };

  return (
    <nav className="glass-panel" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.5rem', borderRadius: 'var(--radius-lg)', zIndex: 1100, position: 'relative' }}>
      
      {/* Brand & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        <div style={{ background: 'var(--accent-gradient)', padding: '0.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--accent-glow)' }}>
          <MapPin color="white" size={24} />
        </div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          Commute<span style={{ color: 'var(--accent-primary)' }}>IQ</span>
        </h1>
        <span style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginLeft: '0.25rem' }}>
          {currentUser.role}
        </span>
      </div>

      {/* Right Side Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', width: '42px', height: '42px', borderRadius: '50%', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun size={18} color="var(--warning)" /> : <Moon size={18} color="var(--accent-primary)" />}
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowNotifs(!showNotifs)}
            style={{ position: 'relative', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', width: '42px', height: '42px', borderRadius: '50%', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--error)', width: 18, height: 18, borderRadius: '50%', fontSize: '0.65rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: '2px solid var(--bg-surface)' }}>
                {unreadCount}
              </span>
            )}
          </button>
          
          {showNotifs && (
            <div className="glass-panel animate-fade-in" style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: 320, zIndex: 9999, padding: 0, overflow: 'hidden', border: '1px solid var(--border-glass)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-glass)', background: 'var(--bg-surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Notifications</h4>
                <button onClick={() => setShowNotifs(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ maxHeight: 350, overflowY: 'auto', background: 'var(--bg-color)' }}>
                {myNotifications.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No recent notifications</div>
                ) : (
                  myNotifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => markNotificationRead(n.id)}
                      style={{ padding: '1rem', borderBottom: '1px solid var(--border-glass)', background: n.read ? 'transparent' : 'rgba(6, 182, 212, 0.1)', cursor: 'pointer', transition: 'background 0.2s' }}
                    >
                      <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.85rem', color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)', lineHeight: 1.4 }}>{n.message}</p>
                      <span style={{ fontSize: '0.65rem', color: 'var(--accent-primary)', fontWeight: 600, textTransform: 'uppercase' }}>{n.type} · Tap to dismiss</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Separator */}
        <div style={{ width: 1, height: '30px', background: 'var(--border-glass)' }} />

        {/* Profile Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div onClick={() => fileInputRef.current?.click()} style={{ width: 42, height: 42, borderRadius: '50%', background: currentUser.avatarUrl ? `url(${currentUser.avatarUrl}) center/cover` : 'var(--bg-surface-elevated)', border: '2px solid var(--accent-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer', flexShrink: 0 }} title="Click to upload profile photo">
            {!currentUser.avatarUrl && <User size={20} color="var(--text-secondary)" />}
          </div>
          <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleAvatarUpload} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>{currentUser.name}</span>
          </div>
        </div>

        {/* Direct Logout Button */}
        <button 
          onClick={logout} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--error)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', flexShrink: 0 }} 
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }} 
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
          title="Sign Out"
        >
          <LogOut size={16} /> 
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}
