import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { MOCK_PROPERTIES, MOCK_NOTIFICATIONS } from '../data/mockData';
import { getCommuteInfo } from '../utils/commute';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [properties, setProperties] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]); 
  const [chats, setChats] = useState([]); 
  const [activeChatUser, setActiveChatUser] = useState(null); 
  const [customRequests, setCustomRequests] = useState([]);
  const [resolvedCounts, setResolvedCounts] = useState({}); // brokerId -> count
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({ maxPrice: 60000, maxCommute: 60, amenities: [], expectations: [], desiredLocations: [] });
  const [compareList, setCompareList] = useState([]);

  useEffect(() => {
    const storedProps = localStorage.getItem('commuteiq_properties');
    setProperties(storedProps ? JSON.parse(storedProps) : MOCK_PROPERTIES);

    const storedNotifs = localStorage.getItem('commuteiq_notifs');
    setNotifications(storedNotifs ? JSON.parse(storedNotifs) : MOCK_NOTIFICATIONS);

    const storedSubs = localStorage.getItem('commuteiq_subscriptions');
    if (storedSubs) setSubscriptions(JSON.parse(storedSubs));
    
    const storedChats = localStorage.getItem('commuteiq_chats');
    if (storedChats) setChats(JSON.parse(storedChats));

    const storedReqs = localStorage.getItem('commuteiq_custom_requests');
    if (storedReqs) setCustomRequests(JSON.parse(storedReqs));

    const storedCounts = localStorage.getItem('commuteiq_resolved_counts');
    if (storedCounts) setResolvedCounts(JSON.parse(storedCounts));
    
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('commuteiq_properties', JSON.stringify(properties));
      localStorage.setItem('commuteiq_notifs', JSON.stringify(notifications));
      localStorage.setItem('commuteiq_subscriptions', JSON.stringify(subscriptions));
      localStorage.setItem('commuteiq_chats', JSON.stringify(chats));
      localStorage.setItem('commuteiq_custom_requests', JSON.stringify(customRequests));
      localStorage.setItem('commuteiq_resolved_counts', JSON.stringify(resolvedCounts));
    }
  }, [properties, notifications, subscriptions, chats, customRequests, resolvedCounts, loading]);

  useEffect(() => {
    if (activeChatUser && currentUser && chats.length > 0) {
      const hasUnread = chats.some(c => c.senderId === activeChatUser.id && c.receiverId === currentUser.id && !c.read);
      if (hasUnread) {
        setChats(prev => prev.map(c => 
          (c.senderId === activeChatUser.id && c.receiverId === currentUser.id && !c.read) 
          ? { ...c, read: true } : c
        ));
      }
    }
  }, [activeChatUser, currentUser, chats]);

  const sendMessage = (receiverId, text) => {
    if (!currentUser) return;
    
    const allUsers = JSON.parse(localStorage.getItem('commuteiq_all_users') || '[]');
    let receiverName = 'User';
    if (receiverId === 'sys_support') receiverName = 'CommuteIQ Support';
    else {
      const u = allUsers.find(x => x.id === receiverId);
      if (u) receiverName = u.name;
    }

    const newMsg = {
      id: `msg_${Date.now()}_${Math.random()}`,
      senderId: currentUser.id,
      senderName: currentUser.name || 'User',
      receiverId,
      receiverName,
      text,
      timestamp: Date.now(),
      read: false
    };
    
    setChats(prev => [...prev, newMsg]);

    if (receiverId !== 'sys_support') {
      setNotifications(prev => [{
        id: `n_${Date.now()}_msg`,
        type: 'message',
        userId: receiverId,
        message: `New chat message from ${currentUser.name || 'User'}.`,
        read: false,
        timestamp: Date.now()
      }, ...prev]);
    } else {
      setTimeout(() => {
        setChats(prev => [...prev, {
          id: `msg_${Date.now()}_sysrep`,
          senderId: 'sys_support',
          senderName: 'CommuteIQ Support',
          receiverId: currentUser.id,
          receiverName: currentUser.name || 'User',
          text: "Thank you for reaching out! Our support team has received your query and will assist you shortly.",
          timestamp: Date.now(),
          read: false
        }]);
      }, 1200);
    }
  };

  const filteredProperties = useMemo(() => {
    return properties.map(property => {
      let bestCommute = { distance: 0, time: 0 };
      if (filters.desiredLocations.length > 0) {
        let minTime = Infinity; let bestDist = 0;
        filters.desiredLocations.forEach(loc => {
          const commute = getCommuteInfo(loc, property.location);
          if (commute.time < minTime) { minTime = commute.time; bestDist = commute.distance; }
        });
        bestCommute = { distance: bestDist, time: minTime };
      } else if (currentUser?.workplace) {
        bestCommute = getCommuteInfo(currentUser.workplace, property.location);
      }
      return { ...property, commute: bestCommute };
    }).filter(p => {
      if (p.price > filters.maxPrice) return false;
      const hasTargetSet = filters.desiredLocations.length > 0 || currentUser?.workplace;
      if (hasTargetSet && p.commute.time > filters.maxCommute) return false;
      if (filters.expectations.length > 0 && !filters.expectations.some(e => p.expectations.includes(e))) return false;
      if (filters.amenities.length > 0 && !filters.amenities.every(a => p.amenities.includes(a))) return false;
      return true;
    });
  }, [properties, filters, currentUser]);

  const toggleCompare = (property) => {
    setCompareList(prev => {
      if (prev.find(p => p.id === property.id)) return prev.filter(p => p.id !== property.id);
      if (prev.length >= 2) { alert("Compare 2 properties max."); return prev; }
      return [...prev, property];
    });
  };

  const clearCompare = () => setCompareList([]);
  
  const markNotificationRead = (id) => setNotifications(prev => prev.filter(n => n.id !== id));

  const setPropertyStatus = (id, status) => {
    const prop = properties.find(p => p.id === id);
    if (!prop) return;

    if (prop.status === 'occupied' && status === 'available') {
      const activeSubs = subscriptions.filter(s => s.propertyId === id);
      if (activeSubs.length > 0) {
        const newNotifs = activeSubs.map(s => ({
          id: `n_${Date.now()}_${s.userId}_${Math.random()}`,
          type: 'availability',
          propertyId: id,
          message: `Alert! The property "${prop.title}" you were watching is now AVAILABLE for rent!`,
          read: false,
          userId: s.userId,
          timestamp: Date.now()
        }));
        setNotifications(nprev => [...newNotifs, ...nprev]);
      }
    }
    
    setProperties(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };
  
  const subscribeToProperty = (propertyId) => {
    if (!currentUser) return;
    if (subscriptions.find(s => s.propertyId === propertyId && s.userId === currentUser.id)) {
      alert("You are already subscribed to alerts for this property.");
      return;
    }
    setSubscriptions(prev => [...prev, { userId: currentUser.id, propertyId }]);
    
    setNotifications(prev => [{
      id: `n_${Date.now()}_sub_${Math.random()}`,
      type: 'system',
      userId: currentUser.id,
      message: `Reminder active. You will be notified when property becomes available.`,
      read: false,
      timestamp: Date.now()
    }, ...prev]);
    
    alert("Alert Set! You will be notified when this property becomes available.");
  };

  const addProperty = (propertyData) => {
    setProperties(prev => [{ id: `p_${Date.now()}`, status: 'available', ownerId: currentUser?.id, brokerId: 'u2', reviews: [], ...propertyData }, ...prev]);
  };

  const editProperty = (id, propertyData) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, ...propertyData } : p));
  };

  const deleteProperty = (id) => {
    if (!window.confirm("Are you sure you want to delete this property completely? This action cannot be undone.")) return;
    setProperties(prev => prev.filter(p => p.id !== id));
    setSubscriptions(prev => prev.filter(s => s.propertyId !== id));
  };

  const addCustomRequest = (requestData) => {
    const newReq = { id: `req_${Date.now()}`, renterId: currentUser.id, renterName: currentUser.name, timestamp: Date.now(), status: 'open', resolvedByBrokerId: null, resolvedByBrokerName: null, ...requestData };
    setCustomRequests(prev => [newReq, ...prev]);
    alert("Post submitted! Brokers will review your requirement and message you.");
  };
  
  // brokerId = null means Renter resolved it themselves (no score increment)
  const resolveCustomRequest = (reqId, brokerId = null, brokerName = null) => {
    setCustomRequests(prev => prev.map(r => 
      r.id === reqId ? { ...r, status: 'resolved', resolvedByBrokerId: brokerId, resolvedByBrokerName: brokerName } : r
    ));
    if (brokerId) {
      setResolvedCounts(prev => ({ ...prev, [brokerId]: (prev[brokerId] || 0) + 1 }));
    }
  };

  return (
    <AppContext.Provider value={{
      properties: filteredProperties, allProperties: properties,
      filters, setFilters, compareList, toggleCompare, clearCompare,
      notifications, markNotificationRead, setPropertyStatus, addProperty, editProperty, deleteProperty,
      subscribeToProperty, subscriptions,
      chats, sendMessage, activeChatUser, setActiveChatUser,
      customRequests, addCustomRequest, resolveCustomRequest, resolvedCounts
    }}>
      {!loading && children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
