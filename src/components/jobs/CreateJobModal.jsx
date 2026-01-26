import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CreateJobModal = ({ isOpen, onClose }) => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    address: '',
    jobType: 'installation',
    priority: 'medium',
    assignedTo: '',
    assignedToName: '',
    scheduledDate: '',
    scheduledTime: '',
    notes: '',
    status: 'unassigned'
  });

  useEffect(() => {
    const fetchTechnicians = async () => {
      if (!userProfile?.companyId) return;
      
      try {
        const techRef = collection(db, 'companies', userProfile.companyId, 'technicians');
        const snapshot = await getDocs(techRef);
        const techData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTechnicians(techData);
      } catch (error) {
        console.error('Error fetching technicians:', error);
      }
    };

    if (isOpen) {
      fetchTechnicians();
    }
  }, [isOpen, userProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'assignedTo' && value) {
      const tech = technicians.find(t => t.id === value);
      setFormData(prev => ({
        ...prev,
        assignedToName: tech ? tech.name : '',
        status: value ? 'scheduled' : 'unassigned'
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userProfile?.companyId) return;

    setLoading(true);
    const loadingToast = toast.loading('Creating job...');
    
    try {
      const jobsRef = collection(db, 'companies', userProfile.companyId, 'jobs');
      
      let scheduledDateTime = null;
      if (formData.scheduledDate && formData.scheduledTime) {
        scheduledDateTime = `${formData.scheduledDate}T${formData.scheduledTime}`;
      } else if (formData.scheduledDate) {
        scheduledDateTime = `${formData.scheduledDate}T09:00`;
      }
      
      await addDoc(jobsRef, {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        address: formData.address,
        jobType: formData.jobType,
        priority: formData.priority,
        assignedTo: formData.assignedTo,
        assignedToName: formData.assignedToName,
        scheduledDateTime: scheduledDateTime,
        notes: formData.notes,
        status: formData.status,
        createdAt: serverTimestamp(),
        createdBy: userProfile.uid,
        updatedAt: serverTimestamp(),
        activityLog: [{
          type: 'created',
          userName: userProfile.fullName || 'System',
          timestamp: new Date()
        }]
      });

      setFormData({
        customerName: '',
        customerPhone: '',
        address: '',
        jobType: 'installation',
        priority: 'medium',
        assignedTo: '',
        assignedToName: '',
        scheduledDate: '',
        scheduledTime: '',
        notes: '',
        status: 'unassigned'
      });

      toast.success('Job created successfully!', { id: loadingToast });
      onClose();
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create New Job</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Address *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                placeholder="123 Main St, City, State 12345"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Type *</label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                >
                  <option value="installation">Installation</option>
                  <option value="repair">Repair</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inspection">Inspection</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date</label>
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Time</label>
                <input
                  type="time"
                  name="scheduledTime"
                  value={formData.scheduledTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Technician (Optional)</label>
              <select
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              >
                <option value="">Leave Unassigned</option>
                {technicians.map(tech => (
                  <option key={tech.id} value={tech.id}>{tech.name}</option>
                ))}
              </select>
              {technicians.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">No technicians available. Add technicians in settings.</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              placeholder="Any special instructions or details..."
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJobModal;
