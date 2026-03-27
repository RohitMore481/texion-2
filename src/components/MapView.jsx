import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useAppContext } from '../context/AppContext';
import { useEffect, useState } from 'react';
import PropertyCard from './PropertyCard';

// Leaflet default icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored icons
const createIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const greenIcon = createIcon('green');
const redIcon = createIcon('red');
const blueIcon = createIcon('blue');

export default function MapView({ properties, onContact }) {
  const { filters } = useAppContext();
  
  // Center on New Delhi initially
  const center = [28.6139, 77.2090];
  
  // Hack to force Leaflet to resize correctly within a flex/grid container
  const [map, setMap] = useState(null);
  useEffect(() => {
    if (map) {
      setTimeout(() => map.invalidateSize(), 400);
    }
  }, [map, properties]);

  return (
    <div style={{ height: '100%', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
      <MapContainer 
        center={center} 
        zoom={11} 
        style={{ height: '100%', width: '100%' }}
        ref={setMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        
        {/* Force dark mode styles on map tiles through CSS filter in index.css */}
        <style>
          {`
            .leaflet-layer,
            .leaflet-control-zoom-in,
            .leaflet-control-zoom-out,
            .leaflet-control-attribution {
              filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
            }
          `}
        </style>

        {properties.map(property => {
          // Determine marker color. 
          // Green: within commute (or no workplace set, available)
          // Red: occupied or outside commute
          const isAvailable = property.status === 'available';
          const commuteTime = property.commute?.time || 0;
          let iconUrl = blueIcon;

          if (!isAvailable) {
            iconUrl = redIcon;
          } else if (commuteTime > 0 && commuteTime <= filters.maxCommute) {
            iconUrl = greenIcon; // Valid and available
          } else if (commuteTime > filters.maxCommute) {
            iconUrl = redIcon; // Too far
          } else {
             iconUrl = greenIcon; // Valid by default if no commute filter applies
          }

          return (
            <Marker 
              key={property.id} 
              position={[property.location.lat, property.location.lng]}
              icon={iconUrl}
            >
              <Popup className="custom-popup" closeButton={false} minWidth={280}>
                {/* Embedded simplified Property Card */}
                <div style={{ margin: '-14px', borderRadius: '12px', overflow: 'hidden' }}>
                  <img src={property.images[0]} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                  <div style={{ padding: '12px', background: 'var(--bg-surface)' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>{property.title}</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>₹{property.price}</span>
                      {commuteTime > 0 && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{commuteTime} mins</span>
                      )}
                    </div>
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
