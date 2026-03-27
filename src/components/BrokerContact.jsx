import { X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function BrokerContact({ property, onClose }) {
  const { users } = useAppContext();
  const broker = users.find(u => u.id === property?.brokerId);

  if (!property || !broker) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: 450, padding: '2rem', position: 'relative' }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-secondary)' }}
        >
          <X size={24} />
        </button>

        <h2 style={{ marginBottom: '0.5rem' }}>Contact Broker</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Interested in <b>{property.title}</b>? Send a message to the listing broker.
        </p>

        <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
            {broker.name.substring(0, 1)}
          </div>
          <div>
            <h4 style={{ margin: 0 }}>{broker.name}</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{broker.agency}</p>
            <div style={{ fontSize: '0.8rem', color: 'var(--warning)', marginTop: 4 }}>⭐ {broker.rating} rating</div>
          </div>
        </div>

        <form onSubmit={e => { e.preventDefault(); alert("Message sent successfully!"); onClose(); }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Your Message</label>
            <textarea 
              rows={4}
              defaultValue={`Hi ${broker.name},\n\nI am interested in ${property.title} listed for ₹${property.price}/month. Is it still available for a visit?`}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-color)', border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', resize: 'none'
              }}
            />
          </div>
          <button 
            type="submit"
            style={{ 
              width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)', 
              background: 'var(--accent-gradient)', color: 'white', fontWeight: 600,
              boxShadow: 'var(--accent-glow)'
            }}
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
