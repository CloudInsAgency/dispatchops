/**
 * Location capture for technicians.
 *
 * BREADCRUMBS, NOT CONTINUOUS TRACKING. A browser cannot report location in
 * the background — iOS Safari suspends JavaScript as soon as the phone locks
 * or the tech switches apps — so a "live tracker" built on the web would go
 * silent exactly when a dispatcher wants it. Instead we take one fix at each
 * status change (En Route, In Progress, Completed), which is reliable, costs
 * almost no battery, and answers the question people actually ask: where was
 * the tech when they said they had arrived.
 *
 * Continuous tracking would need a native app with background location
 * permission, which both app stores review closely.
 *
 * Nothing here runs without explicit consent — see LOCATION_CONSENT_KEY and
 * the consent card in TechDashboard.
 */

/** Field on the tech's own users/{uid} document. */
export const CONSENT_FIELD = 'locationConsent';

/**
 * One position fix. Resolves to null rather than throwing: a missing location
 * must never block a technician from updating a job status.
 */
export const capturePosition = ({ timeout = 10000 } = {}) =>
  new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve(null);
      return;
    }

    let settled = false;
    const done = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    // Belt and braces: some mobile browsers never fire either callback when
    // permission is in an odd state, which would hang the status update.
    const timer = setTimeout(() => done(null), timeout + 1000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        done({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy ?? 0),
          at: new Date(),
        });
      },
      (err) => {
        clearTimeout(timer);
        console.warn('Location unavailable:', err?.message || err);
        done(null);
      },
      { enableHighAccuracy: true, timeout, maximumAge: 30000 }
    );
  });

/** Has the browser already been granted location permission? */
export const permissionState = async () => {
  if (typeof navigator === 'undefined' || !navigator.permissions?.query) return 'unknown';
  try {
    const s = await navigator.permissions.query({ name: 'geolocation' });
    return s.state; // 'granted' | 'prompt' | 'denied'
  } catch {
    return 'unknown';
  }
};

/** Metres between two fixes, for a rough "is this near the job" sanity check. */
export const metresBetween = (a, b) => {
  if (!a || !b) return null;
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(s)));
};

/** Firestore stores these as Timestamps on read and Dates on write. */
export const toDate = (v) => {
  if (!v) return null;
  if (typeof v.toDate === 'function') return v.toDate();
  if (v instanceof Date) return v;
  if (v._seconds) return new Date(v._seconds * 1000);
  return new Date(v);
};

export const STATUS_LABEL = {
  en_route: 'En route',
  in_progress: 'Arrived',
  completed: 'Completed',
};
