import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up new user
  const signup = async (email, password, userData) => {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Calculate trial end date (14 days from now)
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14);

      // Create company document in Firestore
      const companyData = {
        name: userData.companyName,
        tier: userData.selectedTier,
        ownerId: user.uid,
        ownerName: userData.fullName,
        ownerEmail: email,
        phone: userData.phone || '',
        stripeCustomerId: null, // Will be set after Stripe subscription creation
        subscriptionId: null,
        subscriptionStatus: 'trialing',
        trialEndsAt: trialEndDate,
        createdAt: new Date(),
        updatedAt: new Date(),
        technicianCount: 0,
        isActive: true
      };

      await setDoc(doc(db, 'companies', user.uid), companyData);

      // Create user profile document
      const userProfileData = {
        uid: user.uid,
        email: email,
        fullName: userData.fullName,
        companyId: user.uid,
        role: 'owner',
        createdAt: new Date()
      };

      await setDoc(doc(db, 'users', user.uid), userProfileData);

      return user;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  // Sign in existing user
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  // Load user profile from Firestore
  const loadUserProfile = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile(userData);

        // Also load company data
        const companyDoc = await getDoc(doc(db, 'companies', userData.companyId));
        if (companyDoc.exists()) {
          setUserProfile({
            ...userData,
            company: companyDoc.data()
          });
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await loadUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    resetPassword,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
