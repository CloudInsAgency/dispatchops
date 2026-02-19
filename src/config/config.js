// Firebase configuration from environment variables
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Pricing tiers configuration
export const PRICING_TIERS = [
  {
    id: 'starter',
    name: 'Starter Plan',
    techRange: '1-10 technicians',
    price: 99,
    maxTechnicians: 10,
    stripeProductId: 'price_starter_monthly', // You'll get this from Stripe
    features: [
      'Up to 10 technicians',
      'Up to 200 jobs/month',
      'Real-time dispatch board',
      'Technician mobile dashboard',
      'Basic reporting',
      'Email support'
    ],
    popular: false
  },
  {
    id: 'growth',
    name: 'Growth Plan',
    techRange: '11-20 technicians',
    price: 149,
    maxTechnicians: 20,
    stripeProductId: 'price_growth_monthly', // You'll get this from Stripe
    features: [
      'Up to 20 technicians',
      'Up to 400 jobs/month',
      'Everything in Starter',
      'Advanced reporting',
      'Priority email support',
      'Custom job types',
      'Export to CSV'
    ],
    popular: true
  },
  {
    id: 'professional',
    name: 'Professional Plan',
    techRange: '21-40 technicians',
    price: 225,
    maxTechnicians: 40,
    stripeProductId: 'price_professional_monthly', // You'll get this from Stripe
    features: [
      'Up to 40 technicians',
      'Up to 800 jobs/month',
      'Everything in Growth',
      'API access',
      'Phone support',
      'Dedicated account manager',
      'Custom integrations'
    ],
    popular: false
  }
];

// Helper function to determine tier based on technician count
export const getTierForTechCount = (techCount) => {
  if (techCount <= 10) return PRICING_TIERS[0];
  if (techCount <= 20) return PRICING_TIERS[1];
  return PRICING_TIERS[2];
};
