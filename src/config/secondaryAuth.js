import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { firebaseConfig } from './config';

export const createTechAuthAccount = async (email, password) => {
  const secondaryApp = initializeApp(firebaseConfig, 'TechAccountCreator');
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const uid = userCredential.user.uid;
    await secondaryAuth.signOut();
    await deleteApp(secondaryApp);
    return { uid, email };
  } catch (error) {
    try {
      await secondaryAuth.signOut();
      await deleteApp(secondaryApp);
    } catch (_) {}
    throw error;
  }
};
