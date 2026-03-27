import { useAppContext } from '../context/AppContext';
import { X, Check } from 'lucide-react';

export default function ComparisonView() {
  const { compareList, clearCompare, toggleCompare } = useAppContext();

  if (compareList.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1100,
      background: 'var(--bg-surface-elevated)', backdropFilter: 'blur(16px)',
      borderTop: '1px solid var(--border-glass)', padding: '1rem',
      boxShadow: 'var(--shadow-lg)'
    }}>
      <div className="container" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Compare Properties <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>({compareList.length}/2)</span>
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Review your selected properties side-by-side.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flex: 3 }}>
          {compareList.map(p => (
            <div key={p.id} className="glass-panel" style={{ flex: 1, padding: '1rem', display: 'flex', gap: '1rem', position: 'relative' }}>
              <button 
                onClick={() => toggleCompare(p)}
                style={{ position: 'absolute', top: -10, right: -10, background: 'var(--error)', color: 'white', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={14} />
              </button>
              <img src={p.images[0]} style={{ width: 80, height: 80, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{p.title}</h4>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                  <span><b style={{ color: 'var(--accent-primary)' }}>₹{p.price}</b></span>
                  <span>{p.commute?.time || 0} mins</span>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  {p.amenities.slice(0, 3).map(a => (
                    <span key={a} style={{ fontSize: '0.7rem', background: 'var(--bg-surface)', padding: '2px 6px', borderRadius: '4px' }}>{a}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {compareList.length === 1 && (
            <div className="glass-panel" style={{ flex: 1, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', color: 'var(--text-muted)' }}>
              Select another property to compare
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button 
            disabled={compareList.length < 2}
            style={{ 
              padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', 
              background: compareList.length === 2 ? 'var(--accent-secondary)' : 'var(--bg-surface)', 
              color: compareList.length === 2 ? '#000' : 'var(--text-muted)', 
              fontWeight: 600, cursor: compareList.length === 2 ? 'pointer' : 'not-allowed'
            }}
          >
            Full Comparison
          </button>
          <button 
            onClick={clearCompare}
            style={{ padding: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}
