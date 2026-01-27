import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, orderBy, doc as firestoreDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { FiLogOut, FiMapPin, FiPhone, FiClock, FiCheckCircle, FiAlertCircle, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

const TechDashboard = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    const fetchCompanyName = async () => {
      if (!userProfile?.companyId) return;
      
      try {
        const companyDoc = await getDoc(firestoreDoc(db, 'companies', userProfile.companyId));
        if (companyDoc.exists()) {
          setCompanyName(companyDoc.data().name || '');
        }
      } catch (error) {
        console.error('Error fetching company:', error);
      }
    };

    fetchCompanyName();
  }, [userProfile]);

  useEffect(() => {
    if (!userProfile?.companyId) {
      setLoading(false);
      return;
    }

    const jobsRef = collection(db, 'companies', userProfile.companyId, 'jobs');
    const q = query(
      jobsRef,
      where('assignedToName', '==', userProfile.fullName),
      orderBy('scheduledDateTime', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const activeJobs = jobsData.filter(job => job.status !== 'completed');
      setJobs(activeJobs);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching jobs:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile]);

  const handleLogout = async () => {
    await logout();
    navigate('/tech');
  };

  const updateJobStatus = async (jobId, newStatus) => {
    if (!userProfile?.companyId) return;

    const loadingToast = toast.loading('Updating status...');
    
    try {
      const jobRef = doc(db, 'companies', userProfile.companyId, 'jobs', jobId);
      const currentJob = jobs.find(j => j.id === jobId);
      
      await updateDoc(jobRef, {
        status: newStatus,
        updatedAt: new Date(),
        activityLog: arrayUnion({
          type: 'status_changed',
          field: 'status',
          oldValue: currentJob?.status,
          newValue: newStatus,
          userName: userProfile.fullName || 'Technician',
          timestamp: new Date()
        })
      });
      
      toast.success('Status updated!', { id: loadingToast });
      setSelectedJob(null);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status', { id: loadingToast });
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Not scheduled';
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBorder = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-red-500';
      case 'medium': return 'border-l-4 border-yellow-500';
      case 'low': return 'border-l-4 border-green-500';
      default: return 'border-l-4 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary-600 text-white sticky top-0 z-10 shadow-lg">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">My Jobs</h1>
              <p className="text-sm text-primary-100">{userProfile?.fullName || 'Technician'}</p>
              {companyName && <p className="text-xs text-primary-200 mt-0.5">{companyName}</p>}
            </div>
            <button onClick={handleLogout} className="flex items-center bg-primary-700 px-4 py-2 rounded-lg hover:bg-primary-800 transition">
              <FiLogOut className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4 pb-20">
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <FiCheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No active jobs</p>
            <p className="text-gray-400 text-sm mt-2">You are all caught up!</p>
          </div>
        ) : (
          jobs.map(job => (
            <div key={job.id} onClick={() => setSelectedJob(job)} className={`bg-white rounded-lg shadow-md p-4 ${getPriorityBorder(job.priority)} cursor-pointer active:scale-98 transition`}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900">{job.customerName}</h3>
                {job.priority === 'high' && <FiAlertCircle className="h-5 w-5 text-red-500" />}
              </div>
              <div className="flex items-start text-gray-700 mb-2">
                <FiMapPin className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{job.address}</span>
              </div>
              <div className="flex items-center text-gray-700 mb-2">
                <FiPhone className="h-5 w-5 mr-2" />
                <a href={`tel:${job.customerPhone}`} className="text-primary-600 font-medium" onClick={(e) => e.stopPropagation()}>
                  {job.customerPhone}
                </a>
              </div>
              <div className="flex items-center text-gray-700 mb-3">
                <FiClock className="h-5 w-5 mr-2" />
                <span className="font-medium">{formatDateTime(job.scheduledDateTime)}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-sm font-medium text-gray-500 uppercase">{job.jobType}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(job.status)}`}>
                  {job.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedJob.customerName}</h2>
                <button onClick={() => setSelectedJob(null)} className="text-gray-400 hover:text-gray-600">
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Address</p>
                  <p className="text-gray-900">{selectedJob.address}</p>
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(selectedJob.address)}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 text-sm font-medium mt-2 inline-block">
                    Get Directions →
                  </a>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Phone</p>
                  <a href={`tel:${selectedJob.customerPhone}`} className="text-primary-600 font-medium text-lg">
                    {selectedJob.customerPhone}
                  </a>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Scheduled Time</p>
                  <p className="text-gray-900 font-medium">{formatDateTime(selectedJob.scheduledDateTime)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Job Type</p>
                  <p className="text-gray-900 capitalize">{selectedJob.jobType}</p>
                </div>
                {selectedJob.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Notes</p>
                    <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">{selectedJob.notes}</p>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700 mb-3">Update Status:</p>
                {selectedJob.status === 'scheduled' && (
                  <button onClick={() => updateJobStatus(selectedJob.id, 'in_progress')} className="w-full bg-yellow-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-yellow-600 transition shadow-lg">
                    Start Job
                  </button>
                )}
                {selectedJob.status === 'in_progress' && (
                  <button onClick={() => updateJobStatus(selectedJob.id, 'completed')} className="w-full bg-green-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-green-600 transition shadow-lg">
                    Mark Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechDashboard;
