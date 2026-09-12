import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Gate for signed-in routes.
 *
 * `requireRole` matters as much as the sign-in check. Without it any
 * authenticated user reached the owner dashboard, so a technician saw the
 * dispatch board, a Create Job button, Reports and Billing — then hit
 * "You do not have permission to create jobs for this company" when they
 * used them, because firestore.rules correctly allows only the company owner
 * to write. The rules were right; the UI was offering actions the caller was
 * never allowed to take.
 *
 * Techs are sent to their own dashboard rather than to the login page: they
 * are legitimately signed in, just in the wrong place.
 */
const ProtectedRoute = ({ children, requireRole }) => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // The profile arrives a tick after the auth user. Wait for it rather than
  // redirecting on a role we have not read yet.
  if (requireRole && !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireRole && userProfile.role !== requireRole) {
    return (
      <Navigate
        to={userProfile.role === 'tech' ? '/tech/dashboard' : '/dashboard'}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;
