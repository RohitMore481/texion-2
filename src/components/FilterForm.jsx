import { useAppContext } from '../context/AppContext';
import { Search, SlidersHorizontal, Plus } from 'lucide-react';
import { useState } from 'react';

const COMMON_AMENITIES = ['hospital', 'grocery', 'gym', 'park', 'metro'];
const COMMON_EXPECTATIONS = ['vegetarian', 'family only', 'no pets'];

export default function FilterForm() {
  const { filters, setFilters } = useAppContext();
  const [customAmenity, setCustomAmenity] = useState('');
  const [customExpectation, setCustomExpectation] = useState('');

  const handleAmenityChange = (amenity) => {
    const val = amenity.toLowerCase().trim();
    if (!val) return;
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(val)
        ? prev.amenities.filter(a => a !== val)
        : [...prev.amenities, val]
    }));
  };

  const handleExpectationChange = (exp) => {
    const val = exp.toLowerCase().trim();
    if (!val) return;
    setFilters(prev => ({
      ...prev,
      expectations: prev.expectations.includes(val)
        ? prev.expectations.filter(e => e !== val)
        : [...prev.expectations, val]
    }));
  };

  const addCustomAmenity = (e) => {
    e.preventDefault();
    handleAmenityChange(customAmenity);
    setCustomAmenity('');
  };

  const addCustomExpectation = (e) => {
    e.preventDefault();
    handleExpectationChange(customExpectation);
    setCustomExpectation('');
  };

  const visibleAmenities = Array.from(new Set([...COMMON_AMENITIES, ...filters.amenities]));
  const visibleExpectations = Array.from(new Set([...COMMON_EXPECTATIONS, ...filters.expectations]));

  return (
    <aside className="glass-panel" style={{ padding: '1.5rem', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <SlidersHorizontal size={20} color="var(--accent-primary)" />
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Smart Filters</h2>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <label style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Max Monthly Rent (₹)</label>
          <input 
            type="number" 
            value={filters.maxPrice} 
            onChange={e => setFilters({...filters, maxPrice: Number(e.target.value) || 0})}
            style={{ width: '80px', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'var(--bg-color)', border: '1px solid var(--border-glass)', color: 'white', textAlign: 'right' }} 
          />
        </div>
        <input 
          type="range" min="5000" max="150000" step="1000"
          value={filters.maxPrice}
          onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
          style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
        />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <label style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Max Commute (Mins)</label>
          <input 
            type="number" 
            value={filters.maxCommute} 
            onChange={e => setFilters({...filters, maxCommute: Number(e.target.value) || 0})}
            style={{ width: '60px', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'var(--bg-color)', border: '1px solid var(--border-glass)', color: 'white', textAlign: 'right' }} 
          />
        </div>
        <input 
          type="range" min="10" max="120" step="5"
          value={filters.maxCommute}
          onChange={(e) => setFilters({ ...filters, maxCommute: Number(e.target.value) })}
          style={{ width: '100%', accentColor: 'var(--accent-secondary)' }}
        />
        <p style={{ fontSize: '0.75rem', color: 'var(--warning)', mt: '0.5rem' }}>Relative to map pins</p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
          Required Amenities
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {visibleAmenities.map(amenity => (
            <button key={amenity} onClick={() => handleAmenityChange(amenity)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: 'var(--radius-full)', background: filters.amenities.includes(amenity) ? 'var(--accent-primary)' : 'var(--bg-surface)', color: filters.amenities.includes(amenity) ? 'white' : 'var(--text-secondary)', border: `1px solid ${filters.amenities.includes(amenity) ? 'var(--accent-primary)' : 'var(--border-glass)'}`, transition: 'all 0.2s', textTransform: 'capitalize' }}>
              {amenity}
            </button>
          ))}
        </div>
        <form onSubmit={addCustomAmenity} style={{ display: 'flex', gap: '0.25rem' }}>
          <input type="text" value={customAmenity} onChange={e => setCustomAmenity(e.target.value)} placeholder="Custom amenity..." style={{ flex: 1, padding: '0.4rem', borderRadius: '4px', background: 'var(--bg-color)', border: '1px solid var(--border-glass)', color: 'white', fontSize: '0.8rem' }} />
          <button type="submit" style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', color: 'white', borderRadius: '4px', padding: '0 0.5rem' }}><Plus size={14}/></button>
        </form>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
          Owner Expectations
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {visibleExpectations.map(exp => (
            <button key={exp} onClick={() => handleExpectationChange(exp)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: 'var(--radius-full)', background: filters.expectations.includes(exp) ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-surface)', color: filters.expectations.includes(exp) ? 'var(--error)' : 'var(--text-secondary)', border: `1px solid ${filters.expectations.includes(exp) ? 'var(--error)' : 'var(--border-glass)'}`, transition: 'all 0.2s', textTransform: 'capitalize' }}>
              {exp}
            </button>
          ))}
        </div>
        <form onSubmit={addCustomExpectation} style={{ display: 'flex', gap: '0.25rem' }}>
          <input type="text" value={customExpectation} onChange={e => setCustomExpectation(e.target.value)} placeholder="Custom expectation..." style={{ flex: 1, padding: '0.4rem', borderRadius: '4px', background: 'var(--bg-color)', border: '1px solid var(--border-glass)', color: 'white', fontSize: '0.8rem' }} />
          <button type="submit" style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', color: 'white', borderRadius: '4px', padding: '0 0.5rem' }}><Plus size={14}/></button>
        </form>
      </div>

    </aside>
  );
}
