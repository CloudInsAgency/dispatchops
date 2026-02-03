import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter Plan',
    price: 149.95,
    priceId: import.meta.env.VITE_STRIPE_STARTER_PRICE_ID,
    techLimit: 10,
    jobLimit: 200,
    features: [
      'Up to 10 technicians',
      'Up to 200 jobs/month',
      'Real-time dispatch board',
      'Technician mobile dashboard',
      'Basic reporting',
      'Email support'
    ]
  },
  growth: {
    id: 'growth',
    name: 'Growth Plan',
    price: 199.95,
    priceId: import.meta.env.VITE_STRIPE_GROWTH_PRICE_ID,
    techLimit: 20,
    jobLimit: 400,
    features: [
      'Up to 20 technicians',
      'Up to 400 jobs/month',
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
    price: 275,
    priceId: import.meta.env.VITE_STRIPE_PROFESSIONAL_PRICE_ID,
    techLimit: 40,
    jobLimit: 800,
    features: [
      'Up to 40 technicians',
      'Up to 800 jobs/month',
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

export const canCreateJob = (currentPlan, currentMonthJobCount) => {
  const plan = getPlanById(currentPlan);
  return currentMonthJobCount < plan.jobLimit;
};

export const getRecommendedUpgrade = (currentPlan) => {
  if (currentPlan === 'starter') return 'growth';
  if (currentPlan === 'growth') return 'professional';
  return null;
};
