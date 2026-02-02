import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiTruck, FiLogOut, FiPlus, FiUsers } from 'react-icons/fi';
import JobBoard from '../jobs/JobBoard';
import CreateJobModal from '../jobs/CreateJobModal';
import StatsCards from '../dashboard/StatsCards';
import { usePlanLimits } from '../../hooks/usePlanLimits';
import UpgradeModal from '../subscription/UpgradeModal';

const DispatchDashboard = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const { canAddTech, currentPlan, planDetails, techCount } = usePlanLimits(userProfile);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const companyName = userProfile?.company?.name || 'Your Company';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/logo.png" alt="Cloud Dispatch Ops" className="h-8 w-8" />
              <FiTruck className="h-6 w-6 text-primary-600 ml-2" />
              <span className="ml-2 text-2xl font-bold text-gray-900">Cloud Dispatch Ops</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {planDetails?.name || 'Starter Plan'} — {techCount}/{planDetails?.techLimit || 10} techs
              </span>
              <button
                onClick={() => navigate('/dispatch/technicians')}
                className="flex items-center text-primary-600 hover:text-primary-800 px-3 py-2 rounded-lg hover:bg-primary-50"
              >
                <FiUsers className="mr-2 h-5 w-5" />
                Manage Technicians
              </button>
              <button
                onClick={() => setShowCreateJobModal(true)}
                className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
              >
                <FiPlus className="mr-2" />
                Create Job
              </button>
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900">{companyName}</p>
                <p className="text-xs text-gray-500 capitalize">{currentPlan} Plan</p>
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

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Dispatch Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage jobs and technicians</p>
          </div>

          {/* Stats Cards */}
          <StatsCards />

          {/* Job Board - Kanban with drag-and-drop */}
          <div className="bg-white rounded-lg shadow p-6">
            <JobBoard
              onCreateJob={() => setShowCreateJobModal(true)}
            />
          </div>
        </div>
      </div>

      {/* Create Job Modal - uses the correct companies/{companyId}/jobs collection */}
      <CreateJobModal
        isOpen={showCreateJobModal}
        onClose={() => setShowCreateJobModal(false)}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={currentPlan}
        reason={`You've reached your plan limit of ${planDetails?.techLimit || 10} technicians. Upgrade to add more technicians.`}
      />
    </div>
  );
};

export default DispatchDashboard;
