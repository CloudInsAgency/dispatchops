import React, { useEffect, useMemo, useRef, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useCompanyId } from '../../hooks/useCompanyId';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FiMapPin, FiAlertTriangle, FiCrosshair } from 'react-icons/fi';
import { toDate, metresBetween } from '../../utils/geo';

/**
 * Where the crew has been today.
 *
 * Plots the breadcrumbs captured when technicians change job status. This is
 * deliberately NOT a live tracker: a browser cannot report position in the
 * background, so a moving-dot map built on the web would freeze the moment a
 * phone locks and quietly show stale positions as if they were current. Three
 * honest fixes per job beat a live view that lies.
 *
 * Tiles come from OpenStreetMap through Leaflet rather than the Google Maps
 * JS API, which bills per load and needs a key and a card on file. Swapping
 * in Google later means changing the tile layer and nothing else.
 */

const STATUS_COLOR = {
  en_route: '#2563EB',
  in_progress: '#D97706',
  completed: '#0B6B4F',
};

const pin = (color, label) =>
  L.divIcon({
    className: '',
    html: `<div style="
      background:${color};width:26px;height:26px;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);border:2px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,.35);display:flex;align-items:center;
      justify-content:center;">
      <span style="transform:rotate(45deg);color:#fff;font:700 11px/1 ui-sans-serif,system-ui;">${label}</span>
    </div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
  });

const LiveMapPage = () => {
  const companyId = useCompanyId();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    if (!companyId) { setLoading(false); return; }
    const q = query(collection(db, 'companies', companyId, 'jobs'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setJobs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error('Map: jobs listener failed', err);
        setLoadError(
          err?.code === 'permission-denied'
            ? 'You do not have permission to view this company’s jobs.'
            : 'Could not load the map. Check your connection and try again.'
        );
        setLoading(false);
      }
    );
    return () => unsub();
  }, [companyId]);

  // Flatten every breadcrumb across today's jobs into plottable points.
  const points = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const out = [];
    jobs.forEach((j) => {
      (j.locationTrail || []).forEach((p) => {
        const at = toDate(p.at);
        if (!at || at < start) return;
        if (typeof p.lat !== 'number' || typeof p.lng !== 'number') return;
        out.push({ ...p, at, jobId: j.id, customer: j.customerName, address: j.address });
      });
    });
    return out.sort((a, b) => a.at - b.at);
  }, [jobs]);

  const byTech = useMemo(() => {
    const m = new Map();
    points.forEach((p) => {
      const k = p.techName || 'Unknown';
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(p);
    });
    return m;
  }, [points]);

  // Initialise the map once, then redraw the overlay whenever points change.
  useEffect(() => {
    if (loading || loadError || !mapEl.current) return;
    if (!mapRef.current) {
      mapRef.current = L.map(mapEl.current, { scrollWheelZoom: true }).setView([39.83, -98.58], 4);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current);
      layerRef.current = L.layerGroup().addTo(mapRef.current);
    }

    const layer = layerRef.current;
    layer.clearLayers();
    if (!points.length) return;

    byTech.forEach((trail, techName) => {
      trail.forEach((p, i) => {
        const colour = STATUS_COLOR[p.status] || '#5A6478';
        L.marker([p.lat, p.lng], { icon: pin(colour, String(i + 1)) })
          .bindPopup(
            `<strong>${techName}</strong><br/>${p.label || p.status}` +
              `<br/>${p.customer || 'Job'}<br/>` +
              `<small>${p.at.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` +
              (p.accuracy ? ` · ±${p.accuracy}m` : '') +
              `</small>`
          )
          .addTo(layer);
      });
      if (trail.length > 1) {
        L.polyline(trail.map((p) => [p.lat, p.lng]), {
          color: '#21518B', weight: 2, opacity: 0.5, dashArray: '5,6',
        }).addTo(layer);
      }
    });

    mapRef.current.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng])).pad(0.25), {
      maxZoom: 15,
    });
  }, [points, byTech, loading, loadError]);

  useEffect(() => () => { mapRef.current?.remove(); mapRef.current = null; }, []);

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-gray-600">Loading map…</div>;
  }

  if (loadError) {
    return (
      <div className="p-6">
        <div className="mx-auto mt-16 max-w-md text-center">
          <FiAlertTriangle className="mx-auto mb-4 h-10 w-10 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-900">Map unavailable</h2>
          <p className="mt-2 text-[15px] text-gray-600">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Today’s map</h1>
          <p className="mt-1 text-[15px] text-gray-600">
            Where each technician was when they marked a job en route, arrived or complete.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          {Object.entries({ 'En route': STATUS_COLOR.en_route, Arrived: STATUS_COLOR.in_progress, Completed: STATUS_COLOR.completed }).map(([label, c]) => (
            <span key={label} className="flex items-center gap-1.5 text-gray-600">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {points.length === 0 && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-8 text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <FiCrosshair className="h-6 w-6 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">No location points today</h2>
          <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-gray-600">
            Points appear as technicians update job status from their phones. Each
            technician has to allow location sharing once, in their own app — it is
            off until they agree.
          </p>
        </div>
      )}

      <div
        ref={mapEl}
        className="h-[520px] w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
      />

      {byTech.size > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...byTech.entries()].map(([techName, trail]) => {
            const last = trail[trail.length - 1];
            const spread = trail.length > 1 ? metresBetween(trail[0], last) : null;
            return (
              <div key={techName} className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-center gap-2">
                  <FiMapPin className="h-4 w-4 text-brand-navy" />
                  <h3 className="font-semibold text-gray-900">{techName}</h3>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Last seen {last.label || last.status} at{' '}
                  {last.at.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  {last.customer ? ` · ${last.customer}` : ''}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {trail.length} point{trail.length === 1 ? '' : 's'} today
                  {spread !== null ? ` · ${(spread / 1000).toFixed(1)} km between first and last` : ''}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-xs leading-relaxed text-gray-500">
        Positions are recorded only at status changes, only while the technician’s app
        is open, and only for technicians who have agreed to share location. This is
        not continuous tracking, and nothing is recorded between jobs.
      </p>
    </div>
  );
};

export default LiveMapPage;
