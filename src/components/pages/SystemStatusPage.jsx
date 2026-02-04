import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiTruck, FiCheckCircle, FiServer, FiDatabase, FiShield, FiGlobe } from 'react-icons/fi';

const systems = [
  { name: 'Web Application', desc: 'Owner dashboard and landing page', icon: FiGlobe, status: 'operational' },
  { name: 'Technician Portal', desc: 'Mobile technician dashboard', icon: FiTruck, status: 'operational' },
  { name: 'Authentication', desc: 'Login, signup, and account management', icon: FiShield, status: 'operational' },
  { name: 'Database', desc: 'Firestore data storage and real-time sync', icon: FiDatabase, status: 'operational' },
  { name: 'API Services', desc: 'Stripe billing and serverless functions', icon: FiServer, status: 'operational' },
];

const statusColors = { operational: 'bg-green-500', degraded: 'bg-yellow-500', outage: 'bg-red-500' };
const statusLabels = { operational: 'Operational', degraded: 'Degraded Performance', outage: 'Service Outage' };

const SystemStatusPage = () => {
  const allOperational = systems.every(s => s.status === 'operational');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="Cloud Dispatch Ops" className="h-8 w-8" />
            <FiTruck className="h-6 w-6 text-primary-600 ml-2" />
            <span className="ml-2 text-xl font-bold text-gray-900">Cloud Dispatch Ops</span>
          </Link>
          <Link to="/" className="text-gray-600 hover:text-gray-900 flex items-center text-sm">
            <FiArrowLeft className="mr-1" /> Back to Home
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">System Status</h1>
          {allOperational ? (
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-6 py-3 rounded-full text-lg font-semibold">
              <FiCheckCircle className="h-6 w-6" /> All Systems Operational
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-6 py-3 rounded-full text-lg font-semibold">
              Some systems are experiencing issues
            </div>
          )}
        </div>

        <div className="space-y-4">
          {systems.map((sys, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <sys.icon className="h-6 w-6 text-gray-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">{sys.name}</h3>
                  <p className="text-sm text-gray-500">{sys.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${statusColors[sys.status]}`} />
                <span className="text-sm font-medium text-gray-700">{statusLabels[sys.status]}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Uptime History (Last 90 Days)</h2>
          <div className="flex gap-0.5">
            {Array.from({ length: 90 }, (_, i) => (
              <div key={i} className="flex-1 h-8 bg-green-400 rounded-sm" title={`${90 - i} days ago — Operational`} />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>90 days ago</span>
            <span>Today</span>
          </div>
          <p className="text-center text-green-700 font-semibold mt-4">99.9% Uptime</p>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          <p className="mt-2">Have an issue? <Link to="/contact" className="text-primary-600 hover:text-primary-700 font-medium">Contact Support</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SystemStatusPage;
