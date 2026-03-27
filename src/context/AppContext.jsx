import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { MOCK_PROPERTIES, MOCK_NOTIFICATIONS } from '../data/mockData';
import { getCommuteInfo } from '../utils/commute';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [properties, setProperties] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [filters, setFilters] = useState({
    maxPrice: 60000,
    maxCommute: 60, // minutes
    amenities: [],
    expectations: []
  });

  const [compareList, setCompareList] = useState([]);

  useEffect(() => {
    // Seed properties into localStorage safely
    const storedProps = localStorage.getItem('commuteiq_properties');
    if (storedProps) {
      setProperties(JSON.parse(storedProps));
    } else {
      setProperties(MOCK_PROPERTIES);
      localStorage.setItem('commuteiq_properties', JSON.stringify(MOCK_PROPERTIES));
    }

    const storedNotifs = localStorage.getItem('commuteiq_notifs');
    if (storedNotifs) {
      setNotifications(JSON.parse(storedNotifs));
    } else {
      setNotifications(MOCK_NOTIFICATIONS);
      localStorage.setItem('commuteiq_notifs', JSON.stringify(MOCK_NOTIFICATIONS));
    }
    
    setLoading(false);
  }, []);

  // Save properties back to local storage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('commuteiq_properties', JSON.stringify(properties));
    }
  }, [properties, loading]);

  // Save notifications
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('commuteiq_notifs', JSON.stringify(notifications));
    }
  }, [notifications, loading]);

  const filteredProperties = useMemo(() => {
    return properties.map(property => {
      let commute = { distance: 0, time: 0 };
      if (currentUser?.workplace) {
        commute = getCommuteInfo(currentUser.workplace, property.location);
      }
      return { ...property, commute };
    }).filter(p => {
      if (p.price > filters.maxPrice) return false;
      if (currentUser?.workplace && p.commute.time > filters.maxCommute) return false;
      if (filters.expectations.length > 0) {
        const hasExpectation = filters.expectations.some(e => p.expectations.includes(e));
        if (!hasExpectation) return false;
      }
      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every(a => p.amenities.includes(a));
        if (!hasAllAmenities) return false;
      }
      return true;
    });
  }, [properties, filters, currentUser]);

  const toggleCompare = (property) => {
    setCompareList(prev => {
      if (prev.find(p => p.id === property.id)) {
        return prev.filter(p => p.id !== property.id);
      }
      if (prev.length >= 2) {
        alert("You can only compare 2 properties at once.");
        return prev;
      }
      return [...prev, property];
    });
  };

  const clearCompare = () => setCompareList([]);

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const setPropertyStatus = (id, status) => {
    setProperties(prev => prev.map(p => {
      if (p.id === id) {
        if (p.status === 'occupied' && status === 'available') {
          setNotifications(nprev => [{
            id: `n_${Date.now()}`,
            type: 'availability',
            propertyId: id,
            message: `Property "${p.title}" is now available!`,
            read: false,
            userId: 'all' // In real app, target specific users.
          }, ...nprev]);
        }
        return { ...p, status };
      }
      return p;
    }));
  };
  
  // For owners to add a completely new mock property
  const addProperty = (propertyData) => {
    const newProperty = {
      id: `p_${Date.now()}`,
      status: 'available',
      ownerId: currentUser?.id,
      brokerId: 'u2', // Assign default broker for now
      reviews: [],
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&auto=format&fit=crop&q=60'],
      ...propertyData
    };
    setProperties(prev => [newProperty, ...prev]);
  };

  return (
    <AppContext.Provider value={{
      properties: filteredProperties, allProperties: properties,
      filters, setFilters,
      compareList, toggleCompare, clearCompare,
      notifications, markNotificationRead,
      setPropertyStatus, addProperty
    }}>
      {!loading && children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
