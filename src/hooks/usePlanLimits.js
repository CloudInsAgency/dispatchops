import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { canAddTechnician, getPlanById } from '../config/stripe';

export const usePlanLimits = (userProfile) => {
  const [techCount, setTechCount] = useState(0);
  const [canAddTech, setCanAddTech] = useState(true);
  const [currentPlan, setCurrentPlan] = useState('starter');

  useEffect(() => {
    if (!userProfile?.companyId) return;

    // Get current plan from user profile
    const plan = userProfile?.subscription?.plan || 'starter';
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
      setTechCount(count);
      setCanAddTech(canAddTechnician(plan, count));
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