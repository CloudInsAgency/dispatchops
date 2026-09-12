import React from 'react';
import { FiMapPin, FiAlertTriangle, FiCrosshair } from 'react-icons/fi';
import TechMap, { MapLegend } from './TechMap';
import { useLocationPoints } from '../../hooks/useLocationPoints';
import { metresBetween } from '../../utils/geo';

/**
 * Where the crew has been today, full size.
 *
 * Deliberately NOT a live tracker. A browser cannot report position in the
 * background — iOS Safari suspends JavaScript the moment the phone locks or
 * the technician switches apps — so a moving-dot map built on the web would
 * freeze and then present stale positions as if they were current. Three
 * honest fixes per job beat a live view that lies.
 *
 * Shares useLocationPoints and TechMap with the panel on the dispatch board,
 * so the two can never disagree.
 */
const LiveMapPage = () => {
  const { points, byTech, loading, error } = useLocationPoints();

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-gray-600">Loading map…</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mx-auto mt-16 max-w-md text-center">
          <FiAlertTriangle className="mx-auto mb-4 h-10 w-10 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-900">Map unavailable</h2>
          <p className="mt-2 text-[15px] text-gray-600">{error}</p>
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
        <MapLegend />
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

      <TechMap points={points} byTech={byTech} height={520} className="border border-gray-200" />

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
