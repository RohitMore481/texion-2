import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import FilterForm from '../components/FilterForm';
import MapView from '../components/MapView';
import ComparisonView from '../components/ComparisonView';
import { MapPin, Search as SearchIcon, List, MessageSquare, Plus, Check, Star, ShieldCheck, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { calculatePriceAccuracy, calculateSafetyRating } from '../utils/scoring';

export default function RenterDashboard() {
  const { properties, compareList, toggleCompare } = useAppContext();
  const { currentUser } = useAuth();
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', padding: '1rem', gap: '1rem', background: 'var(--bg-color)' }}>
      
      {/* Sidebar Filters */}
      <div style={{ width: '320px', flexShrink: 0 }}>
        <FilterForm />
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
        
        {/* Top Controls */}
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.25rem 0' }}>Displaying {properties.length} Properties</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Showing results based on your commute choices.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-color)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
            <button 
              onClick={() => setViewMode('map')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none',
                background: viewMode === 'map' ? 'var(--accent-primary)' : 'transparent',
                color: viewMode === 'map' ? '#fff' : 'var(--text-secondary)',
                fontWeight: viewMode === 'map' ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <MapPin size={18} /> Map
            </button>
            <button 
              onClick={() => setViewMode('list')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none',
                background: viewMode === 'list' ? 'var(--accent-primary)' : 'transparent',
                color: viewMode === 'list' ? '#fff' : 'var(--text-secondary)',
                fontWeight: viewMode === 'list' ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <List size={18} /> List
            </button>
          </div>
        </div>

        {/* Dynamic View Area */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {/* MAP VIEW */}
          <div style={{ position: 'absolute', inset: 0, visibility: viewMode === 'map' ? 'visible' : 'hidden', opacity: viewMode === 'map' ? 1 : 0, transition: 'opacity 0.3s' }}>
            <MapView properties={properties} />
          </div>

          {/* LIST VIEW */}
          <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingRight: '0.5rem', visibility: viewMode === 'list' ? 'visible' : 'hidden', opacity: viewMode === 'list' ? 1 : 0, transition: 'opacity 0.3s' }}>
            {properties.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No properties found matching your criteria. Try adjusting filters or expanding the map area.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                {properties.map(p => {
                  const safetyRating = calculateSafetyRating(p.location.lat, p.location.lng);
                  const accuracy = calculatePriceAccuracy(p.price, p.location.lat, p.location.lng);
                  const isAvailable = p.status === 'available';

                  return (
                    <div key={p.id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', opacity: isAvailable ? 1 : 0.6 }}>
                      <div style={{ position: 'relative', height: 160 }}>
                        <img src={p.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: 12, left: 12, background: isAvailable ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 600 }}>
                          {isAvailable ? 'AVAILABLE' : 'OCCUPIED'}
                        </div>
                        <button 
                          onClick={() => toggleCompare(p)}
                          style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: 'white', border: '1px solid var(--border-glass)', padding: '0.4rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          title="Compare Property"
                        >
                          {compareList.find(c => c.id === p.id) ? <Check size={16} color="var(--success)" /> : <Plus size={16} />}
                        </button>
                      </div>

                      <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{p.title}</h3>
                          {p.leaseFormat && <span style={{ fontSize: '0.7rem', background: 'var(--bg-surface-elevated)', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid var(--border-glass)', whiteSpace: 'nowrap' }}>{p.leaseFormat}</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                          <MapPin size={12} /> {p.location.address}
                        </div>

                        {/* Price & Commute */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                          <div>
                            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-primary)', display: 'block' }}>₹{p.price.toLocaleString()}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>per month</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontWeight: 600, color: p.commute?.time <= 30 ? 'var(--success)' : 'var(--warning)', display: 'block' }}>
                              {p.commute?.time || '?'} mins
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>commute time</span>
                          </div>
                        </div>

                        {/* ML Analytics Scores */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                          <div style={{ flex: 1, background: 'var(--bg-surface-elevated)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--warning)', marginBottom: '0.25rem' }}>
                              <ShieldCheck size={14} /> <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{safetyRating}</span>
                            </div>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Safety Rating</span>
                          </div>
                          
                          <div style={{ flex: 1, background: 'var(--bg-surface-elevated)', padding: '0.5rem', borderRadius: '4px', border: `1px solid ${accuracy.isOverpriced ? 'var(--error)' : 'var(--success)'}`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: accuracy.isOverpriced ? 'var(--error)' : 'var(--success)', marginBottom: '0.25rem' }}>
                              <TrendingUp size={14} /> <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{accuracy.score}/10</span>
                            </div>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Price Value</span>
                          </div>
                        </div>

                        <button style={{ marginTop: 'auto', width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-surface-elevated)'}>
                          <MessageSquare size={16} /> Contact Broker
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {compareList.length > 0 && <ComparisonView />}
    </div>
  );
}
