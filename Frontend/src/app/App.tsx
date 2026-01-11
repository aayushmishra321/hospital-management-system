import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { jwtDecode } from 'jwt-decode';

import { AuthContext } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { NotFound } from './components/NotFound';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LandingPage } from './pages/LandingPage';
import { PremiumLandingPage } from './pages/PremiumLandingPage';
import { HealthcareLanding } from './pages/HealthcareLanding';
import { HealthcareAbout } from './pages/HealthcareAbout';
import { HealthcareServices } from './pages/HealthcareServices';
import { HealthcareContact } from './pages/HealthcareContact';
import { LoginPage } from './pages/LoginPage';
import Register from './pages/Register';

import { EnhancedPremiumDashboard } from './pages/PremiumDashboard';

interface JwtPayload {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function App() {
  const [user, setUser] = useState<any>(null);

  // 🔁 Restore user from JWT on refresh
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        setUser({
          id: decoded.id,
          name: decoded.name,
          email: decoded.email,
          role: decoded.role
        });
      } catch {
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = (userData: any) => {
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (userData: any) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  return (
    <ErrorBoundary>
      <AuthContext.Provider value={{ user, login, logout, updateUser }}>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">

            <Routes>

            {/* HEALTHCARE WEBSITE PAGES */}
            <Route path="/" element={<HealthcareLanding />} />
            <Route path="/about" element={<HealthcareAbout />} />
            <Route path="/services" element={<HealthcareServices />} />
            <Route path="/contact" element={<HealthcareContact />} />
            
            {/* ALTERNATIVE LANDING PAGES */}
            <Route path="/premium" element={<PremiumLandingPage />} />
            <Route path="/original" element={<LandingPage />} />

            {/* AUTH ROUTES */}
            <Route
              path="/login"
              element={!user ? <LoginPage /> : <Navigate to="/dashboard" />}
            />

            <Route
              path="/register"
              element={!user ? <Register /> : <Navigate to="/dashboard" />}
            />

            {/* UNIFIED DASHBOARD ROUTE FOR ALL ROLES */}
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute allowedRoles={['admin', 'doctor', 'patient', 'receptionist']}>
                  <EnhancedPremiumDashboard />
                </ProtectedRoute>
              }
            />

            {/* LEGACY ROLE BASED ROUTES - REDIRECT TO UNIFIED DASHBOARD */}
            <Route
              path="/admin/*"
              element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" />}
            />

            <Route
              path="/doctor/*"
              element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" />}
            />

            <Route
              path="/patient/*"
              element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" />}
            />

            <Route
              path="/receptionist/*"
              element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" />}
            />

            {/* CATCH-ALL ROUTES FOR PROFILE AND SETTINGS */}
            <Route
              path="/profile"
              element={user ? <Navigate to="/dashboard/profile" replace /> : <Navigate to="/login" />}
            />
            
            <Route
              path="/settings"
              element={user ? <Navigate to="/dashboard/settings" replace /> : <Navigate to="/login" />}
            />

            {/* CATCH-ALL ROUTE FOR UNKNOWN PATHS */}
            <Route path="*" element={<NotFound />} />

          </Routes>

          <Toaster position="top-right" richColors />
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
    </ErrorBoundary>
  );
}
