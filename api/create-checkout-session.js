/*
 * ESM, not CommonJS. package.json sets "type": "module", so every .js file in
 * this repo is an ES module — `require` and `module.exports` throw at load and
 * Vercel returns FUNCTION_INVOCATION_FAILED before the handler ever runs.
 * These functions were written in CommonJS, which is why checkout returned 500
 * for every customer who tried to pay.
 */
import Stripe from 'stripe';

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { priceId, planId, userId, companyId, customerEmail } = req.body;

    let customerId;
    if (customerEmail) {
      const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: customerEmail,
          metadata: { userId: userId || '', companyId: companyId || '' }
        });
        customerId = customer.id;
      }
    }

    // Derive the return host from the request rather than a build-time
    // constant. This fell back to dispatchops-three.vercel.app, an old
    // preview deployment, so a customer who paid was redirected to a host
    // they are not signed in to and saw a login screen instead of a receipt.
    const origin =
      req.headers.origin ||
      (req.headers.host ? `https://${req.headers.host}` : 'https://www.clouddispatchops.com');

    const sessionConfig = {
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/billing?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${origin}/billing?cancelled=true`,
      metadata: { planId, userId: userId || '', companyId: companyId || '' },
    };

    if (customerId) {
      sessionConfig.customer = customerId;
    } else if (customerEmail) {
      sessionConfig.customer_email = customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);
    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: error.message });
  }
}
