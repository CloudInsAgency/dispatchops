import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FiSettings, FiUser, FiBell, FiLock } from 'react-icons/fi';

const SettingsPage = () => {
  const { userProfile } = useAuth();
  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and company settings</p>
      </div>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <FiUser className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" defaultValue={userProfile?.fullName || ''} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" defaultValue={userProfile?.email || ''} disabled className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <FiSettings className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Company</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input type="text" defaultValue={userProfile?.company?.name || ''} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" defaultValue={userProfile?.company?.phone || ''} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
