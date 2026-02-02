import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheckCircle, FiClock, FiTruck, FiLogOut, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { usePlanLimits } from '../../hooks/usePlanLimits';
import UpgradeModal from '../subscription/UpgradeModal';

const TechniciansPage = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const { canAddTech, currentPlan, planDetails, techCount } = usePlanLimits(userProfile);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [techs, setTechs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTech, setEditingTech] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    status: 'active'
  });

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  useEffect(() => {
    if (!userProfile?.companyId) {
      setLoading(false);
      return;
    }
    const techsRef = collection(db, 'users');
    const q = query(
      techsRef,
      where('companyId', '==', userProfile.companyId),
      where('role', '==', 'tech')
    );
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
    console.log('handleAddTech clicked, canAddTech:', canAddTech, 'techs:', techs.length);
    if (!canAddTech) {
      setShowUpgradeModal(true);
      return;
    }
    setEditingTech(null);
    setFormData({ fullName: '', email: '', phone: '', status: 'active' });
    setShowModal(true);
  };

  const handleEditTech = (tech) => {
    setEditingTech(tech);
    setFormData({
      fullName: tech.fullName || tech.name || '',
      email: tech.email || '',
      phone: tech.phone || '',
      status: tech.status || 'active'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    const loadingToast = toast.loading(editingTech ? 'Updating technician...' : 'Adding technician...');
    try {
      if (editingTech) {
        const techRef = doc(db, 'users', editingTech.id);
        await updateDoc(techRef, {
          fullName: formData.fullName,
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          status: formData.status,
          updatedAt: new Date()
        });
        toast.success('Technician updated!', { id: loadingToast });
      } else {
        await addDoc(collection(db, 'users'), {
          fullName: formData.fullName,
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          role: 'tech',
          status: 'active',
          companyId: userProfile.companyId,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        toast.success('Technician added!', { id: loadingToast });
      }
      setShowModal(false);
      setFormData({ fullName: '', email: '', phone: '', status: 'active' });
    } catch (error) {
      console.error('Error saving tech:', error);
      toast.error('Failed to save technician', { id: loadingToast });
    }
  };

  const handleDeleteTech = async (tech) => {
    if (!window.confirm(`Are you sure you want to delete ${tech.fullName || tech.name}?`)) return;
    const loadingToast = toast.loading('Deleting technician...');
    try {
      await deleteDoc(doc(db, 'users', tech.id));
      toast.success('Technician deleted!', { id: loadingToast });
    } catch (error) {
      console.error('Error deleting tech:', error);
      toast.error('Failed to delete technician', { id: loadingToast });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading technicians...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
              <button onClick={() => navigate('/dispatch')} className="flex items-center text-blue-600 hover:text-blue-800 px-3 py-2 rounded-lg hover:bg-blue-50">
                <FiArrowLeft className="mr-2 h-5 w-5" />
                Back to Dashboard
              </button>
              <button onClick={handleLogout} className="flex items-center text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100">
                <FiLogOut className="mr-2 h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Technicians</h1>
            <p className="text-gray-600 mt-1">
              Manage your field technicians ({techs.length}/{planDetails?.techLimit || 10} on {planDetails?.name || 'Starter Plan'})
            </p>
          </div>
          <button onClick={handleAddTech} className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition flex items-center gap-2 shadow-lg">
            <FiPlus className="h-5 w-5" />
            Add Technician
          </button>
        </div>

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
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{techs.filter(t => t.status === 'active').length}</p>
              </div>
              <FiCheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-3xl font-bold text-gray-400 mt-1">{techs.filter(t => t.status === 'inactive').length}</p>
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
                        <div className="text-sm font-medium text-gray-900">{tech.fullName || tech.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{tech.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{tech.phone || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tech.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {tech.status || 'active'}
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
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{editingTech ? 'Edit Technician' : 'Add Technician'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
                  <p className="text-xs text-gray-500 mt-1">Tech will use this email to log in</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                </div>
                {editingTech && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition">Cancel</button>
                <button type="submit" className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition">{editingTech ? 'Update' : 'Add'} Technician</button>
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
