import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMap, FiChevronDown, FiChevronUp, FiMaximize2, FiCrosshair } from 'react-icons/fi';
import TechMap, { MapLegend } from './TechMap';
import { useLocationPoints } from '../../hooks/useLocationPoints';

/**
 * Compact map on the dispatch board.
 *
 * Collapsible and collapsed-aware: the board is the page dispatchers actually
 * work in, so the map earns a glance, not half the screen. Full detail lives
 * on /map.
 *
 * Renders nothing at all when there is no location data AND the panel has
 * never been opened — an empty map on the main working screen is just noise
 * for a company whose technicians have not opted in.
 */
const BoardMapPanel = () => {
  const { points, byTech, loading, error } = useLocationPoints();
  const [open, setOpen] = useState(true);

  if (loading || error) return null;
  if (points.length === 0 && !open) return null;

  return (
    <section className="mt-6 rounded-lg bg-white shadow">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-6 py-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex min-w-0 items-center gap-2.5 text-left"
        >
          <FiMap className="h-5 w-5 flex-shrink-0 text-primary-600" />
          <span className="truncate font-semibold text-gray-900">Where the crew has been today</span>
          <span className="flex-shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
            {points.length} point{points.length === 1 ? '' : 's'}
          </span>
          {open ? <FiChevronUp className="h-4 w-4 text-gray-400" /> : <FiChevronDown className="h-4 w-4 text-gray-400" />}
        </button>
        <div className="flex flex-shrink-0 items-center gap-4">
          <div className="hidden sm:block"><MapLegend /></div>
          <Link
            to="/map"
            className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            <FiMaximize2 className="h-4 w-4" />
            <span className="hidden sm:inline">Full map</span>
          </Link>
        </div>
      </div>

      {open && (
        <div className="p-4">
          {points.length === 0 ? (
            <div className="py-10 text-center">
              <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <FiCrosshair className="h-5 w-5 text-gray-400" />
              </div>
              <p className="font-medium text-gray-900">No location points today</p>
              <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-gray-600">
                Points appear as technicians mark jobs en route, arrived or complete
                from their phones. Each technician allows location sharing once, in
                their own app.
              </p>
            </div>
          ) : (
            <>
              <TechMap points={points} byTech={byTech} height={300} />
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-gray-600">
                {[...byTech.entries()].map(([tech, trail]) => {
                  const last = trail[trail.length - 1];
                  return (
                    <span key={tech}>
                      <strong className="font-semibold text-gray-900">{tech}</strong>
                      {' — '}
                      {last.label || last.status} at{' '}
                      {last.at.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </span>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
};

export default BoardMapPanel;
