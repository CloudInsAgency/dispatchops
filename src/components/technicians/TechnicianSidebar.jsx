import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, onSnapshot, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { FiPlus, FiUser, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import AddTechnicianModal from './AddTechnicianModal';

const TechnicianSidebar = ({ onTechnicianSelect, selectedTechnicianId }) => {
  const { userProfile } = useAuth();
  const [technicians, setTechnicians] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTech, setEditingTech] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', status: '' });

  // Fetch technicians
  useEffect(() => {
    if (!userProfile?.companyId) return;

    const techRef = collection(db, 'companies', userProfile.companyId, 'technicians');
    const q = query(techRef, orderBy('name', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const techData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTechnicians(techData);
    }, (error) => {
      console.error('Error fetching technicians:', error);
    });

    return () => unsubscribe();
  }, [userProfile]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const handleEdit = (tech) => {
    setEditingTech(tech.id);
    setEditForm({
      name: tech.name,
      email: tech.email,
      phone: tech.phone,
      status: tech.status
    });
  };

  const handleSaveEdit = async (techId) => {
    if (!userProfile?.companyId) return;

    try {
      const techRef = doc(db, 'companies', userProfile.companyId, 'technicians', techId);
      await updateDoc(techRef, {
        ...editForm,
        updatedAt: new Date()
      });
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
      const techRef = doc(db, 'companies', userProfile.companyId, 'technicians', techId);
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
        {/* Header */}
        <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Technicians</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 transition text-sm"
            >
              <FiPlus className="mr-1" />
              Add
            </button>
          </div>

          {/* Filter Buttons */}
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

        {/* Technician List */}
        <div className="p-4 space-y-2">
          {technicians.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FiUser className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No technicians yet</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="text-primary-600 text-sm mt-2 hover:underline"
              >
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
                  // Edit Mode
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-2 py-1 border rounded text-sm"
                      placeholder="Name"
                    />
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-2 py-1 border rounded text-sm"
                      placeholder="Email"
                    />
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-2 py-1 border rounded text-sm"
                      placeholder="Phone"
                    />
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full px-2 py-1 border rounded text-sm"
                    >
                      <option value="available">Available</option>
                      <option value="busy">Busy</option>
                      <option value="offline">Offline</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(tech.id)}
                        className="flex-1 bg-primary-600 text-white px-2 py-1 rounded text-sm hover:bg-primary-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingTech(null)}
                        className="flex-1 bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <div
                      onClick={() => onTechnicianSelect(selectedTechnicianId === tech.id ? null : tech.id)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(tech.status)} mr-2`}></div>
                          <h3 className="font-semibold text-gray-900">{tech.name}</h3>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{tech.email}</p>
                      <p className="text-sm text-gray-600">{tech.phone}</p>
                      <p className="text-xs text-gray-500 mt-1 capitalize">{tech.status}</p>
                    </div>
                    
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(tech);
                        }}
                        className="flex-1 flex items-center justify-center text-sm text-gray-600 hover:text-primary-600"
                      >
                        <FiEdit2 className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(tech.id, tech.name);
                        }}
                        className="flex-1 flex items-center justify-center text-sm text-gray-600 hover:text-red-600"
                      >
                        <FiTrash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Technician Modal */}
      <AddTechnicianModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </>
  );
};

export default TechnicianSidebar;
