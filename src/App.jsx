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
import TechniciansPage from './components/dispatch/TechniciansPage';
import AppShell from './components/layout/AppShell';
import SettingsPage from './components/settings/SettingsPage';
import BillingPage from './components/billing/BillingPage';
import ReportsPage from './components/reports/ReportsPage';
import HelpCenterPage from './components/pages/HelpCenterPage';
import ContactPage from './components/pages/ContactPage';
import SystemStatusPage from './components/pages/SystemStatusPage';
import AboutPage from './components/pages/AboutPage';
import PrivacyPolicyPage from './components/pages/PrivacyPolicyPage';
import TermsOfServicePage from './components/pages/TermsOfServicePage';

const AdminLayout = ({ children }) => (
  <ProtectedRoute>
    <AppShell>{children}</AppShell>
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/tech" element={<TechLogin />} />
        <Route path="/tech/dashboard" element={<ProtectedRoute><TechDashboard /></ProtectedRoute>} />
        <Route path="/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/technicians" element={<AdminLayout><TechniciansPage /></AdminLayout>} />
        <Route path="/settings" element={<AdminLayout><SettingsPage /></AdminLayout>} />
        <Route path="/billing" element={<AdminLayout><BillingPage /></AdminLayout>} />
            <Route path="/reports" element={<AdminLayout><ReportsPage /></AdminLayout>} />
        <Route path="/dispatch" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dispatch/technicians" element={<Navigate to="/technicians" replace />} />
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingFlow /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
