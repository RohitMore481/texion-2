import { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS } from '../data/mockData';
import { auth } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [useFirebase, setUseFirebase] = useState(false); // Flag if firebase succeeds

  useEffect(() => {
    // Seed initial Mock DB if needed (for fallback support)
    const storedUsersList = localStorage.getItem('commuteiq_all_users');
    if (!storedUsersList) {
      const defaultUsers = MOCK_USERS.map(u => ({ 
        ...u, 
        email: `${u.name.split(' ')[0].toLowerCase()}@test.com`, // Converted name to email
        password: 'password123', 
        avatarUrl: '' 
      }));
      localStorage.setItem('commuteiq_all_users', JSON.stringify(defaultUsers));
    }

    // Attempt Firebase Listening
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          // If valid firebase user, merge with our local DB profile data
          setUseFirebase(true);
          const users = JSON.parse(localStorage.getItem('commuteiq_all_users') || '[]');
          let profile = users.find(u => u.id === user.uid);
          
          if (profile) {
            setCurrentUser(profile);
            localStorage.setItem('commuteiq_user', JSON.stringify(profile));
          } else {
            // Fallback for unexpected missing local profile but valid firebase auth
            setCurrentUser({ id: user.uid, email: user.email, name: 'Firebase User', role: 'renter' });
          }
        } else {
          // Check if we have a local fallback session (Mock Identity)
          const storedUser = localStorage.getItem('commuteiq_user');
          if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
          } else {
            setCurrentUser(null);
          }
        }
        setLoading(false);
      }, (error) => {
        console.warn("Firebase Init Error (Using Mock Fallback):", error.message);
        setUseFirebase(false);
        const storedUser = localStorage.getItem('commuteiq_user');
        if (storedUser) setCurrentUser(JSON.parse(storedUser));
        setLoading(false);
      });
      return unsubscribe;
    } catch (e) {
      console.warn("Firebase blocked. Falling back to Mock DB entirely.");
      const storedUser = localStorage.getItem('commuteiq_user');
      if (storedUser) setCurrentUser(JSON.parse(storedUser));
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      // Attempt Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Wait for onAuthStateChanged to pick it up or return immediately
      return { success: true };
    } catch (error) {
      console.warn("Firebase Login Failed:", error.message, "-> Attempting Local Mock DB Login.");
      // Fallback Mock Logic
      const users = JSON.parse(localStorage.getItem('commuteiq_all_users') || '[]');
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('commuteiq_user', JSON.stringify(user));
        return { success: true };
      }
      return { success: false, message: 'Invalid email or password' };
    }
  };

  const register = async (userData) => {
    try {
      // Attempt Firebase Auth Creation
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      
      const newUser = {
        id: userCredential.user.uid,
        avatarUrl: '', 
        ...userData
      };
      
      // Store extended profile in mock DB
      const users = JSON.parse(localStorage.getItem('commuteiq_all_users') || '[]');
      users.push(newUser);
      localStorage.setItem('commuteiq_all_users', JSON.stringify(users));
      
      setCurrentUser(newUser);
      localStorage.setItem('commuteiq_user', JSON.stringify(newUser));
      return { success: true };

    } catch (error) {
      console.warn("Firebase Register Failed:", error.message, "-> Attempting Local Mock DB Register.");
      
      // Fallback Mock Logic
      const users = JSON.parse(localStorage.getItem('commuteiq_all_users') || '[]');
      if (users.find(u => u.email === userData.email)) {
        return { success: false, message: 'Email already exists' };
      }
      
      const newUser = {
        id: `m_${Date.now()}`,
        avatarUrl: '', 
        ...userData
      };
      
      users.push(newUser);
      localStorage.setItem('commuteiq_all_users', JSON.stringify(users));
      
      setCurrentUser(newUser);
      localStorage.setItem('commuteiq_user', JSON.stringify(newUser));
      return { success: true };
    }
  };

  const updateProfile = (updates) => {
    if (!currentUser) return;
    
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    localStorage.setItem('commuteiq_user', JSON.stringify(updatedUser));

    const users = JSON.parse(localStorage.getItem('commuteiq_all_users') || '[]');
    const newUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    localStorage.setItem('commuteiq_all_users', JSON.stringify(newUsers));
  };

  const logoutTask = async () => {
    try {
      if (auth.currentUser) await signOut(auth);
    } catch(e) {}
    setCurrentUser(null);
    localStorage.removeItem('commuteiq_user');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout: logoutTask, loading, updateProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
