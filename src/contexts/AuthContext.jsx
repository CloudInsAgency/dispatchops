import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collectionGroup, query, where, getDocs } from 'firebase/firestore';
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

  const signup = async (email, password, fullName, companyName, phone) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const companyRef = doc(db, 'companies', user.uid);
    await setDoc(companyRef, {
      name: companyName,
      ownerEmail: email,
      ownerName: fullName,
      ownerId: user.uid,
      phone: phone || '',
      createdAt: serverTimestamp(),
      isActive: true,
      subscriptionStatus: 'trialing',
      stripeCustomerId: null,
      subscriptionId: null
    });

    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email,
      fullName,
      role: 'owner',
      companyId: user.uid,
      createdAt: serverTimestamp(),
      subscription: {
        plan: 'starter',
        techLimit: 10,
        jobLimit: 100,
        status: 'active',
        stripeCustomerId: '',
        stripeSubscriptionId: ''
      }
    });

    return userCredential;
  };

  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    setUserProfile(null);
    return signOut(auth);
  };

  const loadUserProfile = async (user) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();

        if (!userData.subscription) {
          const defaultSub = {
            plan: 'starter',
            techLimit: 10,
            jobLimit: 100,
            status: 'active',
            stripeCustomerId: '',
            stripeSubscriptionId: ''
          };
          await setDoc(userRef, { subscription: defaultSub }, { merge: true });
          userData.subscription = defaultSub;
        }

        let companyData = null;
        if (userData.companyId) {
          const companyRef = doc(db, 'companies', userData.companyId);
          const companySnap = await getDoc(companyRef);
          if (companySnap.exists()) {
            companyData = companySnap.data();
          }
        }

        setUserProfile({
          ...userData,
          company: companyData
        });
      } else {
      // No users doc - check if this user is a technician
      const techQuery = query(
        collectionGroup(db, 'technicians'),
        where('email', '==', user.email)
      );
      const techSnap = await getDocs(techQuery);

      if (!techSnap.empty) {
        const techData = techSnap.docs[0].data();
        const companyId = techSnap.docs[0].ref.parent.parent.id;

        const newUserData = {
          uid: user.uid,
          email: user.email,
          fullName: techData.name || techData.fullName || user.email,
          role: 'tech',
          companyId: companyId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        await setDoc(userRef, newUserData);

        let companyData = null;
        const companyRef = doc(db, 'companies', companyId);
        const companySnap = await getDoc(companyRef);
        if (companySnap.exists()) {
          companyData = companySnap.data();
        }

        setUserProfile({
          ...newUserData,
          company: companyData
        });
      }
    }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await loadUserProfile(user);
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
    loading,
    signup,
    login,
    logout,
    loadUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
