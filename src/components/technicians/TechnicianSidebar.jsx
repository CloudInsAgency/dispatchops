import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, onSnapshot, orderBy, doc, deleteDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { FiPlus, FiUser, FiEdit2, FiTrash2, FiX, FiNavigation, FiTool } from 'react-icons/fi';
import AddTechnicianModal from './AddTechnicianModal';
import { usePlanLimits } from '../../hooks/usePlanLimits';
import UpgradeModal from '../subscription/UpgradeModal';

const TechnicianSidebar = ({ onTechnicianSelect, selectedTechnicianId }) => {
  const { userProfile } = useAuth();
  const [technicians, setTechnicians] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTech, setEditingTech] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', status: '' });
  const [activeJobs, setActiveJobs] = useState([]);
  const { canAddTech, currentPlan, planDetails, techCount } = usePlanLimits(userProfile);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (!currentUser?.uid) return;
    const techRef = collection(db, 'companies', currentUser.uid, 'technicians');
    const q = query(techRef, orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const techData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTechnicians(techData);
    }, (error) => {
      console.error('Error fetching technicians:', error);
    });
    return () => unsubscribe();
  }, [userProfile]);

  // Listen to active jobs for real-time tech status
  useEffect(() => {
    if (!currentUser?.uid) return;
    const jobsRef = collection(db, 'companies', currentUser.uid, 'jobs');
    const q = query(jobsRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setActiveJobs(jobs);
    });
    return () => unsubscribe();
  }, [userProfile]);

  // Get real-time status for a technician based on their jobs
  const getTechLiveStatus = (techName) => {
    const techJobs = activeJobs.filter(j => j.assignedToName === techName);
    const enRouteJob = techJobs.find(j => j.status === 'en_route');
    if (enRouteJob) return { status: 'en_route', label: 'En Route', customer: enRouteJob.customerName, color: 'bg-purple-500', textColor: 'text-purple-700', bgColor: 'bg-purple-50' };
    const inProgressJob = techJobs.find(j => j.status === 'in_progress');
    if (inProgressJob) return { status: 'in_progress', label: 'Working', customer: inProgressJob.customerName, color: 'bg-yellow-500', textColor: 'text-yellow-700', bgColor: 'bg-yellow-50' };
    const scheduledJobs = techJobs.filter(j => j.status === 'scheduled');
    if (scheduledJobs.length > 0) return { status: 'scheduled', label: `${scheduledJobs.length} job${scheduledJobs.length > 1 ? 's' : ''} scheduled`, customer: null, color: 'bg-blue-500', textColor: 'text-blue-700', bgColor: 'bg-blue-50' };
    return null;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const handleAddClick = () => {
    if (!canAddTech) {
      setShowUpgradeModal(true);
      return;
    }
    setShowAddModal(true);
  };

  const handleEdit = (tech) => {
    setEditingTech(tech.id);
    setEditForm({ name: tech.name, email: tech.email, phone: tech.phone, status: tech.status });
  };

  const handleSaveEdit = async (techId) => {
    if (!currentUser?.uid) return;
    try {
      const techRef = doc(db, 'companies', currentUser.uid, 'technicians', techId);
      await updateDoc(techRef, { ...editForm, updatedAt: new Date() });
      setEditingTech(null);
      alert('Technician updated successfully!');
    } catch (error) {
      console.error('Error updating technician:', error);
      alert('Failed to update technician');
    }
  };

  const handleDelete = async (techId, techName) => {
    if (!window.confirm(`Are you sure you want to delete ${techName}?`)) return;
    try {
      const techRef = doc(db, 'companies', currentUser.uid, 'technicians', techId);
      await deleteDoc(techRef);
      alert('Technician deleted successfully!');
    } catch (error) {
      console.error('Error deleting technician:', error);
      alert('Failed to delete technician');
    }
  };

  return (
    <>
      <div className="w-80 bg-white border-r border-gray-200 h-full overflow-y-auto">
        <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-900">Technicians</h2>
            <button
              onClick={handleAddClick}
              className="flex items-center bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 transition text-sm"
            >
              <FiPlus className="mr-1" />
              Add
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            {technicians.length}/{planDetails?.techLimit || 10} on {planDetails?.name || 'Starter Plan'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onTechnicianSelect(null)}
              className={`px-3 py-1 rounded-lg text-sm transition ${
                !selectedTechnicianId
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Jobs
            </button>
          </div>
        </div>

        <div className="p-4 space-y-2">
          {technicians.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FiUser className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No technicians yet</p>
              <button onClick={handleAddClick} className="text-primary-600 text-sm mt-2 hover:underline">
                Add your first technician
              </button>
            </div>
          ) : (
            technicians.map(tech => (
              <div
                key={tech.id}
                className={`border rounded-lg p-3 transition ${
                  selectedTechnicianId === tech.id
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {editingTech === tech.id ? (
                  <div className="space-y-2">
                    <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-2 py-1 border rounded text-sm" placeholder="Name" />
                    <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-2 py-1 border rounded text-sm" placeholder="Email" />
                    <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-2 py-1 border rounded text-sm" placeholder="Phone" />
                    <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="w-full px-2 py-1 border rounded text-sm">
                      <option value="available">Available</option>
                      <option value="busy">Busy</option>
                      <option value="offline">Offline</option>
                    </select>
                    <div className="flex gap-2">
                      <button onClick={() => handleSaveEdit(tech.id)} className="flex-1 bg-primary-600 text-white px-2 py-1 rounded text-sm hover:bg-primary-700">Save</button>
                      <button onClick={() => setEditingTech(null)} className="flex-1 bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm hover:bg-gray-300">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div onClick={() => onTechnicianSelect(selectedTechnicianId === tech.id ? null : tech.id)} className="cursor-pointer">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                          <div className={`w-2.5 h-2.5 rounded-full ${getTechLiveStatus(tech.name)?.color || getStatusColor(tech.status)} mr-2`}></div>
                          <h3 className="font-semibold text-gray-900">{tech.name}</h3>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{tech.email}</p>
                      <p className="text-sm text-gray-600">{tech.phone}</p>
                      {getTechLiveStatus(tech.name) ? (
                        <div className={`mt-2 px-2 py-1 rounded-md ${getTechLiveStatus(tech.name).bgColor} flex items-center gap-1`}>
                          {getTechLiveStatus(tech.name).status === 'en_route' && <FiNavigation className={`h-3 w-3 ${getTechLiveStatus(tech.name).textColor}`} />}
                          {getTechLiveStatus(tech.name).status === 'in_progress' && <FiTool className={`h-3 w-3 ${getTechLiveStatus(tech.name).textColor}`} />}
                          <span className={`text-xs font-semibold ${getTechLiveStatus(tech.name).textColor}`}>
                            {getTechLiveStatus(tech.name).label}
                          </span>
                          {getTechLiveStatus(tech.name).customer && (
                            <span className={`text-xs ${getTechLiveStatus(tech.name).textColor} opacity-75`}>
                              — {getTechLiveStatus(tech.name).customer}
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 mt-1 capitalize">{tech.status}</p>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(tech); }} className="flex-1 flex items-center justify-center text-sm text-gray-600 hover:text-primary-600">
                        <FiEdit2 className="h-4 w-4 mr-1" /> Edit
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(tech.id, tech.name); }} className="flex-1 flex items-center justify-center text-sm text-gray-600 hover:text-red-600">
                        <FiTrash2 className="h-4 w-4 mr-1" /> Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <AddTechnicianModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={currentPlan}
        reason={`You've reached your plan limit of ${planDetails?.techLimit || 10} technicians. Upgrade to add more.`}
      />
    </>
  );
};

export default TechnicianSidebar;
