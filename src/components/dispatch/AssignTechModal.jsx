import React, { useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { X, User } from 'lucide-react';

const AssignTechModal = ({ job, techs, onClose }) => {
  const [selectedTech, setSelectedTech] = useState(job.assignedTo || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAssign = async () => {
    setLoading(true);
    setError('');

    try {
      const tech = techs.find(t => t.id === selectedTech);
      
      await updateDoc(doc(db, 'jobs', job.id), {
        assignedTo: selectedTech || null,
        assignedToName: tech ? tech.name : null,
        updatedAt: serverTimestamp()
      });

      onClose();
    } catch (err) {
      console.error('Error assigning technician:', err);
      setError('Failed to assign technician. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Assign Technician</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Job Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Job</div>
            <div className="font-semibold text-gray-900">{job.customerName}</div>
            <div className="text-sm text-gray-600">{job.customerAddress}</div>
            <div className="text-sm text-gray-600 mt-2">
              {new Date(job.scheduledDateTime).toLocaleDateString()} at{' '}
              {new Date(job.scheduledDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          {/* Tech Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Technician
            </label>
            <div className="space-y-2">
              {/* Unassigned Option */}
              <button
                type="button"
                onClick={() => setSelectedTech('')}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  selectedTech === ''
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedTech === '' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <User className={`w-5 h-5 ${
                    selectedTech === '' ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">Unassigned</div>
                  <div className="text-sm text-gray-500">No technician assigned</div>
                </div>
                {selectedTech === '' && (
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>

              {/* Tech Options */}
              {techs.map(tech => (
                <button
                  key={tech.id}
                  type="button"
                  onClick={() => setSelectedTech(tech.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    selectedTech === tech.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    selectedTech === tech.id ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <User className={`w-5 h-5 ${
                      selectedTech === tech.id ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">{tech.name}</div>
                    <div className="text-sm text-gray-500">{tech.email}</div>
                  </div>
                  {selectedTech === tech.id && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Assigning...' : 'Assign Tech'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignTechModal;