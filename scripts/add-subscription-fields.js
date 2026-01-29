// Script to add subscription fields to user documents
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDN7c1o_iU_MU3RMFyH5z9k_zY-wKLYk3I",
  authDomain: "dispatchops-prod.firebaseapp.com",
  projectId: "dispatchops-prod",
  storageBucket: "dispatchops-prod.firebasestorage.app",
  messagingSenderId: "654163430502",
  appId: "1:654163430502:web:9e7a37819e4c5c5f8b0e3a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Default subscription for starter plan
const defaultSubscription = {
  plan: 'starter',
  techLimit: 10,
  jobLimit: 100,
  stripeCustomerId: '',
  stripeSubscriptionId: '',
  status: 'active',
  createdAt: new Date().toISOString()
};

async function addSubscriptionFields() {
  try {
    console.log('🔍 Fetching all users...');
    
    // Get all users
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    console.log(`📊 Found ${usersSnapshot.size} users`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    // Loop through each user
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      // Check if user already has subscription field
      if (userData.subscription) {
        console.log(`⏭️  Skipping ${userData.email || userId} - already has subscription`);
        skippedCount++;
        continue;
      }
      
      // Only add subscription to owner/admin users, not techs
      if (userData.role === 'tech') {
        console.log(`⏭️  Skipping tech user: ${userData.email || userId}`);
        skippedCount++;
        continue;
      }
      
      // Add subscription field
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        subscription: defaultSubscription
      });
      
      console.log(`✅ Added subscription to: ${userData.email || userId}`);
      updatedCount++;
    }
    
    console.log('\n🎉 Script completed!');
    console.log(`✅ Updated: ${updatedCount} users`);
    console.log(`⏭️  Skipped: ${skippedCount} users`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the script
addSubscriptionFields();