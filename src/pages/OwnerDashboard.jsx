import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Edit2, Plus, Star, MapPin, X } from 'lucide-react';

const AMENITIES_LIST = ['hospital', 'grocery', 'gym', 'park', 'metro', 'pool', 'mall'];
const EXPECTATIONS_LIST = ['vegetarian', 'family only', 'no pets', 'corporate only', 'no girls allowed', 'bachelor only'];

export default function OwnerDashboard() {
  const { allProperties, setPropertyStatus, addProperty } = useAppContext();
  const { currentUser } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    address: '',
    imageUrl: '',
    amenities: [],
    expectations: []
  });

  const myProperties = allProperties.filter(property => property.ownerId === currentUser.id);

  const handleStatusToggle = (property) => {
    const newStatus = property.status === 'available' ? 'occupied' : 'available';
    setPropertyStatus(property.id, newStatus);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    
    // Create new property data
    addProperty({
      title: formData.title,
      price: Number(formData.price),
      location: { 
        lat: 28.5 + (Math.random() * 0.1), // Random nearby coords for map
        lng: 77.2 + (Math.random() * 0.1), 
        address: formData.address 
      },
      amenities: formData.amenities,
      expectations: formData.expectations,
      images: [formData.imageUrl || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&auto=format&fit=crop&q=60']
    });
    
    // Reset and close
    setFormData({ title: '', price: '', address: '', imageUrl: '', amenities: [], expectations: [] });
    setShowAddForm(false);
  };

  const toggleArrayItem = (arrayName, item) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].includes(item) 
        ? prev[arrayName].filter(i => i !== item)
        : [...prev[arrayName], item]
    }));
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Owner Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your listings, adjust availability, and view reviews.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          style={{ background: 'var(--accent-primary)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
        >
          <Plus size={18} /> Add Property
        </button>
      </div>

      {myProperties.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          You don't have any properties listed yet. 
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {myProperties.map(p => (
            <div key={p.id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', height: 160 }}>
                <img src={p.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600 }}>
                  ₹{p.price} / mo
                </div>
              </div>

              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>{p.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  <MapPin size={14} /> {p.location.address}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Status</span>
                    <span style={{ fontWeight: 600, color: p.status === 'available' ? 'var(--success)' : 'var(--error)' }}>
                      {p.status.toUpperCase()}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleStatusToggle(p)}
                    style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}
                  >
                    Mark {p.status === 'available' ? 'Occupied' : 'Available'}
                  </button>
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Recent Feedback</h4>
                  {p.reviews.length === 0 ? (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No feedback yet.</span>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {p.reviews.map((r, i) => (
                        <div key={i} style={{ background: 'var(--bg-surface-elevated)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <span style={{ fontWeight: 600 }}>{r.user}</span>
                            <span style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>{r.rating} <Star size={12} fill="var(--warning)" /></span>
                          </div>
                          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>"{r.comment}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Property Modal */}
      {showAddForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: 600, padding: '2rem', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setShowAddForm(false)} style={{ position: 'absolute', top: 20, right: 20, color: 'var(--text-secondary)' }}><X size={24} /></button>
            <h2 style={{ marginBottom: '1.5rem' }}>List New Property</h2>

            <form onSubmit={handleAddSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Property Title *</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', color: 'white' }} placeholder="e.g. Luxury 2BHK" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Monthly Rent (₹) *</label>
                  <input required type="number" min="1000" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', color: 'white' }} placeholder="45000" />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Full Address *</label>
                <input required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', color: 'white' }} placeholder="Sector 14, City" />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Image URL (Optional)</label>
                <input value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', color: 'white' }} placeholder="https://unsplash.com/..." />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Amenities Included</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {AMENITIES_LIST.map(amenity => (
                    <button type="button" key={amenity} onClick={() => toggleArrayItem('amenities', amenity)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: 'var(--radius-full)', background: formData.amenities.includes(amenity) ? 'var(--accent-primary)' : 'var(--bg-surface)', color: formData.amenities.includes(amenity) ? 'white' : 'var(--text-secondary)', border: `1px solid ${formData.amenities.includes(amenity) ? 'var(--accent-primary)' : 'var(--border-glass)'}`, textTransform: 'capitalize' }}>
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Owner Expectations</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {EXPECTATIONS_LIST.map(exp => (
                    <button type="button" key={exp} onClick={() => toggleArrayItem('expectations', exp)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: 'var(--radius-full)', background: formData.expectations.includes(exp) ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-surface)', color: formData.expectations.includes(exp) ? 'var(--error)' : 'var(--text-secondary)', border: `1px solid ${formData.expectations.includes(exp) ? 'var(--error)' : 'var(--border-glass)'}`, textTransform: 'capitalize' }}>
                      {exp}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--accent-gradient)', color: 'white', fontWeight: 600, boxShadow: 'var(--accent-glow)' }}>
                Publish Listing
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
