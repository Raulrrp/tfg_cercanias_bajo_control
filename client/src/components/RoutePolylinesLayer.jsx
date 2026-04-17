import { Polyline, Popup } from 'react-leaflet';
import 'leaflet-polylineoffset';
import { useMemo } from 'react';

const OVERLAP_OFFSET_PX = 20;

const resolveRouteColor = (rawColor) => {
  const normalized = String(rawColor ?? '').trim();
  if (/^[0-9a-fA-F]{6}$/.test(normalized)) return `#${normalized}`;
  if (/^#[0-9a-fA-F]{6}$/.test(normalized)) return normalized;
  return '#ff4d4d';
};

export const RoutePolylinesLayer = ({ shapes }) => {
  const routePolylines = useMemo(() => {
    const countsByShapeId = new Map();
    const routeIds = new Set();

    shapes.forEach((entry) => {
      const shapeId = String(entry.shape?.id ?? '').trim();
      const routeId = String(entry.routeId ?? '').trim();
      if (shapeId) countsByShapeId.set(shapeId, (countsByShapeId.get(shapeId) || 0) + 1);
      if (routeId) routeIds.add(routeId);
    });

    const sortedRouteIds = Array.from(routeIds).sort((a, b) => a.localeCompare(b));
    const routeOffsetIndex = new Map(
      sortedRouteIds.map((routeId, index) => [routeId, index - (sortedRouteIds.length - 1) / 2])
    );

    return shapes.map((entry, index) => {
      const shapeId = String(entry.shape?.id ?? '').trim();
      const routeId = String(entry.routeId ?? '').trim();
      const points = entry.shape?.shapePoints || [];
      const isSharedShape = (countsByShapeId.get(shapeId) || 0) > 1;

      return {
        ...entry,
        key: `${routeId}-${shapeId}-${index}`,
        positions: points.map((point) => [point.latitude, point.longitude]),
        offset: isSharedShape ? (routeOffsetIndex.get(routeId) || 0) * OVERLAP_OFFSET_PX : 0,
      };
    });
  }, [shapes]);

  return routePolylines.map((routeShapeEntry) => (
    <Polyline
      key={routeShapeEntry.key}
      positions={routeShapeEntry.positions}
      pathOptions={{
        color: resolveRouteColor(routeShapeEntry.routeColor),
        weight: 3,
        opacity: 0.8,
        offset: routeShapeEntry.offset,
      }}
    >
      <Popup>
        <strong>Ruta:</strong> {routeShapeEntry.routeId}
      </Popup>
    </Polyline>
  ));
};

export default RoutePolylinesLayer;