const stripe = require('stripe')(process.env.VITE_STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
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

    const sessionConfig = {
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.VITE_APP_URL || 'https://dispatchops-three.vercel.app'}/billing?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.VITE_APP_URL || 'https://dispatchops-three.vercel.app'}/billing?cancelled=true`,
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
};
