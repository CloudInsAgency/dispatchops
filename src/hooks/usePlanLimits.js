import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { canAddTechnician, canCreateJob, getPlanById } from '../config/stripe';

export const usePlanLimits = (userProfile) => {
  const [techCount, setTechCount] = useState(0);
  const [monthlyJobCount, setMonthlyJobCount] = useState(0);
  const [canAddTech, setCanAddTech] = useState(true);
  const [canAddJob, setCanAddJob] = useState(true);
  const [currentPlan, setCurrentPlan] = useState('starter');

  useEffect(() => {
    if (!userProfile?.companyId) return;

    const plan = userProfile?.subscription?.plan || 'starter';
    setCurrentPlan(plan);

    // --- Technician counting (dual collection) ---
    let usersCount = 0;
    let subCount = 0;
    const updateTechLimits = () => {
      const total = Math.max(usersCount, subCount);
      setTechCount(total);
      setCanAddTech(canAddTechnician(plan, total));
    };

    const usersRef = collection(db, 'users');
    const usersQ = query(
      usersRef,
      where('companyId', '==', userProfile.companyId),
      where('role', '==', 'tech')
    );
    const unsub1 = onSnapshot(usersQ, (snapshot) => {
      usersCount = snapshot.size;
      updateTechLimits();
    });

    const subRef = collection(db, 'companies', userProfile.companyId, 'technicians');
    const unsub2 = onSnapshot(subRef, (snapshot) => {
      subCount = snapshot.size;
      updateTechLimits();
    });

    // --- Monthly job counting ---
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStart = Timestamp.fromDate(firstOfMonth);

    const jobsRef = collection(db, 'companies', userProfile.companyId, 'jobs');
    const jobsQ = query(
      jobsRef,
      where('createdAt', '>=', monthStart)
    );
    const unsub3 = onSnapshot(jobsQ, (snapshot) => {
      const count = snapshot.size;
      setMonthlyJobCount(count);
      setCanAddJob(canCreateJob(plan, count));
    });

    return () => { unsub1(); unsub2(); unsub3(); };
  }, [userProfile]);

  return {
    techCount,
    monthlyJobCount,
    canAddTech,
    canAddJob,
    currentPlan,
    planDetails: getPlanById(currentPlan)
  };
};
