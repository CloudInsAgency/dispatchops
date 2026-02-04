import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiAlertTriangle, FiCreditCard, FiLogOut } from 'react-icons/fi';

const TrialGate = ({ children }) => {
  const { userProfile, currentUser, loading, logout } = useAuth();
  const navigate = useNavigate();

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

  // Techs bypass trial gate — they don't own subscriptions
  if (userProfile?.role === 'tech') {
    return children;
  }

  // Check subscription status
  const subscription = userProfile?.subscription;
  const companyStatus = userProfile?.company?.subscriptionStatus;

  // Active paid subscription — always allow
  if (subscription?.status === 'active' && subscription?.stripeSubscriptionId) {
    return children;
  }

  // Check if trialing
  const isTrialing = subscription?.status === 'trialing' || companyStatus === 'trialing';

  if (isTrialing) {
    // Check if trial has expired
    const trialEndsAt = subscription?.trialEndsAt?.toDate?.() 
      || userProfile?.company?.trialEndsAt?.toDate?.()
      || null;

    if (trialEndsAt) {
      const now = new Date();
      const daysLeft = Math.ceil((trialEndsAt - now) / (1000 * 60 * 60 * 24));

      if (daysLeft <= 0) {
        // Trial expired — block access
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 text-center">
              <div className="bg-red-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-6">
                <FiAlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">Your Free Trial Has Ended</h1>
              <p className="text-gray-600 mb-2">
                Your 14-day free trial expired on {trialEndsAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
              </p>
              <p className="text-gray-600 mb-8">
                Subscribe to a plan to continue using Cloud Dispatch Ops and keep managing your team.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/billing')}
                  className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition flex items-center justify-center gap-2"
                >
                  <FiCreditCard className="h-5 w-5" /> Choose a Plan
                </button>
                <button
                  onClick={async () => { await logout(); navigate('/'); }}
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <FiLogOut className="h-5 w-5" /> Sign Out
                </button>
              </div>

              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Your data is safe!</strong> All your technicians, jobs, and settings are preserved. Subscribe to pick up right where you left off.
                </p>
              </div>
            </div>
          </div>
        );
      }
    }

    // Trial still active — allow access
    return children;
  }

  // Cancelled subscription — block access
  if (subscription?.status === 'cancelled' || companyStatus === 'cancelled') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 text-center">
          <div className="bg-yellow-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-6">
            <FiAlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Subscription Inactive</h1>
          <p className="text-gray-600 mb-8">
            Your subscription has been cancelled. Resubscribe to continue using Cloud Dispatch Ops.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/billing')}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition flex items-center justify-center gap-2"
            >
              <FiCreditCard className="h-5 w-5" /> Resubscribe
            </button>
            <button
              onClick={async () => { await logout(); navigate('/'); }}
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <FiLogOut className="h-5 w-5" /> Sign Out
            </button>
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Your data is safe!</strong> All your technicians, jobs, and settings are preserved.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Default: allow access (covers edge cases, users with no subscription data yet)
  return children;
};

export default TrialGate;
