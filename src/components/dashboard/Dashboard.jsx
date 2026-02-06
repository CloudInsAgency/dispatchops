import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FiPlus } from 'react-icons/fi';
import JobBoard from '../jobs/JobBoard';
import CreateJobModal from '../jobs/CreateJobModal';
import TechnicianSidebar from '../technicians/TechnicianSidebar';
import StatsCards from './StatsCards';

const Dashboard = () => {
  const { userProfile, currentUser } = useAuth();
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState(null);
  const [showTechSidebar, setShowTechSidebar] = useState(true);

  const trialEndsAt = userProfile?.company?.trialEndsAt?.toDate?.();
  const daysLeft = trialEndsAt ? Math.ceil((trialEndsAt - new Date()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="flex flex-col h-full">
      {daysLeft > 0 && (
        <div className="bg-primary-600 text-white py-3">
          <div className="px-4 sm:px-6 lg:px-8 text-center">
            <p className="font-medium">🎉 Your free trial has {daysLeft} days remaining. No credit card required until trial ends.</p>
          </div>
        </div>
      )}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dispatch Board{selectedTechnicianId && <span className="text-base font-normal text-gray-500 ml-2">(Filtered by technician)</span>}</h1>
            <p className="text-gray-600 text-sm mt-1">Manage and track all your field service jobs</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowTechSidebar(!showTechSidebar)} className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium hidden lg:block">
              {showTechSidebar ? 'Hide' : 'Show'} Technicians
            </button>
            <button onClick={() => setShowCreateJobModal(true)} className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition shadow-sm">
              <FiPlus className="mr-2 h-5 w-5" />Create Job
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        {showTechSidebar && (
          <div className="hidden lg:block">
            <TechnicianSidebar onTechnicianSelect={setSelectedTechnicianId} selectedTechnicianId={selectedTechnicianId} />
          </div>
        )}
        <div className="flex-1 overflow-auto p-6">
          <StatsCards />
          <div className="bg-white rounded-lg shadow mt-6 p-6">
            <JobBoard onCreateJob={() => setShowCreateJobModal(true)} selectedTechnicianId={selectedTechnicianId} />
          </div>
        </div>
      </div>
      <CreateJobModal isOpen={showCreateJobModal} onClose={() => setShowCreateJobModal(false)} />
    </div>
  );
};

export default Dashboard;
