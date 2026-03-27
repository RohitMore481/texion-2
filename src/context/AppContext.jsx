import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { MOCK_PROPERTIES, MOCK_USERS, MOCK_NOTIFICATIONS } from '../data/mockData';
import { getCommuteInfo } from '../utils/commute';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Current user (can be swapped for demo)
  const [currentUser, setCurrentUser] = useState(MOCK_USERS[0]); // Renter by default
  const [properties, setProperties] = useState(MOCK_PROPERTIES);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  
  // Search state
  const [filters, setFilters] = useState({
    maxPrice: 50000,
    maxCommute: 60, // minutes
    amenities: [],
    expectations: []
  });

  const [compareList, setCompareList] = useState([]);

  // Derived properties with commute calculated if the user is a renter with a workplace
  const filteredProperties = useMemo(() => {
    return properties.map(property => {
      let commute = { distance: 0, time: 0 };
      if (currentUser?.workplace) {
        commute = getCommuteInfo(currentUser.workplace, property.location);
      }
      return { ...property, commute };
    }).filter(p => {
      // 1. Price check
      if (p.price > filters.maxPrice) return false;
      // 2. Commute check
      if (currentUser?.workplace && p.commute.time > filters.maxCommute) return false;
      // 3. Expectations check (property expectations must NOT completely reject user settings, simplified to exact match for testing)
      if (filters.expectations.length > 0) {
        // Here we just test if the property has any of the selected expectations directly
        const hasExpectation = filters.expectations.some(e => p.expectations.includes(e));
        if (!hasExpectation) return false;
      }
      // 4. Amenities check (must have all selected)
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

  // Simulate notification when an occupied property becomes available
  const setPropertyStatus = (id, status) => {
    setProperties(prev => prev.map(p => {
      if (p.id === id) {
        if (p.status === 'occupied' && status === 'available') {
          // Push notification
          setNotifications(nprev => [{
            id: `n_${Date.now()}`,
            type: 'availability',
            propertyId: id,
            message: `Property "${p.title}" you watched is now available!`,
            read: false
          }, ...nprev]);
        }
        return { ...p, status };
      }
      return p;
    }));
  };

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser, users: MOCK_USERS,
      properties: filteredProperties, allProperties: properties,
      filters, setFilters,
      compareList, toggleCompare, clearCompare,
      notifications, markNotificationRead,
      setPropertyStatus
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
