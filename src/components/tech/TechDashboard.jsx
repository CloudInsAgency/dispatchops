import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, query, onSnapshot, doc as firestoreDoc, getDoc } from 'firebase/firestore';
import { db, storage } from '../../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FiLogOut, FiMapPin, FiPhone, FiClock, FiCheckCircle, FiAlertCircle, FiX, FiCamera, FiTrash2, FiTruck, FiNavigation, FiPlay, FiSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

const TechDashboard = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [techNotes, setTechNotes] = useState('');
  const [signature, setSignature] = useState(null);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('active');
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const touchStartY = useRef(0);
  const scrollContainerRef = useRef(null);
  const PULL_THRESHOLD = 80;
  const [activeTimers, setActiveTimers] = useState({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem('jobTimers');
      if (saved) setActiveTimers(JSON.parse(saved));
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (Object.keys(activeTimers).length > 0) {
      localStorage.setItem('jobTimers', JSON.stringify(activeTimers));
    }
  }, [activeTimers]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTimers(prev => {
        const updated = { ...prev };
        let changed = false;
        Object.keys(updated).forEach(jobId => {
          if (updated[jobId].running) {
            updated[jobId] = { ...updated[jobId], elapsed: updated[jobId].elapsed + 1 };
            changed = true;
          }
        });
        return changed ? updated : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const startTimer = (jobId) => {
    setActiveTimers(prev => ({
      ...prev,
      [jobId]: { elapsed: prev[jobId]?.elapsed || 0, running: true, startedAt: new Date().toISOString() }
    }));
  };

  const pauseTimer = (jobId) => {
    setActiveTimers(prev => ({ ...prev, [jobId]: { ...prev[jobId], running: false } }));
  };

  const resetTimer = (jobId) => {
    setActiveTimers(prev => {
      const updated = { ...prev };
      delete updated[jobId];
      return updated;
    });
    try {
      const saved = JSON.parse(localStorage.getItem('jobTimers') || '{}');
      delete saved[jobId];
      localStorage.setItem('jobTimers', JSON.stringify(saved));
    } catch (e) {}
  };

  const formatTimer = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleTouchStart = useCallback((e) => {
    const container = scrollContainerRef.current;
    if (container && container.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isPulling) return;
    const distance = Math.max(0, e.touches[0].clientY - touchStartY.current);
    setPullDistance(Math.min(distance * 0.5, 120));
  }, [isPulling]);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance >= PULL_THRESHOLD) {
      setRefreshing(true);
      setPullDistance(PULL_THRESHOLD);
      setTimeout(() => {
        setRefreshing(false);
        setPullDistance(0);
        toast.success('Jobs refreshed');
      }, 1000);
    } else {
      setPullDistance(0);
    }
    setIsPulling(false);
  }, [pullDistance]);

  useEffect(() => {
    const fetchCompanyName = async () => {
      if (!userProfile?.companyId) return;
      try {
        const companyDoc = await getDoc(firestoreDoc(db, 'companies', userProfile.companyId));
        if (companyDoc.exists()) setCompanyName(companyDoc.data().name || '');
      } catch (error) {
        console.error('Error fetching company:', error);
      }
    };
    fetchCompanyName();
  }, [userProfile]);

  useEffect(() => {
    console.log("DEBUG userProfile:", JSON.stringify(userProfile));
    const companyId = userProfile?.companyId || userProfile?.companyID;
    if (!companyId || !userProfile?.fullName) {
      setLoading(false);
      return;
    }
    const jobsRef = collection(db, 'companies', companyId, 'jobs');
    const q = query(jobsRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("DEBUG snapshot size:", snapshot.size, "companyId:", userProfile.companyId, "fullName:", userProfile.fullName, "uid:", userProfile.uid);
      const allJobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const myJobs = allJobs.filter(job => job.assignedToName === userProfile.fullName || job.assignedToUid === userProfile.uid);
      myJobs.sort((a, b) => (a.scheduledDateTime || '').localeCompare(b.scheduledDateTime || ''));
      setJobs(myJobs);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching jobs:', error.code, error.message);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [userProfile]);

  useEffect(() => {
    if (selectedJob) {
      setPhotos(selectedJob.photos || []);
      setTechNotes(selectedJob.techNotes || '');
      setSignature(selectedJob.signature || null);
    }
  }, [selectedJob]);

  const handleLogout = async () => {
    await logout();
    navigate('/tech');
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1920;
          if (width > height && width > maxDim) { height = (height / width) * maxDim; width = maxDim; }
          else if (height > maxDim) { width = (width / height) * maxDim; height = maxDim; }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => { resolve(new File([blob], file.name, { type: 'image/jpeg' })); }, 'image/jpeg', 0.85);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    if (photos.length + files.length > 5) { toast.error('Maximum 5 photos allowed per job'); return; }
    setUploading(true);
    const loadingToast = toast.loading('Uploading photos...');
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const compressedFile = await compressImage(file);
        const storageRef = ref(storage, `jobs/${selectedJob.id}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, compressedFile);
        const url = await getDownloadURL(storageRef);
        uploadedUrls.push(url);
      }
      const newPhotos = [...photos, ...uploadedUrls];
      setPhotos(newPhotos);
      const jobRef = doc(db, 'companies', userProfile.companyId, 'jobs', selectedJob.id);
      await updateDoc(jobRef, { photos: newPhotos, updatedAt: new Date() });
      toast.success('Photos uploaded!', { id: loadingToast });
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error('Failed to upload photos', { id: loadingToast });
    } finally { setUploading(false); }
  };

  const handleDeletePhoto = async (photoUrl) => {
    const newPhotos = photos.filter(p => p !== photoUrl);
    setPhotos(newPhotos);
    try {
      const jobRef = doc(db, 'companies', userProfile.companyId, 'jobs', selectedJob.id);
      await updateDoc(jobRef, { photos: newPhotos, updatedAt: new Date() });
      toast.success('Photo deleted');
    } catch (error) { console.error('Error deleting photo:', error); toast.error('Failed to delete photo'); }
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    ctx.beginPath();
    ctx.moveTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    ctx.lineTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const stopDrawing = (e) => { e.preventDefault(); setIsDrawing(false); };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    setSignature(null);
  };

  const saveSignature = async () => {
    const canvas = canvasRef.current;
    try {
      const blob = await (await fetch(canvas.toDataURL())).blob();
      const storageRef = ref(storage, `signatures/${selectedJob.id}/${Date.now()}.png`);
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      setSignature(url);
      const jobRef = doc(db, 'companies', userProfile.companyId, 'jobs', selectedJob.id);
      await updateDoc(jobRef, { signature: url, updatedAt: new Date() });
      toast.success('Signature saved!');
    } catch (error) { console.error('Error saving signature:', error); toast.error('Failed to save signature'); }
  };

  const saveTechNotes = async () => {
    if (!techNotes.trim()) { toast.error('Please enter notes'); return; }
    try {
      const jobRef = doc(db, 'companies', userProfile.companyId, 'jobs', selectedJob.id);
      await updateDoc(jobRef, { techNotes: techNotes, updatedAt: new Date() });
      toast.success('Notes saved!');
    } catch (error) { console.error('Error saving notes:', error); toast.error('Failed to save notes'); }
  };

  const updateJobStatus = async (jobId, newStatus) => {
    if (!userProfile?.companyId) return;
    if (newStatus === 'completed') {
      if (photos.length === 0) { toast.error('Please upload at least one photo before completing'); return; }
      if (!signature) { toast.error('Please capture customer signature before completing'); return; }
      if (!techNotes.trim()) { toast.error('Please add technician notes before completing'); return; }
    }
    const loadingToast = toast.loading('Updating status...');
    try {
      const jobRef = doc(db, 'companies', userProfile.companyId, 'jobs', jobId);
      const currentJob = jobs.find(j => j.id === jobId);
      const updateData = {
        status: newStatus,
        updatedAt: new Date(),
        activityLog: arrayUnion({
          type: 'status_changed', field: 'status',
          oldValue: currentJob?.status, newValue: newStatus,
          userName: userProfile.fullName || 'Technician', timestamp: new Date()
        })
      };
      if (newStatus === 'en_route') updateData.enRouteAt = new Date();
      else if (newStatus === 'in_progress') { updateData.startedAt = new Date(); startTimer(jobId); }
      else if (newStatus === 'completed') {
        updateData.completedAt = new Date();
        if (activeTimers[jobId]) updateData.jobDuration = activeTimers[jobId].elapsed;
        pauseTimer(jobId);
      }
      await updateDoc(jobRef, updateData);
      toast.success('Status updated!', { id: loadingToast });
      if (newStatus === 'completed') {
        resetTimer(jobId);
        setSelectedJob(null);
        setPhotos([]);
        setTechNotes('');
        setSignature(null);
      }
    } catch (error) { console.error('Error updating status:', error); toast.error('Failed to update status', { id: loadingToast }); }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Not scheduled';
    return new Date(dateTimeString).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'en_route': return 'bg-purple-100 text-purple-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'scheduled': return 'SCHEDULED';
      case 'en_route': return 'EN ROUTE';
      case 'in_progress': return 'IN PROGRESS';
      case 'completed': return 'COMPLETED';
      default: return status?.replace('_', ' ').toUpperCase() || 'UNKNOWN';
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
    return (<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-600">Loading jobs...</div></div>);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary-600 text-white sticky top-0 z-10 shadow-lg">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src="/logo.png" alt="Cloud Dispatch Ops" className="h-8 w-8 mr-2" />
              <FiTruck className="h-6 w-6 mr-2" />
              <div>
                <h1 className="text-xl font-bold">Cloud Dispatch Ops</h1>
                <p className="text-xs text-primary-100">{userProfile?.fullName || 'Technician'}</p>
                {companyName && <p className="text-xs text-primary-200 mt-0.5">{companyName}</p>}
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center bg-primary-700 px-4 py-2 rounded-lg hover:bg-primary-800 transition">
              <FiLogOut className="mr-2" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200 sticky top-[72px] z-10">
        <div className="flex">
          {['active', 'completed', 'all'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-center font-medium transition ${activeTab === tab ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center items-center overflow-hidden transition-all duration-200"
        style={{ height: pullDistance > 0 ? `${pullDistance}px` : '0px' }}>
        <div className={`transition-transform duration-200 ${refreshing ? 'animate-spin' : ''}`}
          style={{ transform: `rotate(${Math.min(pullDistance / PULL_THRESHOLD * 360, 360)}deg)` }}>
          <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        {pullDistance >= PULL_THRESHOLD && !refreshing && <span className="ml-2 text-sm text-primary-600 font-medium">Release to refresh</span>}
        {refreshing && <span className="ml-2 text-sm text-primary-600 font-medium">Refreshing...</span>}
      </div>

      <div ref={scrollContainerRef} className="p-4 space-y-4 pb-20"
        onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        {(() => {
          let filteredJobs = jobs;
          const today = new Date(); today.setHours(0, 0, 0, 0);
          if (activeTab === 'active') filteredJobs = jobs.filter(job => job.status !== 'completed');
          else if (activeTab === 'completed') filteredJobs = jobs.filter(job => {
            if (job.status !== 'completed' || !job.completedAt) return false;
            const d = new Date(job.completedAt.seconds ? job.completedAt.seconds * 1000 : job.completedAt);
            d.setHours(0, 0, 0, 0);
            return d.getTime() === today.getTime();
          });

          return filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <FiCheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                {activeTab === 'active' && 'No active jobs'}
                {activeTab === 'completed' && 'No completed jobs today'}
                {activeTab === 'all' && 'No jobs'}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {activeTab === 'active' && 'You are all caught up!'}
                {activeTab === 'completed' && 'Complete some jobs to see them here'}
                {activeTab === 'all' && 'No jobs assigned yet'}
              </p>
            </div>
          ) : (
            filteredJobs.map(job => (
              <div key={job.id} onClick={() => setSelectedJob(job)} className={`bg-white rounded-lg shadow-md p-4 ${getPriorityBorder(job.priority)} cursor-pointer active:scale-98 transition`}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{job.customerName}</h3>
                  <div className="flex items-center gap-2">
                    {job.priority === 'high' && <FiAlertCircle className="h-5 w-5 text-red-500" />}
                    {activeTimers[job.id]?.running && (
                      <span className="bg-red-100 text-red-700 text-xs font-mono font-bold px-2 py-1 rounded-full animate-pulse">
                        ⏱ {formatTimer(activeTimers[job.id].elapsed)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-start text-gray-700 mb-2">
                  <FiMapPin className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" /><span>{job.address}</span>
                </div>
                <div className="flex items-center text-gray-700 mb-2">
                  <FiPhone className="h-5 w-5 mr-2" />
                  <a href={`tel:${job.customerPhone}`} className="text-primary-600 font-medium" onClick={(e) => e.stopPropagation()}>{job.customerPhone}</a>
                </div>
                <div className="flex items-center text-gray-700 mb-3">
                  <FiClock className="h-5 w-5 mr-2" /><span className="font-medium">{formatDateTime(job.scheduledDateTime)}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-sm font-medium text-gray-500 uppercase">{job.jobType}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(job.status)}`}>{getStatusLabel(job.status)}</span>
                </div>
              </div>
            ))
          );
        })()}
      </div>

      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedJob.customerName}</h2>
                <button onClick={() => setSelectedJob(null)} className="text-gray-400 hover:text-gray-600"><FiX className="h-6 w-6" /></button>
              </div>

              {(selectedJob.status === 'in_progress' || activeTimers[selectedJob.id]) && (
                <div className="mb-6 bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">⏱ Job Timer</p>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-mono font-bold text-gray-900">{formatTimer(activeTimers[selectedJob.id]?.elapsed || 0)}</span>
                    <div className="flex gap-2">
                      {!activeTimers[selectedJob.id]?.running ? (
                        <button onClick={() => startTimer(selectedJob.id)} className="flex items-center gap-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition">
                          <FiPlay className="h-4 w-4" />{activeTimers[selectedJob.id]?.elapsed > 0 ? 'Resume' : 'Start'}
                        </button>
                      ) : (
                        <button onClick={() => pauseTimer(selectedJob.id)} className="flex items-center gap-1 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition">
                          <FiSquare className="h-4 w-4" />Pause
                        </button>
                      )}
                      {activeTimers[selectedJob.id]?.elapsed > 0 && (
                        <button onClick={() => resetTimer(selectedJob.id)} className="text-red-500 px-3 py-2 rounded-lg hover:bg-red-50 transition text-sm">Reset</button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Address</p>
                  <p className="text-gray-900">{selectedJob.address}</p>
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(selectedJob.address)}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 text-sm font-medium mt-2 inline-block">Get Directions →</a>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Phone</p>
                  <a href={`tel:${selectedJob.customerPhone}`} className="text-primary-600 font-medium text-lg">{selectedJob.customerPhone}</a>
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
                    <p className="text-sm font-medium text-gray-500 mb-1">Job Notes</p>
                    <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">{selectedJob.notes}</p>
                  </div>
                )}
                {selectedJob.status === 'completed' && selectedJob.jobDuration && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Time on Job</p>
                    <p className="text-gray-900 font-medium">{formatTimer(selectedJob.jobDuration)}</p>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">📸 Job Photos {photos.length > 0 && `(${photos.length}/5)`}</p>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {photos.map((photoUrl, index) => (
                    <div key={index} className="relative">
                      <img src={photoUrl} alt={`Job photo ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                      {selectedJob.status !== 'completed' && (
                        <button onClick={() => handleDeletePhoto(photoUrl)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><FiTrash2 className="h-3 w-3" /></button>
                      )}
                    </div>
                  ))}
                </div>
                {photos.length < 5 && selectedJob.status !== 'completed' && (
                  <>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple capture="environment" onChange={handlePhotoUpload} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                      className="w-full bg-gray-100 border-2 border-dashed border-gray-300 text-gray-600 py-3 rounded-lg font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2">
                      <FiCamera className="h-5 w-5" />{uploading ? 'Uploading...' : 'Take/Upload Photo'}
                    </button>
                  </>
                )}
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">📝 Technician Notes</p>
                {selectedJob.status === 'completed' ? (
                  <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">{techNotes || 'No notes'}</p>
                ) : (
                  <>
                    <textarea value={techNotes} onChange={(e) => setTechNotes(e.target.value)}
                      placeholder="Add notes about the job, work performed, parts used, etc."
                      className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                    <button onClick={saveTechNotes} className="mt-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition">Save Notes</button>
                  </>
                )}
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">✍️ Customer Signature</p>
                {signature ? (
                  <div className="relative">
                    <img src={signature} alt="Customer signature" className="w-full border-2 border-gray-300 rounded-lg" />
                    {selectedJob.status !== 'completed' && <button onClick={clearSignature} className="mt-2 text-red-600 text-sm font-medium">Clear & Re-sign</button>}
                  </div>
                ) : selectedJob.status !== 'completed' ? (
                  <div>
                    <canvas ref={canvasRef} width={300} height={150}
                      onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
                      className="w-full border-2 border-gray-300 rounded-lg touch-none cursor-crosshair bg-white" />
                    <div className="flex gap-2 mt-2">
                      <button onClick={clearSignature} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition">Clear</button>
                      <button onClick={saveSignature} className="flex-1 bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 transition">Save Signature</button>
                    </div>
                  </div>
                ) : <p className="text-gray-400 text-sm">No signature captured</p>}
              </div>

              {selectedJob.status !== 'completed' && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700 mb-3">Update Status:</p>
                  {selectedJob.status === 'scheduled' && (
                    <button onClick={() => updateJobStatus(selectedJob.id, 'en_route')}
                      className="w-full bg-purple-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-purple-600 transition shadow-lg flex items-center justify-center gap-2">
                      <FiNavigation className="h-5 w-5" /> En Route
                    </button>
                  )}
                  {selectedJob.status === 'en_route' && (
                    <button onClick={() => updateJobStatus(selectedJob.id, 'in_progress')}
                      className="w-full bg-yellow-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-yellow-600 transition shadow-lg">
                      Start Job
                    </button>
                  )}
                  {selectedJob.status === 'in_progress' && (
                    <button onClick={() => updateJobStatus(selectedJob.id, 'completed')}
                      className="w-full bg-green-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-green-600 transition shadow-lg">
                      Mark Complete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechDashboard;
