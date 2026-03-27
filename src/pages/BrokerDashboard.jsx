import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Users, Mail, Phone, Home } from 'lucide-react';

export default function BrokerDashboard() {
  const { allProperties } = useAppContext();
  const { currentUser, users } = useAuth(); // Usually we would get renters from API

  // Properties assigned to this broker
  const myListings = allProperties.filter(p => p.brokerId === currentUser.id);

  // Mock list of renters looking for properties
  const unassignedRenters = [
    { id: 'r1', name: 'John Doe', req: '2BHK in Saket', budget: 40000, urgency: 'High' },
    { id: 'r2', name: 'Alice Smith', req: 'Studio near Metro', budget: 20000, urgency: 'Medium' }
  ];

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Broker Dashboard</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your portfolio and assist clients looking for properties.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Active Client Requests */}
        <div>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} color="var(--accent-secondary)" /> Client Requests
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {unassignedRenters.map(r => (
              <div key={r.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{r.name}</h4>
                  <span style={{ 
                    background: r.urgency === 'High' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)', 
                    color: r.urgency === 'High' ? 'var(--error)' : 'var(--warning)', 
                    padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 
                  }}>
                    {r.urgency} Urgency
                  </span>
                </div>
                <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Looking for: <b>{r.req}</b> (Max ₹{r.budget})
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button style={{ flex: 1, padding: '0.5rem', background: 'var(--accent-gradient)', color: 'white', borderRadius: 'var(--radius-sm)', border: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Home size={16} /> Assign Property
                  </button>
                  <button style={{ padding: '0.5rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Broker's Property Portfolio */}
        <div>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Home size={20} color="var(--accent-primary)" /> My Active Listings
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {myListings.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No properties in your portfolio.</p>
            ) : (
              myListings.map(p => (
                <div key={p.id} className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <img src={p.images[0]} style={{ width: 80, height: 80, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 0.25rem 0' }}>{p.title}</h4>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>₹{p.price}/mo</p>
                    <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: p.status === 'available' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: p.status === 'available' ? 'var(--success)' : 'var(--error)' }}>
                      {p.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
