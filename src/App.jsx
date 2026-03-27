import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import ChatWidget from './components/ChatWidget';
import Login from './pages/Login';
import Register from './pages/Register';
import RenterDashboard from './pages/RenterDashboard';
import BrokerDashboard from './pages/BrokerDashboard';
import OwnerDashboard from './pages/OwnerDashboard';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Loading Identity...</div>;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />; // Redirect if wrong role
  }
  return children;
};

// Layout with Globals like Navbar and ChatWidget
const AppLayout = ({ children }) => {
  return (
    <AppProvider>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Navbar />
        <main style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {children}
        </main>
        <ChatWidget />
      </div>
    </AppProvider>
  );
};

// Route Decider for Homepage ('/')
const DashboardRouter = () => {
  const { currentUser } = useAuth();
  
  if (currentUser?.role === 'owner') return <OwnerDashboard />;
  if (currentUser?.role === 'broker') return <BrokerDashboard />;
  return <RenterDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout>
                <DashboardRouter />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
