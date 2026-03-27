import { useAppContext } from '../context/AppContext';
import { Search, SlidersHorizontal } from 'lucide-react';

const AMENITIES = ['hospital', 'grocery', 'gym', 'park', 'metro', 'pool', 'mall'];
const EXPECTATIONS = ['vegetarian', 'family only', 'no pets', 'corporate only', 'no girls allowed', 'bachelor only'];

export default function FilterForm() {
  const { filters, setFilters } = useAppContext();

  const handleAmenityChange = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleExpectationChange = (exp) => {
    setFilters(prev => ({
      ...prev,
      expectations: prev.expectations.includes(exp)
        ? prev.expectations.filter(e => e !== exp)
        : [...prev.expectations, exp]
    }));
  };

  return (
    <aside className="glass-panel" style={{ padding: '1.5rem', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <SlidersHorizontal size={20} color="var(--accent-primary)" />
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Smart Filters</h2>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
          Max Monthly Rent: ₹{filters.maxPrice.toLocaleString()}
        </label>
        <input 
          type="range" min="5000" max="150000" step="1000"
          value={filters.maxPrice}
          onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
          style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          <span>₹5k</span><span>₹150k</span>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
          Max Commute Time: {filters.maxCommute} mins
        </label>
        <input 
          type="range" min="10" max="120" step="5"
          value={filters.maxCommute}
          onChange={(e) => setFilters({ ...filters, maxCommute: Number(e.target.value) })}
          style={{ width: '100%', accentColor: 'var(--accent-secondary)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          <span>10m</span><span>120m</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--warning)', marginTop: '0.5rem' }}>Based on workplace route</p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
          Nearby Amenities (Multi-destination)
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {AMENITIES.map(amenity => (
            <button
              key={amenity}
              onClick={() => handleAmenityChange(amenity)}
              style={{
                padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: 'var(--radius-full)',
                background: filters.amenities.includes(amenity) ? 'var(--accent-primary)' : 'var(--bg-surface)',
                color: filters.amenities.includes(amenity) ? 'white' : 'var(--text-secondary)',
                border: `1px solid ${filters.amenities.includes(amenity) ? 'var(--accent-primary)' : 'var(--border-glass)'}`,
                transition: 'all 0.2s', textTransform: 'capitalize'
              }}
            >
              {amenity}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
          Owner Expectations
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {EXPECTATIONS.map(exp => (
            <button
              key={exp}
              onClick={() => handleExpectationChange(exp)}
              style={{
                padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: 'var(--radius-full)',
                background: filters.expectations.includes(exp) ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-surface)',
                color: filters.expectations.includes(exp) ? 'var(--error)' : 'var(--text-secondary)',
                border: `1px solid ${filters.expectations.includes(exp) ? 'var(--error)' : 'var(--border-glass)'}`,
                transition: 'all 0.2s', textTransform: 'capitalize'
              }}
            >
              {exp}
            </button>
          ))}
        </div>
      </div>

    </aside>
  );
}
