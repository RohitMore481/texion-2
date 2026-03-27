import { useAppContext } from '../context/AppContext';
import { getSafetyScore } from '../utils/safety';
import { MapPin, Clock, ShieldCheck, CheckCircle2, MessageSquare, Scale } from 'lucide-react';

export default function PropertyCard({ property, onContact }) {
  const { toggleCompare, compareList, currentUser } = useAppContext();
  const safety = getSafetyScore(property.location.lat, property.location.lng);
  
  const isCompared = compareList.find(p => p.id === property.id);
  
  const isAvailable = property.status === 'available';
  const commuteTime = property.commute?.time || 0;
  const inCommuteRange = currentUser?.workplace && commuteTime > 0;

  return (
    <div className="glass-panel" style={{ 
      display: 'flex', flexDirection: 'column', 
      overflow: 'hidden', transition: 'var(--transition-normal)' 
    }}>
      <div style={{ position: 'relative', height: '200px' }}>
        <img 
          src={property.images[0]} 
          alt={property.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute', top: 12, left: 12,
          background: isAvailable ? 'var(--success)' : 'var(--error)',
          color: 'white', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)',
          fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase'
        }}>
          {property.status}
        </div>
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          color: safety.color, padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)',
          fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem'
        }}>
          <ShieldCheck size={14} />
          {safety.label}
        </div>
      </div>

      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{property.title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          <MapPin size={16} />
          <span>{property.location.address}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', background: 'var(--bg-surface-elevated)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Rent</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
              ₹{property.price.toLocaleString()}
            </span>
          </div>
          {inCommuteRange && (
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Commute</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: commuteTime <= 45 ? 'var(--success)' : 'var(--warning)', fontWeight: 600 }}>
                <Clock size={16} />
                {commuteTime} mins
              </div>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Owner Expectations</span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
            {property.expectations.length === 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>None</span>}
            {property.expectations.map(exp => (
              <span key={exp} style={{ fontSize: '0.75rem', background: 'rgba(239,68,68,0.1)', color: 'var(--error)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                {exp}
              </span>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Amenities</span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
            {property.amenities.map(a => (
              <span key={a} style={{ fontSize: '0.75rem', background: 'var(--bg-surface)', padding: '0.15rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle2 size={12} color="var(--accent-secondary)" />
                {a}
              </span>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={() => onContact(property)}
            style={{ 
              flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', 
              background: 'var(--accent-primary)', color: 'white', fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
            }}
          >
            <MessageSquare size={18} />
            Contact
          </button>
          <button 
            onClick={() => toggleCompare(property)}
            title="Compare"
            style={{ 
              padding: '0.75rem', borderRadius: 'var(--radius-md)', 
              background: isCompared ? 'var(--bg-glass)' : 'var(--bg-surface)', 
              border: `1px solid ${isCompared ? 'var(--accent-secondary)' : 'var(--border-glass)'}`,
              color: isCompared ? 'var(--accent-secondary)' : 'var(--text-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <Scale size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
