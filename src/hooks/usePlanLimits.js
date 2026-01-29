import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { canAddTechnician, getPlanById } from '../config/stripe';

export const usePlanLimits = (userProfile) => {
  const [techCount, setTechCount] = useState(0);
  const [canAddTech, setCanAddTech] = useState(true);
  const [currentPlan, setCurrentPlan] = useState('starter');

  useEffect(() => {
    console.log('🔍 usePlanLimits - userProfile:', userProfile);
    
    if (!userProfile?.companyId) {
      console.log('❌ No companyId found');
      return;
    }

    // Get current plan from user profile
    const plan = userProfile?.subscription?.plan || 'starter';
    console.log('📋 Current plan:', plan);
    console.log('📋 Full subscription object:', userProfile?.subscription);
    setCurrentPlan(plan);

    // Listen to tech count
    const techsRef = collection(db, 'users');
    const q = query(
      techsRef,
      where('companyId', '==', userProfile.companyId),
      where('role', '==', 'tech')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const count = snapshot.size;
      console.log('👥 Tech count:', count);
      
      const canAdd = canAddTechnician(plan, count);
      console.log('✅ Can add tech?', canAdd, 'Plan:', plan, 'Count:', count);
      
      setTechCount(count);
      setCanAddTech(canAdd);
    });

    return () => unsubscribe();
  }, [userProfile]);

  return {
    techCount,
    canAddTech,
    currentPlan,
    planDetails: getPlanById(currentPlan)
  };
};