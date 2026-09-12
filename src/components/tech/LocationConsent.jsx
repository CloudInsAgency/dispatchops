import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { FiMapPin, FiX } from 'react-icons/fi';
import { CONSENT_FIELD, permissionState } from '../../utils/geo';

/**
 * Consent gate for location capture.
 *
 * Employee location tracking is regulated, and several US states require
 * notice or written consent before an employer may collect it. So this is an
 * explicit opt-in that states plainly what is collected and when — not a
 * pre-ticked box, and not buried in the terms.
 *
 * Declining is a first-class outcome: the technician keeps full use of the
 * app, and status updates simply carry no coordinates.
 */
const LocationConsent = ({ uid, onDecision }) => {
  const [busy, setBusy] = useState(false);

  const record = async (granted) => {
    if (!uid) return;
    setBusy(true);
    try {
      if (granted) {
        // Trigger the browser prompt now, while the tech is looking at the
        // explanation, rather than mid-job when they tap "En route".
        await new Promise((resolve) => {
          if (!navigator.geolocation) return resolve();
          navigator.geolocation.getCurrentPosition(resolve, resolve, { timeout: 8000 });
        });
      }
      await updateDoc(doc(db, 'users', uid), {
        [CONSENT_FIELD]: granted,
        locationConsentAt: new Date(),
        locationPermission: await permissionState(),
      });
      onDecision?.(granted);
    } catch (e) {
      console.error('Could not save location preference:', e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-4 mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600">
          <FiMapPin className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold text-gray-900">
            Share your location with dispatch?
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-700">
            If you turn this on, your location is recorded <strong>only at the moment
            you tap En Route, Arrived or Completed</strong> — three points per job.
            Dispatch uses it to confirm arrival times and answer customer calls.
          </p>
          <ul className="mt-2.5 space-y-1 text-sm text-gray-600">
            <li>· You are not tracked continuously, and never between jobs</li>
            <li>· Nothing is recorded while the app is closed</li>
            <li>· You can turn this off at any time</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => record(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {busy ? 'Saving…' : 'Allow location'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => record(false)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => onDecision?.(null)}
          className="text-gray-400 transition hover:text-gray-600"
        >
          <FiX className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default LocationConsent;
