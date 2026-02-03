import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, orderBy, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheckCircle, FiClock, FiCopy, FiEye, FiEyeOff, FiLink } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { usePlanLimits } from '../../hooks/usePlanLimits';
import UpgradeModal from '../subscription/UpgradeModal';
import { createTechAuthAccount } from '../../config/secondaryAuth';

const TechniciansPage = () => {
  const { userProfile } = useAuth();
  const { canAddTech, currentPlan, planDetails, techCount } = usePlanLimits(userProfile);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [techs, setTechs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTech, setEditingTech] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [createdTechInfo, setCreatedTechInfo] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    status: 'available'
  });

  useEffect(() => {
    if (!userProfile?.companyId) {
      setLoading(false);
      return;
    }

    // Read from companies/{companyId}/technicians - same as TechnicianSidebar
    const techsRef = collection(db, 'companies', userProfile.companyId, 'technicians');
    const q = query(techsRef, orderBy('name', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const techsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTechs(techsData);
      setLoading(false);
    }, (error) => {
      console.error('Error loading techs:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile]);

  const handleAddTech = () => {
    if (!canAddTech) {
      setShowUpgradeModal(true);
      return;
    }
    setEditingTech(null);
    setFormData({ name: '', email: '', phone: '', password: '', status: 'available' });
    setShowModal(true);
  };

  const handleEditTech = (tech) => {
    setEditingTech(tech);
    setFormData({
      name: tech.name || '',
      email: tech.email || '',
      phone: tech.phone || '',
      status: tech.status || 'available'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    const loadingToast = toast.loading(editingTech ? 'Updating technician...' : 'Adding technician...');

    try {
      if (editingTech) {
        const techRef = doc(db, 'companies', userProfile.companyId, 'technicians', editingTech.id);
        await updateDoc(techRef, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          status: formData.status,
          updatedAt: new Date()
        });
        toast.success('Technician updated!', { id: loadingToast });
      } else {
        // Validate password
        if (formData.password.length < 6) {
          toast.error('Password must be at least 6 characters');
          toast.dismiss(loadingToast);
          return;
        }
        // 1. Create Firebase Auth account via secondary app
        const { uid } = await createTechAuthAccount(formData.email, formData.password);
        // 2. Create user doc so AuthContext can load their profile
        await setDoc(doc(db, 'users', uid), {
          uid, email: formData.email, fullName: formData.name,
          role: 'tech', companyId: userProfile.companyId,
          createdAt: new Date(), updatedAt: new Date()
        });
        // 3. Add to technicians subcollection
        await addDoc(collection(db, 'companies', userProfile.companyId, 'technicians'), {
          name: formData.name, fullName: formData.name,
          email: formData.email, phone: formData.phone,
          status: 'available', companyId: userProfile.companyId,
          authUid: uid, createdAt: new Date(), updatedAt: new Date()
        });
        // 4. Write techInvite backup
        await setDoc(doc(db, 'techInvites', formData.email), {
          companyId: userProfile.companyId, name: formData.name, createdAt: new Date()
        });
        toast.success('Technician account created!', { id: loadingToast });
        setCreatedTechInfo({ name: formData.name, email: formData.email, password: formData.password, loginUrl: window.location.origin + '/tech' });
      }

      setShowModal(false);
      setFormData({ name: '', email: '', phone: '', password: '', status: 'available' });
    } catch (error) {
      console.error('Error saving tech:', error);
      if (error.code === 'auth/email-already-in-use') { toast.error('That email is already registered.', { id: loadingToast }); }
      else if (error.code === 'auth/invalid-email') { toast.error('Invalid email address.', { id: loadingToast }); }
      else if (error.code === 'auth/weak-password') { toast.error('Password too weak. Use at least 6 characters.', { id: loadingToast }); }
      else { toast.error('Failed to save technician: ' + error.message, { id: loadingToast }); }
    }
  };

  const handleDeleteTech = async (tech) => {
    if (!window.confirm(`Are you sure you want to delete ${tech.name}?`)) return;

    const loadingToast = toast.loading('Deleting technician...');

    try {
      await deleteDoc(doc(db, 'companies', userProfile.companyId, 'technicians', tech.id));
      toast.success('Technician deleted!', { id: loadingToast });
    } catch (error) {
      console.error('Error deleting tech:', error);
      toast.error('Failed to delete technician', { id: loadingToast });
    }
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); toast.success('Copied!'); };

  const copyTechLogin = () => {
    const loginUrl = `${window.location.origin}/tech`;
    navigator.clipboard.writeText(loginUrl);
    toast.success('Tech login URL copied to clipboard!');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading technicians...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Technicians</h1>
          <p className="text-gray-600 mt-1">
            Manage your field technicians ({techs.length}/{planDetails?.techLimit || 10} on {planDetails?.name || 'Starter Plan'})
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={copyTechLogin}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            <FiCopy className="h-4 w-4" />
            Copy Tech Login URL
          </button>
          <button
            onClick={handleAddTech}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2 shadow-sm"
          >
            <FiPlus className="h-5 w-5" />
            Add Technician
          </button>
        </div>
      </div>

      {createdTechInfo && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-900 flex items-center gap-2"><FiCheckCircle className="h-5 w-5" />Account Created for {createdTechInfo.name}</h3>
              <p className="text-sm text-green-700 mt-1">Share these credentials with the technician so they can log in.</p>
            </div>
            <button onClick={() => setCreatedTechInfo(null)} className="text-green-400 hover:text-green-600"><FiX className="h-5 w-5" /></button>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-lg border border-green-200 p-3">
              <p className="text-xs font-medium text-gray-500 mb-1">Login URL</p>
              <div className="flex items-center justify-between"><p className="text-sm font-mono text-gray-900 truncate mr-2">{createdTechInfo.loginUrl}</p><button onClick={() => copyToClipboard(createdTechInfo.loginUrl)} className="text-primary-600 hover:text-primary-800 flex-shrink-0"><FiCopy className="h-4 w-4" /></button></div>
            </div>
            <div className="bg-white rounded-lg border border-green-200 p-3">
              <p className="text-xs font-medium text-gray-500 mb-1">Email</p>
              <div className="flex items-center justify-between"><p className="text-sm font-mono text-gray-900 truncate mr-2">{createdTechInfo.email}</p><button onClick={() => copyToClipboard(createdTechInfo.email)} className="text-primary-600 hover:text-primary-800 flex-shrink-0"><FiCopy className="h-4 w-4" /></button></div>
            </div>
            <div className="bg-white rounded-lg border border-green-200 p-3">
              <p className="text-xs font-medium text-gray-500 mb-1">Password</p>
              <div className="flex items-center justify-between"><p className="text-sm font-mono text-gray-900 truncate mr-2">{createdTechInfo.password}</p><button onClick={() => copyToClipboard(createdTechInfo.password)} className="text-primary-600 hover:text-primary-800 flex-shrink-0"><FiCopy className="h-4 w-4" /></button></div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Technicians</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{techs.length}</p>
            </div>
            <FiCheckCircle className="h-12 w-12 text-primary-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {techs.filter(t => t.status === 'available').length}
              </p>
            </div>
            <FiCheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Busy / Offline</p>
              <p className="text-3xl font-bold text-gray-400 mt-1">
                {techs.filter(t => t.status !== 'available').length}
              </p>
            </div>
            <FiClock className="h-12 w-12 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {techs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <p className="text-gray-500">No technicians yet. Add your first tech to get started!</p>
                  </td>
                </tr>
              ) : (
                techs.map(tech => (
                  <tr key={tech.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{tech.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{tech.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{tech.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(tech.status)}`}>
                        {tech.status || 'available'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEditTech(tech)} className="text-primary-600 hover:text-primary-900 mr-4">
                        <FiEdit2 className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleDeleteTech(tech)} className="text-red-600 hover:text-red-900">
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingTech ? 'Edit Technician' : 'Add Technician'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="John Smith"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="tech@company.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>
                {!editingTech && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Min 6 characters"
                        minLength={6}
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">The tech will use this to log in.</p>
                  </div>
                )}
                {editingTech && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="available">Available</option>
                      <option value="busy">Busy</option>
                      <option value="offline">Offline</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition">
                  {editingTech ? 'Update' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={currentPlan}
        reason={`You've reached your plan limit of ${planDetails?.techLimit || 10} technicians. Upgrade to add more technicians.`}
      />
    </div>
  );
};

export default TechniciansPage;
