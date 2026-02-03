import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTruck, FiUser, FiClipboard, FiSmartphone, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../config/firebase';

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [technicianData, setTechnicianData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  const [jobData, setJobData] = useState({
    customerName: '',
    customerPhone: '',
    address: '',
    jobType: 'Installation',
    notes: ''
  });

  const handleWelcomeNext = () => {
    setShowWelcome(false);
  };

  const handleSkipOnboarding = () => {
    navigate('/dashboard');
  };

  // Step 1: Add First Technician
  const handleAddTechnician = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const companyId = userProfile?.companyId || currentUser?.uid;
      
      // Add technician to Firestore
      await addDoc(collection(db, 'companies', companyId, 'technicians'), {
        name: technicianData.name,
        email: technicianData.email,
        phone: technicianData.phone,
        status: 'active',
        createdAt: new Date()
      });

      // Update company technician count
      await updateDoc(doc(db, 'companies', companyId), {
        technicianCount: increment(1)
      });

      setStep(1);
      setLoading(false);
    } catch (error) {
      console.error('Error adding technician:', error);
      alert('Failed to add technician. Please try again.');
      setLoading(false);
    }
  };

  // Step 2: Create First Job
  const handleCreateJob = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const companyId = userProfile?.companyId || currentUser?.uid;
      
      // Add job to Firestore
      await addDoc(collection(db, 'companies', companyId, 'jobs'), {
        customerName: jobData.customerName,
        customerPhone: jobData.customerPhone,
        address: jobData.address,
        jobType: jobData.jobType,
        notes: jobData.notes,
        status: 'unassigned',
        priority: 'normal',
        assignedTo: null,
        createdAt: new Date(),
        createdBy: currentUser.uid
      });

      setStep(2);
      setLoading(false);
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Failed to create job. Please try again.');
      setLoading(false);
    }
  };

  // Step 3: Complete
  const handleComplete = () => {
    navigate('/dashboard');
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 md:p-12">
          <div className="text-center">
            <div className="inline-block p-4 bg-primary-100 rounded-full mb-6">
              <FiTruck className="h-16 w-16 text-primary-600" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to DispatchOps! 👋
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              Let's get you set up in under 3 minutes.<br />
              We'll help you add your first technician and create your first job.
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-gray-900 mb-4">Here's what we'll do:</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <FiUser className="h-6 w-6 text-primary-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Add your first technician</p>
                    <p className="text-sm text-gray-600">We'll send them an invite to the mobile app</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FiClipboard className="h-6 w-6 text-primary-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Create your first job</p>
                    <p className="text-sm text-gray-600">See how easy it is to dispatch work</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FiSmartphone className="h-6 w-6 text-primary-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Get your team using the mobile app</p>
                    <p className="text-sm text-gray-600">Real-time updates from the field</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleWelcomeNext}
                className="flex-1 bg-primary-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-primary-700 transition text-lg"
              >
                Let's Go!
              </button>
              <button
                onClick={handleSkipOnboarding}
                className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-lg font-semibold hover:bg-gray-200 transition text-lg"
              >
                Skip for Now
              </button>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              You can always access this tutorial later from the help menu
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {step + 1} of 3
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((step + 1) / 3) * 100)}% Complete
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-600 transition-all duration-500"
              style={{ width: `${((step + 1) / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 0: Add First Technician */}
        {step === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-primary-100 rounded-lg mr-4">
                <FiUser className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Add Your First Technician</h2>
                <p className="text-gray-600">We'll send them an invite to download the mobile app</p>
              </div>
            </div>

            <form onSubmit={handleAddTechnician} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technician Name *
                </label>
                <input
                  type="text"
                  value={technicianData.name}
                  onChange={(e) => setTechnicianData({...technicianData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="John Smith"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={technicianData.email}
                  onChange={(e) => setTechnicianData({...technicianData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={technicianData.phone}
                  onChange={(e) => setTechnicianData({...technicianData, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="(555) 123-4567"
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 After adding, we'll send {technicianData.name || 'them'} an email and SMS with instructions to download the mobile app.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
              >
                {loading ? 'Adding Technician...' : 'Add Technician & Continue'}
              </button>
            </form>
          </div>
        )}

        {/* Step 1: Create First Job */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
                <FiCheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <p className="text-center text-green-600 font-semibold mb-6">
                ✓ Great! {technicianData.name} has been added.
              </p>
            </div>

            <div className="flex items-center mb-6">
              <div className="p-3 bg-primary-100 rounded-lg mr-4">
                <FiClipboard className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Create Your First Job</h2>
                <p className="text-gray-600">{technicianData.name} will see this on their mobile app</p>
              </div>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={jobData.customerName}
                  onChange={(e) => setJobData({...jobData, customerName: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="Jane Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Phone *
                </label>
                <input
                  type="tel"
                  value={jobData.customerPhone}
                  onChange={(e) => setJobData({...jobData, customerPhone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="(555) 987-6543"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Address *
                </label>
                <input
                  type="text"
                  value={jobData.address}
                  onChange={(e) => setJobData({...jobData, address: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="123 Main St, Philadelphia, PA 19103"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type *
                </label>
                <select
                  value={jobData.jobType}
                  onChange={(e) => setJobData({...jobData, jobType: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                >
                  <option>Installation</option>
                  <option>Repair</option>
                  <option>Maintenance</option>
                  <option>Emergency</option>
                  <option>Inspection</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={jobData.notes}
                  onChange={(e) => setJobData({...jobData, notes: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  rows="3"
                  placeholder="Any special instructions or details..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
              >
                {loading ? 'Creating Job...' : 'Create Job & Continue'}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Complete */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mx-auto mb-6">
              <FiCheckCircle className="h-12 w-12 text-green-600" />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              You're All Set! 🎉
            </h2>

            <p className="text-xl text-gray-600 mb-8">
              Your dispatch system is ready to use.
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-gray-900 mb-4">What happens next:</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">📱</span>
                  <p className="text-gray-700">{technicianData.name} will receive an invite to download the mobile app</p>
                </div>
                <div className="flex items-start">
                  <span className="text-2xl mr-3">👀</span>
                  <p className="text-gray-700">They'll see the job you just created and can update its status</p>
                </div>
                <div className="flex items-start">
                  <span className="text-2xl mr-3">📊</span>
                  <p className="text-gray-700">You'll see real-time updates on your dashboard</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleComplete}
              className="w-full bg-primary-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-primary-700 transition text-lg"
            >
              Go to Dashboard
            </button>

            <p className="mt-4 text-sm text-gray-500">
              Need help? Check out our tutorial videos in the Help menu
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;
