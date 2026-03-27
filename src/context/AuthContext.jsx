import { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS } from '../data/mockData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage on load
    const storedUser = localStorage.getItem('commuteiq_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    
    // Seed users to local storage if not exists
    const storedUsersList = localStorage.getItem('commuteiq_all_users');
    if (!storedUsersList) {
      // Add secure mock passwords to MOCK_USERS
      const defaultUsers = MOCK_USERS.map(u => ({ ...u, username: u.name.split(' ')[0].toLowerCase(), password: 'password123' }));
      localStorage.setItem('commuteiq_all_users', JSON.stringify(defaultUsers));
    }
    
    setLoading(false);
  }, []);

  const login = (username, password) => {
    const users = JSON.parse(localStorage.getItem('commuteiq_all_users') || '[]');
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('commuteiq_user', JSON.stringify(user));
      return { success: true };
    }
    return { success: false, message: 'Invalid username or password' };
  };

  const register = (userData) => {
    const users = JSON.parse(localStorage.getItem('commuteiq_all_users') || '[]');
    
    if (users.find(u => u.username === userData.username)) {
      return { success: false, message: 'Username already exists' };
    }
    
    const newUser = {
      id: `u_${Date.now()}`,
      ...userData
    };
    
    users.push(newUser);
    localStorage.setItem('commuteiq_all_users', JSON.stringify(users));
    
    setCurrentUser(newUser);
    localStorage.setItem('commuteiq_user', JSON.stringify(newUser));
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('commuteiq_user');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
