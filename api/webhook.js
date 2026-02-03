const stripe = require('stripe')(process.env.VITE_STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send('Webhook Error: ' + err.message);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log('Unhandled event type: ' + event.type);
    }
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: error.message });
  }
};

async function handleCheckoutComplete(session) {
  const { customer, subscription, metadata } = session;
  const planId = metadata.planId;
  const userId = metadata.userId;
  const companyId = metadata.companyId;
  const stripeSubscription = await stripe.subscriptions.retrieve(subscription);

  if (userId) {
    await db.collection('users').doc(userId).update({
      stripeCustomerId: customer,
      subscription: {
        plan: planId, status: 'active', stripeSubscriptionId: subscription,
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000), updatedAt: new Date(),
      },
    });
  } else {
    const snapshot = await db.collection('users').where('stripeCustomerId', '==', customer).get();
    if (!snapshot.empty) {
      await snapshot.docs[0].ref.update({
        subscription: {
          plan: planId, status: 'active', stripeSubscriptionId: subscription,
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000), updatedAt: new Date(),
        },
      });
    }
  }

  if (companyId) {
    await db.collection('companies').doc(companyId).update({
      subscriptionStatus: 'active', subscriptionPlan: planId,
      stripeCustomerId: customer, subscriptionId: subscription, updatedAt: new Date(),
    });
  }
}

async function handleSubscriptionUpdate(subscription) {
  const { customer, status } = subscription;
  const snapshot = await db.collection('users').where('stripeCustomerId', '==', customer).get();
  if (!snapshot.empty) {
    const userDoc = snapshot.docs[0];
    await userDoc.ref.update({
      'subscription.status': status,
      'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
      'subscription.updatedAt': new Date(),
    });
    const userData = userDoc.data();
    if (userData.companyId) {
      await db.collection('companies').doc(userData.companyId).update({ subscriptionStatus: status, updatedAt: new Date() });
    }
  }
}

async function handleSubscriptionDeleted(subscription) {
  const { customer } = subscription;
  const snapshot = await db.collection('users').where('stripeCustomerId', '==', customer).get();
  if (!snapshot.empty) {
    const userDoc = snapshot.docs[0];
    await userDoc.ref.update({
      subscription: { plan: 'starter', status: 'cancelled', updatedAt: new Date() },
    });
    const userData = userDoc.data();
    if (userData.companyId) {
      await db.collection('companies').doc(userData.companyId).update({
        subscriptionStatus: 'cancelled', subscriptionPlan: 'starter', updatedAt: new Date(),
      });
    }
  }
}
