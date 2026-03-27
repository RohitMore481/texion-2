import { useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import NotificationPanel from './NotificationPanel';
import { Home, Users, LogOut, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const { currentUser, logout, updateProfile } = useAuth();
  const fileInputRef = useRef(null);

  if (!currentUser) return null;

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2000000) { alert("File size must be < 2MB."); return; }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfile({ avatarUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

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
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1 style={{ fontSize: '1.5rem', margin: 0, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            CommuteIQ
          </h1>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <Users size={16} />
          <span style={{ fontSize: '0.9rem', textTransform: 'capitalize' }}>
            <b>{currentUser.name}</b> ({currentUser.role})
          </span>
        </div>

        <NotificationPanel />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleAvatarUpload} />
          
          <div 
            onClick={() => fileInputRef.current.click()}
            style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: currentUser.avatarUrl ? `url(${currentUser.avatarUrl}) center/cover` : 'var(--accent-secondary)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', color: '#000', fontSize: '14px', cursor: 'pointer',
              position: 'relative', overflow: 'hidden'
            }}
            title="Update Profile Picture"
          >
            {!currentUser.avatarUrl ? (
              currentUser.name.substring(0, 2).toUpperCase()
            ) : null}
            <div className="avatar-hover-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'var(--transition-fast)' }}>
              <Camera size={16} color="white" />
            </div>
          </div>
          {/* Add the hover style globally or inline via CSS trick */}
          <style>{`.avatar-hover-overlay:hover { opacity: 1 !important; }`}</style>
          
          <button 
            onClick={logout}
            style={{ color: 'var(--error)', display: 'flex', alignItems: 'center', padding: '0.5rem', borderRadius: 'var(--radius-sm)', transition: 'background 0.2s', border: 'none', background: 'transparent', cursor: 'pointer' }}
            title="Log out"
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}
