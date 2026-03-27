import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { Search, Bell, ShieldCheck, TrendingUp } from 'lucide-react';
import { calculatePriceAccuracy, calculateSafetyRating } from '../utils/scoring';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png' });

const createIcon = (color) => new L.Icon({ iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`, shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });

const greenIcon = createIcon('green'); const redIcon = createIcon('red'); const blueIcon = createIcon('blue'); const goldIcon = createIcon('gold');

function LocationClickCapture() {
  const { setFilters } = useAppContext();
  useMapEvents({ click(e) { setFilters(prev => ({ ...prev, desiredLocations: [...prev.desiredLocations, { lat: e.latlng.lat, lng: e.latlng.lng }] })); } });
  return null;
}

function MapController() {
  const map = useMap();
  useEffect(() => { const resizeObserver = new ResizeObserver(() => map.invalidateSize()); resizeObserver.observe(map.getContainer()); return () => resizeObserver.disconnect(); }, [map]);
  return null;
}

export default function MapView({ properties, onContact }) {
  const { filters, setFilters, subscribeToProperty, subscriptions } = useAppContext();
  const { currentUser } = useAuth();
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapInstance, setMapInstance] = useState(null);

  const clearLocations = () => setFilters(prev => ({...prev, desiredLocations: []}));

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0 && mapInstance) mapInstance.flyTo([parseFloat(data[0].lat), parseFloat(data[0].lon)], 13);
      else alert("Location not found.");
    } catch(err) { console.error(err); }
  };

  const isUserSubscribed = (propertyId) => {
    return subscriptions.some(s => s.propertyId === propertyId && s.userId === currentUser?.id);
  };

  return (
    <div style={{ height: '100%', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-glass)', position: 'relative' }}>
      
      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 500, background: 'var(--bg-surface-elevated)', padding: '0.75rem', borderRadius: 'var(--radius-md)', backdropFilter: 'blur(8px)', border: '1px solid var(--border-glass)', maxWidth: 280 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search city/area..." style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', background: 'var(--bg-color)', color: 'white', outline: 'none', fontSize: '0.85rem' }} />
          <button type="submit" style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', padding: '0 0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Search size={16} /></button>
        </form>
        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', fontWeight: 600 }}>Click map to add target locations.</p>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{filters.desiredLocations.length} locations selected.</span>
        {filters.desiredLocations.length > 0 && <button onClick={clearLocations} style={{ display: 'block', width: '100%', marginTop: '0.5rem', padding: '0.4rem', background: 'var(--error)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}>Clear Locations</button>}
      </div>

      <MapContainer center={mapCenter} zoom={11} style={{ height: '100%', width: '100%', background: 'var(--bg-surface)' }} ref={setMapInstance} zoomControl={false}>
        <MapController />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" className="map-tiles" />
        <style>{`.leaflet-layer, .leaflet-control-zoom-in, .leaflet-control-zoom-out, .leaflet-control-attribution { filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%); } .leaflet-control-container .leaflet-top.leaflet-left { top: auto; bottom: 20px; left: 20px; }`}</style>
        <LocationClickCapture />

        {filters.desiredLocations.map((loc, i) => <Marker key={`dl-${i}`} position={[loc.lat, loc.lng]} icon={goldIcon}><Popup className="custom-popup"><b>Desired Location {i+1}</b></Popup></Marker>)}

        {properties.map(property => {
          const isAvailable = property.status === 'available';
          const commuteTime = property.commute?.time || 0;
          let iconUrl = !isAvailable ? redIcon : ((commuteTime > 0 && commuteTime <= filters.maxCommute) || commuteTime === 0) ? greenIcon : redIcon;

          const safetyRating = calculateSafetyRating(property.location.lat, property.location.lng);
          const accuracy = calculatePriceAccuracy(property.price, property.location.lat, property.location.lng);

          return (
            <Marker key={property.id} position={[property.location.lat, property.location.lng]} icon={iconUrl}>
              <Popup className="custom-popup" closeButton={false} minWidth={280}>
                <div style={{ margin: '-14px', borderRadius: '12px', overflow: 'hidden' }}>
                  <img src={property.images[0]} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                  <div style={{ padding: '12px', background: 'var(--bg-surface)', position: 'relative' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>{property.title}</h4>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>₹{property.price.toLocaleString()}</span>
                      {commuteTime > 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{commuteTime} min commute</span>}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '12px' }}>
                      <div style={{ flex: 1, padding: '4px', background: 'var(--bg-surface-elevated)', borderRadius: '4px', border: '1px solid var(--border-glass)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--warning)', fontSize: '0.8rem', fontWeight: 600 }}>
                          <ShieldCheck size={12} /> {safetyRating}
                        </div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Safety</div>
                      </div>
                      <div style={{ flex: 1, padding: '4px', background: 'var(--bg-surface-elevated)', borderRadius: '4px', border: `1px solid ${accuracy.isOverpriced ? 'var(--error)' : 'var(--success)'}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: accuracy.isOverpriced ? 'var(--error)' : 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }}>
                          <TrendingUp size={12} /> {accuracy.score}/10
                        </div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Value</div>
                      </div>
                    </div>
                    
                    {!isAvailable && currentUser?.role === 'renter' && (
                      <button onClick={(e) => { e.stopPropagation(); subscribeToProperty(property.id); }} disabled={isUserSubscribed(property.id)} style={{ width: '100%', padding: '0.5rem', background: isUserSubscribed(property.id) ? 'var(--bg-surface-elevated)' : 'var(--accent-secondary)', color: isUserSubscribed(property.id) ? 'var(--text-muted)' : 'black', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: isUserSubscribed(property.id) ? 'not-allowed' : 'pointer' }}>
                        <Bell size={16} /> {isUserSubscribed(property.id) ? 'Alert Set' : 'Alert Me When Available'}
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
