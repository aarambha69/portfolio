import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/admin.69" />;
};

import { useState, useEffect } from 'react';
import axios from 'axios';
import Maintenance from './pages/Maintenance';
import { getApiUrl } from './config/api';

function App() {
  const [maintenance, setMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(getApiUrl('settings_public'))
      .then(res => {
        setMaintenance(res.data.maintenance_mode);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return null; // Or a unified loader

  // Check if we show maintenance page
  const isAdminRoute = window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/api'); // api usually handled by backend, but safe to exclude

  if (maintenance && !isAdminRoute) {
    return <Maintenance />;
  }

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin.69" element={<Login />} />
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
