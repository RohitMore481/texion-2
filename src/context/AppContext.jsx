import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { MOCK_PROPERTIES, MOCK_NOTIFICATIONS } from '../data/mockData';
import { getCommuteInfo } from '../utils/commute';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [properties, setProperties] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]); // { userId, propertyId }
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
    
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('commuteiq_properties', JSON.stringify(properties));
      localStorage.setItem('commuteiq_notifs', JSON.stringify(notifications));
      localStorage.setItem('commuteiq_subscriptions', JSON.stringify(subscriptions));
    }
  }, [properties, notifications, subscriptions, loading]);

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

  const markNotificationRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const setPropertyStatus = (id, status) => {
    setProperties(prev => prev.map(p => {
      if (p.id === id) {
        if (p.status === 'occupied' && status === 'available') {
          // Check for subscriptions to send alert
          const activeSubs = subscriptions.filter(s => s.propertyId === id);
          if (activeSubs.length > 0) {
            const newNotifs = activeSubs.map(s => ({
              id: `n_${Date.now()}_${s.userId}`,
              type: 'availability',
              propertyId: id,
              message: `Alert! The property "${p.title}" you were watching is now AVAILABLE for rent!`,
              read: false,
              userId: s.userId
            }));
            setNotifications(nprev => [...newNotifs, ...nprev]);
          }
        }
        return { ...p, status };
      }
      return p;
    }));
  };
  
  const subscribeToProperty = (propertyId) => {
    if (!currentUser) return;
    if (subscriptions.find(s => s.propertyId === propertyId && s.userId === currentUser.id)) {
      alert("You are already subscribed to alerts for this property.");
      return;
    }
    setSubscriptions(prev => [...prev, { userId: currentUser.id, propertyId }]);
    alert("Alert Set! You will be notified when this property becomes available.");
  };

  const addProperty = (propertyData) => {
    setProperties(prev => [{ id: `p_${Date.now()}`, status: 'available', ownerId: currentUser?.id, brokerId: 'u2', reviews: [], ...propertyData }, ...prev]);
  };

  return (
    <AppContext.Provider value={{
      properties: filteredProperties, allProperties: properties,
      filters, setFilters, compareList, toggleCompare, clearCompare,
      notifications, markNotificationRead, setPropertyStatus, addProperty,
      subscribeToProperty, subscriptions
    }}>
      {!loading && children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
