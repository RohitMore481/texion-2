import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import RenterDashboard from './pages/RenterDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import BrokerDashboard from './pages/BrokerDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function RoleBasedRouter() {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to correct dashboard based on role
  if (currentUser.role === 'renter') return <Navigate to="/renter" replace />;
  if (currentUser.role === 'broker') return <Navigate to="/broker" replace />;
  if (currentUser.role === 'owner') return <Navigate to="/owner" replace />;

  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        {/* Navbar is rendered globally, but only displays when authenticated */}
        <Navbar />

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<RoleBasedRouter />} />

          <Route path="/renter" element={
            <ProtectedRoute allowedRoles={['renter']}>
              <RenterDashboard />
            </ProtectedRoute>
          } />

          <Route path="/owner" element={
            <ProtectedRoute allowedRoles={['owner']}>
              <OwnerDashboard />
            </ProtectedRoute>
          } />

          <Route path="/broker" element={
            <ProtectedRoute allowedRoles={['broker']}>
              <BrokerDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
