import { useState } from 'react';
import Navbar from './components/Navbar';
import FilterForm from './components/FilterForm';
import PropertyCard from './components/PropertyCard';
import MapView from './components/MapView';
import ComparisonView from './components/ComparisonView';
import BrokerContact from './components/BrokerContact';
import { useAppContext } from './context/AppContext';
import { Map, List, LayoutGrid } from 'lucide-react';

export default function App() {
  const { properties, currentUser } = useAppContext();
  const [viewMode, setViewMode] = useState('split'); // split, map, list
  const [contactProperty, setContactProperty] = useState(null);

  // Layout styling based on mode
  const getGridTemplate = () => {
    if (viewMode === 'map') return '300px 1fr 0';
    if (viewMode === 'list') return '300px 0 1fr';
    return '300px 1fr 1fr'; // split
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Navbar />

      <main className="container" style={{ 
        flex: 1, display: 'grid', gridTemplateColumns: getGridTemplate(), 
        gap: '1.5rem', paddingBottom: '1.5rem', minHeight: 0, transition: 'var(--transition-normal)'
      }}>
        {/* Filters Panel */}
        <div style={{ overflow: 'hidden' }}>
          <FilterForm />
        </div>

        {/* Map View */}
        <div style={{ 
          overflow: 'hidden', 
          opacity: viewMode === 'list' ? 0 : 1, 
          transform: viewMode === 'list' ? 'scale(0.95)' : 'scale(1)',
          transition: 'var(--transition-normal)',
          display: viewMode === 'list' ? 'none' : 'block'
        }}>
          <div className="glass-panel" style={{ height: '100%', position: 'relative' }}>
            <MapView properties={properties} onContact={setContactProperty} />
            
            {/* View Toggles Overlaid on Map */}
            <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 500, display: 'flex', gap: '0.5rem', background: 'var(--bg-surface-elevated)', padding: '0.5rem', borderRadius: 'var(--radius-full)', backdropFilter: 'blur(8px)' }}>
              <button onClick={() => setViewMode('split')} style={{ padding: '0.5rem', borderRadius: '50%', background: viewMode === 'split' ? 'var(--accent-primary)' : 'transparent', color: viewMode === 'split' ? 'white' : 'var(--text-primary)' }}>
                <LayoutGrid size={18} />
              </button>
              <button onClick={() => setViewMode('map')} style={{ padding: '0.5rem', borderRadius: '50%', background: viewMode === 'map' ? 'var(--accent-primary)' : 'transparent', color: viewMode === 'map' ? 'white' : 'var(--text-primary)' }}>
                <Map size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* List View */}
        <div style={{ 
          overflowY: 'auto', paddingRight: '0.5rem',
          opacity: viewMode === 'map' ? 0 : 1, 
          transform: viewMode === 'map' ? 'translateX(20px)' : 'translateX(0)',
          transition: 'var(--transition-normal)',
          display: viewMode === 'map' ? 'none' : 'block'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
              {properties.length} Properties Found
            </h2>
            {viewMode === 'list' && (
              <button onClick={() => setViewMode('split')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-surface-elevated)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)' }}>
                <Map size={16} /> Show Map
              </button>
            )}
          </div>

          {properties.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <h3>No properties match your criteria.</h3>
              <p>Try expanding your search radius or modifying expectations.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'list' ? 'repeat(auto-fill, minmax(320px, 1fr))' : '1fr', gap: '1.5rem' }}>
              {properties.map(p => (
                <PropertyCard key={p.id} property={p} onContact={setContactProperty} />
              ))}
            </div>
          )}
        </div>
      </main>

      <ComparisonView />
      
      {contactProperty && (
        <BrokerContact property={contactProperty} onClose={() => setContactProperty(null)} />
      )}
    </div>
  );
}
