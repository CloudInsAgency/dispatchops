import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with publishable key
export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Plan configuration
export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter Plan',
    price: 149.95,
    priceId: import.meta.env.VITE_STRIPE_STARTER_PRICE_ID,
    techLimit: 10,
    features: [
      'Up to 10 technicians',
      'Unlimited jobs',
      'Real-time dispatch board',
      'Mobile app for technicians',
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
    features: [
      'Up to 20 technicians',
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
    techLimit: null, // unlimited
    features: [
      'Unlimited technicians',
      'Everything in Growth',
      'API access',
      'Phone support',
      'Dedicated account manager',
      'Custom integrations'
    ]
  }
};

// Helper function to get plan by ID
export const getPlanById = (planId) => {
  return PLANS[planId] || PLANS.starter;
};

// Helper function to check if user can add more techs
export const canAddTechnician = (currentPlan, currentTechCount) => {
  const plan = getPlanById(currentPlan);
  
  // Professional has unlimited techs
  if (plan.techLimit === null) return true;
  
  // Check if under limit
  return currentTechCount < plan.techLimit;
};

// Helper function to get recommended upgrade plan
export const getRecommendedUpgrade = (currentPlan) => {
  if (currentPlan === 'starter') return 'growth';
  if (currentPlan === 'growth') return 'professional';
  return null; // Already on highest plan
};