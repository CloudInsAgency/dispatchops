import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc, setDoc, doc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { createTechAuthAccount } from '../../config/secondaryAuth';
import { FiX, FiCopy, FiCheckCircle, FiUser, FiMail, FiLock } from 'react-icons/fi';

const generatePassword = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const AddTechnicianModal = ({ isOpen, onClose }) => {
  const { userProfile, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('form'); // 'form' or 'credentials'
  const [credentials, setCredentials] = useState(null);
  const [copied, setCopied] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'available'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCopy = (field, value) => {
    navigator.clipboard.writeText(value);
    setCopied(prev => ({ ...prev, [field]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [field]: false })), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const companyId = userProfile?.companyId || currentUser?.uid;
    if (!companyId) return;

    setLoading(true);
    try {
      // 1. Generate password
      const password = generatePassword();

      // 2. Create Firebase Auth account via secondary app (won't log out owner)
      const { uid } = await createTechAuthAccount(formData.email, password);

      // 3. Create user doc for the tech
      await setDoc(doc(db, 'users', uid), {
        uid,
        email: formData.email,
        fullName: formData.name,
        phone: formData.phone,
        role: 'tech',
        companyId,
        status: formData.status,
        createdAt: serverTimestamp()
      });

      // 4. Add to company's technicians subcollection
      await addDoc(collection(db, 'companies', companyId, 'technicians'), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        status: formData.status,
        authUid: uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 5. Increment technician count
      await updateDoc(doc(db, 'companies', companyId), {
        technicianCount: increment(1)
      });

      // 6. Show credentials
      setCredentials({ email: formData.email, password, name: formData.name });
      setStep('credentials');

    } catch (error) {
      console.error('Error adding technician:', error);
      if (error.code === 'auth/email-already-in-use') {
        alert('This email is already registered. Please use a different email.');
      } else {
        alert('Failed to add technician. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('form');
    setCredentials(null);
    setCopied({});
    setFormData({ name: '', email: '', phone: '', status: 'available' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 'form' ? 'Add Technician' : 'Technician Created!'}
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition">
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                placeholder="John Smith" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                placeholder="(555) 123-4567" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select name="status" value={formData.status} onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent">
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
              </select>
            </div>
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <button type="button" onClick={handleClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50">
                {loading ? 'Creating Account...' : 'Add Technician'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <FiCheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-green-800 font-medium">{credentials.name}'s account is ready!</p>
              </div>
              <p className="text-sm text-green-700 mt-1">Share these login credentials with your technician.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  <FiUser className="inline h-4 w-4 mr-1" /> Technician
                </label>
                <p className="text-gray-900 font-medium">{credentials.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  <FiMail className="inline h-4 w-4 mr-1" /> Email
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm">{credentials.email}</code>
                  <button onClick={() => handleCopy('email', credentials.email)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-1">
                    {copied.email ? <><FiCheckCircle className="text-green-600" /> Copied</> : <><FiCopy /> Copy</>}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  <FiLock className="inline h-4 w-4 mr-1" /> Password
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm font-mono">{credentials.password}</code>
                  <button onClick={() => handleCopy('password', credentials.password)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-1">
                    {copied.password ? <><FiCheckCircle className="text-green-600" /> Copied</> : <><FiCopy /> Copy</>}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Tech Login URL</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm break-all">dispatchops-three.vercel.app/tech</code>
                  <button onClick={() => handleCopy('url', 'https://dispatchops-three.vercel.app/tech')}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-1">
                    {copied.url ? <><FiCheckCircle className="text-green-600" /> Copied</> : <><FiCopy /> Copy</>}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-6">
              <p className="text-sm text-yellow-800">⚠️ Save these credentials now — the password cannot be retrieved later.</p>
            </div>

            <button onClick={handleClose}
              className="w-full mt-6 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddTechnicianModal;
