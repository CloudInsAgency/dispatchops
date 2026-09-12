import { useAuth } from '../contexts/AuthContext';

/**
 * The id of the company whose data the signed-in user may see.
 *
 * Everything in Firestore hangs off `companies/{companyId}/...`, and for an
 * OWNER that id happens to equal their own auth uid, because signup writes the
 * company doc keyed by the owner's uid. Twenty-two call sites took that
 * shortcut and used `currentUser.uid` directly as the company id.
 *
 * That silently breaks for every user who is not the owner — a technician's
 * uid is their own, while their companyId points at the owner. Those reads
 * resolve to `companies/{techUid}/...`, which does not exist, so the board
 * shows zero jobs and zero technicians; and the writes are rejected, because
 * `isCompanyOwner(companyId)` in firestore.rules compares the caller's
 * companyId against the path segment. That was the cause of both "Failed to
 * create job" and "Failed to add technician": the auth account was created
 * client-side and succeeded, then the very next Firestore write was denied,
 * leaving an orphaned auth user with no profile document.
 *
 * Always resolve the company through the profile. The uid fallback covers the
 * brief window during bootstrap before the profile has loaded.
 */
export const useCompanyId = () => {
  const { userProfile, currentUser } = useAuth();
  return userProfile?.companyId || currentUser?.uid || null;
};

export default useCompanyId;
