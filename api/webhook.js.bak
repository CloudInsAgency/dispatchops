const stripe = require('stripe')(process.env.VITE_STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        await handleCheckoutComplete(session);
        break;

      case 'customer.subscription.updated':
        const subscription = event.data.object;
        await handleSubscriptionUpdate(subscription);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        await handleSubscriptionDeleted(deletedSubscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Handle successful checkout
async function handleCheckoutComplete(session) {
  const { customer, subscription, metadata } = session;
  const planId = metadata.planId;

  // Get subscription details from Stripe
  const stripeSubscription = await stripe.subscriptions.retrieve(subscription);
  
  // Find user by customer ID and update their subscription
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('stripeCustomerId', '==', customer).get();

  if (!snapshot.empty) {
    const userDoc = snapshot.docs[0];
    await userDoc.ref.update({
      subscription: {
        plan: planId,
        status: 'active',
        stripeSubscriptionId: subscription,
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        updatedAt: new Date(),
      },
    });
  }
}

// Handle subscription updates
async function handleSubscriptionUpdate(subscription) {
  const { customer, status, metadata } = subscription;

  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('stripeCustomerId', '==', customer).get();

  if (!snapshot.empty) {
    const userDoc = snapshot.docs[0];
    await userDoc.ref.update({
      'subscription.status': status,
      'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
      'subscription.updatedAt': new Date(),
    });
  }
}

// Handle subscription cancellation
async function handleSubscriptionDeleted(subscription) {
  const { customer } = subscription;

  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('stripeCustomerId', '==', customer).get();

  if (!snapshot.empty) {
    const userDoc = snapshot.docs[0];
    await userDoc.ref.update({
      subscription: {
        plan: 'starter', // Revert to starter
        status: 'cancelled',
        updatedAt: new Date(),
      },
    });
  }
}