import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './components/landing/LandingPage';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import ProtectedRoute from './components/ProtectedRoute';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import Dashboard from './components/dashboard/Dashboard';
import TechLogin from './components/tech/TechLogin';
import TechDashboard from './components/tech/TechDashboard';
import DispatchDashboard from './components/dispatch/DispatchDashboard';
import TechniciansPage from './components/dispatch/TechniciansPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Technician Routes */}
        <Route path="/tech" element={<TechLogin />} />
        <Route
          path="/tech/dashboard"
          element={
            <ProtectedRoute>
              <TechDashboard />
            </ProtectedRoute>
          }
        />

        {/* Dispatcher Routes */}
        <Route
          path="/dispatch"
          element={
            <ProtectedRoute>
              <DispatchDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dispatch/technicians"
          element={
            <ProtectedRoute>
              <TechniciansPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingFlow />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;