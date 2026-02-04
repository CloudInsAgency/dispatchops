import React, { useState } from 'react';
import { FiX, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';
import { stripePromise, PLANS, getRecommendedUpgrade } from '../../config/stripe';
import toast from 'react-hot-toast';

const UpgradeModal = ({ isOpen, onClose, currentPlan, targetPlan, userId, companyId, customerEmail, reason }) => {
  const [loading, setLoading] = useState(false);
  const recommendedPlan = targetPlan || getRecommendedUpgrade(currentPlan);
  const upgradePlan = PLANS[recommendedPlan];

  if (!isOpen || !upgradePlan) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    const loadingToast = toast.loading('Redirecting to checkout...');
    try {
      const stripe = await stripePromise;
      const apiUrl = import.meta.env.DEV
        ? 'http://localhost:5173/api/create-checkout-session'
        : 'https://dispatchops-three.vercel.app/api/create-checkout-session';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: upgradePlan.priceId,
          planId: upgradePlan.id,
          userId: userId || '',
          companyId: companyId || '',
          customerEmail: customerEmail || '',
        }),
      });

      const session = await response.json();
      if (session.error) {
        toast.error(session.error, { id: loadingToast });
        setLoading(false);
        return;
      }

      toast.dismiss(loadingToast);
      const result = await stripe.redirectToCheckout({ sessionId: session.id });
      if (result.error) { toast.error(result.error.message); }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('Failed to start upgrade process', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FiTrendingUp className="h-8 w-8 text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-900">Upgrade Your Plan</h2>
              </div>
              <p className="text-gray-600">{reason}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <FiX className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Current Plan</p>
            <p className="text-lg font-bold text-gray-900">{PLANS[currentPlan]?.name || 'Starter Plan'}</p>
            <p className="text-sm text-gray-600">Up to {PLANS[currentPlan]?.techLimit || 10} technicians &bull; Up to {PLANS[currentPlan]?.jobLimit || 200} jobs/month</p>
          </div>

          <div className="border-2 border-primary-600 rounded-xl p-6 mb-6 bg-primary-50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-primary-600 font-medium mb-1">RECOMMENDED UPGRADE</p>
                <h3 className="text-2xl font-bold text-gray-900">{upgradePlan.name}</h3>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">${upgradePlan.price}</p>
                <p className="text-sm text-gray-600">/month</p>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              {upgradePlan.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <FiCheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
            <button onClick={handleUpgrade} disabled={loading} className="w-full bg-primary-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 transition disabled:opacity-50 shadow-lg">
              {loading ? 'Processing...' : `Upgrade to ${upgradePlan.name} \u2014 $${upgradePlan.price}/mo`}
            </button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Secure checkout powered by Stripe. Your card will be charged ${upgradePlan.price}/month.</p>
            <p className="mt-1">You can cancel or downgrade anytime from the billing page.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
