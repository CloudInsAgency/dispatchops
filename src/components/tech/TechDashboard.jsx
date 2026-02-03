import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, query, onSnapshot, doc as firestoreDoc, getDoc } from 'firebase/firestore';
import { db, storage } from '../../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FiLogOut, FiMapPin, FiPhone, FiClock, FiCheckCircle, FiAlertCircle, FiX, FiCamera, FiTrash2, FiTruck } from 'react-icons/fi';
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
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'completed', 'all'

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
    if (!userProfile?.companyId || !userProfile?.fullName) {
      setLoading(false);
      return;
    }

    const jobsRef = collection(db, 'companies', userProfile.companyId, 'jobs');
    const q = query(jobsRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allJobs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const myJobs = allJobs.filter(job => 
        job.assignedToName === userProfile.fullName ||
        job.assignedToUid === userProfile.uid
      );

      myJobs.sort((a, b) => {
        const dateA = a.scheduledDateTime || '';
        const dateB = b.scheduledDateTime || '';
        return dateA.localeCompare(dateB);
      });

      setJobs(myJobs);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching jobs:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile]);
  // Reset form when job selection changes
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

  // Compress image before upload
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimension 1920px
          const maxDim = 1920;
          if (width > height && width > maxDim) {
            height = (height / width) * maxDim;
            width = maxDim;
          } else if (height > maxDim) {
            width = (width / height) * maxDim;
            height = maxDim;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          }, 'image/jpeg', 0.85); // 85% quality
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    if (photos.length + files.length > 5) {
      toast.error('Maximum 5 photos allowed per job');
      return;
    }

    setUploading(true);
    const loadingToast = toast.loading('Uploading photos...');

    try {
      const uploadedUrls = [];
      
      for (const file of files) {
        // Compress image
        const compressedFile = await compressImage(file);
        
        // Upload to Firebase Storage
        const storageRef = ref(storage, `jobs/${selectedJob.id}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, compressedFile);
        const url = await getDownloadURL(storageRef);
        uploadedUrls.push(url);
      }

      const newPhotos = [...photos, ...uploadedUrls];
      setPhotos(newPhotos);

      // Update Firestore
      const jobRef = doc(db, 'companies', userProfile.companyId, 'jobs', selectedJob.id);
      await updateDoc(jobRef, {
        photos: newPhotos,
        updatedAt: new Date()
      });

      toast.success('Photos uploaded!', { id: loadingToast });
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error('Failed to upload photos', { id: loadingToast });
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoUrl) => {
    const newPhotos = photos.filter(p => p !== photoUrl);
    setPhotos(newPhotos);

    try {
      const jobRef = doc(db, 'companies', userProfile.companyId, 'jobs', selectedJob.id);
      await updateDoc(jobRef, {
        photos: newPhotos,
        updatedAt: new Date()
      });
      toast.success('Photo deleted');
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Failed to delete photo');
    }
  };

  // Signature Canvas handlers - FIXED coordinate calculation
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
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    ctx.beginPath();
    ctx.moveTo(x, y);
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
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature(null);
  };

  const saveSignature = async () => {
    const canvas = canvasRef.current;
    const signatureDataUrl = canvas.toDataURL();
    
    try {
      // Upload signature to storage
      const blob = await (await fetch(signatureDataUrl)).blob();
      const storageRef = ref(storage, `signatures/${selectedJob.id}/${Date.now()}.png`);
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      
      setSignature(url);
      
      // Update Firestore
      const jobRef = doc(db, 'companies', userProfile.companyId, 'jobs', selectedJob.id);
      await updateDoc(jobRef, {
        signature: url,
        updatedAt: new Date()
      });
      
      toast.success('Signature saved!');
    } catch (error) {
      console.error('Error saving signature:', error);
      toast.error('Failed to save signature');
    }
  };

  const saveTechNotes = async () => {
    if (!techNotes.trim()) {
      toast.error('Please enter notes');
      return;
    }

    try {
      const jobRef = doc(db, 'companies', userProfile.companyId, 'jobs', selectedJob.id);
      await updateDoc(jobRef, {
        techNotes: techNotes,
        updatedAt: new Date()
      });
      toast.success('Notes saved!');
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to save notes');
    }
  };

  const updateJobStatus = async (jobId, newStatus) => {
    if (!userProfile?.companyId) return;

    // Validation for completion
    if (newStatus === 'completed') {
      if (photos.length === 0) {
        toast.error('Please upload at least one photo before completing');
        return;
      }
      if (!signature) {
        toast.error('Please capture customer signature before completing');
        return;
      }
      if (!techNotes.trim()) {
        toast.error('Please add technician notes before completing');
        return;
      }
    }

    const loadingToast = toast.loading('Updating status...');
    
    try {
      const jobRef = doc(db, 'companies', userProfile.companyId, 'jobs', jobId);
      const currentJob = jobs.find(j => j.id === jobId);
      
      await updateDoc(jobRef, {
        status: newStatus,
        updatedAt: new Date(),
        completedAt: newStatus === 'completed' ? new Date() : null,
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
      
      // Reset form
      setPhotos([]);
      setTechNotes('');
      setSignature(null);
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
      case 'completed': return 'bg-green-100 text-green-800';
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
              <FiLogOut className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-[72px] z-10">
        <div className="flex">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-4 text-center font-medium transition ${
              activeTab === 'active'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-4 text-center font-medium transition ${
              activeTab === 'completed'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-4 text-center font-medium transition ${
              activeTab === 'all'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-20">
        {(() => {
          // Filter jobs based on active tab
          let filteredJobs = jobs;
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (activeTab === 'active') {
            filteredJobs = jobs.filter(job => job.status !== 'completed');
          } else if (activeTab === 'completed') {
            filteredJobs = jobs.filter(job => {
              if (job.status !== 'completed') return false;
              if (!job.completedAt) return false;
              const completedDate = new Date(job.completedAt.seconds * 1000);
              completedDate.setHours(0, 0, 0, 0);
              return completedDate.getTime() === today.getTime();
            });
          }
          // 'all' shows everything

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
          );
        })()}
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

              {/* Job Details */}
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
                    <p className="text-sm font-medium text-gray-500 mb-1">Job Notes</p>
                    <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">{selectedJob.notes}</p>
                  </div>
                )}
              </div>

              {/* Photo Upload Section */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">📸 Job Photos {photos.length > 0 && `(${photos.length}/5)`}</p>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {photos.map((photoUrl, index) => (
                    <div key={index} className="relative">
                      <img src={photoUrl} alt={`Job photo ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                      <button
                        onClick={() => handleDeletePhoto(photoUrl)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                      >
                        <FiTrash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                {photos.length < 5 && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      capture="environment"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full bg-gray-100 border-2 border-dashed border-gray-300 text-gray-600 py-3 rounded-lg font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2"
                    >
                      <FiCamera className="h-5 w-5" />
                      {uploading ? 'Uploading...' : 'Take/Upload Photo'}
                    </button>
                  </>
                )}
              </div>

              {/* Tech Notes */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">📝 Technician Notes</p>
                <textarea
                  value={techNotes}
                  onChange={(e) => setTechNotes(e.target.value)}
                  placeholder="Add notes about the job, work performed, parts used, etc."
                  className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  onClick={saveTechNotes}
                  className="mt-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                >
                  Save Notes
                </button>
              </div>

              {/* Digital Signature */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">✍️ Customer Signature</p>
                {signature ? (
                  <div className="relative">
                    <img src={signature} alt="Customer signature" className="w-full border-2 border-gray-300 rounded-lg" />
                    <button
                      onClick={clearSignature}
                      className="mt-2 text-red-600 text-sm font-medium"
                    >
                      Clear & Re-sign
                    </button>
                  </div>
                ) : (
                  <div>
                    <canvas
                      ref={canvasRef}
                      width={300}
                      height={150}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full border-2 border-gray-300 rounded-lg touch-none cursor-crosshair bg-white"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={clearSignature}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
                      >
                        Clear
                      </button>
                      <button
                        onClick={saveSignature}
                        className="flex-1 bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 transition"
                      >
                        Save Signature
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Update Buttons */}
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
