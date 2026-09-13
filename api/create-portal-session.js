const stripe = require('stripe')(process.env.VITE_STRIPE_SECRET_KEY);

/**
 * Stripe Billing Portal session.
 *
 * BillingPage has always had a "Manage subscription" button that POSTed here,
 * but the endpoint did not exist — the request fell through to the SPA rewrite
 * and came back as HTML, so the button failed for every customer who pressed
 * it. Without this, a subscriber has no way to update a card, change plan or
 * cancel without emailing support, which is also a requirement of Stripe's
 * own subscription rules.
 */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { customerId } = req.body || {};
    if (!customerId) {
      return res.status(400).json({ error: 'No Stripe customer on this account yet.' });
    }

    // Same reasoning as the checkout endpoint: return to whichever host the
    // request came from, never a build-time constant.
    const origin =
      req.headers.origin ||
      (req.headers.host ? `https://${req.headers.host}` : 'https://www.clouddispatchops.com');

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/billing`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Portal session error:', error);
    return res.status(500).json({ error: error.message || 'Could not open the billing portal.' });
  }
};
