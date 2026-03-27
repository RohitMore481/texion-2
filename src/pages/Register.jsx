import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '', name: '', password: '', role: 'renter'
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Setup additional fields based on role to match mock data structure
    let extraData = {};
    if (formData.role === 'renter') {
      extraData = { workplace: { lat: 28.6139, lng: 77.2090 }, preferences: { maxCommute: 45, maxPrice: 40000 } };
    } else if (formData.role === 'broker') {
      extraData = { agency: 'Independent Broker', rating: 5.0 };
    }

    const result = register({ ...formData, ...extraData });
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', padding: '2rem 0' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: 450, padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            background: 'var(--accent-secondary)', width: 64, height: 64, borderRadius: 'var(--radius-lg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
          }}>
            <UserPlus color="#000" size={32} />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Join the CommuteIQ platform</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.85rem', textAlign: 'center', border: '1px solid var(--error)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Full Name</label>
            <input 
              type="text" required
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              style={{
                width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)', outline: 'none'
              }}
              placeholder="John Doe"
            />
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Username</label>
            <input 
              type="text" required
              value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})}
              style={{
                width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)', outline: 'none'
              }}
              placeholder="e.g. john123"
            />
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Password</label>
            <input 
              type="password" required
              value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
              style={{
                width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)', outline: 'none'
              }}
              placeholder="••••••••"
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Account Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              {['renter', 'broker', 'owner'].map(role => (
                <button
                  type="button"
                  key={role}
                  onClick={() => setFormData({...formData, role})}
                  style={{
                    padding: '0.75rem 0.5rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', textTransform: 'capitalize',
                    background: formData.role === role ? 'var(--accent-primary)' : 'var(--bg-surface)',
                    color: formData.role === role ? 'white' : 'var(--text-secondary)',
                    border: `1px solid ${formData.role === role ? 'var(--accent-primary)' : 'var(--border-glass)'}`,
                    transition: 'var(--transition-fast)'
                  }}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            style={{ 
              width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)', 
              background: 'var(--accent-gradient)', color: 'white', fontWeight: 600,
              boxShadow: 'var(--accent-glow)', marginBottom: '1.5rem'
            }}
          >
            Create Account
          </button>
        </form>
        
        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
