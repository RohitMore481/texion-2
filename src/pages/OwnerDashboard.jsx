import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Edit2, Plus, Star, MapPin, X, Upload, Map as MapIcon, Loader, Trash2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const COMMON_AMENITIES = ['hospital', 'grocery', 'gym', 'park', 'metro'];
const COMMON_EXPECTATIONS = ['vegetarian', 'family only', 'no pets'];

// Map controller to fly to location
function MiniMapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center[0] && center[1]) {
      map.flyTo(center, 15);
      map.invalidateSize();
    }
  }, [center, map]);
  return null;
}

// Allows Owner to click map and set exact pin
function InteractiveMarker({ lat, lng, setCoords }) {
  useMapEvents({
    click(e) {
      setCoords(e.latlng.lat, e.latlng.lng);
    }
  });

  return (
    <Marker position={[lat, lng]}>
      <Popup className="minimap-popup">Verified Location (Click to move)</Popup>
    </Marker>
  );
}

export default function OwnerDashboard() {
  const { allProperties, setPropertyStatus, addProperty } = useAppContext();
  const { currentUser } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '', price: '', leaseTime: '11', address: '', 
    images: [], 
    amenities: [], expectations: [],
    lat: 28.6139, lng: 77.2090, isGeocoded: false
  });

  const [customAmenity, setCustomAmenity] = useState('');
  const [customExpectation, setCustomExpectation] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);

  const myProperties = allProperties.filter(property => property.ownerId === currentUser.id);

  const handleStatusToggle = (property) => {
    setPropertyStatus(property.id, property.status === 'available' ? 'occupied' : 'available');
  };

  const handleMultImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.size > 5000000) return;
      const reader = new FileReader();
      reader.onloadend = () => { setFormData(prev => ({ ...prev, images: [...prev.images, reader.result] })); };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));

  const geocodeAddress = async (e) => {
    e.preventDefault();
    if (!formData.address.trim()) return;
    setIsGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setFormData(prev => ({ ...prev, lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), isGeocoded: true }));
      } else {
        alert("Could not map this exact address. Dropping pin at default. Click the map to adjust.");
        setFormData(prev => ({...prev, isGeocoded: true})); // Let them click to adjust
      } // isGeocoded is basically "pin placed" now
    } catch(err) {
      alert("Error fetching location");
    } finally { setIsGeocoding(false); }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.isGeocoded) {
      const confirmAdd = window.confirm("You haven't clicked 'Update Map'. Use default coordinates?");
      if (!confirmAdd) return;
    }
    if (formData.images.length === 0) { alert("Please upload at least one image."); return; }
    
    addProperty({
      title: formData.title, price: Number(formData.price), leaseFormat: `${formData.leaseTime} Months`,
      location: { lat: formData.lat, lng: formData.lng, address: formData.address },
      amenities: formData.amenities, expectations: formData.expectations, images: formData.images
    });
    
    setFormData({ title: '', price: '', leaseTime: '11', address: '', images: [], amenities: [], expectations: [], lat: 28.6139, lng: 77.2090, isGeocoded: false });
    setShowAddForm(false);
  };

  const toggleArrayItem = (arrayName, item) => {
    const val = item.toLowerCase().trim();
    if (!val) return;
    setFormData(prev => ({ ...prev, [arrayName]: prev[arrayName].includes(val) ? prev[arrayName].filter(i => i !== val) : [...prev[arrayName], val] }));
  };

  const visibleAmenities = Array.from(new Set([...COMMON_AMENITIES, ...formData.amenities]));
  const visibleExpectations = Array.from(new Set([...COMMON_EXPECTATIONS, ...formData.expectations]));

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Owner Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your listings, adjust availability, and view reviews.</p>
        </div>
        <button onClick={() => setShowAddForm(true)} style={{ background: 'var(--accent-primary)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <Plus size={18} /> Add Property
        </button>
      </div>

      {myProperties.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>You don't have any properties listed yet.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {myProperties.map(p => (
            <div key={p.id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', height: 160 }}>
                <img src={p.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600 }}>₹{p.price} / mo</div>
              </div>
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                   <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>{p.title}</h3>
                   {p.leaseFormat && <span style={{ fontSize: '0.75rem', background: 'var(--bg-surface-elevated)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-glass)' }}>{p.leaseFormat} Lease</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}><MapPin size={14} /> {p.location.address}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Status</span>
                    <span style={{ fontWeight: 600, color: p.status === 'available' ? 'var(--success)' : 'var(--error)' }}>{p.status.toUpperCase()}</span>
                  </div>
                  <button onClick={() => handleStatusToggle(p)} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                    Mark {p.status === 'available' ? 'Occupied' : 'Available'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: 800, padding: 0, maxHeight: '95vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Create New Listing</h2>
              <button type="button" onClick={() => setShowAddForm(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <div style={{ overflowY: 'auto', padding: '2rem' }}>
              <form id="add-prop-form" onSubmit={handleAddSubmit}>
                
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>Property Photos *</label>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formData.images.length}/5 photos</span>
                  </div>
                  <input type="file" accept="image/*" multiple ref={fileInputRef} style={{ display: 'none' }} onChange={handleMultImageUpload} />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
                    {formData.images.map((imgSrc, idx) => (
                      <div key={idx} style={{ position: 'relative', height: 120, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', overflow: 'hidden' }}>
                        <img src={imgSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button type="button" onClick={() => removeImage(idx)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', padding: '0.2rem', cursor: 'pointer' }}><Trash2 size={14} /></button>
                      </div>
                    ))}
                    {formData.images.length < 5 && (
                      <div onClick={() => fileInputRef.current.click()} style={{ height: 120, borderRadius: 'var(--radius-sm)', border: '2px dashed var(--accent-secondary)', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'var(--transition-fast)' }}>
                        <Upload size={24} color="var(--accent-secondary)" style={{ marginBottom: '0.5rem' }} /><span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Add Photo</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ gridColumn: 'span 1' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Property Title *</label>
                    <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', color: 'white', outline: 'none' }} placeholder="e.g. Luxury 2BHK Setup" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Custom Rent (₹) *</label>
                    <input required type="number" min="1000" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', color: 'white', outline: 'none' }} placeholder="45000" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Lock-in Duration (Months) *</label>
                    <input required type="number" min="1" max="24" value={formData.leaseTime} onChange={e => setFormData({...formData, leaseTime: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', color: 'white', outline: 'none' }} placeholder="11" />
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Address & Exact Map Location *</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <input required value={formData.address} onChange={e => { setFormData({...formData, address: e.target.value, isGeocoded: false}); }} style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: `1px solid ${formData.isGeocoded ? 'var(--success)' : 'var(--border-glass)'}`, color: 'white', outline: 'none' }} placeholder="Block B, Sector 14..." />
                    <button type="button" onClick={geocodeAddress} disabled={isGeocoding} style={{ background: 'var(--accent-secondary)', color: 'black', padding: '0 1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                      {isGeocoding ? <Loader size={18} className="animate-spin" /> : <MapIcon size={18} />} Fetch Address
                    </button>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>* You can directly click on the map to manually move the pin to exact coordinates.</p>
                  
                  <div style={{ height: 200, width: '100%', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', overflow: 'hidden' }}>
                    <MapContainer center={[formData.lat, formData.lng]} zoom={11} style={{ height: '100%', width: '100%', background: 'var(--bg-surface)' }} zoomControl={false} dragging={true}>
                       <style>
                        {`
                          .leaflet-layer { filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%); }
                          .minimap-popup .leaflet-popup-content-wrapper { background: var(--bg-surface-elevated); color: white; border: 1px solid var(--accent-primary); }
                          .minimap-popup .leaflet-popup-tip { background: var(--bg-surface-elevated); }
                        `}
                      </style>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <MiniMapController center={[formData.lat, formData.lng]} />
                      
                      {/* Interactive Marker Logic */}
                      {formData.isGeocoded && (
                        <InteractiveMarker 
                           lat={formData.lat} lng={formData.lng} 
                           setCoords={(lat, lng) => setFormData(p => ({...p, lat, lng}))} 
                        />
                      )}
                    </MapContainer>
                  </div>
                  {formData.isGeocoded && <p style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.5rem', marginBottom: 0 }}>Pin Dropped at: {formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}</p>}
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Amenities Included</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    {visibleAmenities.map(amenity => (
                      <button type="button" key={amenity} onClick={() => toggleArrayItem('amenities', amenity)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: 'var(--radius-full)', background: formData.amenities.includes(amenity) ? 'var(--accent-primary)' : 'var(--bg-surface)', color: formData.amenities.includes(amenity) ? 'white' : 'var(--text-secondary)', border: `1px solid ${formData.amenities.includes(amenity) ? 'var(--accent-primary)' : 'var(--border-glass)'}`, textTransform: 'capitalize' }}>{amenity}</button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <input type="text" value={customAmenity} onChange={e => setCustomAmenity(e.target.value)} placeholder="Add custom amenity..." style={{ flex: 1, padding: '0.4rem', borderRadius: '4px', background: 'var(--bg-color)', border: '1px solid var(--border-glass)', color: 'white', fontSize: '0.8rem' }} />
                    <button type="button" onClick={() => { toggleArrayItem('amenities', customAmenity); setCustomAmenity(''); }} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', color: 'white', borderRadius: '4px', padding: '0 0.5rem' }}><Plus size={14}/></button>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Custom Owner Expectations</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    {visibleExpectations.map(exp => (
                      <button type="button" key={exp} onClick={() => toggleArrayItem('expectations', exp)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: 'var(--radius-full)', background: formData.expectations.includes(exp) ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-surface)', color: formData.expectations.includes(exp) ? 'var(--error)' : 'var(--text-secondary)', border: `1px solid ${formData.expectations.includes(exp) ? 'var(--error)' : 'var(--border-glass)'}`, textTransform: 'capitalize' }}>{exp}</button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <input type="text" value={customExpectation} onChange={e => setCustomExpectation(e.target.value)} placeholder="Add custom expectation rule..." style={{ flex: 1, padding: '0.4rem', borderRadius: '4px', background: 'var(--bg-color)', border: '1px solid var(--border-glass)', color: 'white', fontSize: '0.8rem' }} />
                    <button type="button" onClick={() => { toggleArrayItem('expectations', customExpectation); setCustomExpectation(''); }} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', color: 'white', borderRadius: '4px', padding: '0 0.5rem' }}><Plus size={14}/></button>
                  </div>
                </div>

              </form>
            </div>

            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.5)' }}>
              <button form="add-prop-form" type="submit" style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--accent-gradient)', color: 'white', fontWeight: 600, boxShadow: 'var(--accent-glow)' }}>
                Publish Property Listing
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
