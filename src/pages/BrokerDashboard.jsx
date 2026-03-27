import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Users, Home, MessageSquare, Award } from 'lucide-react';

export default function BrokerDashboard() {
  const { allProperties, customRequests, setActiveChatUser, resolvedCounts } = useAppContext();
  const { currentUser } = useAuth(); 

  const myListings = allProperties.filter(p => p.brokerId === currentUser.id);
  const openRequests = (customRequests || []).filter(r => r.status !== 'resolved');
  const myScore = resolvedCounts?.[currentUser.id] || 0;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', overflowY: 'auto', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Broker Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your portfolio and assist clients looking for properties.</p>
        </div>
        {/* Broker Score Card */}
        <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)' }}>
          <div style={{ background: 'var(--accent-gradient)', borderRadius: '50%', padding: '0.7rem', boxShadow: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={22} color="white" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Queries Resolved</p>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)', lineHeight: 1 }}>{myScore}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 55%) 1fr', gap: '2rem' }}>
        
        {/* Active Client Requests */}
        <div>
          <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <Users size={20} color="var(--accent-secondary)" /> Open Tenant Requests 
            {openRequests.length > 0 && <span style={{ background: 'var(--accent-primary)', color: 'white', borderRadius: '9999px', fontSize: '0.7rem', padding: '0.1rem 0.5rem', fontWeight: 700 }}>{openRequests.length}</span>}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {openRequests.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No active custom requests from Renters at this time. Encourage clients to post their needs!
              </div>
            ) : (
              openRequests.map(r => (
                <div key={r.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1.05rem', color: 'var(--text-primary)' }}>{r.renterName}</h4>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Posted: {new Date(r.timestamp).toLocaleDateString()}</span>
                    </div>
                    <span style={{ background: r.urgency === 'High' ? 'rgba(239,68,68,0.15)' : r.urgency === 'Medium' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)', color: r.urgency === 'High' ? 'var(--error)' : r.urgency === 'Medium' ? 'var(--warning)' : 'var(--success)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, border: `1px solid currentColor`, flexShrink: 0 }}>
                      {r.urgency}
                    </span>
                  </div>
                  <div style={{ background: 'var(--bg-surface)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                    <p style={{ margin: '0 0 0.4rem 0', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{r.requirement}</p>
                    <p style={{ margin: 0, color: 'var(--accent-primary)', fontWeight: 700 }}>Max Budget: ₹{r.budget.toLocaleString()}/mo</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setActiveChatUser({ id: r.renterId, name: r.renterName })} style={{ flex: 1, padding: '0.65rem', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-surface-elevated)'}>
                      <MessageSquare size={15} /> Contact Renter
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Broker's Property Portfolio */}
        <div>
          <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <Home size={20} color="var(--accent-primary)" /> My Active Listings
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {myListings.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No properties in your portfolio.</p>
            ) : (
              myListings.map(p => (
                <div key={p.id} className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <img src={p.images[0]} style={{ width: 80, height: 80, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }} alt={p.title} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>{p.title}</h4>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>₹{p.price.toLocaleString()}/mo</p>
                    <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: p.status === 'available' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: p.status === 'available' ? 'var(--success)' : 'var(--error)', border: `1px solid ${p.status === 'available' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}` }}>
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
