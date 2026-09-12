import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useCompanyId } from './useCompanyId';
import { toDate } from '../utils/geo';

/**
 * Today's technician breadcrumbs, flattened out of the jobs collection.
 *
 * Shared by the full Map page and the panel on the dispatch board so the two
 * can never disagree about where a technician was, and so there is one place
 * to change when the shape of a trail entry changes.
 *
 * `sinceStartOfDay` exists because the board panel only ever wants today,
 * while a history view will eventually want a range.
 */
export const useLocationPoints = ({ sinceStartOfDay = true } = {}) => {
  const companyId = useCompanyId();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!companyId) { setLoading(false); return; }
    setLoading(true);
    setError('');

    const unsub = onSnapshot(
      query(collection(db, 'companies', companyId, 'jobs')),
      (snap) => {
        setJobs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error('Location points listener failed', err);
        setError(
          err?.code === 'permission-denied'
            ? 'You do not have permission to view this company’s jobs.'
            : 'Could not load technician locations.'
        );
        setLoading(false);
      }
    );
    return () => unsub();
  }, [companyId]);

  const points = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const out = [];
    jobs.forEach((j) => {
      (j.locationTrail || []).forEach((p) => {
        const at = toDate(p.at);
        if (!at) return;
        if (sinceStartOfDay && at < start) return;
        if (typeof p.lat !== 'number' || typeof p.lng !== 'number') return;
        out.push({ ...p, at, jobId: j.id, customer: j.customerName, address: j.address });
      });
    });
    return out.sort((a, b) => a.at - b.at);
  }, [jobs, sinceStartOfDay]);

  const byTech = useMemo(() => {
    const m = new Map();
    points.forEach((p) => {
      const k = p.techName || 'Unknown';
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(p);
    });
    return m;
  }, [points]);

  return { points, byTech, jobs, loading, error };
};

export default useLocationPoints;
