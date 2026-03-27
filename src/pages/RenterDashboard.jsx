import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import FilterForm from '../components/FilterForm';
import MapView from '../components/MapView';
import ComparisonView from '../components/ComparisonView';
import { MapPin, List, MessageSquare, Plus, Check, ShieldCheck, TrendingUp, X, FileText, Clock, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { calculatePriceAccuracy, calculateSafetyRating } from '../utils/scoring';

export default function RenterDashboard() {
  const { properties, compareList, toggleCompare, setActiveChatUser, addCustomRequest, customRequests, resolveCustomRequest, chats } = useAppContext();
  const { currentUser } = useAuth();
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'list' | 'myrequests'
  
  const [showReqForm, setShowReqForm] = useState(false);
  const [reqData, setReqData] = useState({ requirement: '', budget: '', urgency: 'Medium' });

  const myRequests = customRequests.filter(r => r.renterId === currentUser.id);

  // Find the broker (non-renter, non-owner) who last chatted with this renter
  const getLastBrokerWhoHelped = () => {
    const allUsers = JSON.parse(localStorage.getItem('commuteiq_all_users') || '[]');
    const brokerMessages = chats
      .filter(c => c.receiverId === currentUser.id)
      .sort((a, b) => b.timestamp - a.timestamp);
    for (const msg of brokerMessages) {
      const sender = allUsers.find(u => u.id === msg.senderId);
      if (sender && sender.role === 'broker') return { id: sender.id, name: sender.name };
    }
    return null;
  };

  const handleMarkSatisfied = (reqId) => {
    const broker = getLastBrokerWhoHelped();
    resolveCustomRequest(reqId, broker?.id || null, broker?.name || null);
  };
  const openRequests = myRequests.filter(r => r.status !== 'resolved');
  const resolvedRequests = myRequests.filter(r => r.status === 'resolved');

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    if (!reqData.requirement.trim() || !reqData.budget) return;
    addCustomRequest({ requirement: reqData.requirement, budget: Number(reqData.budget), urgency: reqData.urgency });
    setReqData({ requirement: '', budget: '', urgency: 'Medium' });
    setShowReqForm(false);
  };

  const urgencyColor = (u) => u === 'High' ? 'var(--error)' : u === 'Medium' ? 'var(--warning)' : 'var(--success)';
  const urgencyBg = (u) => u === 'High' ? 'rgba(239,68,68,0.15)' : u === 'Medium' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)';

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', padding: '1rem', gap: '1rem', background: 'var(--bg-color)', position: 'relative' }}>
      
      {/* Sidebar Filters */}
      <div style={{ width: '300px', flexShrink: 0, overflowY: 'auto' }}>
        <FilterForm />
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
        
        {/* Top Controls */}
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', margin: '0 0 0.2rem 0', color: 'var(--text-primary)' }}>
              {viewMode === 'myrequests' ? `My Requests (${myRequests.length})` : `Displaying ${properties.length} Properties`}
            </h2>
            <button onClick={() => setShowReqForm(true)} style={{ background: 'rgba(6, 182, 212, 0.12)', color: 'var(--accent-secondary)', border: '1px dashed var(--accent-secondary)', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>
              + Post a Custom Request to Brokers
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--bg-color)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
            {[
              { id: 'map', icon: <MapPin size={16} />, label: 'Map' },
              { id: 'list', icon: <List size={16} />, label: 'List' },
              { id: 'myrequests', icon: <FileText size={16} />, label: `Requests${openRequests.length > 0 ? ` (${openRequests.length})` : ''}` }
            ].map(tab => (
              <button key={tab.id} onClick={() => setViewMode(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', borderRadius: '6px', border: 'none', background: viewMode === tab.id ? 'var(--accent-primary)' : 'transparent', color: viewMode === tab.id ? '#fff' : 'var(--text-secondary)', fontWeight: viewMode === tab.id ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.85rem' }}>
                {tab.icon} {tab.label}
              </button>
            ))}
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
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No properties found matching your criteria.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                {properties.map(p => {
                  const safetyRating = calculateSafetyRating(p.location.lat, p.location.lng);
                  const accuracy = calculatePriceAccuracy(p.price, p.location.lat, p.location.lng);
                  const isAvailable = p.status === 'available';
                  return (
                    <div key={p.id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', opacity: isAvailable ? 1 : 0.6 }}>
                      <div style={{ position: 'relative', height: 160 }}>
                        <img src={p.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.title} />
                        <div style={{ position: 'absolute', top: 12, left: 12, background: isAvailable ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 600 }}>
                          {isAvailable ? 'AVAILABLE' : 'OCCUPIED'}
                        </div>
                        <button onClick={() => toggleCompare(p)} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: 'white', border: '1px solid var(--border-glass)', padding: '0.4rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Compare Property">
                          {compareList.find(c => c.id === p.id) ? <Check size={16} color="var(--success)" /> : <Plus size={16} />}
                        </button>
                      </div>
                      <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{p.title}</h3>
                          {p.leaseFormat && <span style={{ fontSize: '0.7rem', background: 'var(--bg-surface-elevated)', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid var(--border-glass)', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{p.leaseFormat}</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                          <MapPin size={12} /> {p.location.address}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', background: 'var(--bg-surface)', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)' }}>
                          <div>
                            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-primary)', display: 'block' }}>₹{p.price.toLocaleString()}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>per month</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontWeight: 600, color: p.commute?.time <= 30 ? 'var(--success)' : 'var(--warning)', display: 'block' }}>{p.commute?.time || '?'} mins</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>commute</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <div style={{ flex: 1, background: 'var(--bg-surface-elevated)', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--warning)' }}><ShieldCheck size={13} /> <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{safetyRating}</span></div>
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Safety</span>
                          </div>
                          <div style={{ flex: 1, background: 'var(--bg-surface-elevated)', padding: '0.4rem', borderRadius: '4px', border: `1px solid ${accuracy.isOverpriced ? 'var(--error)' : 'var(--success)'}`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: accuracy.isOverpriced ? 'var(--error)' : 'var(--success)' }}><TrendingUp size={13} /> <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{accuracy.score}/10</span></div>
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Price Value</span>
                          </div>
                        </div>
                        {p.amenities?.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.5rem' }}>
                            {p.amenities.map((am, i) => <span key={i} style={{ fontSize: '0.6rem', padding: '0.1rem 0.35rem', background: 'var(--accent-primary)', color: 'white', borderRadius: '4px', textTransform: 'capitalize' }}>{am}</span>)}
                          </div>
                        )}
                        {p.expectations?.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.75rem' }}>
                            {p.expectations.map((ex, i) => <span key={i} style={{ fontSize: '0.6rem', padding: '0.1rem 0.35rem', background: 'rgba(239,68,68,0.15)', color: 'var(--error)', border: '1px solid var(--error)', borderRadius: '4px', textTransform: 'capitalize' }}>{ex}</span>)}
                          </div>
                        )}
                        <button onClick={() => setActiveChatUser({ id: p.ownerId, name: 'Owner' })} style={{ marginTop: 'auto', width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'background 0.2s', fontWeight: 600, fontSize: '0.85rem' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-surface-elevated)'}>
                          <MessageSquare size={15} /> Message Owner
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* MY REQUESTS VIEW */}
          <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingRight: '0.5rem', visibility: viewMode === 'myrequests' ? 'visible' : 'hidden', opacity: viewMode === 'myrequests' ? 1 : 0, transition: 'opacity 0.3s', padding: '0 0.5rem 1rem 0' }}>
            {myRequests.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <FileText size={40} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.4 }} />
                <p style={{ margin: '0 0 1rem 0' }}>No custom requests yet.</p>
                <button onClick={() => setShowReqForm(true)} style={{ background: 'var(--accent-gradient)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, border: 'none' }}>Post Your First Request</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Open Requests */}
                {openRequests.length > 0 && (<>
                  <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}><Clock size={16} color="var(--warning)" /> Open Requests ({openRequests.length})</h3>
                  {openRequests.map(r => (
                    <div key={r.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>{r.requirement}</p>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Posted: {new Date(r.timestamp).toLocaleDateString()}</span>
                        </div>
                        <span style={{ background: urgencyBg(r.urgency), color: urgencyColor(r.urgency), padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, border: `1px solid ${urgencyColor(r.urgency)}`, flexShrink: 0 }}>{r.urgency}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--accent-primary)', fontWeight: 700, fontSize: '1rem' }}>Max: ₹{r.budget.toLocaleString()}/mo</span>
                        <button onClick={() => handleMarkSatisfied(r.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                          <CheckCircle2 size={15} /> Mark Satisfied
                        </button>
                      </div>
                    </div>
                  ))}
                </>)}
                
                {/* Resolved Requests */}
                {resolvedRequests.length > 0 && (<>
                  <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}><CheckCircle2 size={16} color="var(--success)" /> Resolved ({resolvedRequests.length})</h3>
                  {resolvedRequests.map(r => (
                    <div key={r.id} className="glass-panel" style={{ padding: '1.25rem', opacity: 0.65 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', margin: '0 0 0.25rem 0', textDecoration: 'line-through', opacity: 0.7 }}>{r.requirement}</p>
                          {r.resolvedByBrokerName && <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Resolved with help from: <b style={{ color: 'var(--success)' }}>{r.resolvedByBrokerName}</b></p>}
                          {!r.resolvedByBrokerName && <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Marked satisfied by you.</p>}
                        </div>
                        <span style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>RESOLVED</span>
                      </div>
                    </div>
                  ))}
                </>)}
              </div>
            )}
          </div>
        </div>
      </div>

      {compareList.length > 0 && <ComparisonView />}

      {/* Post Broker Request Modal */}
      {showReqForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: 500, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Post Broker Requirement</h2>
              <button onClick={() => setShowReqForm(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleRequestSubmit} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Describe exactly what you need *</label>
                <textarea required value={reqData.requirement} onChange={e => setReqData({...reqData, requirement: e.target.value})} style={{ width: '100%', height: 90, padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', outline: 'none', resize: 'none' }} placeholder="e.g. Need a fully furnished 2BHK near Tech Park for a family..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Max Monthly Budget (₹) *</label>
                  <input required type="number" min="1000" value={reqData.budget} onChange={e => setReqData({...reqData, budget: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', outline: 'none' }} placeholder="35000" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Urgency *</label>
                  <select required value={reqData.urgency} onChange={e => setReqData({...reqData, urgency: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', outline: 'none' }}>
                    <option value="High">High (Immediate)</option>
                    <option value="Medium">Medium (1-2 Weeks)</option>
                    <option value="Low">Low (Next Month)</option>
                  </select>
                </div>
              </div>
              <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--accent-gradient)', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Post Request To Brokers</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
