import { fetchShapes } from "../data/files/shape-repo.js";
import { fetchTrips } from '../data/files/trip-repo.js';
import { fetchRoutes } from '../data/files/route-repo.js';
import { RouteShapes } from '@tfg_cercanias_bajo_control/common/models/RouteShapes.js';

let cachedRouteShapes = null;

// calculates the bounding box of a route
const getRouteBounds = (shapes) => {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;
  let hasPoints = false;

  shapes.forEach((shape) => {
    (shape.shapePoints || []).forEach((point) => {
      if (typeof point.latitude !== 'number' || typeof point.longitude !== 'number') {
        return;
      }

      hasPoints = true;
      minLat = Math.min(minLat, point.latitude);
      maxLat = Math.max(maxLat, point.latitude);
      minLng = Math.min(minLng, point.longitude);
      maxLng = Math.max(maxLng, point.longitude);
    });
  });

  if (!hasPoints) {
    return null;
  }

  return {
    minLatitude: minLat,
    maxLatitude: maxLat,
    minLongitude: minLng,
    maxLongitude: maxLng,
  };
};

export const getShapes = async () => {
  const data = await fetchShapes();
  return data;
};

export const getRouteShapes = async () => {
  if (cachedRouteShapes) {
    return cachedRouteShapes;
  }

  const [shapes, trips, routes] = await Promise.all([fetchShapes(), fetchTrips(), fetchRoutes()]);

  const lineIdByRouteId = new Map(
    routes.map((route) => {
      const rawRouteId = String(route.id ?? '').trim();
      const lineId = String(route.shortName ?? route.id ?? '').trim() || rawRouteId;
      return [rawRouteId, lineId];
    })
  );

  const lineColorByLineId = new Map();
  routes.forEach((route) => {
    const lineId = String(route.shortName ?? route.id ?? '').trim();
    const color = String(route.color ?? '').trim();
    if (!lineId || !color || lineColorByLineId.has(lineId)) return;
    lineColorByLineId.set(lineId, color);
  });

  const shapeById = new Map(
    shapes.map((shape) => [String(shape.id ?? '').trim(), shape])
  );

  const routeToShapeIds = new Map();
  trips.forEach((trip) => {
    const rawRouteId = String(trip.routeId ?? '').trim();
    const shapeId = String(trip.shapeId ?? '').trim();
    if (!rawRouteId || !shapeId) return;

    const routeId = lineIdByRouteId.get(rawRouteId) ?? rawRouteId;

    if (!routeToShapeIds.has(routeId)) {
      routeToShapeIds.set(routeId, new Set());
    }
    routeToShapeIds.get(routeId).add(shapeId);
  });

  const result = Array.from(routeToShapeIds.entries())
    .map(([routeId, shapeIds]) => {
      const routeShapes = Array.from(shapeIds)
        .map((shapeId) => shapeById.get(shapeId))
        .filter(Boolean)
        .sort((a, b) => String(a.id).localeCompare(String(b.id)));

      const bounds = getRouteBounds(routeShapes);

      return new RouteShapes({
        routeId,
        routeColor: lineColorByLineId.get(routeId) ?? null,
        shapes: routeShapes,
        minLatitude: bounds?.minLatitude ?? null,
        maxLatitude: bounds?.maxLatitude ?? null,
        minLongitude: bounds?.minLongitude ?? null,
        maxLongitude: bounds?.maxLongitude ?? null,
      });
    })
    .sort((a, b) => a.routeId.localeCompare(b.routeId))
    .map((routeShapes) => routeShapes.toJson());

  cachedRouteShapes = result;
  return cachedRouteShapes;
};