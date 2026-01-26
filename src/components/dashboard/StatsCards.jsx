import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { FiClipboard, FiUsers, FiBarChart2, FiClock } from 'react-icons/fi';

const StatsCards = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({
    totalJobsToday: 0,
    activeTechnicians: 0,
    completedThisWeek: 0,
    onTimeRate: '--'
  });

  useEffect(() => {
    if (!userProfile?.companyId) return;

    // Fetch jobs for stats
    const jobsRef = collection(db, 'companies', userProfile.companyId, 'jobs');
    const jobsQuery = query(jobsRef);

    const unsubscribe = onSnapshot(jobsQuery, (snapshot) => {
      const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(today);
      startOfWeek.setDate(startOfWeek.getDate() - today.getDay());

      // Calculate stats
      const jobsToday = jobs.filter(job => {
        if (!job.createdAt) return false;
        const createdDate = job.createdAt.toDate ? job.createdAt.toDate() : new Date(job.createdAt);
        return createdDate >= today;
      }).length;

      const completedThisWeek = jobs.filter(job => {
        if (job.status !== 'completed' || !job.updatedAt) return false;
        const updatedDate = job.updatedAt.toDate ? job.updatedAt.toDate() : new Date(job.updatedAt);
        return updatedDate >= startOfWeek;
      }).length;

      // Calculate on-time rate (jobs completed on or before scheduled time)
      const completedJobs = jobs.filter(job => job.status === 'completed' && job.scheduledDateTime);
      const onTimeJobs = completedJobs.filter(job => {
        const scheduledDate = new Date(job.scheduledDateTime);
        const completedDate = job.updatedAt?.toDate ? job.updatedAt.toDate() : new Date(job.updatedAt);
        // Consider on-time if completed within 2 hours of scheduled time
        const timeDiff = completedDate - scheduledDate;
        return timeDiff <= 2 * 60 * 60 * 1000; // 2 hours in milliseconds
      }).length;

      const onTimeRate = completedJobs.length > 0 
        ? Math.round((onTimeJobs / completedJobs.length) * 100) 
        : '--';

      setStats({
        totalJobsToday: jobsToday,
        activeTechnicians: userProfile?.company?.technicianCount || 0,
        completedThisWeek: completedThisWeek,
        onTimeRate: onTimeRate !== '--' ? `${onTimeRate}%` : '--'
      });
    });

    return () => unsubscribe();
  }, [userProfile]);

  return (
    <div className="grid md:grid-cols-4 gap-6 mb-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600">Total Jobs Today</h3>
          <FiClipboard className="h-5 w-5 text-gray-400" />
        </div>
        <p className="text-3xl font-bold text-gray-900">{stats.totalJobsToday}</p>
        <p className="text-sm text-gray-500 mt-2">Created today</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600">Active Technicians</h3>
          <FiUsers className="h-5 w-5 text-gray-400" />
        </div>
        <p className="text-3xl font-bold text-gray-900">{stats.activeTechnicians}</p>
        <p className="text-sm text-gray-500 mt-2">Team members</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600">Completed Jobs</h3>
          <FiBarChart2 className="h-5 w-5 text-gray-400" />
        </div>
        <p className="text-3xl font-bold text-gray-900">{stats.completedThisWeek}</p>
        <p className="text-sm text-gray-500 mt-2">This week</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600">On-Time Rate</h3>
          <FiClock className="h-5 w-5 text-gray-400" />
        </div>
        <p className="text-3xl font-bold text-gray-900">{stats.onTimeRate}</p>
        <p className="text-sm text-gray-500 mt-2">
          {stats.onTimeRate === '--' ? 'Not enough data' : 'Completed on time'}
        </p>
      </div>
    </div>
  );
};

export default StatsCards;
