import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc, deleteDoc, collection, getDocs, arrayUnion } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { FiX, FiEdit2, FiTrash2, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import JobActivityLog from './JobActivityLog';

const JobDetailsModal = ({ isOpen, onClose, job }) => {
  const { userProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    address: '',
    jobType: '',
    priority: '',
    assignedTo: '',
    assignedToName: '',
    scheduledDate: '',
    scheduledTime: '',
    notes: '',
    status: ''
  });

  useEffect(() => {
    if (job) {
      let schedDate = '';
      let schedTime = '';
      if (job.scheduledDateTime) {
        const dateTime = new Date(job.scheduledDateTime);
        schedDate = dateTime.toISOString().split('T')[0];
        schedTime = dateTime.toTimeString().slice(0, 5);
      }

      setFormData({
        customerName: job.customerName || '',
        customerPhone: job.customerPhone || '',
        address: job.address || '',
        jobType: job.jobType || '',
        priority: job.priority || '',
        assignedTo: job.assignedTo || '',
        assignedToName: job.assignedToName || '',
        scheduledDate: schedDate,
        scheduledTime: schedTime,
        notes: job.notes || '',
        status: job.status || ''
      });
    }
  }, [job]);

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

    if (name === 'assignedTo') {
      const tech = technicians.find(t => t.id === value);
      setFormData(prev => ({
        ...prev,
        assignedToName: tech ? tech.name : '',
        status: value ? 'scheduled' : 'unassigned'
      }));
    }
  };

  const handleSave = async () => {
    if (!userProfile?.companyId || !job?.id) return;

    setLoading(true);
    const loadingToast = toast.loading('Updating job...');
    
    try {
      const jobRef = doc(db, 'companies', userProfile.companyId, 'jobs', job.id);
      
      let scheduledDateTime = null;
      if (formData.scheduledDate && formData.scheduledTime) {
        scheduledDateTime = `${formData.scheduledDate}T${formData.scheduledTime}`;
      } else if (formData.scheduledDate) {
        scheduledDateTime = `${formData.scheduledDate}T09:00`;
      }

      // Track ALL changes for activity log
      const activities = [];
      const userName = userProfile.fullName || 'System';

      // Status change
      if (job.status !== formData.status) {
        activities.push({
          type: 'status_changed',
          field: 'status',
          oldValue: job.status,
          newValue: formData.status,
          userName: userName,
          timestamp: new Date()
        });
      }

      // Assignment change
      if (job.assignedTo !== formData.assignedTo) {
        activities.push({
          type: 'assigned',
          field: 'technician',
          oldValue: job.assignedToName || 'Unassigned',
          newValue: formData.assignedToName || 'Unassigned',
          userName: userName,
          timestamp: new Date()
        });
      }

      // Priority change
      if (job.priority !== formData.priority) {
        activities.push({
          type: 'updated',
          field: 'priority',
          oldValue: job.priority,
          newValue: formData.priority,
          userName: userName,
          timestamp: new Date()
        });
      }

      // Job type change
      if (job.jobType !== formData.jobType) {
        activities.push({
          type: 'updated',
          field: 'job type',
          oldValue: job.jobType,
          newValue: formData.jobType,
          userName: userName,
          timestamp: new Date()
        });
      }

      // Notes change
      if (job.notes !== formData.notes) {
        activities.push({
          type: 'note_added',
          field: 'notes',
          oldValue: job.notes || '(none)',
          newValue: formData.notes || '(removed)',
          userName: userName,
          timestamp: new Date()
        });
      }

      // Customer info changes
      if (job.customerName !== formData.customerName) {
        activities.push({
          type: 'updated',
          field: 'customer name',
          oldValue: job.customerName,
          newValue: formData.customerName,
          userName: userName,
          timestamp: new Date()
        });
      }

      if (job.customerPhone !== formData.customerPhone) {
        activities.push({
          type: 'updated',
          field: 'phone number',
          oldValue: job.customerPhone,
          newValue: formData.customerPhone,
          userName: userName,
          timestamp: new Date()
        });
      }

      if (job.address !== formData.address) {
        activities.push({
          type: 'updated',
          field: 'address',
          oldValue: job.address,
          newValue: formData.address,
          userName: userName,
          timestamp: new Date()
        });
      }

      // Scheduled date/time change
      if (job.scheduledDateTime !== scheduledDateTime) {
        const oldDate = job.scheduledDateTime 
          ? new Date(job.scheduledDateTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
          : 'Not scheduled';
        const newDate = scheduledDateTime 
          ? new Date(scheduledDateTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
          : 'Not scheduled';
        
        activities.push({
          type: 'updated',
          field: 'scheduled time',
          oldValue: oldDate,
          newValue: newDate,
          userName: userName,
          timestamp: new Date()
        });
      }

      // If no specific changes, just log a general update
      if (activities.length === 0) {
        activities.push({
          type: 'updated',
          field: 'general',
          userName: userName,
          timestamp: new Date()
        });
      }

      await updateDoc(jobRef, {
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
        updatedAt: new Date(),
        activityLog: arrayUnion(...activities)
      });

      toast.success('Job updated successfully!', { id: loadingToast });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error('Failed to update job', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userProfile?.companyId || !job?.id) return;
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) return;

    setLoading(true);
    const loadingToast = toast.loading('Deleting job...');
    
    try {
      const jobRef = doc(db, 'companies', userProfile.companyId, 'jobs', job.id);
      await deleteDoc(jobRef);
      toast.success('Job deleted successfully!', { id: loadingToast });
      onClose();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !job) return null;

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Not scheduled';
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Job' : 'Job Details'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!isEditing ? (
            <>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                <div className="space-y-2 text-gray-700">
                  <p><span className="font-medium">Name:</span> {job.customerName}</p>
                  <p><span className="font-medium">Phone:</span> {job.customerPhone}</p>
                  <p><span className="font-medium">Address:</span> {job.address}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h3>
                <div className="space-y-2 text-gray-700">
                  <p><span className="font-medium">Type:</span> <span className="capitalize">{job.jobType}</span></p>
                  <p><span className="font-medium">Priority:</span> <span className="capitalize">{job.priority}</span></p>
                  <p><span className="font-medium">Status:</span> <span className="capitalize">{job.status.replace('_', ' ')}</span></p>
                  <p><span className="font-medium">Scheduled:</span> {formatDateTime(job.scheduledDateTime)}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment</h3>
                <p className="text-gray-700">
                  <span className="font-medium">Technician:</span> {job.assignedToName || 'Unassigned'}
                </p>
              </div>

              {job.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{job.notes}</p>
                </div>
              )}

              {/* Activity Log */}
              <div className="pt-6 border-t border-gray-200">
                <JobActivityLog activities={job.activityLog || []} />
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <FiTrash2 className="mr-2" />
                  Delete Job
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  <FiEdit2 className="mr-2" />
                  Edit Job
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                    <select
                      name="jobType"
                      value={formData.jobType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                    >
                      <option value="installation">Installation</option>
                      <option value="repair">Repair</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="inspection">Inspection</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                    >
                      <option value="unassigned">Unassigned</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Time</label>
                    <input
                      type="time"
                      name="scheduledTime"
                      value={formData.scheduledTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment</h3>
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                >
                  <option value="">Leave Unassigned</option>
                  {technicians.map(tech => (
                    <option key={tech.id} value={tech.id}>{tech.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                >
                  <FiSave className="mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;
