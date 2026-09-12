import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter Plan',
    price: 99,
    priceId: import.meta.env.VITE_STRIPE_STARTER_PRICE_ID,
    techLimit: 5,
    jobLimit: null, // unlimited — see canCreateJob
    features: [
      'Up to 5 technicians',
      'Unlimited jobs',
      'Real-time dispatch board',
      'Technician mobile dashboard',
      'Basic reporting',
      'Email support'
    ]
  },
  growth: {
    id: 'growth',
    name: 'Growth Plan',
    price: 149,
    priceId: import.meta.env.VITE_STRIPE_GROWTH_PRICE_ID,
    techLimit: 10,
    jobLimit: null, // unlimited — see canCreateJob
    features: [
      'Up to 10 technicians',
      'Unlimited jobs',
      'Everything in Starter',
      'Advanced reporting',
      'Priority email support',
      'Custom job types',
      'Export to CSV'
    ]
  },
  professional: {
    id: 'professional',
    name: 'Professional Plan',
    price: 225,
    priceId: import.meta.env.VITE_STRIPE_PROFESSIONAL_PRICE_ID,
    techLimit: 40,
    jobLimit: null, // unlimited — see canCreateJob
    features: [
      'Up to 40 technicians',
      'Unlimited jobs',
      'Everything in Growth',
      'API access',
      'Phone support',
      'Dedicated account manager',
      'Custom integrations'
    ]
  }
};

export const getPlanById = (planId) => {
  return PLANS[planId] || PLANS.starter;
};

export const canAddTechnician = (currentPlan, currentTechCount) => {
  const plan = getPlanById(currentPlan);
  return currentTechCount < plan.techLimit;
};

/**
 * Jobs are no longer capped; plans are priced on technicians.
 *
 * The old caps were 200/400/800 against tech limits of 10/20/40 — a flat 20
 * jobs per technician per month at every tier, or under one job per tech per
 * working day. A real HVAC, plumbing or electrical tech runs 4-8 calls a day,
 * so a full Starter crew would have hit the cap in about four working days and
 * then been unable to create jobs while still paying. Upgrading did not help,
 * because the per-tech allowance was identical on every plan.
 *
 * The caps also protected nothing: a job document is a few kilobytes, and the
 * Firestore free tier alone covers orders of magnitude more than 800 a month.
 *
 * `jobLimit: null` means unlimited. Keep the field rather than deleting it so
 * a future abuse guard has somewhere to live.
 */
export const canCreateJob = (currentPlan, currentMonthJobCount) => {
  const plan = getPlanById(currentPlan);
  if (!plan || plan.jobLimit == null) return true;
  return currentMonthJobCount < plan.jobLimit;
};

export const getRecommendedUpgrade = (currentPlan) => {
  if (currentPlan === 'starter') return 'growth';
  if (currentPlan === 'growth') return 'professional';
  return null;
};
