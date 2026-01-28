import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiTruck, FiLogOut, FiPlus, FiMenu } from 'react-icons/fi';
import JobBoard from '../jobs/JobBoard';
import CreateJobModal from '../jobs/CreateJobModal';
import TechnicianSidebar from '../technicians/TechnicianSidebar';
import StatsCards from './StatsCards';

const Dashboard = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const companyName = userProfile?.company?.name || 'Your Company';
  const tierName = userProfile?.company?.tier || 'starter';
  const trialEndsAt = userProfile?.company?.trialEndsAt?.toDate();
  const daysLeft = trialEndsAt ? Math.ceil((trialEndsAt - new Date()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <FiMenu className="h-6 w-6" />
              </button>
              <img src="/logo.png" alt="Cloud Dispatch Ops" className="h-8 w-8" />
              <FiTruck className="h-6 w-6 text-primary-600 ml-2" />
              <span className="ml-2 text-2xl font-bold text-gray-900">Cloud Dispatch Ops</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateJobModal(true)}
                className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
              >
                <FiPlus className="mr-2" />
                Create Job
              </button>
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900">{companyName}</p>
                <p className="text-xs text-gray-500 capitalize">{tierName} Plan</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <FiLogOut className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Trial Banner */}
      {daysLeft > 0 && (
        <div className="bg-primary-600 text-white py-3">
          <div className="px-4 sm:px-6 lg:px-8 text-center">
            <p className="font-medium">
              🎉 Your free trial has {daysLeft} days remaining. No credit card required until trial ends.
            </p>
          </div>
        </div>
      )}

      {/* Main Content with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Technician Sidebar */}
        {showSidebar && (
          <TechnicianSidebar
            onTechnicianSelect={setSelectedTechnicianId}
            selectedTechnicianId={selectedTechnicianId}
          />
        )}

        {/* Job Board */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Dispatch Board
                {selectedTechnicianId && (
                  <span className="text-lg font-normal text-gray-600 ml-3">
                    (Filtered by technician)
                  </span>
                )}
              </h1>
              <p className="text-gray-600 mt-2">Manage and track all your field service jobs</p>
            </div>

            {/* Stats Cards */}
            <StatsCards />

            {/* Job Board */}
            <div className="bg-white rounded-lg shadow p-6">
              <JobBoard 
                onCreateJob={() => setShowCreateJobModal(true)}
                selectedTechnicianId={selectedTechnicianId}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Create Job Modal */}
      <CreateJobModal 
        isOpen={showCreateJobModal}
        onClose={() => setShowCreateJobModal(false)}
      />
    </div>
  );
};

export default Dashboard;