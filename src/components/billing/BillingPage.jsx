import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePlanLimits } from '../../hooks/usePlanLimits';
import { PLANS, getRecommendedUpgrade } from '../../config/stripe';
import { FiCheck, FiArrowRight, FiExternalLink, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import UpgradeModal from '../subscription/UpgradeModal';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';

const BillingPage = () => {
  const { userProfile, currentUser } = useAuth();
  const { currentPlan, planDetails, techCount, monthlyJobCount } = usePlanLimits(userProfile);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const upgradePlan = getRecommendedUpgrade(currentPlan);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Subscription upgraded successfully! It may take a moment to reflect.', { duration: 5000 });
      setSearchParams({});
    }
    if (searchParams.get('cancelled') === 'true') {
      toast('Checkout cancelled.', { icon: '\u2139\uFE0F' });
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const subscriptionStatus = userProfile?.subscription?.status || 'active';
  const currentPeriodEnd = userProfile?.subscription?.currentPeriodEnd;
  const stripeCustomerId = userProfile?.stripeCustomerId;

  const handleManageSubscription = async () => {
    if (!stripeCustomerId) {
      toast.error('No active subscription found. Please upgrade first.');
      return;
    }
    setPortalLoading(true);
    try {
      const apiUrl = import.meta.env.DEV
        ? 'http://localhost:5173/api/create-portal-session'
        : 'https://dispatchops-three.vercel.app/api/create-portal-session';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: stripeCustomerId }),
      });
      const data = await response.json();
      if (data.error) { toast.error(data.error); }
      else { window.location.href = data.url; }
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Failed to open billing portal');
    } finally {
      setPortalLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing & Plans</h1>
        <p className="text-gray-600 mt-1">Manage your subscription and billing information</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
            <p className="text-3xl font-bold text-primary-600 mt-2">{planDetails?.name || 'Starter Plan'}</p>
            <p className="text-gray-600 mt-1">${planDetails?.price || 149.95}/month</p>
            <div className="flex items-center gap-2 mt-2">
              {subscriptionStatus === 'active' ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                  <FiCheckCircle className="h-3 w-3" /> Active
                </span>
              ) : subscriptionStatus === 'cancelled' ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                  <FiAlertCircle className="h-3 w-3" /> Cancelled
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                  {subscriptionStatus}
                </span>
              )}
              {currentPeriodEnd && (
                <span className="text-xs text-gray-500">
                  {subscriptionStatus === 'cancelled' ? 'Access until' : 'Renews'} {formatDate(currentPeriodEnd)}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {upgradePlan && (
              <button onClick={() => setShowUpgradeModal(true)} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition flex items-center gap-2">
                Upgrade Plan <FiArrowRight className="h-5 w-5" />
              </button>
            )}
            {stripeCustomerId && (
              <button onClick={handleManageSubscription} disabled={portalLoading} className="flex items-center justify-center gap-2 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm">
                <FiExternalLink className="h-4 w-4" />
                {portalLoading ? 'Opening...' : 'Manage Subscription'}
              </button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Technicians</span>
              <span className="font-medium">{techCount} / {planDetails?.techLimit || 10}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className={`h-2 rounded-full transition-all ${(techCount / (planDetails?.techLimit || 10)) >= 0.9 ? 'bg-red-500' : 'bg-primary-600'}`} style={{ width: `${Math.min((techCount / (planDetails?.techLimit || 10)) * 100, 100)}%` }} />
            </div>
            {(techCount / (planDetails?.techLimit || 10)) >= 0.9 && <p className="text-xs text-red-500 mt-1">Approaching limit</p>}
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Jobs this month</span>
              <span className="font-medium">{monthlyJobCount} / {planDetails?.jobLimit || 200}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className={`h-2 rounded-full transition-all ${(monthlyJobCount / (planDetails?.jobLimit || 200)) >= 0.9 ? 'bg-red-500' : 'bg-primary-600'}`} style={{ width: `${Math.min((monthlyJobCount / (planDetails?.jobLimit || 200)) * 100, 100)}%` }} />
            </div>
            {(monthlyJobCount / (planDetails?.jobLimit || 200)) >= 0.9 && <p className="text-xs text-red-500 mt-1">Approaching limit</p>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Plan Features</h2>
        <ul className="space-y-3">
          {planDetails?.features?.map((feature, index) => (
            <li key={index} className="flex items-center gap-3">
              <FiCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Compare Plans</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {Object.values(PLANS).map((plan) => {
            const isCurrentPlan = plan.id === currentPlan;
            const isDowngrade = PLANS[currentPlan]?.price > plan.price;
            return (
              <div key={plan.id} className={`border-2 rounded-lg p-6 transition ${isCurrentPlan ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                {isCurrentPlan && <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-primary-600 text-white mb-3">CURRENT</span>}
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">${plan.price}<span className="text-sm font-normal text-gray-500">/month</span></p>
                <ul className="mt-4 space-y-2">
                  <li className="text-sm text-gray-600 flex items-center gap-2"><FiCheck className="h-4 w-4 text-green-500" /> Up to {plan.techLimit} technicians</li>
                  <li className="text-sm text-gray-600 flex items-center gap-2"><FiCheck className="h-4 w-4 text-green-500" /> Up to {plan.jobLimit} jobs/month</li>
                  {plan.features.slice(2).map((f, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-center gap-2"><FiCheck className="h-4 w-4 text-green-500" /> {f}</li>
                  ))}
                </ul>
                {isCurrentPlan ? (
                  <div className="mt-4 text-center py-2 text-sm font-medium text-primary-600 border border-primary-300 rounded-lg bg-white">Current Plan</div>
                ) : (
                  <button onClick={() => setShowUpgradeModal(true)} className={`mt-4 w-full py-2 rounded-lg text-sm font-medium transition ${isDowngrade ? 'border border-gray-300 text-gray-600 hover:bg-gray-50' : 'bg-primary-600 text-white hover:bg-primary-700'}`}>
                    {isDowngrade ? 'Downgrade' : 'Upgrade'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} currentPlan={currentPlan} userId={currentUser?.uid} companyId={userProfile?.companyId} customerEmail={currentUser?.email} reason="Upgrade your plan to unlock more features." />
    </div>
  );
};

export default BillingPage;
