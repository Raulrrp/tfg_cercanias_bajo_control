import { fetchShapes } from "../data/files/shape-repo.js";
import { fetchTrips } from '../data/files/trip-repo.js';
import { fetchRoutes } from '../data/files/route-repo.js';
import { RouteShapes } from '@tfg_cercanias_bajo_control/common/models/RouteShapes.js';

let cachedRouteShapes = null;

// calculates the centroid of a route
const getRouteCentroid = (shapes) => {
  let latSum = 0;
  let lonSum = 0;
  let totalPoints = 0;

  shapes.forEach((shape) => {
    (shape.shapePoints || []).forEach((point) => {
      if (typeof point.latitude !== 'number' || typeof point.longitude !== 'number') {
        return;
      }

      latSum += point.latitude;
      lonSum += point.longitude;
      totalPoints += 1;
    });
  });

  if (totalPoints === 0) {
    return null;
  }

  return {
    centerLatitude: latSum / totalPoints,
    centerLongitude: lonSum / totalPoints,
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

      const center = getRouteCentroid(routeShapes);

      return new RouteShapes({
        routeId,
        routeColor: lineColorByLineId.get(routeId) ?? null,
        shapes: routeShapes,
        centerLatitude: center?.centerLatitude ?? null,
        centerLongitude: center?.centerLongitude ?? null,
      });
    })
    .sort((a, b) => a.routeId.localeCompare(b.routeId))
    .map((routeShapes) => routeShapes.toJson());

  cachedRouteShapes = result;
  return cachedRouteShapes;
};