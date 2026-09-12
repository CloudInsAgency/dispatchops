import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * The Leaflet canvas. Given breadcrumbs, draws pins and per-technician trails.
 *
 * Presentational only — data comes from useLocationPoints — so the dispatch
 * board panel and the full Map page render identical geometry at different
 * sizes instead of drifting apart.
 *
 * Tiles are OpenStreetMap rather than the Google Maps JS API, which bills per
 * load and needs a key and a card on file. Moving to Google later is a change
 * to the tileLayer URL and nothing else.
 */

export const STATUS_COLOR = {
  en_route: '#2563EB',
  in_progress: '#D97706',
  completed: '#0B6B4F',
};

const pin = (color, label) =>
  L.divIcon({
    className: '',
    html: `<div style="
      background:${color};width:24px;height:24px;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);border:2px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,.35);display:flex;align-items:center;
      justify-content:center;">
      <span style="transform:rotate(45deg);color:#fff;font:700 10px/1 ui-sans-serif,system-ui;">${label}</span>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });

const TechMap = ({ points, byTech, height = 320, interactive = true, className = '' }) => {
  const el = useRef(null);
  const map = useRef(null);
  const layer = useRef(null);

  useEffect(() => {
    if (!el.current) return;

    if (!map.current) {
      map.current = L.map(el.current, {
        scrollWheelZoom: interactive,
        dragging: interactive,
        zoomControl: interactive,
        // Centred on the continental US until there is something to fit to.
      }).setView([39.83, -98.58], 4);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map.current);
      layer.current = L.layerGroup().addTo(map.current);
    }

    const g = layer.current;
    g.clearLayers();
    if (!points.length) return;

    byTech.forEach((trail, techName) => {
      trail.forEach((p, i) => {
        L.marker([p.lat, p.lng], { icon: pin(STATUS_COLOR[p.status] || '#5A6478', String(i + 1)) })
          .bindPopup(
            `<strong>${techName}</strong><br/>${p.label || p.status}` +
              `<br/>${p.customer || 'Job'}<br/>` +
              `<small>${p.at.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` +
              (p.accuracy ? ` · ±${p.accuracy}m` : '') +
              '</small>'
          )
          .addTo(g);
      });
      if (trail.length > 1) {
        L.polyline(trail.map((p) => [p.lat, p.lng]), {
          color: '#21518B', weight: 2, opacity: 0.5, dashArray: '5,6',
        }).addTo(g);
      }
    });

    map.current.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng])).pad(0.25), {
      maxZoom: 15,
    });
  }, [points, byTech, interactive]);

  // Leaflet measures the container on creation; if it was hidden or has just
  // been resized (collapsing the panel, opening the sidebar) the tiles render
  // into the wrong box until it is told to re-measure.
  useEffect(() => {
    const t = setTimeout(() => map.current?.invalidateSize(), 150);
    const onResize = () => map.current?.invalidateSize();
    window.addEventListener('resize', onResize);
    return () => { clearTimeout(t); window.removeEventListener('resize', onResize); };
  }, [height]);

  useEffect(() => () => { map.current?.remove(); map.current = null; }, []);

  return (
    <div
      ref={el}
      style={{ height }}
      className={`w-full overflow-hidden rounded-lg bg-gray-100 ${className}`}
    />
  );
};

export const MapLegend = () => (
  <div className="flex flex-wrap gap-4 text-xs">
    {[['En route', STATUS_COLOR.en_route], ['Arrived', STATUS_COLOR.in_progress], ['Completed', STATUS_COLOR.completed]].map(([label, c]) => (
      <span key={label} className="flex items-center gap-1.5 text-gray-600">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
        {label}
      </span>
    ))}
  </div>
);

export default TechMap;
