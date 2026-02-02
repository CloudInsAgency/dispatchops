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

    const plan = userProfile?.subscription?.plan || 'starter';
    setCurrentPlan(plan);

    let usersCount = 0;
    let subCount = 0;
    const updateLimits = () => {
      const total = Math.max(usersCount, subCount);
      const canAdd = canAddTechnician(plan, total);
      setTechCount(total);
      setCanAddTech(canAdd);
    };

    // Listen to techs in users collection
    const usersRef = collection(db, 'users');
    const usersQ = query(
      usersRef,
      where('companyId', '==', userProfile.companyId),
      where('role', '==', 'tech')
    );
    const unsub1 = onSnapshot(usersQ, (snapshot) => {
      usersCount = snapshot.size;
      updateLimits();
    });

    // Listen to techs in companies subcollection
    const subRef = collection(db, 'companies', userProfile.companyId, 'technicians');
    const unsub2 = onSnapshot(subRef, (snapshot) => {
      subCount = snapshot.size;
      updateLimits();
    });

    return () => { unsub1(); unsub2(); };
  }, [userProfile]);

  return {
    techCount,
    canAddTech,
    currentPlan,
    planDetails: getPlanById(currentPlan)
  };
};
