import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { FiUser, FiSettings, FiClock, FiMapPin, FiSave, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const defaultHours = DAYS.reduce((acc, day) => {
  acc[day] = { enabled: day !== 'Saturday' && day !== 'Sunday', open: '08:00', close: '17:00' };
  return acc;
}, {});

const SettingsPage = () => {
  const { userProfile, loadUserProfile, currentUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Profile fields
  const [fullName, setFullName] = useState('');

  // Company fields
  const [companyName, setCompanyName] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyCity, setCompanyCity] = useState('');
  const [companyState, setCompanyState] = useState('');
  const [companyZip, setCompanyZip] = useState('');

  // Business hours
  const [businessHours, setBusinessHours] = useState(defaultHours);

  // Service area
  const [serviceRadius, setServiceRadius] = useState('');
  const [serviceZips, setServiceZips] = useState('');

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName || '');
      const c = userProfile.company || {};
      setCompanyName(c.name || '');
      setCompanyPhone(c.phone || '');
      setCompanyEmail(c.ownerEmail || userProfile.email || '');
      setCompanyAddress(c.address || '');
      setCompanyCity(c.city || '');
      setCompanyState(c.state || '');
      setCompanyZip(c.zip || '');
      if (c.businessHours) setBusinessHours({ ...defaultHours, ...c.businessHours });
      setServiceRadius(c.serviceRadius || '');
      setServiceZips(c.serviceZips || '');
    }
  }, [userProfile]);

  const handleSave = async () => {
    setSaving(true);
    const loadingToast = toast.loading('Saving settings...');
    try {
      // Update user doc
      const userRef = doc(db, 'users', userProfile.uid);
      await updateDoc(userRef, { fullName, updatedAt: new Date() });

      // Update company doc
      if (currentUser?.uid) {
        const companyRef = doc(db, 'companies', currentUser.uid);
        await updateDoc(companyRef, {
          name: companyName,
          phone: companyPhone,
          ownerEmail: companyEmail,
          address: companyAddress,
          city: companyCity,
          state: companyState,
          zip: companyZip,
          businessHours,
          serviceRadius,
          serviceZips,
          updatedAt: new Date()
        });
      }

      // Reload profile from Firestore to reflect changes
      if (currentUser) await loadUserProfile(currentUser);

      toast.success('Settings saved!', { id: loadingToast });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings', { id: loadingToast });
    }
    setSaving(false);
  };

  const toggleDay = (day) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled }
    }));
  };

  const updateHours = (day, field, value) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'company', label: 'Company', icon: FiSettings },
    { id: 'hours', label: 'Business Hours', icon: FiClock },
    { id: 'service', label: 'Service Area', icon: FiMapPin },
  ];

  const inputClass = 'w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition';

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and company settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary-600 text-white px-5 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          {saving ? <FiClock className="h-4 w-4 animate-spin" /> : <FiSave className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <FiUser className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
              <p className="text-sm text-gray-500">Your personal account information</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={userProfile?.email || ''} disabled className={`${inputClass} bg-gray-50 text-gray-500 cursor-not-allowed`} />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input type="text" value={userProfile?.role === 'owner' ? 'Owner / Dispatcher' : userProfile?.role || ''} disabled className={`${inputClass} bg-gray-50 text-gray-500 cursor-not-allowed capitalize`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
              <input type="text" value={userProfile?.subscription?.plan ? userProfile.subscription.plan.charAt(0).toUpperCase() + userProfile.subscription.plan.slice(1) + ' Plan' : 'Starter Plan'} disabled className={`${inputClass} bg-gray-50 text-gray-500 cursor-not-allowed`} />
            </div>
          </div>
        </div>
      )}

      {/* Company Tab */}
      {activeTab === 'company' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <FiSettings className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Company Information</h2>
              <p className="text-sm text-gray-500">Your business details shown to customers and technicians</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
              <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} placeholder="Acme HVAC Services" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Phone</label>
              <input type="tel" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} className={inputClass} placeholder="(555) 123-4567" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Email</label>
              <input type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} className={inputClass} placeholder="info@company.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              <input type="text" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} className={inputClass} placeholder="123 Main St" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input type="text" value={companyCity} onChange={(e) => setCompanyCity(e.target.value)} className={inputClass} placeholder="City" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input type="text" value={companyState} onChange={(e) => setCompanyState(e.target.value)} className={inputClass} placeholder="NJ" maxLength={2} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                <input type="text" value={companyZip} onChange={(e) => setCompanyZip(e.target.value)} className={inputClass} placeholder="07052" maxLength={10} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Business Hours Tab */}
      {activeTab === 'hours' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <FiClock className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Business Hours</h2>
              <p className="text-sm text-gray-500">Set your operating hours for scheduling and dispatch</p>
            </div>
          </div>
          <div className="space-y-3">
            {DAYS.map(day => (
              <div key={day} className={`flex items-center gap-4 p-3 rounded-lg transition ${businessHours[day].enabled ? 'bg-gray-50' : 'bg-gray-50 opacity-50'}`}>
                <label className="flex items-center gap-3 w-36 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={businessHours[day].enabled}
                    onChange={() => toggleDay(day)}
                    className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-900">{day}</span>
                </label>
                {businessHours[day].enabled ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={businessHours[day].open}
                      onChange={(e) => updateHours(day, 'open', e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="text-gray-400 text-sm">to</span>
                    <input
                      type="time"
                      value={businessHours[day].close}
                      onChange={(e) => updateHours(day, 'close', e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 italic">Closed</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Service Area Tab */}
      {activeTab === 'service' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <FiMapPin className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Service Area</h2>
              <p className="text-sm text-gray-500">Define where your team provides service</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Radius (miles)</label>
              <input
                type="number"
                value={serviceRadius}
                onChange={(e) => setServiceRadius(e.target.value)}
                className={`${inputClass} max-w-xs`}
                placeholder="e.g. 25"
                min="1"
                max="500"
              />
              <p className="text-xs text-gray-400 mt-1">Maximum distance from your business address for service calls</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service ZIP Codes</label>
              <textarea
                value={serviceZips}
                onChange={(e) => setServiceZips(e.target.value)}
                className={`${inputClass} min-h-[100px]`}
                placeholder="Enter ZIP codes separated by commas (e.g. 07052, 07068, 07078)"
              />
              <p className="text-xs text-gray-400 mt-1">Optionally list specific ZIP codes you serve</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
